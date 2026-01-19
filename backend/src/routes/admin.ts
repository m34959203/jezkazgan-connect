import { Hono } from 'hono';
import { db, users, businesses, events, promotions, cities, cityBanners } from '../db';
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

// ==================== CITY BANNERS ====================

// Get all banners for a city
admin.get('/cities/:cityId/banners', async (c) => {
  const { cityId } = c.req.param();

  try {
    const result = await db
      .select({
        id: cityBanners.id,
        cityId: cityBanners.cityId,
        businessId: cityBanners.businessId,
        title: cityBanners.title,
        description: cityBanners.description,
        imageUrl: cityBanners.imageUrl,
        link: cityBanners.link,
        linkType: cityBanners.linkType,
        position: cityBanners.position,
        isActive: cityBanners.isActive,
        startDate: cityBanners.startDate,
        endDate: cityBanners.endDate,
        viewsCount: cityBanners.viewsCount,
        clicksCount: cityBanners.clicksCount,
        createdAt: cityBanners.createdAt,
        businessName: businesses.name,
      })
      .from(cityBanners)
      .leftJoin(businesses, eq(cityBanners.businessId, businesses.id))
      .where(eq(cityBanners.cityId, cityId))
      .orderBy(cityBanners.position);

    // Get city info
    const [city] = await db.select().from(cities).where(eq(cities.id, cityId));

    return c.json({ banners: result, city });
  } catch (error) {
    console.error('City banners error:', error);
    return c.json({ error: 'Failed to fetch city banners' }, 500);
  }
});

// Create banner for a city
admin.post('/cities/:cityId/banners', async (c) => {
  const { cityId } = c.req.param();
  const body = await c.req.json();

  try {
    // Get max position
    const maxPositionResult = await db
      .select({ maxPos: sql<number>`COALESCE(MAX(${cityBanners.position}), -1)` })
      .from(cityBanners)
      .where(eq(cityBanners.cityId, cityId));

    const nextPosition = (maxPositionResult[0]?.maxPos ?? -1) + 1;

    const [created] = await db
      .insert(cityBanners)
      .values({
        cityId,
        businessId: body.businessId || null,
        title: body.title,
        description: body.description || null,
        imageUrl: body.imageUrl,
        link: body.link || null,
        linkType: body.linkType || 'external',
        position: body.position ?? nextPosition,
        isActive: body.isActive ?? true,
        startDate: body.startDate ? new Date(body.startDate) : null,
        endDate: body.endDate ? new Date(body.endDate) : null,
      })
      .returning();

    return c.json(created);
  } catch (error) {
    console.error('Create banner error:', error);
    return c.json({ error: 'Failed to create banner' }, 500);
  }
});

// Update banner
admin.patch('/cities/:cityId/banners/:bannerId', async (c) => {
  const { bannerId } = c.req.param();
  const body = await c.req.json();

  try {
    const updateData: any = {
      updatedAt: new Date(),
    };

    if (body.title !== undefined) updateData.title = body.title;
    if (body.description !== undefined) updateData.description = body.description;
    if (body.imageUrl !== undefined) updateData.imageUrl = body.imageUrl;
    if (body.link !== undefined) updateData.link = body.link;
    if (body.linkType !== undefined) updateData.linkType = body.linkType;
    if (body.position !== undefined) updateData.position = body.position;
    if (body.isActive !== undefined) updateData.isActive = body.isActive;
    if (body.businessId !== undefined) updateData.businessId = body.businessId || null;
    if (body.startDate !== undefined) updateData.startDate = body.startDate ? new Date(body.startDate) : null;
    if (body.endDate !== undefined) updateData.endDate = body.endDate ? new Date(body.endDate) : null;

    const [updated] = await db
      .update(cityBanners)
      .set(updateData)
      .where(eq(cityBanners.id, bannerId))
      .returning();

    return c.json(updated);
  } catch (error) {
    console.error('Update banner error:', error);
    return c.json({ error: 'Failed to update banner' }, 500);
  }
});

// Delete banner
admin.delete('/cities/:cityId/banners/:bannerId', async (c) => {
  const { bannerId } = c.req.param();

  try {
    await db.delete(cityBanners).where(eq(cityBanners.id, bannerId));
    return c.json({ success: true });
  } catch (error) {
    console.error('Delete banner error:', error);
    return c.json({ error: 'Failed to delete banner' }, 500);
  }
});

