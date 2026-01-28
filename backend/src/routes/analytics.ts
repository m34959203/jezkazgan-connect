import { Hono } from 'hono';
import { db } from '../db';
import {
  analyticsEvents, users, businesses, payments, referrals
} from '../db/schema';
import { eq, and, desc, sql, gte, lte, between } from 'drizzle-orm';
import { authMiddleware, adminMiddleware, getCurrentUser, optionalAuthMiddleware } from '../middleware/auth';
import { z } from 'zod';
import { zValidator } from '@hono/zod-validator';

const app = new Hono();

// Track analytics event (public with optional auth)
const trackEventSchema = z.object({
  eventType: z.enum([
    'page_view', 'event_view', 'business_view', 'promotion_view',
    'premium_conversion', 'business_tier_upgrade', 'referral_signup',
    'first_purchase', 'subscription_started', 'subscription_cancelled'
  ]),
  eventData: z.record(z.unknown()).optional(),
  sessionId: z.string().optional(),
  source: z.string().optional(),
  referrer: z.string().optional(),
  utmSource: z.string().optional(),
  utmMedium: z.string().optional(),
  utmCampaign: z.string().optional(),
});

app.post('/track', optionalAuthMiddleware, zValidator('json', trackEventSchema), async (c) => {
  const user = getCurrentUser(c);
  const data = c.req.valid('json');

  const ipAddress = c.req.header('x-forwarded-for')?.split(',')[0] ||
                    c.req.header('x-real-ip') || 'unknown';
  const userAgent = c.req.header('user-agent') || 'unknown';

  // Determine device type from user agent
  const deviceType = /mobile|android|iphone|ipad/i.test(userAgent)
    ? (/ipad|tablet/i.test(userAgent) ? 'tablet' : 'mobile')
    : 'desktop';

  await db.insert(analyticsEvents).values({
    userId: user?.id,
    sessionId: data.sessionId,
    eventType: data.eventType,
    eventData: data.eventData ? JSON.stringify(data.eventData) : null,
    source: data.source || 'web',
    referrer: data.referrer,
    utmSource: data.utmSource,
    utmMedium: data.utmMedium,
    utmCampaign: data.utmCampaign,
    ipAddress,
    userAgent,
    deviceType,
  });

  return c.json({ success: true });
});

