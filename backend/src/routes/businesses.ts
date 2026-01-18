import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { z } from 'zod';
import { eq, and, desc, sql } from 'drizzle-orm';
import { db, businesses, cities, users } from '../db';
import { authMiddleware, getCurrentUser, type AuthUser } from '../middleware/auth';

const app = new Hono<{ Variables: { user: AuthUser } }>();

// Query params schema
const listQuerySchema = z.object({
  cityId: z.string().uuid().optional(),
  category: z.string().optional(),
  isVerified: z.coerce.boolean().optional(),
  limit: z.coerce.number().min(1).max(100).default(20),
  offset: z.coerce.number().min(0).default(0),
});

// GET /businesses - список бизнесов
app.get('/', zValidator('query', listQuerySchema), async (c) => {
  const { cityId, category, isVerified, limit, offset } = c.req.valid('query');

  const conditions = [];

  if (cityId) conditions.push(eq(businesses.cityId, cityId));
  if (category) conditions.push(eq(businesses.category, category as any));
  if (isVerified !== undefined) conditions.push(eq(businesses.isVerified, isVerified));

  const result = await db
    .select({
      id: businesses.id,
      name: businesses.name,
      description: businesses.description,
      category: businesses.category,
      address: businesses.address,
      phone: businesses.phone,
      instagram: businesses.instagram,
      logo: businesses.logo,
      isVerified: businesses.isVerified,
      tier: businesses.tier,
      city: {
        id: cities.id,
        name: cities.name,
        slug: cities.slug,
      },
    })
    .from(businesses)
    .leftJoin(cities, eq(businesses.cityId, cities.id))
    .where(conditions.length ? and(...conditions) : undefined)
    .orderBy(desc(businesses.isVerified), desc(businesses.tier), businesses.name)
    .limit(limit)
    .offset(offset);

  return c.json(result);
});

// GET /businesses/:id - бизнес по ID
app.get('/:id', async (c) => {
  const id = c.req.param('id');

  const result = await db
    .select({
      id: businesses.id,
      name: businesses.name,
      description: businesses.description,
      category: businesses.category,
      address: businesses.address,
      phone: businesses.phone,
      whatsapp: businesses.whatsapp,
      instagram: businesses.instagram,
      website: businesses.website,
      logo: businesses.logo,
      cover: businesses.cover,
      isVerified: businesses.isVerified,
      tier: businesses.tier,
      createdAt: businesses.createdAt,
      city: {
        id: cities.id,
        name: cities.name,
        slug: cities.slug,
      },
      owner: {
        id: users.id,
        name: users.name,
      },
    })
    .from(businesses)
    .leftJoin(cities, eq(businesses.cityId, cities.id))
    .leftJoin(users, eq(businesses.ownerId, users.id))
    .where(eq(businesses.id, id))
    .limit(1);

  if (!result.length) {
    return c.json({ error: 'Business not found' }, 404);
  }

  return c.json(result[0]);
});

// Create business schema
const createBusinessSchema = z.object({
  cityId: z.string().uuid(),
  name: z.string().min(2).max(200),
  description: z.string().optional(),
  category: z.enum(['restaurants', 'cafes', 'sports', 'beauty', 'education', 'services', 'shopping', 'entertainment', 'other']),
  address: z.string().optional(),
  phone: z.string().optional(),
  whatsapp: z.string().optional(),
  instagram: z.string().optional(),
  website: z.string().url().optional(),
  logo: z.string().url().optional(),
  cover: z.string().url().optional(),
});

// POST /businesses - создать бизнес
app.post('/', authMiddleware, zValidator('json', createBusinessSchema), async (c) => {
  const user = getCurrentUser(c);

  if (!user) {
    return c.json({ error: 'Unauthorized' }, 401);
  }

  const data = c.req.valid('json');

  // Проверить, есть ли уже бизнес у пользователя
  const existing = await db
    .select()
    .from(businesses)
    .where(eq(businesses.ownerId, user.id))
    .limit(1);

  if (existing.length) {
    return c.json({ error: 'User already has a business' }, 400);
  }

  // Обновить роль пользователя на business
  await db
    .update(users)
    .set({ role: 'business' })
    .where(eq(users.id, user.id));

  const result = await db
    .insert(businesses)
    .values({
      ...data,
      ownerId: user.id,
      tier: 'free',
      postsThisMonth: 0,
    })
    .returning();

  return c.json(result[0], 201);
});

// PUT /businesses/:id - обновить бизнес
app.put('/:id', authMiddleware, zValidator('json', createBusinessSchema.partial()), async (c) => {
  const id = c.req.param('id');
  const user = getCurrentUser(c);

  if (!user) {
    return c.json({ error: 'Unauthorized' }, 401);
  }

  // Проверить владельца (или админ/модератор может редактировать)
  const business = await db
    .select()
    .from(businesses)
    .where(eq(businesses.id, id))
    .limit(1);

  if (!business.length) {
    return c.json({ error: 'Business not found' }, 404);
  }

  // Только владелец или админ/модератор может редактировать
  if (business[0].ownerId !== user.id && user.role !== 'admin' && user.role !== 'moderator') {
    return c.json({ error: 'Access denied' }, 403);
  }

  const data = c.req.valid('json');

  const result = await db
    .update(businesses)
    .set({ ...data, updatedAt: new Date() })
    .where(eq(businesses.id, id))
    .returning();

  return c.json(result[0]);
});

export default app;
