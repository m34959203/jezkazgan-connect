import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { z } from 'zod';
import { eq, and, desc, sql } from 'drizzle-orm';
import { db, businesses, cities, users, events, promotions } from '../db';
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

// GET /businesses/me - бизнес текущего пользователя
app.get('/me', authMiddleware, async (c) => {
  const user = getCurrentUser(c);

  if (!user) {
    return c.json({ error: 'Unauthorized' }, 401);
  }

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
      tierUntil: businesses.tierUntil,
      postsThisMonth: businesses.postsThisMonth,
      createdAt: businesses.createdAt,
      city: {
        id: cities.id,
        name: cities.name,
        slug: cities.slug,
      },
    })
    .from(businesses)
    .leftJoin(cities, eq(businesses.cityId, cities.id))
    .where(eq(businesses.ownerId, user.id))
    .limit(1);

  if (!result.length) {
    return c.json({ error: 'Business not found', message: 'User does not have a business' }, 404);
  }

  return c.json(result[0]);
});

// GET /businesses/me/stats - статистика бизнеса текущего пользователя
app.get('/me/stats', authMiddleware, async (c) => {
  const user = getCurrentUser(c);

  if (!user) {
    return c.json({ error: 'Unauthorized' }, 401);
  }

  // Найти бизнес пользователя
  const business = await db
    .select({ id: businesses.id })
    .from(businesses)
    .where(eq(businesses.ownerId, user.id))
    .limit(1);

  if (!business.length) {
    return c.json({ error: 'Business not found' }, 404);
  }

  const businessId = business[0].id;

  // Получить статистику событий
  const eventsStats = await db
    .select({
      total: sql<number>`count(*)::int`,
      totalViews: sql<number>`coalesce(sum(${events.viewsCount}), 0)::int`,
      approved: sql<number>`count(*) filter (where ${events.isApproved} = true)::int`,
      pending: sql<number>`count(*) filter (where ${events.isApproved} = false)::int`,
    })
    .from(events)
    .where(eq(events.businessId, businessId));

  // Получить статистику акций
  const promotionsStats = await db
    .select({
      total: sql<number>`count(*)::int`,
      totalViews: sql<number>`coalesce(sum(${promotions.viewsCount}), 0)::int`,
      active: sql<number>`count(*) filter (where ${promotions.isActive} = true and ${promotions.validUntil} >= now())::int`,
    })
    .from(promotions)
    .where(eq(promotions.businessId, businessId));

  // Получить последние публикации
  const recentEvents = await db
    .select({
      id: events.id,
      title: events.title,
      type: sql<string>`'event'`,
      status: sql<string>`case when ${events.isApproved} then 'approved' else 'pending' end`,
      viewsCount: events.viewsCount,
      createdAt: events.createdAt,
    })
    .from(events)
    .where(eq(events.businessId, businessId))
    .orderBy(desc(events.createdAt))
    .limit(5);

  const recentPromotions = await db
    .select({
      id: promotions.id,
      title: promotions.title,
      type: sql<string>`'promotion'`,
      status: sql<string>`case when ${promotions.isActive} and ${promotions.validUntil} >= now() then 'active' else 'expired' end`,
      viewsCount: promotions.viewsCount,
      createdAt: promotions.createdAt,
    })
    .from(promotions)
    .where(eq(promotions.businessId, businessId))
    .orderBy(desc(promotions.createdAt))
    .limit(5);

  return c.json({
    events: eventsStats[0],
    promotions: promotionsStats[0],
    totalViews: (eventsStats[0]?.totalViews || 0) + (promotionsStats[0]?.totalViews || 0),
    recentPublications: [...recentEvents, ...recentPromotions]
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 10),
  });
});

