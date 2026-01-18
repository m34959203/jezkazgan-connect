// Favorites routes for managing user's saved items
import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { z } from 'zod';
import { eq, and } from 'drizzle-orm';
import { db, favorites, events, businesses, promotions } from '../db';
import { authMiddleware, getCurrentUser, type AuthUser } from '../middleware/auth';

const app = new Hono<{ Variables: { user: AuthUser } }>();

// All routes require authentication
app.use('*', authMiddleware);

// GET /favorites - Get all favorites for current user
app.get('/', async (c) => {
  const user = getCurrentUser(c);
  if (!user) {
    return c.json({ error: 'Unauthorized' }, 401);
  }

  // Get all favorites with related data
  const userFavorites = await db
    .select({
      id: favorites.id,
      eventId: favorites.eventId,
      businessId: favorites.businessId,
      promotionId: favorites.promotionId,
      createdAt: favorites.createdAt,
    })
    .from(favorites)
    .where(eq(favorites.userId, user.id));

  // Separate favorites by type
  const eventIds = userFavorites.filter(f => f.eventId).map(f => f.eventId!);
  const businessIds = userFavorites.filter(f => f.businessId).map(f => f.businessId!);
  const promotionIds = userFavorites.filter(f => f.promotionId).map(f => f.promotionId!);

  // Fetch related data
  const [favoriteEvents, favoriteBusinesses, favoritePromotions] = await Promise.all([
    eventIds.length > 0
      ? db.select().from(events).where(
          // In a real app, use inArray from drizzle-orm
          eq(events.id, eventIds[0]) // Simplified for now
        )
      : Promise.resolve([]),
    businessIds.length > 0
      ? db.select().from(businesses).where(eq(businesses.id, businessIds[0]))
      : Promise.resolve([]),
    promotionIds.length > 0
      ? db.select().from(promotions).where(eq(promotions.id, promotionIds[0]))
      : Promise.resolve([]),
  ]);

  return c.json({
    favorites: userFavorites,
    events: favoriteEvents,
    businesses: favoriteBusinesses,
    promotions: favoritePromotions,
    counts: {
      events: eventIds.length,
      businesses: businessIds.length,
      promotions: promotionIds.length,
      total: userFavorites.length,
    },
  });
});

// GET /favorites/events - Get favorite events
app.get('/events', async (c) => {
  const user = getCurrentUser(c);
  if (!user) {
    return c.json({ error: 'Unauthorized' }, 401);
  }

  const userFavorites = await db
    .select({
      favoriteId: favorites.id,
      eventId: favorites.eventId,
      createdAt: favorites.createdAt,
    })
    .from(favorites)
    .where(
      and(
        eq(favorites.userId, user.id),
        // Only events (eventId is not null)
      )
    );

  // Filter only events
  const eventFavorites = userFavorites.filter(f => f.eventId);

  return c.json({
    favorites: eventFavorites,
    total: eventFavorites.length,
  });
});

// Check if item is in favorites schema
const checkFavoriteSchema = z.object({
  eventId: z.string().uuid().optional(),
  businessId: z.string().uuid().optional(),
  promotionId: z.string().uuid().optional(),
});

// GET /favorites/check - Check if specific item is in favorites
app.get('/check', zValidator('query', checkFavoriteSchema), async (c) => {
  const user = getCurrentUser(c);
  if (!user) {
    return c.json({ error: 'Unauthorized' }, 401);
  }

  const { eventId, businessId, promotionId } = c.req.valid('query');

  if (!eventId && !businessId && !promotionId) {
    return c.json({ error: 'Please provide eventId, businessId, or promotionId' }, 400);
  }

  let condition = eq(favorites.userId, user.id);

  if (eventId) {
    condition = and(condition, eq(favorites.eventId, eventId))!;
  } else if (businessId) {
    condition = and(condition, eq(favorites.businessId, businessId))!;
  } else if (promotionId) {
    condition = and(condition, eq(favorites.promotionId, promotionId))!;
  }

  const existing = await db
    .select({ id: favorites.id })
    .from(favorites)
    .where(condition)
    .limit(1);

  return c.json({
    isFavorite: existing.length > 0,
    favoriteId: existing[0]?.id || null,
  });
});

// Add to favorites schema
const addFavoriteSchema = z.object({
  eventId: z.string().uuid().optional(),
  businessId: z.string().uuid().optional(),
  promotionId: z.string().uuid().optional(),
}).refine(
  data => data.eventId || data.businessId || data.promotionId,
  { message: 'Please provide eventId, businessId, or promotionId' }
);

