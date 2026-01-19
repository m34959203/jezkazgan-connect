// AI Image Generation Routes (Nano Banana)
// Business Premium feature

import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { z } from 'zod';
import { eq, and, desc } from 'drizzle-orm';
import { db, businesses, aiImageGenerations } from '../db';
import { authMiddleware, getCurrentUser, type AuthUser } from '../middleware/auth';
import {
  generateImage,
  isAiGenerationAvailable,
  generatePromptSuggestions,
  translatePromptForAI,
} from '../services/nanobanana';

const app = new Hono<{ Variables: { user: AuthUser } }>();

// Check if AI generation is available
app.get('/status', async (c) => {
  return c.json({
    available: isAiGenerationAvailable(),
    provider: process.env.NANOBANANA_API_URL ? 'nanobanana' : 'openai',
  });
});

// Get prompt suggestions
const suggestionsQuerySchema = z.object({
  contentType: z.enum(['event', 'promotion', 'banner']),
  title: z.string().optional(),
  description: z.string().optional(),
  category: z.string().optional(),
  discount: z.string().optional(),
});

app.get('/suggestions', zValidator('query', suggestionsQuerySchema), async (c) => {
  const { contentType, ...context } = c.req.valid('query');

  const suggestions = generatePromptSuggestions(contentType, context);

  return c.json({ suggestions });
});

// Generate image schema
const generateImageSchema = z.object({
  prompt: z.string().min(10).max(1000),
  style: z.enum(['banner', 'promo', 'event', 'poster', 'social']).optional(),
  translatePrompt: z.boolean().default(true),
});

// Generate image (Business Premium only)
app.post('/generate', authMiddleware, zValidator('json', generateImageSchema), async (c) => {
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

  if (!isAiGenerationAvailable()) {
    return c.json({ error: 'AI generation service not configured' }, 503);
  }

  const data = c.req.valid('json');

  // Optionally translate prompt for better AI results
  const finalPrompt = data.translatePrompt
    ? translatePromptForAI(data.prompt)
    : data.prompt;

  // Create generation record
  const [generation] = await db
    .insert(aiImageGenerations)
    .values({
      businessId: biz.id,
      userId: user.id,
      prompt: data.prompt,
      style: data.style || null,
      status: 'generating',
    })
    .returning();

  try {
    // Generate image
    const result = await generateImage({
      prompt: finalPrompt,
      style: data.style,
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
      revisedPrompt: result.revisedPrompt,
      prompt: data.prompt,
      style: data.style,
    }, 201);
  } catch (error) {
    // Update record with error
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

// Get generation history
const historyQuerySchema = z.object({
  limit: z.coerce.number().min(1).max(50).default(20),
  offset: z.coerce.number().min(0).default(0),
});

app.get('/history', authMiddleware, zValidator('query', historyQuerySchema), async (c) => {
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

  return c.json(history);
});

// Mark generation as used
const markUsedSchema = z.object({
  usedFor: z.enum(['event', 'promotion', 'banner']),
  usedForId: z.string().uuid(),
});

app.patch('/:id/used', authMiddleware, zValidator('json', markUsedSchema), async (c) => {
  const user = getCurrentUser(c);
  const generationId = c.req.param('id');

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

  const data = c.req.valid('json');

  // Update generation
  const [updated] = await db
    .update(aiImageGenerations)
    .set({
      usedFor: data.usedFor,
      usedForId: data.usedForId,
    })
    .where(
      and(
        eq(aiImageGenerations.id, generationId),
        eq(aiImageGenerations.businessId, business[0].id)
      )
    )
    .returning();

  if (!updated) {
    return c.json({ error: 'Generation not found' }, 404);
  }

  return c.json(updated);
});

export default app;
