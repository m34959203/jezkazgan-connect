import { Hono } from 'hono';
import { db, users, businesses, events, promotions, cities } from '../db';
import { eq, desc, sql, count, and, gte, like, or } from 'drizzle-orm';
import { authMiddleware, adminMiddleware, type AuthUser } from '../middleware/auth';

const admin = new Hono<{ Variables: { user: AuthUser } }>();

// Use shared auth middleware + admin role check
admin.use('*', authMiddleware);
admin.use('*', adminMiddleware);

// ==================== STATS (Dashboard) ====================

admin.get('/stats', async (c) => {
  try {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const [usersCount] = await db.select({ count: count() }).from(users);
    const [businessesCount] = await db.select({ count: count() }).from(businesses);
    const [eventsCount] = await db.select({ count: count() }).from(events);
    const [promotionsCount] = await db.select({ count: count() }).from(promotions);

    const [pendingEvents] = await db
      .select({ count: count() })
      .from(events)
      .where(eq(events.isApproved, false));

    const [pendingBusinesses] = await db
      .select({ count: count() })
      .from(businesses)
      .where(eq(businesses.isVerified, false));

    const [newUsersThisMonth] = await db
      .select({ count: count() })
      .from(users)
      .where(gte(users.createdAt, thirtyDaysAgo));

    return c.json({
      users: usersCount.count,
      businesses: businessesCount.count,
      events: eventsCount.count,
      promotions: promotionsCount.count,
      pendingEvents: pendingEvents.count,
      pendingBusinesses: pendingBusinesses.count,
      newUsersThisMonth: newUsersThisMonth.count,
    });
  } catch (error) {
    console.error('Stats error:', error);
    return c.json({ error: 'Failed to fetch stats' }, 500);
  }
});

// ==================== USERS ====================

admin.get('/users', async (c) => {
  try {
    const { search, role, limit = '20', offset = '0' } = c.req.query();

    let query = db.select().from(users);

    const conditions = [];
    if (search) {
      conditions.push(
        or(
          like(users.name, `%${search}%`),
          like(users.email, `%${search}%`)
        )
      );
    }
    if (role && role !== 'all') {
      conditions.push(eq(users.role, role as any));
    }

    if (conditions.length > 0) {
      query = query.where(and(...conditions)) as any;
    }

    const result = await query
      .orderBy(desc(users.createdAt))
      .limit(Number(limit))
      .offset(Number(offset));

    const [total] = await db.select({ count: count() }).from(users);

    return c.json({
      users: result.map((u) => ({ ...u, passwordHash: undefined })),
      total: total.count,
    });
  } catch (error) {
    console.error('Users error:', error);
    return c.json({ error: 'Failed to fetch users' }, 500);
  }
});

admin.get('/users/:id', async (c) => {
  const { id } = c.req.param();
  try {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    if (!user) return c.json({ error: 'User not found' }, 404);
    return c.json({ ...user, passwordHash: undefined });
  } catch {
    return c.json({ error: 'Failed to fetch user' }, 500);
  }
});

admin.patch('/users/:id', async (c) => {
  const { id } = c.req.param();
  const body = await c.req.json();

  try {
    const [updated] = await db
      .update(users)
      .set({
        role: body.role,
        isPremium: body.isPremium,
        updatedAt: new Date(),
      })
      .where(eq(users.id, id))
      .returning();

    return c.json({ ...updated, passwordHash: undefined });
  } catch {
    return c.json({ error: 'Failed to update user' }, 500);
  }
});

// ==================== BUSINESSES ====================

admin.get('/businesses', async (c) => {
  try {
    const { search, tier, verified, limit = '20', offset = '0' } = c.req.query();

    const result = await db
      .select({
        id: businesses.id,
        name: businesses.name,
        category: businesses.category,
        tier: businesses.tier,
        isVerified: businesses.isVerified,
        postsThisMonth: businesses.postsThisMonth,
        createdAt: businesses.createdAt,
        ownerName: users.name,
        ownerEmail: users.email,
        cityName: cities.name,
      })
      .from(businesses)
      .leftJoin(users, eq(businesses.ownerId, users.id))
      .leftJoin(cities, eq(businesses.cityId, cities.id))
      .orderBy(desc(businesses.createdAt))
      .limit(Number(limit))
      .offset(Number(offset));

    const [total] = await db.select({ count: count() }).from(businesses);

    // Tier stats
    const [freeCount] = await db.select({ count: count() }).from(businesses).where(eq(businesses.tier, 'free'));
    const [liteCount] = await db.select({ count: count() }).from(businesses).where(eq(businesses.tier, 'lite'));
    const [premiumCount] = await db.select({ count: count() }).from(businesses).where(eq(businesses.tier, 'premium'));

    return c.json({
      businesses: result,
      total: total.count,
      tierStats: {
        free: freeCount.count,
        lite: liteCount.count,
        premium: premiumCount.count,
      },
    });
  } catch (error) {
    console.error('Businesses error:', error);
    return c.json({ error: 'Failed to fetch businesses' }, 500);
  }
});

