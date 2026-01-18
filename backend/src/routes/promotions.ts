import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { z } from 'zod';
import { eq, and, gte, desc, sql } from 'drizzle-orm';
import { db, promotions, businesses, cities, users } from '../db';
import { authMiddleware, optionalAuthMiddleware, getCurrentUser, type AuthUser } from '../middleware/auth';

const app = new Hono<{ Variables: { user: AuthUser } }>();

// Query params schema
const listQuerySchema = z.object({
  cityId: z.string().uuid().optional(),
  businessId: z.string().uuid().optional(),
  includePremiumOnly: z.coerce.boolean().default(false),
  limit: z.coerce.number().min(1).max(100).default(20),
  offset: z.coerce.number().min(0).default(0),
});

// GET /promotions - список акций
app.get('/', optionalAuthMiddleware, zValidator('query', listQuerySchema), async (c) => {
  const { cityId, businessId, includePremiumOnly, limit, offset } = c.req.valid('query');
  const user = getCurrentUser(c);

  const conditions = [
    eq(promotions.isActive, true),
    gte(promotions.validUntil, new Date()),
  ];

  if (cityId) conditions.push(eq(promotions.cityId, cityId));
  if (businessId) conditions.push(eq(promotions.businessId, businessId));

  // Проверить premium статус пользователя
  const isPremiumUser = user?.isPremium || false;

  // Если пользователь не premium и не включён флаг, скрыть premium акции
  if (!isPremiumUser && !includePremiumOnly) {
    conditions.push(eq(promotions.isPremiumOnly, false));
  }

  const result = await db
    .select({
      id: promotions.id,
      title: promotions.title,
      description: promotions.description,
      image: promotions.image,
      discount: promotions.discount,
      validUntil: promotions.validUntil,
      isPremiumOnly: promotions.isPremiumOnly,
      viewsCount: promotions.viewsCount,
      savesCount: promotions.savesCount,
      business: {
        id: businesses.id,
        name: businesses.name,
        logo: businesses.logo,
        isVerified: businesses.isVerified,
      },
      city: {
        id: cities.id,
        name: cities.name,
        slug: cities.slug,
      },
    })
    .from(promotions)
    .leftJoin(businesses, eq(promotions.businessId, businesses.id))
    .leftJoin(cities, eq(promotions.cityId, cities.id))
    .where(and(...conditions))
    .orderBy(desc(promotions.createdAt))
    .limit(limit)
    .offset(offset);

  return c.json(result);
});

// GET /promotions/:id - акция по ID
app.get('/:id', optionalAuthMiddleware, async (c) => {
  const id = c.req.param('id');
  const user = getCurrentUser(c);

  const result = await db
    .select({
      id: promotions.id,
      title: promotions.title,
      description: promotions.description,
      image: promotions.image,
      discount: promotions.discount,
      conditions: promotions.conditions,
      validFrom: promotions.validFrom,
      validUntil: promotions.validUntil,
      isPremiumOnly: promotions.isPremiumOnly,
      viewsCount: promotions.viewsCount,
      savesCount: promotions.savesCount,
      createdAt: promotions.createdAt,
      business: {
        id: businesses.id,
        name: businesses.name,
        logo: businesses.logo,
        phone: businesses.phone,
        whatsapp: businesses.whatsapp,
        instagram: businesses.instagram,
        address: businesses.address,
        isVerified: businesses.isVerified,
      },
      city: {
        id: cities.id,
        name: cities.name,
        slug: cities.slug,
      },
    })
    .from(promotions)
    .leftJoin(businesses, eq(promotions.businessId, businesses.id))
    .leftJoin(cities, eq(promotions.cityId, cities.id))
    .where(eq(promotions.id, id))
    .limit(1);

  if (!result.length) {
    return c.json({ error: 'Promotion not found' }, 404);
  }

  const promo = result[0];

  // Проверить доступ к premium акции
  if (promo.isPremiumOnly && !user?.isPremium) {
    return c.json({ error: 'Premium subscription required' }, 403);
  }

  // Increment views
  await db
    .update(promotions)
    .set({ viewsCount: sql`${promotions.viewsCount} + 1` })
    .where(eq(promotions.id, id));

  return c.json(promo);
});

// Create promotion schema
const createPromotionSchema = z.object({
  title: z.string().min(3).max(200),
  description: z.string().optional(),
  image: z.string().url().optional(),
  discount: z.string(),
  conditions: z.string().optional(),
  validUntil: z.string().datetime(),
  isPremiumOnly: z.boolean().default(false),
});

// POST /promotions - создать акцию (только для бизнеса)
app.post('/', authMiddleware, zValidator('json', createPromotionSchema), async (c) => {
  const user = getCurrentUser(c);

  if (!user) {
    return c.json({ error: 'Unauthorized' }, 401);
  }

  // Получить бизнес пользователя
  const business = await db
    .select()
    .from(businesses)
    .where(eq(businesses.ownerId, user.id))
    .limit(1);

  if (!business.length) {
    return c.json({ error: 'Business account required' }, 403);
  }

  const biz = business[0];

  // Проверить лимит публикаций
  const limits = { free: 3, lite: 10, premium: Infinity };
  const postLimit = limits[biz.tier as keyof typeof limits];

  if (biz.postsThisMonth >= postLimit) {
    return c.json({
      error: 'Monthly post limit reached',
      limit: postLimit,
      current: biz.postsThisMonth,
      tier: biz.tier,
    }, 403);
  }

  const data = c.req.valid('json');

  const result = await db
    .insert(promotions)
    .values({
      ...data,
      validUntil: new Date(data.validUntil),
      businessId: biz.id,
      cityId: biz.cityId,
    })
    .returning();

  // Увеличить счётчик публикаций
  await db
    .update(businesses)
    .set({ postsThisMonth: sql`${businesses.postsThisMonth} + 1` })
    .where(eq(businesses.id, biz.id));

  return c.json(result[0], 201);
});

export default app;