// Get all banners (for overview)
admin.get('/banners', async (c) => {
  try {
    const result = await db
      .select({
        id: cityBanners.id,
        cityId: cityBanners.cityId,
        title: cityBanners.title,
        imageUrl: cityBanners.imageUrl,
        isActive: cityBanners.isActive,
        viewsCount: cityBanners.viewsCount,
        clicksCount: cityBanners.clicksCount,
        createdAt: cityBanners.createdAt,
        cityName: cities.name,
        businessName: businesses.name,
      })
      .from(cityBanners)
      .leftJoin(cities, eq(cityBanners.cityId, cities.id))
      .leftJoin(businesses, eq(cityBanners.businessId, businesses.id))
      .orderBy(desc(cityBanners.createdAt));

    const [total] = await db.select({ count: count() }).from(cityBanners);
    const [active] = await db.select({ count: count() }).from(cityBanners).where(eq(cityBanners.isActive, true));

    return c.json({
      banners: result,
      total: total.count,
      activeCount: active.count,
    });
  } catch (error) {
    console.error('Banners error:', error);
    return c.json({ error: 'Failed to fetch banners' }, 500);
  }
});

// ==================== ANALYTICS ====================

admin.get('/analytics', async (c) => {
  try {
    const { period = '30' } = c.req.query();
    const days = parseInt(period);
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    // Get total counts and changes
    const [totalUsers] = await db.select({ count: count() }).from(users);
    const [newUsers] = await db.select({ count: count() }).from(users).where(gte(users.createdAt, startDate));

    const [totalBusinesses] = await db.select({ count: count() }).from(businesses);
    const [newBusinesses] = await db.select({ count: count() }).from(businesses).where(gte(businesses.createdAt, startDate));

    const [totalEvents] = await db.select({ count: count() }).from(events);
    const [totalPromotions] = await db.select({ count: count() }).from(promotions);

    // Get views stats
    const [eventsViews] = await db.select({
      total: sql<number>`COALESCE(SUM(${events.viewsCount}), 0)::int`
    }).from(events);

    const [promotionsViews] = await db.select({
      total: sql<number>`COALESCE(SUM(${promotions.viewsCount}), 0)::int`
    }).from(promotions);

    // Users by city (top 5)
    const usersByCity = await db
      .select({
        cityName: cities.name,
        count: sql<number>`count(*)::int`,
      })
      .from(businesses)
      .leftJoin(cities, eq(businesses.cityId, cities.id))
      .groupBy(cities.name)
      .orderBy(desc(sql`count(*)`))
      .limit(5);

    // Events by category
    const eventsByCategory = await db
      .select({
        category: events.category,
        count: sql<number>`count(*)::int`,
        views: sql<number>`COALESCE(SUM(${events.viewsCount}), 0)::int`,
      })
      .from(events)
      .groupBy(events.category)
      .orderBy(desc(sql`sum(${events.viewsCount})`))
      .limit(5);

    // Tier distribution
    const [freeBusinesses] = await db.select({ count: count() }).from(businesses).where(eq(businesses.tier, 'free'));
    const [liteBusinesses] = await db.select({ count: count() }).from(businesses).where(eq(businesses.tier, 'lite'));
    const [premiumBusinesses] = await db.select({ count: count() }).from(businesses).where(eq(businesses.tier, 'premium'));

    // Premium users
    const [premiumUsers] = await db.select({ count: count() }).from(users).where(eq(users.isPremium, true));

    return c.json({
      overview: {
        totalUsers: totalUsers.count,
        newUsers: newUsers.count,
        totalBusinesses: totalBusinesses.count,
        newBusinesses: newBusinesses.count,
        totalEvents: totalEvents.count,
        totalPromotions: totalPromotions.count,
        totalViews: (eventsViews.total || 0) + (promotionsViews.total || 0),
      },
      usersByCity: usersByCity.map((c, i) => ({
        name: c.cityName || 'Не указан',
        count: c.count,
        percentage: Math.round((c.count / Math.max(totalBusinesses.count, 1)) * 100),
      })),
      eventsByCategory: eventsByCategory.map(c => ({
        category: c.category,
        count: c.count,
        views: c.views,
      })),
      tierDistribution: {
        free: freeBusinesses.count,
        lite: liteBusinesses.count,
        premium: premiumBusinesses.count,
      },
      conversionMetrics: {
        premiumUsers: premiumUsers.count,
        premiumBusinesses: premiumBusinesses.count,
        conversionRate: totalBusinesses.count > 0
          ? Math.round((premiumBusinesses.count / totalBusinesses.count) * 100 * 10) / 10
          : 0,
      },
      period: days,
    });
  } catch (error) {
    console.error('Analytics error:', error);
    return c.json({ error: 'Failed to fetch analytics' }, 500);
  }
});

// ==================== MODERATION ====================