admin.patch('/businesses/:id', async (c) => {
  const { id } = c.req.param();
  const body = await c.req.json();

  try {
    const [updated] = await db
      .update(businesses)
      .set({
        isVerified: body.isVerified,
        tier: body.tier,
        updatedAt: new Date(),
      })
      .where(eq(businesses.id, id))
      .returning();

    return c.json(updated);
  } catch {
    return c.json({ error: 'Failed to update business' }, 500);
  }
});

admin.patch('/businesses/:id/verify', async (c) => {
  const { id } = c.req.param();

  try {
    const [updated] = await db
      .update(businesses)
      .set({ isVerified: true, updatedAt: new Date() })
      .where(eq(businesses.id, id))
      .returning();

    return c.json(updated);
  } catch {
    return c.json({ error: 'Failed to verify business' }, 500);
  }
});

// ==================== EVENTS ====================

admin.get('/events', async (c) => {
  try {
    const { status, category, limit = '20', offset = '0' } = c.req.query();

    const result = await db
      .select({
        id: events.id,
        title: events.title,
        category: events.category,
        date: events.date,
        isApproved: events.isApproved,
        viewsCount: events.viewsCount,
        createdAt: events.createdAt,
        businessName: businesses.name,
        cityName: cities.name,
      })
      .from(events)
      .leftJoin(businesses, eq(events.businessId, businesses.id))
      .leftJoin(cities, eq(events.cityId, cities.id))
      .orderBy(desc(events.createdAt))
      .limit(Number(limit))
      .offset(Number(offset));

    const [total] = await db.select({ count: count() }).from(events);
    const [pending] = await db.select({ count: count() }).from(events).where(eq(events.isApproved, false));

    return c.json({
      events: result,
      total: total.count,
      pendingCount: pending.count,
    });
  } catch (error) {
    console.error('Events error:', error);
    return c.json({ error: 'Failed to fetch events' }, 500);
  }
});

admin.patch('/events/:id/approve', async (c) => {
  const { id } = c.req.param();

  try {
    const [updated] = await db
      .update(events)
      .set({ isApproved: true, updatedAt: new Date() })
      .where(eq(events.id, id))
      .returning();

    return c.json(updated);
  } catch {
    return c.json({ error: 'Failed to approve event' }, 500);
  }
});

admin.patch('/events/:id/reject', async (c) => {
  const { id } = c.req.param();

  try {
    // For now, just delete rejected events
    await db.delete(events).where(eq(events.id, id));
    return c.json({ success: true });
  } catch {
    return c.json({ error: 'Failed to reject event' }, 500);
  }
});

// ==================== PROMOTIONS ====================

admin.get('/promotions', async (c) => {
  try {
    const { limit = '20', offset = '0' } = c.req.query();

    const result = await db
      .select({
        id: promotions.id,
        title: promotions.title,
        discount: promotions.discount,
        validFrom: promotions.validFrom,
        validUntil: promotions.validUntil,
        isActive: promotions.isActive,
        viewsCount: promotions.viewsCount,
        createdAt: promotions.createdAt,
        businessName: businesses.name,
        cityName: cities.name,
      })
      .from(promotions)
      .leftJoin(businesses, eq(promotions.businessId, businesses.id))
      .leftJoin(cities, eq(promotions.cityId, cities.id))
      .orderBy(desc(promotions.createdAt))
      .limit(Number(limit))
      .offset(Number(offset));

    const [total] = await db.select({ count: count() }).from(promotions);

    return c.json({
      promotions: result,
      total: total.count,
    });
  } catch (error) {
    console.error('Promotions error:', error);
    return c.json({ error: 'Failed to fetch promotions' }, 500);
  }
});

admin.patch('/promotions/:id', async (c) => {
  const { id } = c.req.param();
  const body = await c.req.json();

  try {
    const [updated] = await db
      .update(promotions)
      .set({ isActive: body.isActive })
      .where(eq(promotions.id, id))
      .returning();

    return c.json(updated);
  } catch {
    return c.json({ error: 'Failed to update promotion' }, 500);
  }
});

// ==================== CITIES ====================

admin.get('/cities', async (c) => {
  try {
    const result = await db
      .select()
      .from(cities)
      .orderBy(desc(cities.population));

    return c.json({ cities: result });
  } catch (error) {
    console.error('Cities error:', error);
    return c.json({ error: 'Failed to fetch cities' }, 500);
  }
});

admin.post('/cities', async (c) => {
  const body = await c.req.json();

  try {
    const [created] = await db
      .insert(cities)
      .values({
        name: body.name,
        nameKz: body.nameKz,
        slug: body.slug,
        region: body.region,
        population: body.population,
        isActive: body.isActive ?? true,
      })
      .returning();

    return c.json(created);
  } catch {
    return c.json({ error: 'Failed to create city' }, 500);
  }
});

admin.patch('/cities/:id', async (c) => {
  const { id } = c.req.param();
  const body = await c.req.json();

  try {
    const [updated] = await db
      .update(cities)
      .set({
        name: body.name,
        nameKz: body.nameKz,
        slug: body.slug,
        region: body.region,
        isActive: body.isActive,
      })
      .where(eq(cities.id, id))
      .returning();

    return c.json(updated);
  } catch {
    return c.json({ error: 'Failed to update city' }, 500);
  }
});

export default admin;
