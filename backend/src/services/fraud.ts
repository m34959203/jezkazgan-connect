import { db } from '../db';
import {
  fraudLogs, blockedEntities, deviceFingerprints, users, referrals, payments
} from '../db/schema';
import { eq, and, desc, sql, gte, or } from 'drizzle-orm';
import type { Context } from 'hono';

// Fraud detection configuration
const FRAUD_CONFIG = {
  // Rate limits
  maxLoginAttemptsPerHour: 10,
  maxRegistrationsPerIP: 3,
  maxPaymentsPerHour: 5,
  maxReferralsPerIP: 2,

  // Risk score thresholds
  lowRisk: 30,
  mediumRisk: 60,
  highRisk: 80,

  // Temporary block duration (hours)
  tempBlockDuration: 24,

  // Suspicious patterns
  suspiciousEmailDomains: ['tempmail.com', '10minutemail.com', 'guerrillamail.com', 'mailinator.com'],
  suspiciousPhonePrefixes: ['700', '701'], // Example prefixes
};

// Get client info from request
export function getClientInfo(c: Context) {
  return {
    ipAddress: c.req.header('x-forwarded-for')?.split(',')[0] ||
               c.req.header('x-real-ip') ||
               'unknown',
    userAgent: c.req.header('user-agent') || 'unknown',
  };
}

// Check if IP is blocked
export async function isIPBlocked(ipAddress: string): Promise<boolean> {
  const [blocked] = await db
    .select()
    .from(blockedEntities)
    .where(and(
      eq(blockedEntities.entityType, 'ip'),
      eq(blockedEntities.entityValue, ipAddress),
      or(
        sql`${blockedEntities.expiresAt} IS NULL`,
        gte(blockedEntities.expiresAt, new Date())
      )
    ));

  return !!blocked;
}

// Check if email domain is blocked
export async function isEmailBlocked(email: string): Promise<boolean> {
  const domain = email.split('@')[1]?.toLowerCase();

  // Check suspicious domains
  if (FRAUD_CONFIG.suspiciousEmailDomains.includes(domain)) {
    return true;
  }

  // Check blocked domains in DB
  const [blocked] = await db
    .select()
    .from(blockedEntities)
    .where(and(
      eq(blockedEntities.entityType, 'email_domain'),
      eq(blockedEntities.entityValue, domain)
    ));

  return !!blocked;
}

// Calculate risk score for registration
export async function calculateRegistrationRisk(
  email: string,
  ipAddress: string,
  userAgent: string,
  referralCode?: string
): Promise<{ riskScore: number; reasons: string[] }> {
  const reasons: string[] = [];
  let riskScore = 0;

  const oneHourAgo = new Date();
  oneHourAgo.setHours(oneHourAgo.getHours() - 1);

  // Check registrations from same IP
  const [ipRegistrations] = await db
    .select({ count: sql<number>`count(*)` })
    .from(users)
    .where(sql`created_at > ${oneHourAgo}`);

  // This is a simplified check - in production you'd track IP per registration
  if (Number(ipRegistrations?.count) > FRAUD_CONFIG.maxRegistrationsPerIP) {
    riskScore += 30;
    reasons.push('Multiple registrations from same IP');
  }

  // Check email domain
  const domain = email.split('@')[1]?.toLowerCase();
  if (FRAUD_CONFIG.suspiciousEmailDomains.includes(domain)) {
    riskScore += 40;
    reasons.push('Suspicious email domain');
  }

  // Check for disposable email patterns
  if (domain && (domain.includes('temp') || domain.includes('fake') || domain.includes('trash'))) {
    riskScore += 25;
    reasons.push('Possible disposable email');
  }

  // Check referral abuse
  if (referralCode) {
    const [referralFromIP] = await db
      .select({ count: sql<number>`count(*)` })
      .from(referrals)
      .where(sql`created_at > ${oneHourAgo}`);

    if (Number(referralFromIP?.count) > FRAUD_CONFIG.maxReferralsPerIP) {
      riskScore += 50;
      reasons.push('Referral abuse detected');
    }
  }

  // Check user agent
  if (!userAgent || userAgent === 'unknown' || userAgent.length < 20) {
    riskScore += 15;
    reasons.push('Suspicious user agent');
  }

  // Check for bot patterns in user agent
  const botPatterns = ['bot', 'crawler', 'spider', 'curl', 'wget', 'python', 'scrapy'];
  if (botPatterns.some(pattern => userAgent.toLowerCase().includes(pattern))) {
    riskScore += 60;
    reasons.push('Bot detected in user agent');
  }

  return { riskScore: Math.min(riskScore, 100), reasons };
}