// Get pending content for moderation
admin.get('/moderation', async (c) => {
  try {
    // Get pending events
    const pendingEvents = await db
      .select({
        id: events.id,
        title: events.title,
        category: events.category,
        createdAt: events.createdAt,
        cityName: cities.name,
        businessName: businesses.name,
        creatorEmail: users.email,
      })
      .from(events)
      .leftJoin(cities, eq(events.cityId, cities.id))
      .leftJoin(businesses, eq(events.businessId, businesses.id))
      .leftJoin(users, eq(events.creatorId, users.id))
      .where(eq(events.isApproved, false))
      .orderBy(desc(events.createdAt))
      .limit(20);

    // Get unverified businesses
    const pendingBusinesses = await db
      .select({
        id: businesses.id,
        name: businesses.name,
        category: businesses.category,
        createdAt: businesses.createdAt,
        cityName: cities.name,
        ownerEmail: users.email,
        ownerName: users.name,
      })
      .from(businesses)
      .leftJoin(cities, eq(businesses.cityId, cities.id))
      .leftJoin(users, eq(businesses.ownerId, users.id))
      .where(eq(businesses.isVerified, false))
      .orderBy(desc(businesses.createdAt))
      .limit(20);

    // Counts
    const [pendingEventsCount] = await db.select({ count: count() }).from(events).where(eq(events.isApproved, false));
    const [pendingBusinessesCount] = await db.select({ count: count() }).from(businesses).where(eq(businesses.isVerified, false));

    return c.json({
      pendingEvents: pendingEvents.map(e => ({
        ...e,
        type: 'event',
      })),
      pendingBusinesses: pendingBusinesses.map(b => ({
        ...b,
        type: 'business',
      })),
      counts: {
        events: pendingEventsCount.count,
        businesses: pendingBusinessesCount.count,
        total: pendingEventsCount.count + pendingBusinessesCount.count,
      },
    });
  } catch (error) {
    console.error('Moderation error:', error);
    return c.json({ error: 'Failed to fetch moderation data' }, 500);
  }
});

// ==================== DELETE OPERATIONS ====================

// Delete user
admin.delete('/users/:id', async (c) => {
  const { id } = c.req.param();
  const currentUser = c.get('user');

  // Prevent self-deletion
  if (currentUser.id === id) {
    return c.json({ error: 'Cannot delete yourself' }, 400);
  }

  try {
    // Check if user has a business
    const userBusiness = await db.select().from(businesses).where(eq(businesses.ownerId, id)).limit(1);
    if (userBusiness.length) {
      // Delete business data first
      await db.delete(events).where(eq(events.businessId, userBusiness[0].id));
      await db.delete(promotions).where(eq(promotions.businessId, userBusiness[0].id));
      await db.delete(businesses).where(eq(businesses.id, userBusiness[0].id));
    }

    // Delete user events (created without business)
    await db.delete(events).where(eq(events.creatorId, id));

    // Delete user
    await db.delete(users).where(eq(users.id, id));

    return c.json({ success: true, message: 'User deleted' });
  } catch (error) {
    console.error('Delete user error:', error);
    return c.json({ error: 'Failed to delete user' }, 500);
  }
});

// Delete business
admin.delete('/businesses/:id', async (c) => {
  const { id } = c.req.param();

  try {
    const business = await db.select().from(businesses).where(eq(businesses.id, id)).limit(1);
    if (!business.length) {
      return c.json({ error: 'Business not found' }, 404);
    }

    const ownerId = business[0].ownerId;

    // Delete related data
    await db.delete(events).where(eq(events.businessId, id));
    await db.delete(promotions).where(eq(promotions.businessId, id));
    await db.delete(cityBanners).where(eq(cityBanners.businessId, id));

    // Delete business
    await db.delete(businesses).where(eq(businesses.id, id));

    // Reset owner role to user
    await db.update(users).set({ role: 'user' }).where(eq(users.id, ownerId));

    return c.json({ success: true, message: 'Business deleted' });
  } catch (error) {
    console.error('Delete business error:', error);
    return c.json({ error: 'Failed to delete business' }, 500);
  }
});

// Delete event
admin.delete('/events/:id', async (c) => {
  const { id } = c.req.param();

  try {
    await db.delete(events).where(eq(events.id, id));
    return c.json({ success: true, message: 'Event deleted' });
  } catch (error) {
    console.error('Delete event error:', error);
    return c.json({ error: 'Failed to delete event' }, 500);
  }
});

// Delete promotion
admin.delete('/promotions/:id', async (c) => {
  const { id } = c.req.param();

  try {
    await db.delete(promotions).where(eq(promotions.id, id));
    return c.json({ success: true, message: 'Promotion deleted' });
  } catch (error) {
    console.error('Delete promotion error:', error);
    return c.json({ error: 'Failed to delete promotion' }, 500);
  }
});

// Delete city
admin.delete('/cities/:id', async (c) => {
  const { id } = c.req.param();

  try {
    // Check if city has businesses
    const [businessCount] = await db.select({ count: count() }).from(businesses).where(eq(businesses.cityId, id));
    if (businessCount.count > 0) {
      return c.json({ error: 'Cannot delete city with businesses' }, 400);
    }

    // Delete banners
    await db.delete(cityBanners).where(eq(cityBanners.cityId, id));

    // Delete city
    await db.delete(cities).where(eq(cities.id, id));

    return c.json({ success: true, message: 'City deleted' });
  } catch (error) {
    console.error('Delete city error:', error);
    return c.json({ error: 'Failed to delete city' }, 500);
  }
});

export default admin;
