// Auto-Publish Routes
// Business Premium feature for social media auto-publishing

import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { z } from 'zod';
import { eq, and, desc } from 'drizzle-orm';
import { db, businesses, autoPublishSettings, autoPublishHistory, events, promotions } from '../db';
import { authMiddleware, getCurrentUser, type AuthUser } from '../middleware/auth';
import {
  publishToMultiplePlatforms,
  testConnection,
  validateCredentials,
  type Platform,
  type PublishContent,
  type PlatformCredentials,
} from '../services/autopublish';

const app = new Hono<{ Variables: { user: AuthUser } }>();

// Helper to check Premium tier
async function checkPremiumTier(userId: string) {
  const business = await db
    .select()
    .from(businesses)
    .where(eq(businesses.ownerId, userId))
    .limit(1);

  if (!business.length) {
    return { error: 'Business account required', status: 403 };
  }

  const biz = business[0];

  if (biz.tier !== 'premium') {
    return {
      error: 'Business Premium subscription required',
      requiredTier: 'premium',
      currentTier: biz.tier,
      status: 403,
    };
  }

  if (biz.tierUntil && new Date(biz.tierUntil) < new Date()) {
    return {
      error: 'Business Premium subscription expired',
      expiredAt: biz.tierUntil,
      status: 403,
    };
  }

  return { business: biz };
}

// Get auto-publish settings
app.get('/settings', authMiddleware, async (c) => {
  const user = getCurrentUser(c);

  if (!user) {
    return c.json({ error: 'Unauthorized' }, 401);
  }

  const check = await checkPremiumTier(user.id);
  if ('error' in check) {
    return c.json(check, check.status as 403);
  }

  const settings = await db
    .select({
      id: autoPublishSettings.id,
      platform: autoPublishSettings.platform,
      isEnabled: autoPublishSettings.isEnabled,
      publishEvents: autoPublishSettings.publishEvents,
      publishPromotions: autoPublishSettings.publishPromotions,
      autoPublishOnCreate: autoPublishSettings.autoPublishOnCreate,
      // Don't expose tokens in response
      hasTelegramConfig: autoPublishSettings.telegramBotToken,
      hasInstagramConfig: autoPublishSettings.instagramAccessToken,
      hasVkConfig: autoPublishSettings.vkAccessToken,
      hasFacebookConfig: autoPublishSettings.facebookAccessToken,
      createdAt: autoPublishSettings.createdAt,
      updatedAt: autoPublishSettings.updatedAt,
    })
    .from(autoPublishSettings)
    .where(eq(autoPublishSettings.businessId, check.business.id));

  // Transform to hide actual token values
  const sanitizedSettings = settings.map((s) => ({
    id: s.id,
    platform: s.platform,
    isEnabled: s.isEnabled,
    publishEvents: s.publishEvents,
    publishPromotions: s.publishPromotions,
    autoPublishOnCreate: s.autoPublishOnCreate,
    isConfigured:
      (s.platform === 'telegram' && !!s.hasTelegramConfig) ||
      (s.platform === 'instagram' && !!s.hasInstagramConfig) ||
      (s.platform === 'vk' && !!s.hasVkConfig) ||
      (s.platform === 'facebook' && !!s.hasFacebookConfig),
    createdAt: s.createdAt,
    updatedAt: s.updatedAt,
  }));

  return c.json(sanitizedSettings);
});

// Create/Update auto-publish settings
const settingsSchema = z.object({
  platform: z.enum(['telegram', 'instagram', 'vk', 'facebook']),
  isEnabled: z.boolean().default(false),
  // Telegram
  telegramBotToken: z.string().optional(),
  telegramChannelId: z.string().optional(),
  // Instagram
  instagramAccessToken: z.string().optional(),
  instagramBusinessAccountId: z.string().optional(),
  // VK
  vkAccessToken: z.string().optional(),
  vkGroupId: z.string().optional(),
  // Facebook
  facebookAccessToken: z.string().optional(),
  facebookPageId: z.string().optional(),
  // Publishing options
  publishEvents: z.boolean().default(true),
  publishPromotions: z.boolean().default(true),
  autoPublishOnCreate: z.boolean().default(false),
});