// Calculate risk score for payment
export async function calculatePaymentRisk(
  userId: string,
  amount: number,
  ipAddress: string
): Promise<{ riskScore: number; reasons: string[] }> {
  const reasons: string[] = [];
  let riskScore = 0;

  const oneHourAgo = new Date();
  oneHourAgo.setHours(oneHourAgo.getHours() - 1);

  // Check recent payments
  const [recentPayments] = await db
    .select({ count: sql<number>`count(*)` })
    .from(payments)
    .where(and(
      eq(payments.userId, userId),
      gte(payments.createdAt, oneHourAgo)
    ));

  if (Number(recentPayments?.count) > FRAUD_CONFIG.maxPaymentsPerHour) {
    riskScore += 40;
    reasons.push('Too many payment attempts');
  }

  // Check for failed payments
  const [failedPayments] = await db
    .select({ count: sql<number>`count(*)` })
    .from(payments)
    .where(and(
      eq(payments.userId, userId),
      eq(payments.status, 'failed'),
      gte(payments.createdAt, oneHourAgo)
    ));

  if (Number(failedPayments?.count) > 3) {
    riskScore += 35;
    reasons.push('Multiple failed payments');
  }

  // Check for unusual amount
  if (amount > 500000) { // > 500,000 KZT
    riskScore += 20;
    reasons.push('Unusually large amount');
  }

  // Check IP changes
  const [fingerprints] = await db
    .select()
    .from(deviceFingerprints)
    .where(eq(deviceFingerprints.userId, userId))
    .orderBy(desc(deviceFingerprints.lastSeenAt))
    .limit(1);

  if (fingerprints && fingerprints.ipAddress !== ipAddress) {
    riskScore += 15;
    reasons.push('IP address changed');
  }

  return { riskScore: Math.min(riskScore, 100), reasons };
}

// Log fraud event
export async function logFraudEvent(
  eventType: 'suspicious_login' | 'multiple_accounts' | 'payment_fraud' | 'referral_abuse' | 'rate_limit_exceeded' | 'bot_detected',
  ipAddress: string,
  userAgent: string,
  userId?: string,
  riskScore?: number,
  details?: Record<string, unknown>
): Promise<void> {
  try {
    const action = riskScore && riskScore >= FRAUD_CONFIG.highRisk
      ? 'block_temporary'
      : riskScore && riskScore >= FRAUD_CONFIG.mediumRisk
        ? 'warn'
        : null;

    await db.insert(fraudLogs).values({
      userId,
      ipAddress,
      userAgent,
      eventType,
      riskScore: riskScore || 0,
      details: details ? JSON.stringify(details) : null,
      action,
    });

    // Auto-block high risk IPs
    if (action === 'block_temporary') {
      const expiresAt = new Date();
      expiresAt.setHours(expiresAt.getHours() + FRAUD_CONFIG.tempBlockDuration);

      await db.insert(blockedEntities).values({
        entityType: 'ip',
        entityValue: ipAddress,
        reason: `Auto-blocked: ${eventType} (risk score: ${riskScore})`,
        expiresAt,
      }).onConflictDoNothing();
    }
  } catch (error) {
    console.error('Error logging fraud event:', error);
  }
}

