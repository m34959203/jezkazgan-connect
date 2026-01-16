import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { z } from 'zod';
import { eq, and, gte, desc, asc, sql } from 'drizzle-orm';
import { db, events, businesses, cities } from '../db';

const app = new Hono();

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
      viewsCount: events.viewsCount,
      savesCount: events.savesCount,
      createdAt: events.createdAt,
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

  // Increment views
  await db
    .update(events)
    .set({ viewsCount: sql`${events.viewsCount} + 1` })
    .where(eq(events.id, id));

  return c.json(result[0]);
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
app.post('/', zValidator('json', createEventSchema), async (c) => {
  // TODO: Добавить middleware авторизации
  const userId = c.req.header('X-User-Id'); // Временно через header

  if (!userId) {
    return c.json({ error: 'Unauthorized' }, 401);
  }

  const data = c.req.valid('json');

  const result = await db
    .insert(events)
    .values({
      ...data,
      date: new Date(data.date),
      endDate: data.endDate ? new Date(data.endDate) : null,
      creatorId: userId,
      isApproved: false, // Требует модерации
    })
    .returning();

  return c.json(result[0], 201);
});

export default app;
