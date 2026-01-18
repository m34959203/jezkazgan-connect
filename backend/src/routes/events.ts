import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { z } from 'zod';
import { eq, and, gte, desc, asc, sql } from 'drizzle-orm';
import { db, events, businesses, cities } from '../db';
import { authMiddleware, getCurrentUser, type AuthUser } from '../middleware/auth';

const app = new Hono<{ Variables: { user: AuthUser } }>();

// Query params schema
const listQuerySchema = z.object({
  cityId: z.string().uuid().optional(),
  category: z.string().optional(),
  isFree: z.coerce.boolean().optional(),
  isFeatured: z.coerce.boolean().optional(),
  fromDate: z.string().optional(),
  limit: z.coerce.number().min(1).max(100).default(20),
  offset: z.coerce.number().min(0).default(0),
});

// GET /events - список событий
app.get('/', zValidator('query', listQuerySchema), async (c) => {
  const { cityId, category, isFree, isFeatured, fromDate, limit, offset } = c.req.valid('query');

  const conditions = [
    eq(events.isApproved, true),
    gte(events.date, new Date()),
  ];

  if (cityId) conditions.push(eq(events.cityId, cityId));
  if (category) conditions.push(eq(events.category, category as any));
  if (isFree !== undefined) conditions.push(eq(events.isFree, isFree));
  if (isFeatured !== undefined) conditions.push(eq(events.isFeatured, isFeatured));
  if (fromDate) conditions.push(gte(events.date, new Date(fromDate)));

  const result = await db
    .select({
      id: events.id,
      title: events.title,
      description: events.description,
      category: events.category,
      image: events.image,
      date: events.date,
      location: events.location,
      price: events.price,
      isFree: events.isFree,
      isFeatured: events.isFeatured,
      viewsCount: events.viewsCount,
      savesCount: events.savesCount,
      city: {
        id: cities.id,
        name: cities.name,
        slug: cities.slug,
      },
      business: {
        id: businesses.id,
        name: businesses.name,
        logo: businesses.logo,
      },
    })
    .from(events)
    .leftJoin(cities, eq(events.cityId, cities.id))
    .leftJoin(businesses, eq(events.businessId, businesses.id))
    .where(and(...conditions))
    .orderBy(asc(events.date))
    .limit(limit)
    .offset(offset);

  return c.json(result);
});

// GET /events/:id - событие по ID
app.get('/:id', async (c) => {
  const id = c.req.param('id');

  const result = await db
    .select({
      id: events.id,
      title: events.title,
      description: events.description,
      category: events.category,
      image: events.image,
      date: events.date,
      endDate: events.endDate,
      location: events.location,
      address: events.address,
      price: events.price,
      maxPrice: events.maxPrice,
      isFree: events.isFree,
      isFeatured: events.isFeatured,
      isApproved: events.isApproved,
      viewsCount: events.viewsCount,
      savesCount: events.savesCount,
      createdAt: events.createdAt,
      creatorId: events.creatorId,
      city: {
        id: cities.id,
        name: cities.name,
        slug: cities.slug,
      },
      business: {
        id: businesses.id,
        name: businesses.name,
        logo: businesses.logo,
        isVerified: businesses.isVerified,
      },
    })
    .from(events)
    .leftJoin(cities, eq(events.cityId, cities.id))
    .leftJoin(businesses, eq(events.businessId, businesses.id))
    .where(eq(events.id, id))
    .limit(1);

  if (!result.length) {
    return c.json({ error: 'Event not found' }, 404);
  }

  const event = result[0];

  // Проверка: неодобренные события видны только создателю
  if (!event.isApproved) {
    // Попробуем получить токен для проверки пользователя
    const authHeader = c.req.header('Authorization');
    let userId: string | null = null;

    if (authHeader?.startsWith('Bearer ')) {
      try {
        const { verify } = await import('hono/jwt');
        const { JWT_SECRET, JWT_ALG } = await import('../middleware/auth');
        const token = authHeader.substring(7);
        const payload = await verify(token, JWT_SECRET, JWT_ALG);
        userId = payload.userId as string;
      } catch {
        // Token invalid, treat as unauthenticated
      }
    }

    // Если пользователь не создатель - не показываем
    if (userId !== event.creatorId) {
      return c.json({ error: 'Event not found' }, 404);
    }
  }

  // Increment views only for approved events
  if (event.isApproved) {
    await db
      .update(events)
      .set({ viewsCount: sql`${events.viewsCount} + 1` })
      .where(eq(events.id, id));
  }

  return c.json(event);
});

// Create event schema
const createEventSchema = z.object({
  cityId: z.string().uuid(),
  businessId: z.string().uuid().optional(),
  title: z.string().min(3).max(200),
  description: z.string().optional(),
  category: z.enum(['concerts', 'education', 'seminars', 'leisure', 'sports', 'children', 'exhibitions', 'other']),
  image: z.string().url().optional(),
  date: z.string().datetime(),
  endDate: z.string().datetime().optional(),
  location: z.string().optional(),
  address: z.string().optional(),
  price: z.number().int().min(0).optional(),
  maxPrice: z.number().int().min(0).optional(),
  isFree: z.boolean().default(false),
});

// POST /events - создать событие (требует авторизации)
app.post('/', authMiddleware, zValidator('json', createEventSchema), async (c) => {
  const user = getCurrentUser(c);

  if (!user) {
    return c.json({ error: 'Unauthorized' }, 401);
  }

  const data = c.req.valid('json');

  // Если указан businessId, проверить что он принадлежит пользователю
  if (data.businessId) {
    const business = await db
      .select({ ownerId: businesses.ownerId })
      .from(businesses)
      .where(eq(businesses.id, data.businessId))
      .limit(1);

    if (!business.length) {
      return c.json({ error: 'Business not found' }, 404);
    }

    // Только владелец бизнеса, админ или модератор может создавать события от имени бизнеса
    if (business[0].ownerId !== user.id && user.role !== 'admin' && user.role !== 'moderator') {
      return c.json({ error: 'Access denied', message: 'You can only create events for your own business' }, 403);
    }
  }

  const result = await db
    .insert(events)
    .values({
      ...data,
      date: new Date(data.date),
      endDate: data.endDate ? new Date(data.endDate) : null,
      creatorId: user.id,
      isApproved: false, // Требует модерации
    })
    .returning();

  return c.json(result[0], 201);
});

export default app;