// Save device fingerprint
export async function saveDeviceFingerprint(
  userId: string,
  fingerprint: string,
  ipAddress: string,
  userAgent: string
): Promise<void> {
  try {
    // Check if fingerprint exists for this user
    const [existing] = await db
      .select()
      .from(deviceFingerprints)
      .where(and(
        eq(deviceFingerprints.userId, userId),
        eq(deviceFingerprints.fingerprint, fingerprint)
      ));

    if (existing) {
      // Update last seen
      await db
        .update(deviceFingerprints)
        .set({
          lastSeenAt: new Date(),
          ipAddress,
        })
        .where(eq(deviceFingerprints.id, existing.id));
    } else {
      // Create new fingerprint
      await db.insert(deviceFingerprints).values({
        userId,
        fingerprint,
        ipAddress,
        userAgent,
      });

      // Check for multiple accounts with same fingerprint
      const [sameFingerprint] = await db
        .select({ count: sql<number>`count(distinct ${deviceFingerprints.userId})` })
        .from(deviceFingerprints)
        .where(eq(deviceFingerprints.fingerprint, fingerprint));

      if (Number(sameFingerprint?.count) > 1) {
        await logFraudEvent(
          'multiple_accounts',
          ipAddress,
          userAgent,
          userId,
          70,
          { fingerprint, accountCount: sameFingerprint?.count }
        );
      }
    }
  } catch (error) {
    console.error('Error saving device fingerprint:', error);
  }
}

// Block entity
export async function blockEntity(
  entityType: 'ip' | 'device' | 'email_domain' | 'phone_prefix',
  entityValue: string,
  reason: string,
  blockedBy?: string,
  durationHours?: number
): Promise<void> {
  const expiresAt = durationHours
    ? new Date(Date.now() + durationHours * 60 * 60 * 1000)
    : undefined;

  await db.insert(blockedEntities).values({
    entityType,
    entityValue,
    reason,
    blockedBy,
    expiresAt,
  }).onConflictDoNothing();
}

// Unblock entity
export async function unblockEntity(entityId: string): Promise<void> {
  await db.delete(blockedEntities).where(eq(blockedEntities.id, entityId));
}

// Get fraud logs (for admin)
export async function getFraudLogs(options: {
  limit?: number;
  offset?: number;
  eventType?: string;
  reviewed?: boolean;
}) {
  const { limit = 50, offset = 0 } = options;

  const logs = await db
    .select({
      log: fraudLogs,
      userName: users.name,
      userEmail: users.email,
    })
    .from(fraudLogs)
    .leftJoin(users, eq(fraudLogs.userId, users.id))
    .orderBy(desc(fraudLogs.createdAt))
    .limit(limit)
    .offset(offset);

  return logs;
}

// Get blocked entities (for admin)
export async function getBlockedEntities(options: {
  limit?: number;
  offset?: number;
  entityType?: string;
}) {
  const { limit = 50, offset = 0 } = options;

  const entities = await db
    .select()
    .from(blockedEntities)
    .orderBy(desc(blockedEntities.createdAt))
    .limit(limit)
    .offset(offset);

  return entities;
}

// Cleanup expired blocks
export async function cleanupExpiredBlocks(): Promise<void> {
  await db
    .delete(blockedEntities)
    .where(and(
      sql`${blockedEntities.expiresAt} IS NOT NULL`,
      sql`${blockedEntities.expiresAt} < NOW()`
    ));
}

export default {
  isIPBlocked,
  isEmailBlocked,
  calculateRegistrationRisk,
  calculatePaymentRisk,
  logFraudEvent,
  saveDeviceFingerprint,
  blockEntity,
  unblockEntity,
  getFraudLogs,
  getBlockedEntities,
  cleanupExpiredBlocks,
  getClientInfo,
  FRAUD_CONFIG,
};
