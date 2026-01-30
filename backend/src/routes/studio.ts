// KZ Connect Studio Routes
// AI-powered poster generation for events
// Business Premium feature

import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { z } from 'zod';
import { eq, desc } from 'drizzle-orm';
import { db, businesses, aiImageGenerations } from '../db';
import { authMiddleware, getCurrentUser, type AuthUser } from '../middleware/auth';
import {
  generatePoster,
  refineEventDetails,
  isGeminiAvailable,
  getAvailableThemes,
  generatePromotionalVideo,
  isVideoGenerationAvailable,
  getVideoCapabilities,
  type PosterTheme,
} from '../services/gemini';

const app = new Hono<{ Variables: { user: AuthUser } }>();

// Check studio availability
app.get('/status', async (c) => {
  const videoCapabilities = getVideoCapabilities();
  return c.json({
    available: isGeminiAvailable(),
    provider: 'gemini',
    features: ['text-refinement', 'image-generation', 'city-context'],
    video: {
      available: videoCapabilities.available,
      maxDuration: videoCapabilities.maxDuration,
      aspectRatios: videoCapabilities.aspectRatios,
    },
  });
});

// Get available themes
app.get('/themes', async (c) => {
  const themes = getAvailableThemes();
  return c.json({ themes });
});

// All available poster themes (event categories)
const posterThemes = [
  'concert-vibe', 'edu-smart', 'business-pro', 'leisure-fun', 'sport-energy', 'kids-magic', 'art-gallery',
] as const;

// Poster generation request schema
const generatePosterSchema = z.object({
  title: z.string().min(3).max(200),
  date: z.string().min(1),
  location: z.string().min(2).max(200),
  description: z.string().max(1000).optional(),
  theme: z.enum(posterThemes),
});

// Refine event details only (without image generation)
app.post('/refine', authMiddleware, zValidator('json', generatePosterSchema), async (c) => {
  const user = getCurrentUser(c);

  if (!user) {
    return c.json({ error: 'Unauthorized' }, 401);
  }

  // Get user's business
  const business = await db
    .select()
    .from(businesses)
    .where(eq(businesses.ownerId, user.id))
    .limit(1);

  if (!business.length) {
    return c.json({ error: 'Business account required' }, 403);
  }

  const biz = business[0];

  // Check Business Premium tier
  if (biz.tier !== 'premium') {
    return c.json({
      error: 'Business Premium subscription required',
      requiredTier: 'premium',
      currentTier: biz.tier,
    }, 403);
  }

  // Check tier expiration
  if (biz.tierUntil && new Date(biz.tierUntil) < new Date()) {
    return c.json({
      error: 'Business Premium subscription expired',
      expiredAt: biz.tierUntil,
    }, 403);
  }

  if (!isGeminiAvailable()) {
    return c.json({ error: 'Studio service not configured' }, 503);
  }

  const data = c.req.valid('json');

  try {
    const refined = await refineEventDetails({
      title: data.title,
      date: data.date,
      location: data.location,
      description: data.description,
      theme: data.theme as PosterTheme,
    });

    return c.json({ details: refined });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Refinement failed';
    return c.json({ error: errorMessage }, 500);
  }
});

// Generate full poster (text + image)
app.post('/generate', authMiddleware, zValidator('json', generatePosterSchema), async (c) => {
  const user = getCurrentUser(c);

  if (!user) {
    return c.json({ error: 'Unauthorized' }, 401);
  }

  // Get user's business
  const business = await db
    .select()
    .from(businesses)
    .where(eq(businesses.ownerId, user.id))
    .limit(1);

  if (!business.length) {
    return c.json({ error: 'Business account required' }, 403);
  }

  const biz = business[0];

  // Check Business Premium tier
  if (biz.tier !== 'premium') {
    return c.json({
      error: 'Business Premium subscription required',
      requiredTier: 'premium',
      currentTier: biz.tier,
    }, 403);
  }

  // Check tier expiration
  if (biz.tierUntil && new Date(biz.tierUntil) < new Date()) {
    return c.json({
      error: 'Business Premium subscription expired',
      expiredAt: biz.tierUntil,
    }, 403);
  }

  if (!isGeminiAvailable()) {
    return c.json({ error: 'Studio service not configured' }, 503);
  }

  const data = c.req.valid('json');

  // Create generation record
  const [generation] = await db
    .insert(aiImageGenerations)
    .values({
      businessId: biz.id,
      userId: user.id,
      prompt: `[Studio] ${data.title} - ${data.theme}`,
      style: 'poster',
      status: 'generating',
    })
    .returning();

  try {
    const result = await generatePoster({
      title: data.title,
      date: data.date,
      location: data.location,
      description: data.description,
      theme: data.theme as PosterTheme,
    });

    // Update record with result
    await db
      .update(aiImageGenerations)
      .set({
        generatedImageUrl: result.imageUrl,
        status: 'completed',
      })
      .where(eq(aiImageGenerations.id, generation.id));

    return c.json({
      id: generation.id,
      imageUrl: result.imageUrl,
      details: result.details,
      isAiGenerated: result.isAiGenerated,
      aiDisclaimer: result.aiDisclaimer,
      generatedAt: result.generatedAt,
    }, 201);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Generation failed';

    await db
      .update(aiImageGenerations)
      .set({
        status: 'failed',
        errorMessage,
      })
      .where(eq(aiImageGenerations.id, generation.id));

    return c.json({ error: errorMessage }, 500);
  }
});