// GET /businesses/me/publications - публикации бизнеса
app.get('/me/publications', authMiddleware, async (c) => {
  const user = getCurrentUser(c);

  if (!user) {
    return c.json({ error: 'Unauthorized' }, 401);
  }

  // Найти бизнес пользователя
  const business = await db
    .select({ id: businesses.id })
    .from(businesses)
    .where(eq(businesses.ownerId, user.id))
    .limit(1);

  if (!business.length) {
    return c.json({ error: 'Business not found' }, 404);
  }

  const businessId = business[0].id;

  // Получить события
  const businessEvents = await db
    .select({
      id: events.id,
      title: events.title,
      description: events.description,
      category: events.category,
      image: events.image,
      date: events.date,
      location: events.location,
      isApproved: events.isApproved,
      viewsCount: events.viewsCount,
      createdAt: events.createdAt,
    })
    .from(events)
    .where(eq(events.businessId, businessId))
    .orderBy(desc(events.createdAt));

  // Получить акции
  const businessPromotions = await db
    .select({
      id: promotions.id,
      title: promotions.title,
      description: promotions.description,
      image: promotions.image,
      discount: promotions.discount,
      validUntil: promotions.validUntil,
      isActive: promotions.isActive,
      viewsCount: promotions.viewsCount,
      createdAt: promotions.createdAt,
    })
    .from(promotions)
    .where(eq(promotions.businessId, businessId))
    .orderBy(desc(promotions.createdAt));

  return c.json({
    events: businessEvents.map(e => ({
      ...e,
      type: 'event',
      status: e.isApproved ? 'approved' : 'pending',
    })),
    promotions: businessPromotions.map(p => ({
      ...p,
      type: 'promotion',
      status: p.isActive && new Date(p.validUntil) >= new Date() ? 'active' : 'expired',
    })),
  });
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

// DELETE /businesses/me - удалить свой бизнес
app.delete('/me', authMiddleware, async (c) => {
  const user = getCurrentUser(c);

  if (!user) {
    return c.json({ error: 'Unauthorized' }, 401);
  }

  // Найти бизнес пользователя
  const business = await db
    .select()
    .from(businesses)
    .where(eq(businesses.ownerId, user.id))
    .limit(1);

  if (!business.length) {
    return c.json({ error: 'Business not found' }, 404);
  }

  const businessId = business[0].id;

  // Удалить все связанные данные (события, акции)
  // События бизнеса
  await db.delete(events).where(eq(events.businessId, businessId));

  // Акции бизнеса
  await db.delete(promotions).where(eq(promotions.businessId, businessId));

  // Удалить сам бизнес
  await db.delete(businesses).where(eq(businesses.id, businessId));

  // Вернуть роль пользователя на user
  await db
    .update(users)
    .set({ role: 'user' })
    .where(eq(users.id, user.id));

  return c.json({ success: true, message: 'Бизнес успешно удален' });
});

// DELETE /businesses/:id - удалить бизнес (только для админов)
app.delete('/:id', authMiddleware, async (c) => {
  const id = c.req.param('id');
  const user = getCurrentUser(c);

  if (!user) {
    return c.json({ error: 'Unauthorized' }, 401);
  }

  // Найти бизнес
  const business = await db
    .select()
    .from(businesses)
    .where(eq(businesses.id, id))
    .limit(1);

  if (!business.length) {
    return c.json({ error: 'Business not found' }, 404);
  }

  // Только владелец или админ может удалить
  if (business[0].ownerId !== user.id && user.role !== 'admin') {
    return c.json({ error: 'Access denied' }, 403);
  }

  const businessId = business[0].id;
  const ownerId = business[0].ownerId;

  // Удалить все связанные данные
  await db.delete(events).where(eq(events.businessId, businessId));
  await db.delete(promotions).where(eq(promotions.businessId, businessId));

  // Удалить бизнес
  await db.delete(businesses).where(eq(businesses.id, businessId));

  // Вернуть роль владельца на user
  await db
    .update(users)
    .set({ role: 'user' })
    .where(eq(users.id, ownerId));

  return c.json({ success: true, message: 'Бизнес успешно удален' });
});

export default app;