app.post('/settings', authMiddleware, zValidator('json', settingsSchema), async (c) => {
  const user = getCurrentUser(c);

  if (!user) {
    return c.json({ error: 'Unauthorized' }, 401);
  }

  const check = await checkPremiumTier(user.id);
  if ('error' in check) {
    return c.json(check, check.status as 403);
  }

  const data = c.req.valid('json');

  // Check if settings already exist for this platform
  const existing = await db
    .select()
    .from(autoPublishSettings)
    .where(
      and(
        eq(autoPublishSettings.businessId, check.business.id),
        eq(autoPublishSettings.platform, data.platform)
      )
    )
    .limit(1);

  if (existing.length) {
    // Update existing
    const [updated] = await db
      .update(autoPublishSettings)
      .set({
        ...data,
        updatedAt: new Date(),
      })
      .where(eq(autoPublishSettings.id, existing[0].id))
      .returning();

    return c.json({
      id: updated.id,
      platform: updated.platform,
      isEnabled: updated.isEnabled,
      isConfigured: true,
    });
  } else {
    // Create new
    const [created] = await db
      .insert(autoPublishSettings)
      .values({
        businessId: check.business.id,
        ...data,
      })
      .returning();

    return c.json(
      {
        id: created.id,
        platform: created.platform,
        isEnabled: created.isEnabled,
        isConfigured: true,
      },
      201
    );
  }
});

// Test connection to platform
const testConnectionSchema = z.object({
  platform: z.enum(['telegram', 'instagram', 'vk', 'facebook']),
});

app.post('/test-connection', authMiddleware, zValidator('json', testConnectionSchema), async (c) => {
  const user = getCurrentUser(c);

  if (!user) {
    return c.json({ error: 'Unauthorized' }, 401);
  }

  const check = await checkPremiumTier(user.id);
  if ('error' in check) {
    return c.json(check, check.status as 403);
  }

  const { platform } = c.req.valid('json');

  // Get settings for this platform
  const settings = await db
    .select()
    .from(autoPublishSettings)
    .where(
      and(
        eq(autoPublishSettings.businessId, check.business.id),
        eq(autoPublishSettings.platform, platform)
      )
    )
    .limit(1);

  if (!settings.length) {
    return c.json({ error: 'Platform not configured' }, 400);
  }

  const s = settings[0];
  const credentials: PlatformCredentials = {
    telegramBotToken: s.telegramBotToken || undefined,
    telegramChannelId: s.telegramChannelId || undefined,
    instagramAccessToken: s.instagramAccessToken || undefined,
    instagramBusinessAccountId: s.instagramBusinessAccountId || undefined,
    vkAccessToken: s.vkAccessToken || undefined,
    vkGroupId: s.vkGroupId || undefined,
    facebookAccessToken: s.facebookAccessToken || undefined,
    facebookPageId: s.facebookPageId || undefined,
  };

  const result = await testConnection(platform, credentials);

  return c.json(result);
});

// Publish content manually
const publishSchema = z.object({
  contentType: z.enum(['event', 'promotion']),
  contentId: z.string().uuid(),
  platforms: z.array(z.enum(['telegram', 'instagram', 'vk', 'facebook'])).min(1),
});

