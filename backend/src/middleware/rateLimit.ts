// Rate limiting middleware for Hono
// In-memory rate limiter (for production, use Redis with Upstash)

import { Context, Next } from 'hono';

interface RateLimitConfig {
  windowMs: number;  // Time window in milliseconds
  maxRequests: number;  // Max requests per window
  message?: string;  // Custom error message
  keyGenerator?: (c: Context) => string;  // Custom key generator
  skipSuccessfulRequests?: boolean;  // Don't count successful requests
  skipFailedRequests?: boolean;  // Don't count failed requests
}

interface RateLimitEntry {
  count: number;
  resetTime: number;
}

// In-memory store for rate limiting
// Note: This resets on server restart. For production, use Redis.
const store = new Map<string, RateLimitEntry>();

// Clean up expired entries periodically
setInterval(() => {
  const now = Date.now();
  for (const [key, entry] of store.entries()) {
    if (entry.resetTime < now) {
      store.delete(key);
    }
  }
}, 60000); // Clean up every minute

// Default key generator - uses IP address
function defaultKeyGenerator(c: Context): string {
  // Try to get real IP from headers (when behind proxy)
  const forwarded = c.req.header('x-forwarded-for');
  if (forwarded) {
    return forwarded.split(',')[0].trim();
  }

  const realIp = c.req.header('x-real-ip');
  if (realIp) {
    return realIp;
  }

  // Fallback to connection info (may not always be available)
  return 'unknown';
}

// Create rate limiter middleware
export function rateLimit(config: RateLimitConfig) {
  const {
    windowMs,
    maxRequests,
    message = 'Слишком много запросов, попробуйте позже',
    keyGenerator = defaultKeyGenerator,
  } = config;

  return async (c: Context, next: Next) => {
    const key = keyGenerator(c);
    const now = Date.now();

    let entry = store.get(key);

    // Create new entry or reset if window expired
    if (!entry || entry.resetTime < now) {
      entry = {
        count: 0,
        resetTime: now + windowMs,
      };
      store.set(key, entry);
    }

    // Increment request count
    entry.count++;

    // Set rate limit headers
    const remaining = Math.max(0, maxRequests - entry.count);
    const resetSeconds = Math.ceil((entry.resetTime - now) / 1000);

    c.header('X-RateLimit-Limit', maxRequests.toString());
    c.header('X-RateLimit-Remaining', remaining.toString());
    c.header('X-RateLimit-Reset', resetSeconds.toString());

    // Check if limit exceeded
    if (entry.count > maxRequests) {
      c.header('Retry-After', resetSeconds.toString());
      return c.json(
        {
          error: message,
          retryAfter: resetSeconds,
        },
        429
      );
    }

    await next();
  };
}

// ============================================
// Preset Rate Limiters
// ============================================

// Standard API rate limiter (100 requests per minute)
export const apiRateLimit = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  maxRequests: 100,
  message: 'Превышен лимит запросов. Попробуйте через минуту.',
});

// Strict rate limiter for auth endpoints (10 requests per minute)
export const authRateLimit = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  maxRequests: 10,
  message: 'Слишком много попыток входа. Подождите минуту.',
});

// Very strict rate limiter for registration (5 per hour)
export const registerRateLimit = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  maxRequests: 5,
  message: 'Превышен лимит регистраций. Попробуйте через час.',
});

// Upload rate limiter (20 uploads per hour)
export const uploadRateLimit = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  maxRequests: 20,
  message: 'Превышен лимит загрузок. Попробуйте через час.',
});

// Password change rate limiter (3 per hour)
export const passwordChangeRateLimit = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  maxRequests: 3,
  message: 'Слишком много попыток смены пароля. Попробуйте через час.',
});

// Business creation rate limiter (3 per day)
export const businessCreationRateLimit = rateLimit({
  windowMs: 24 * 60 * 60 * 1000, // 24 hours
  maxRequests: 3,
  message: 'Превышен лимит создания бизнесов. Попробуйте завтра.',
});

// Event creation rate limiter based on user (for free tier)
export function createEventRateLimit(maxPerDay: number) {
  return rateLimit({
    windowMs: 24 * 60 * 60 * 1000, // 24 hours
    maxRequests: maxPerDay,
    message: `Превышен лимит публикаций (${maxPerDay}/день). Обновите тариф для большего количества.`,
    keyGenerator: (c) => {
      // Use user ID from auth context if available
      const userId = c.get('userId');
      if (userId) return `event:${userId}`;
      return `event:${defaultKeyGenerator(c)}`;
    },
  });
}

// ============================================
// IP-based security features
// ============================================

// Track suspicious IPs
const suspiciousIPs = new Map<string, { count: number; blockedUntil: number }>();

// Check if IP is blocked
export function isIPBlocked(c: Context): boolean {
  const ip = defaultKeyGenerator(c);
  const entry = suspiciousIPs.get(ip);

  if (!entry) return false;
  if (entry.blockedUntil < Date.now()) {
    suspiciousIPs.delete(ip);
    return false;
  }

  return true;
}

// Mark IP as suspicious (after multiple rate limit violations)
export function markSuspiciousIP(c: Context): void {
  const ip = defaultKeyGenerator(c);
  let entry = suspiciousIPs.get(ip);

  if (!entry) {
    entry = { count: 0, blockedUntil: 0 };
    suspiciousIPs.set(ip, entry);
  }

  entry.count++;

  // Block for increasing periods based on violation count
  if (entry.count >= 5) {
    // Block for 1 hour after 5 violations
    entry.blockedUntil = Date.now() + 60 * 60 * 1000;
  } else if (entry.count >= 10) {
    // Block for 24 hours after 10 violations
    entry.blockedUntil = Date.now() + 24 * 60 * 60 * 1000;
  }
}

// Security middleware to check for blocked IPs
export async function securityCheck(c: Context, next: Next) {
  if (isIPBlocked(c)) {
    return c.json(
      {
        error: 'Доступ временно заблокирован. Обратитесь в поддержку.',
      },
      403
    );
  }

  await next();
}