// Get conversion metrics (admin)
app.get('/conversions', adminMiddleware, async (c) => {
  const period = c.req.query('period') || '30'; // days
  const fromDate = new Date();
  fromDate.setDate(fromDate.getDate() - Number(period));

  // Premium user conversions
  const [userConversions] = await db
    .select({
      total: sql<number>`count(distinct ${analyticsEvents.userId})`,
    })
    .from(analyticsEvents)
    .where(and(
      eq(analyticsEvents.eventType, 'premium_conversion'),
      gte(analyticsEvents.createdAt, fromDate)
    ));

  // Business tier upgrades
  const [businessUpgrades] = await db
    .select({
      total: sql<number>`count(*)`,
    })
    .from(analyticsEvents)
    .where(and(
      eq(analyticsEvents.eventType, 'business_tier_upgrade'),
      gte(analyticsEvents.createdAt, fromDate)
    ));

  // Total users and premium users
  const [userStats] = await db
    .select({
      totalUsers: sql<number>`count(*)`,
      premiumUsers: sql<number>`sum(case when ${users.isPremium} then 1 else 0 end)`,
      newUsers: sql<number>`sum(case when ${users.createdAt} >= ${fromDate} then 1 else 0 end)`,
    })
    .from(users);

  // Total businesses by tier
  const [businessStats] = await db
    .select({
      totalBusinesses: sql<number>`count(*)`,
      freeBusinesses: sql<number>`sum(case when ${businesses.tier} = 'free' then 1 else 0 end)`,
      liteBusinesses: sql<number>`sum(case when ${businesses.tier} = 'lite' then 1 else 0 end)`,
      premiumBusinesses: sql<number>`sum(case when ${businesses.tier} = 'premium' then 1 else 0 end)`,
    })
    .from(businesses);

  // Conversion funnel
  const [funnelStats] = await db
    .select({
      pageViews: sql<number>`sum(case when ${analyticsEvents.eventType} = 'page_view' then 1 else 0 end)`,
      eventViews: sql<number>`sum(case when ${analyticsEvents.eventType} = 'event_view' then 1 else 0 end)`,
      businessViews: sql<number>`sum(case when ${analyticsEvents.eventType} = 'business_view' then 1 else 0 end)`,
      subscriptionStarts: sql<number>`sum(case when ${analyticsEvents.eventType} = 'subscription_started' then 1 else 0 end)`,
    })
    .from(analyticsEvents)
    .where(gte(analyticsEvents.createdAt, fromDate));

  // Calculate conversion rates
  const totalUsers = Number(userStats?.totalUsers) || 1;
  const premiumUsers = Number(userStats?.premiumUsers) || 0;
  const totalBusinesses = Number(businessStats?.totalBusinesses) || 1;
  const paidBusinesses = (Number(businessStats?.liteBusinesses) || 0) +
                         (Number(businessStats?.premiumBusinesses) || 0);

  return c.json({
    period: Number(period),
    conversions: {
      premiumUserConversions: Number(userConversions?.total) || 0,
      businessTierUpgrades: Number(businessUpgrades?.total) || 0,
    },
    users: {
      total: totalUsers,
      premium: premiumUsers,
      newInPeriod: Number(userStats?.newUsers) || 0,
      conversionRate: Math.round((premiumUsers / totalUsers) * 100 * 10) / 10,
    },
    businesses: {
      total: Number(businessStats?.totalBusinesses) || 0,
      free: Number(businessStats?.freeBusinesses) || 0,
      lite: Number(businessStats?.liteBusinesses) || 0,
      premium: Number(businessStats?.premiumBusinesses) || 0,
      paidConversionRate: Math.round((paidBusinesses / totalBusinesses) * 100 * 10) / 10,
    },
    funnel: {
      pageViews: Number(funnelStats?.pageViews) || 0,
      eventViews: Number(funnelStats?.eventViews) || 0,
      businessViews: Number(funnelStats?.businessViews) || 0,
      subscriptionStarts: Number(funnelStats?.subscriptionStarts) || 0,
    },
  });
});

// Get conversion trends over time (admin)
app.get('/conversions/trends', adminMiddleware, async (c) => {
  const period = c.req.query('period') || '30';
  const fromDate = new Date();
  fromDate.setDate(fromDate.getDate() - Number(period));

  // Daily premium conversions
  const premiumTrends = await db
    .select({
      date: sql<string>`date(${analyticsEvents.createdAt})`,
      count: sql<number>`count(*)`,
    })
    .from(analyticsEvents)
    .where(and(
      eq(analyticsEvents.eventType, 'premium_conversion'),
      gte(analyticsEvents.createdAt, fromDate)
    ))
    .groupBy(sql`date(${analyticsEvents.createdAt})`)
    .orderBy(sql`date(${analyticsEvents.createdAt})`);

  // Daily business upgrades
  const businessTrends = await db
    .select({
      date: sql<string>`date(${analyticsEvents.createdAt})`,
      count: sql<number>`count(*)`,
    })
    .from(analyticsEvents)
    .where(and(
      eq(analyticsEvents.eventType, 'business_tier_upgrade'),
      gte(analyticsEvents.createdAt, fromDate)
    ))
    .groupBy(sql`date(${analyticsEvents.createdAt})`)
    .orderBy(sql`date(${analyticsEvents.createdAt})`);

  // Daily registrations
  const registrationTrends = await db
    .select({
      date: sql<string>`date(${users.createdAt})`,
      count: sql<number>`count(*)`,
    })
    .from(users)
    .where(gte(users.createdAt, fromDate))
    .groupBy(sql`date(${users.createdAt})`)
    .orderBy(sql`date(${users.createdAt})`);

  return c.json({
    premiumConversions: premiumTrends.map(t => ({
      date: t.date,
      count: Number(t.count),
    })),
    businessUpgrades: businessTrends.map(t => ({
      date: t.date,
      count: Number(t.count),
    })),
    registrations: registrationTrends.map(t => ({
      date: t.date,
      count: Number(t.count),
    })),
  });
});