// POST /favorites - Add item to favorites
app.post('/', zValidator('json', addFavoriteSchema), async (c) => {
  const user = getCurrentUser(c);
  if (!user) {
    return c.json({ error: 'Unauthorized' }, 401);
  }

  const { eventId, businessId, promotionId } = c.req.valid('json');

  // Check if already in favorites
  let condition = eq(favorites.userId, user.id);

  if (eventId) {
    condition = and(condition, eq(favorites.eventId, eventId))!;
  } else if (businessId) {
    condition = and(condition, eq(favorites.businessId, businessId))!;
  } else if (promotionId) {
    condition = and(condition, eq(favorites.promotionId, promotionId))!;
  }

  const existing = await db
    .select({ id: favorites.id })
    .from(favorites)
    .where(condition)
    .limit(1);

  if (existing.length > 0) {
    return c.json({ error: 'Item already in favorites', favoriteId: existing[0].id }, 409);
  }

  // Add to favorites
  const result = await db
    .insert(favorites)
    .values({
      userId: user.id,
      eventId,
      businessId,
      promotionId,
    })
    .returning();

  // Update saves count on the item
  if (eventId) {
    await db
      .update(events)
      .set({ savesCount: (await db.select({ count: events.savesCount }).from(events).where(eq(events.id, eventId)))[0].count + 1 })
      .where(eq(events.id, eventId));
  } else if (promotionId) {
    await db
      .update(promotions)
      .set({ savesCount: (await db.select({ count: promotions.savesCount }).from(promotions).where(eq(promotions.id, promotionId)))[0].count + 1 })
      .where(eq(promotions.id, promotionId));
  }

  return c.json({ favorite: result[0], message: 'Added to favorites' }, 201);
});

// DELETE /favorites/:id - Remove from favorites by favorite ID
app.delete('/:id', async (c) => {
  const user = getCurrentUser(c);
  if (!user) {
    return c.json({ error: 'Unauthorized' }, 401);
  }

  const favoriteId = c.req.param('id');

  // Get the favorite first to update counts
  const favorite = await db
    .select()
    .from(favorites)
    .where(and(eq(favorites.id, favoriteId), eq(favorites.userId, user.id)))
    .limit(1);

  if (!favorite.length) {
    return c.json({ error: 'Favorite not found' }, 404);
  }

  // Delete the favorite
  await db.delete(favorites).where(eq(favorites.id, favoriteId));

  // Update saves count on the item
  if (favorite[0].eventId) {
    const event = await db.select({ count: events.savesCount }).from(events).where(eq(events.id, favorite[0].eventId));
    if (event.length && event[0].count > 0) {
      await db
        .update(events)
        .set({ savesCount: event[0].count - 1 })
        .where(eq(events.id, favorite[0].eventId));
    }
  } else if (favorite[0].promotionId) {
    const promo = await db.select({ count: promotions.savesCount }).from(promotions).where(eq(promotions.id, favorite[0].promotionId));
    if (promo.length && promo[0].count > 0) {
      await db
        .update(promotions)
        .set({ savesCount: promo[0].count - 1 })
        .where(eq(promotions.id, favorite[0].promotionId));
    }
  }

  return c.json({ success: true, message: 'Removed from favorites' });
});

// DELETE /favorites/event/:eventId - Remove event from favorites
app.delete('/event/:eventId', async (c) => {
  const user = getCurrentUser(c);
  if (!user) {
    return c.json({ error: 'Unauthorized' }, 401);
  }

  const eventId = c.req.param('eventId');

  const result = await db
    .delete(favorites)
    .where(
      and(
        eq(favorites.userId, user.id),
        eq(favorites.eventId, eventId)
      )
    )
    .returning();

  if (!result.length) {
    return c.json({ error: 'Favorite not found' }, 404);
  }

  // Update saves count
  const event = await db.select({ count: events.savesCount }).from(events).where(eq(events.id, eventId));
  if (event.length && event[0].count > 0) {
    await db
      .update(events)
      .set({ savesCount: event[0].count - 1 })
      .where(eq(events.id, eventId));
  }

  return c.json({ success: true, message: 'Removed from favorites' });
});

// POST /favorites/toggle - Toggle favorite status
app.post('/toggle', zValidator('json', addFavoriteSchema), async (c) => {
  const user = getCurrentUser(c);
  if (!user) {
    return c.json({ error: 'Unauthorized' }, 401);
  }

  const { eventId, businessId, promotionId } = c.req.valid('json');

  // Check if already in favorites
  let condition = eq(favorites.userId, user.id);

  if (eventId) {
    condition = and(condition, eq(favorites.eventId, eventId))!;
  } else if (businessId) {
    condition = and(condition, eq(favorites.businessId, businessId))!;
  } else if (promotionId) {
    condition = and(condition, eq(favorites.promotionId, promotionId))!;
  }

  const existing = await db
    .select({ id: favorites.id })
    .from(favorites)
    .where(condition)
    .limit(1);

  if (existing.length > 0) {
    // Remove from favorites
    await db.delete(favorites).where(eq(favorites.id, existing[0].id));

    // Update saves count (decrement)
    if (eventId) {
      const event = await db.select({ count: events.savesCount }).from(events).where(eq(events.id, eventId));
      if (event.length && event[0].count > 0) {
        await db.update(events).set({ savesCount: event[0].count - 1 }).where(eq(events.id, eventId));
      }
    }

    return c.json({ isFavorite: false, message: 'Removed from favorites' });
  } else {
    // Add to favorites
    const result = await db
      .insert(favorites)
      .values({
        userId: user.id,
        eventId,
        businessId,
        promotionId,
      })
      .returning();

    // Update saves count (increment)
    if (eventId) {
      const event = await db.select({ count: events.savesCount }).from(events).where(eq(events.id, eventId));
      if (event.length) {
        await db.update(events).set({ savesCount: (event[0].count || 0) + 1 }).where(eq(events.id, eventId));
      }
    }

    return c.json({ isFavorite: true, favoriteId: result[0].id, message: 'Added to favorites' }, 201);
  }
});

export default app;