app.post('/publish', authMiddleware, zValidator('json', publishSchema), async (c) => {
  const user = getCurrentUser(c);

  if (!user) {
    return c.json({ error: 'Unauthorized' }, 401);
  }

  const check = await checkPremiumTier(user.id);
  if ('error' in check) {
    return c.json(check, check.status as 403);
  }

  const { contentType, contentId, platforms } = c.req.valid('json');

  // Get content
  let content: PublishContent | null = null;
  let link: string | null = null;

  if (contentType === 'event') {
    const [event] = await db
      .select()
      .from(events)
      .where(
        and(eq(events.id, contentId), eq(events.businessId, check.business.id))
      )
      .limit(1);

    if (!event) {
      return c.json({ error: 'Event not found' }, 404);
    }

    content = {
      title: event.title,
      description: event.description || undefined,
      imageUrl: event.image || undefined,
      videoUrl: event.videoUrl || undefined,
      contentType: 'event',
      date: event.date?.toISOString(),
      location: event.location || undefined,
      price: event.price || undefined,
      isFree: event.isFree || false,
    };

    link = `https://afisha.kz/events/${event.id}`;
  } else {
    const [promo] = await db
      .select()
      .from(promotions)
      .where(
        and(eq(promotions.id, contentId), eq(promotions.businessId, check.business.id))
      )
      .limit(1);

    if (!promo) {
      return c.json({ error: 'Promotion not found' }, 404);
    }

    content = {
      title: promo.title,
      description: promo.description || undefined,
      imageUrl: promo.image || undefined,
      contentType: 'promotion',
      discount: promo.discount || undefined,
      validUntil: promo.validUntil?.toISOString(),
    };

    link = `https://afisha.kz/promotions/${promo.id}`;
  }

  content.link = link;

  // Get credentials for each platform
  const allSettings = await db
    .select()
    .from(autoPublishSettings)
    .where(eq(autoPublishSettings.businessId, check.business.id));

  const credentials: PlatformCredentials = {};

  for (const s of allSettings) {
    if (s.telegramBotToken) credentials.telegramBotToken = s.telegramBotToken;
    if (s.telegramChannelId) credentials.telegramChannelId = s.telegramChannelId;
    if (s.instagramAccessToken) credentials.instagramAccessToken = s.instagramAccessToken;
    if (s.instagramBusinessAccountId)
      credentials.instagramBusinessAccountId = s.instagramBusinessAccountId;
    if (s.vkAccessToken) credentials.vkAccessToken = s.vkAccessToken;
    if (s.vkGroupId) credentials.vkGroupId = s.vkGroupId;
    if (s.facebookAccessToken) credentials.facebookAccessToken = s.facebookAccessToken;
    if (s.facebookPageId) credentials.facebookPageId = s.facebookPageId;
  }

  // Publish to platforms
  const results = await publishToMultiplePlatforms(
    content,
    platforms as Platform[],
    credentials,
    check.business.name
  );

  // Save to history
  for (const result of results) {
    await db.insert(autoPublishHistory).values({
      businessId: check.business.id,
      platform: result.platform,
      contentType,
      contentId,
      status: result.success ? 'published' : 'failed',
      externalPostId: result.postId || null,
      externalPostUrl: result.postUrl || null,
      errorMessage: result.error || null,
      retryCount: result.retryCount || 0,
      publishedAt: result.success ? new Date() : null,
    });
  }

  return c.json({
    results,
    successful: results.filter((r) => r.success).length,
    failed: results.filter((r) => !r.success).length,
  });
});

// Get publish history
const historyQuerySchema = z.object({
  platform: z.enum(['telegram', 'instagram', 'vk', 'facebook']).optional(),
  contentType: z.enum(['event', 'promotion']).optional(),
  status: z.enum(['pending', 'published', 'failed']).optional(),
  limit: z.coerce.number().min(1).max(100).default(20),
  offset: z.coerce.number().min(0).default(0),
});

app.get('/history', authMiddleware, zValidator('query', historyQuerySchema), async (c) => {
  const user = getCurrentUser(c);

  if (!user) {
    return c.json({ error: 'Unauthorized' }, 401);
  }

  const check = await checkPremiumTier(user.id);
  if ('error' in check) {
    return c.json(check, check.status as 403);
  }

  const { platform, contentType, status, limit, offset } = c.req.valid('query');

  const conditions = [eq(autoPublishHistory.businessId, check.business.id)];

  if (platform) conditions.push(eq(autoPublishHistory.platform, platform));
  if (contentType) conditions.push(eq(autoPublishHistory.contentType, contentType));
  if (status) conditions.push(eq(autoPublishHistory.status, status));

  const history = await db
    .select()
    .from(autoPublishHistory)
    .where(and(...conditions))
    .orderBy(desc(autoPublishHistory.createdAt))
    .limit(limit)
    .offset(offset);

  return c.json(history);
});

// Delete settings for a platform
app.delete('/settings/:platform', authMiddleware, async (c) => {
  const user = getCurrentUser(c);
  const platform = c.req.param('platform') as Platform;

  if (!user) {
    return c.json({ error: 'Unauthorized' }, 401);
  }

  const check = await checkPremiumTier(user.id);
  if ('error' in check) {
    return c.json(check, check.status as 403);
  }

  await db
    .delete(autoPublishSettings)
    .where(
      and(
        eq(autoPublishSettings.businessId, check.business.id),
        eq(autoPublishSettings.platform, platform)
      )
    );

  return c.json({ success: true });
});

export default app;