// Get revenue analytics (admin)
app.get('/revenue', adminMiddleware, async (c) => {
  const period = c.req.query('period') || '30';
  const fromDate = new Date();
  fromDate.setDate(fromDate.getDate() - Number(period));

  // Total revenue
  const [revenueStats] = await db
    .select({
      totalRevenue: sql<number>`sum(case when ${payments.status} = 'completed' then ${payments.amount} else 0 end)`,
      totalTransactions: sql<number>`count(case when ${payments.status} = 'completed' then 1 end)`,
      averageTransaction: sql<number>`avg(case when ${payments.status} = 'completed' then ${payments.amount} end)`,
    })
    .from(payments)
    .where(gte(payments.createdAt, fromDate));

  // Revenue by type
  const revenueByType = await db
    .select({
      type: payments.type,
      total: sql<number>`sum(${payments.amount})`,
      count: sql<number>`count(*)`,
    })
    .from(payments)
    .where(and(
      eq(payments.status, 'completed'),
      gte(payments.createdAt, fromDate)
    ))
    .groupBy(payments.type);

  // Revenue by provider
  const revenueByProvider = await db
    .select({
      provider: payments.provider,
      total: sql<number>`sum(${payments.amount})`,
      count: sql<number>`count(*)`,
    })
    .from(payments)
    .where(and(
      eq(payments.status, 'completed'),
      gte(payments.createdAt, fromDate)
    ))
    .groupBy(payments.provider);

  // Daily revenue
  const dailyRevenue = await db
    .select({
      date: sql<string>`date(${payments.createdAt})`,
      total: sql<number>`sum(${payments.amount})`,
      count: sql<number>`count(*)`,
    })
    .from(payments)
    .where(and(
      eq(payments.status, 'completed'),
      gte(payments.createdAt, fromDate)
    ))
    .groupBy(sql`date(${payments.createdAt})`)
    .orderBy(sql`date(${payments.createdAt})`);

  return c.json({
    period: Number(period),
    summary: {
      totalRevenue: Number(revenueStats?.totalRevenue) || 0,
      totalTransactions: Number(revenueStats?.totalTransactions) || 0,
      averageTransaction: Math.round(Number(revenueStats?.averageTransaction) || 0),
    },
    byType: revenueByType.map(r => ({
      type: r.type,
      total: Number(r.total),
      count: Number(r.count),
    })),
    byProvider: revenueByProvider.map(r => ({
      provider: r.provider,
      total: Number(r.total),
      count: Number(r.count),
    })),
    daily: dailyRevenue.map(r => ({
      date: r.date,
      total: Number(r.total),
      count: Number(r.count),
    })),
  });
});

// Get referral analytics (admin)
app.get('/referrals', adminMiddleware, async (c) => {
  const period = c.req.query('period') || '30';
  const fromDate = new Date();
  fromDate.setDate(fromDate.getDate() - Number(period));

  // Referral stats
  const [referralStats] = await db
    .select({
      totalReferrals: sql<number>`count(*)`,
      convertedReferrals: sql<number>`sum(case when ${referrals.status} = 'converted' then 1 else 0 end)`,
      totalBonusEarned: sql<number>`sum(${referrals.bonusEarned})`,
    })
    .from(referrals)
    .where(gte(referrals.createdAt, fromDate));

  // Top referrers
  const topReferrers = await db
    .select({
      userId: referrals.referrerId,
      userName: users.name,
      referralCount: sql<number>`count(*)`,
      convertedCount: sql<number>`sum(case when ${referrals.status} = 'converted' then 1 else 0 end)`,
      totalEarned: sql<number>`sum(${referrals.bonusEarned})`,
    })
    .from(referrals)
    .leftJoin(users, eq(referrals.referrerId, users.id))
    .where(gte(referrals.createdAt, fromDate))
    .groupBy(referrals.referrerId, users.name)
    .orderBy(desc(sql`count(*)`))
    .limit(10);

  // Daily referrals
  const dailyReferrals = await db
    .select({
      date: sql<string>`date(${referrals.createdAt})`,
      count: sql<number>`count(*)`,
      converted: sql<number>`sum(case when ${referrals.status} = 'converted' then 1 else 0 end)`,
    })
    .from(referrals)
    .where(gte(referrals.createdAt, fromDate))
    .groupBy(sql`date(${referrals.createdAt})`)
    .orderBy(sql`date(${referrals.createdAt})`);

  const total = Number(referralStats?.totalReferrals) || 1;
  const converted = Number(referralStats?.convertedReferrals) || 0;

  return c.json({
    period: Number(period),
    summary: {
      totalReferrals: total,
      convertedReferrals: converted,
      conversionRate: Math.round((converted / total) * 100 * 10) / 10,
      totalBonusEarned: Number(referralStats?.totalBonusEarned) || 0,
    },
    topReferrers: topReferrers.map(r => ({
      userId: r.userId,
      userName: r.userName,
      referralCount: Number(r.referralCount),
      convertedCount: Number(r.convertedCount),
      totalEarned: Number(r.totalEarned),
    })),
    daily: dailyReferrals.map(r => ({
      date: r.date,
      count: Number(r.count),
      converted: Number(r.converted),
    })),
  });
});