// ============================================
// Video Generation Endpoints
// ============================================

// Video generation request schema
const generateVideoSchema = z.object({
  title: z.string().min(3).max(200),
  date: z.string().min(1),
  location: z.string().min(2).max(200),
  description: z.string().max(1000).optional(),
  theme: z.enum(posterThemes),
  duration: z.enum(['4s', '8s']).default('8s'),
  aspectRatio: z.enum(['16:9', '9:16']).default('16:9'),
  sourceImage: z.string().optional(), // Base64 for image-to-video
});

// Generate promotional video (Veo 2)
app.post('/generate-video', authMiddleware, zValidator('json', generateVideoSchema), async (c) => {
  const user = getCurrentUser(c);

  if (!user) {
    return c.json({ error: 'Unauthorized' }, 401);
  }

  // Get user's business
  const business = await db
    .select()
    .from(businesses)
    .where(eq(businesses.ownerId, user.id))
    .limit(1);

  if (!business.length) {
    return c.json({ error: 'Business account required' }, 403);
  }

  const biz = business[0];

  // Check Business Premium tier
  if (biz.tier !== 'premium') {
    return c.json({
      error: 'Business Premium subscription required',
      requiredTier: 'premium',
      currentTier: biz.tier,
    }, 403);
  }

  // Check tier expiration
  if (biz.tierUntil && new Date(biz.tierUntil) < new Date()) {
    return c.json({
      error: 'Business Premium subscription expired',
      expiredAt: biz.tierUntil,
    }, 403);
  }

  if (!isVideoGenerationAvailable()) {
    return c.json({
      error: 'Video generation not available',
      message: 'Contact support to enable Veo 2 video generation',
    }, 503);
  }

  const data = c.req.valid('json');

  // Create generation record
  const [generation] = await db
    .insert(aiImageGenerations)
    .values({
      businessId: biz.id,
      userId: user.id,
      prompt: `[Video] ${data.title} - ${data.theme} - ${data.duration}`,
      style: 'video',
      status: 'generating',
    })
    .returning();

  try {
    const result = await generatePromotionalVideo({
      title: data.title,
      date: data.date,
      location: data.location,
      description: data.description,
      theme: data.theme as PosterTheme,
      duration: data.duration,
      aspectRatio: data.aspectRatio,
      sourceImage: data.sourceImage,
    });

    // Update record with result
    await db
      .update(aiImageGenerations)
      .set({
        generatedImageUrl: result.videoUrl, // Reuse field for video URL
        status: 'completed',
      })
      .where(eq(aiImageGenerations.id, generation.id));

    return c.json({
      id: generation.id,
      videoUrl: result.videoUrl,
      thumbnailUrl: result.thumbnailUrl,
      duration: result.duration,
      aspectRatio: result.aspectRatio,
      details: result.details,
      isAiGenerated: result.isAiGenerated,
      aiDisclaimer: result.aiDisclaimer,
      generatedAt: result.generatedAt,
    }, 201);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Video generation failed';

    await db
      .update(aiImageGenerations)
      .set({
        status: 'failed',
        errorMessage,
      })
      .where(eq(aiImageGenerations.id, generation.id));

    return c.json({ error: errorMessage }, 500);
  }
});

// Get studio generation history
const historyQuerySchema = z.object({
  limit: z.coerce.number().min(1).max(50).default(20),
  offset: z.coerce.number().min(0).default(0),
});

app.get('/history', authMiddleware, zValidator('query', historyQuerySchema), async (c) => {
  const user = getCurrentUser(c);

  if (!user) {
    return c.json({ error: 'Unauthorized' }, 401);
  }

  const business = await db
    .select()
    .from(businesses)
    .where(eq(businesses.ownerId, user.id))
    .limit(1);

  if (!business.length) {
    return c.json({ error: 'Business account required' }, 403);
  }

  const { limit, offset } = c.req.valid('query');

  const history = await db
    .select({
      id: aiImageGenerations.id,
      prompt: aiImageGenerations.prompt,
      style: aiImageGenerations.style,
      generatedImageUrl: aiImageGenerations.generatedImageUrl,
      status: aiImageGenerations.status,
      usedFor: aiImageGenerations.usedFor,
      createdAt: aiImageGenerations.createdAt,
    })
    .from(aiImageGenerations)
    .where(eq(aiImageGenerations.businessId, business[0].id))
    .orderBy(desc(aiImageGenerations.createdAt))
    .limit(limit)
    .offset(offset);

  // Filter only studio generations
  const studioHistory = history.filter(h => h.prompt?.startsWith('[Studio]') || h.style === 'poster');

  return c.json(studioHistory);
});

export default app;