// Get traffic sources (admin)
app.get('/traffic', adminMiddleware, async (c) => {
  const period = c.req.query('period') || '30';
  const fromDate = new Date();
  fromDate.setDate(fromDate.getDate() - Number(period));

  // By source
  const bySource = await db
    .select({
      source: analyticsEvents.source,
      count: sql<number>`count(*)`,
      uniqueUsers: sql<number>`count(distinct ${analyticsEvents.userId})`,
    })
    .from(analyticsEvents)
    .where(gte(analyticsEvents.createdAt, fromDate))
    .groupBy(analyticsEvents.source)
    .orderBy(desc(sql`count(*)`));

  // By device type
  const byDevice = await db
    .select({
      deviceType: analyticsEvents.deviceType,
      count: sql<number>`count(*)`,
    })
    .from(analyticsEvents)
    .where(gte(analyticsEvents.createdAt, fromDate))
    .groupBy(analyticsEvents.deviceType)
    .orderBy(desc(sql`count(*)`));

  // By UTM source
  const byUtmSource = await db
    .select({
      utmSource: analyticsEvents.utmSource,
      count: sql<number>`count(*)`,
    })
    .from(analyticsEvents)
    .where(and(
      gte(analyticsEvents.createdAt, fromDate),
      sql`${analyticsEvents.utmSource} IS NOT NULL`
    ))
    .groupBy(analyticsEvents.utmSource)
    .orderBy(desc(sql`count(*)`))
    .limit(10);

  // By UTM campaign
  const byUtmCampaign = await db
    .select({
      utmCampaign: analyticsEvents.utmCampaign,
      count: sql<number>`count(*)`,
    })
    .from(analyticsEvents)
    .where(and(
      gte(analyticsEvents.createdAt, fromDate),
      sql`${analyticsEvents.utmCampaign} IS NOT NULL`
    ))
    .groupBy(analyticsEvents.utmCampaign)
    .orderBy(desc(sql`count(*)`))
    .limit(10);

  return c.json({
    period: Number(period),
    bySource: bySource.map(s => ({
      source: s.source || 'direct',
      count: Number(s.count),
      uniqueUsers: Number(s.uniqueUsers),
    })),
    byDevice: byDevice.map(d => ({
      deviceType: d.deviceType || 'unknown',
      count: Number(d.count),
    })),
    byUtmSource: byUtmSource.map(u => ({
      utmSource: u.utmSource,
      count: Number(u.count),
    })),
    byUtmCampaign: byUtmCampaign.map(u => ({
      utmCampaign: u.utmCampaign,
      count: Number(u.count),
    })),
  });
});

// Helper function to track premium conversion (exported for use in other routes)
export async function trackPremiumConversion(
  userId: string,
  data: {
    paymentId?: string;
    amount?: number;
    subscriptionType?: string;
  }
): Promise<void> {
  await db.insert(analyticsEvents).values({
    userId,
    eventType: 'premium_conversion',
    eventData: JSON.stringify(data),
    source: 'web',
  });
}

// Helper function to track business tier upgrade
export async function trackBusinessTierUpgrade(
  userId: string,
  data: {
    businessId: string;
    oldTier: string;
    newTier: string;
    paymentId?: string;
    amount?: number;
  }
): Promise<void> {
  await db.insert(analyticsEvents).values({
    userId,
    eventType: 'business_tier_upgrade',
    eventData: JSON.stringify(data),
    source: 'web',
  });
}

export default app;
