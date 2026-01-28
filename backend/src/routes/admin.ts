import { Hono } from 'hono';
import { db, users, businesses, events, promotions, cities, cityBanners, cityPhotos, cashbackWallets, cashbackTransactions, cashbackRules, cashbackPartnerPayments, referralCodes, referrals, referralRewardsConfig, businessMembers, favorites, autoPublishSettings, autoPublishHistory, aiImageGenerations, payments, reviews, reviewReplies, reviewVotes } from '../db';
import { eq, desc, sql, count, and, gte, lte, like, or, isNull, inArray } from 'drizzle-orm';
import { authMiddleware, adminMiddleware, type AuthUser } from '../middleware/auth';
import { onUserBecamePremium } from './referral';

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
    // Get current user state to check if premium status is changing
    const [currentUser] = await db.select().from(users).where(eq(users.id, id));
    if (!currentUser) {
      return c.json({ error: 'User not found' }, 404);
    }

    const wasNotPremium = !currentUser.isPremium;
    const becomingPremium = body.isPremium === true;

    const [updated] = await db
      .update(users)
      .set({
        role: body.role,
        isPremium: body.isPremium,
        updatedAt: new Date(),
      })
      .where(eq(users.id, id))
      .returning();

    // If user just became premium, trigger referral reward
    if (wasNotPremium && becomingPremium) {
      try {
        await onUserBecamePremium(id);
      } catch (err) {
        console.error('Failed to process referral premium bonus:', err);
        // Don't fail the request, just log the error
      }
    }

    return c.json({ ...updated, passwordHash: undefined });
  } catch {
    return c.json({ error: 'Failed to update user' }, 500);
  }
});

// ==================== BUSINESSES ====================

admin.get('/businesses', async (c) => {
  try {
    console.log('[Admin] GET /businesses called');
    const { search, tier, verified, limit = '20', offset = '0' } = c.req.query();

    const result = await db
      .select({
        id: businesses.id,
        name: businesses.name,
        description: businesses.description,
        category: businesses.category,
        tier: businesses.tier,
        isVerified: businesses.isVerified,
        postsThisMonth: businesses.postsThisMonth,
        createdAt: businesses.createdAt,
        ownerName: users.name,
        ownerEmail: users.email,
        cityName: cities.name,
        address: businesses.address,
        phone: businesses.phone,
        website: businesses.website,
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
    console.error('[Admin] Businesses error details:', {
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
    });
    return c.json({ error: 'Failed to fetch businesses' }, 500);
  }
});

admin.patch('/businesses/:id', async (c) => {
  const { id } = c.req.param();
  const body = await c.req.json();

  try {
    const updateData: any = {
      updatedAt: new Date(),
    };

    // Support for verification and tier changes
    if (body.isVerified !== undefined) updateData.isVerified = body.isVerified;
    if (body.tier !== undefined) updateData.tier = body.tier;

    // Support for editing business details
    if (body.name !== undefined) updateData.name = body.name;
    if (body.description !== undefined) updateData.description = body.description;
    if (body.category !== undefined) updateData.category = body.category;

    const [updated] = await db
      .update(businesses)
      .set(updateData)
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

    // Get all event and promotion IDs for this business
    const businessEvents = await db.select({ id: events.id }).from(events).where(eq(events.businessId, id));
    const eventIds = businessEvents.map(e => e.id);

    const businessPromotions = await db.select({ id: promotions.id }).from(promotions).where(eq(promotions.businessId, id));
    const promotionIds = businessPromotions.map(p => p.id);

    // Get all review IDs for this business (direct and via events)
    const businessReviews = await db.select({ id: reviews.id }).from(reviews).where(eq(reviews.businessId, id));
    let reviewIds = businessReviews.map(r => r.id);

    if (eventIds.length > 0) {
      const eventReviews = await db.select({ id: reviews.id }).from(reviews).where(inArray(reviews.eventId, eventIds));
      reviewIds = [...reviewIds, ...eventReviews.map(r => r.id)];
    }

    // Delete review replies and votes first (they reference reviews)
    if (reviewIds.length > 0) {
      await db.delete(reviewReplies).where(inArray(reviewReplies.reviewId, reviewIds));
      await db.delete(reviewVotes).where(inArray(reviewVotes.reviewId, reviewIds));
    }

    // Delete favorites referencing events/promotions
    if (eventIds.length > 0) {
      await db.delete(favorites).where(inArray(favorites.eventId, eventIds));
    }
    if (promotionIds.length > 0) {
      await db.delete(favorites).where(inArray(favorites.promotionId, promotionIds));
    }

    // Delete cashback transactions/payments referencing events/promotions
    if (eventIds.length > 0) {
      await db.delete(cashbackTransactions).where(inArray(cashbackTransactions.relatedEventId, eventIds));
      await db.delete(cashbackPartnerPayments).where(inArray(cashbackPartnerPayments.relatedEventId, eventIds));
    }
    if (promotionIds.length > 0) {
      await db.delete(cashbackTransactions).where(inArray(cashbackTransactions.relatedPromotionId, promotionIds));
      await db.delete(cashbackPartnerPayments).where(inArray(cashbackPartnerPayments.relatedPromotionId, promotionIds));
    }

    // Now delete all business-related data
    await db.delete(cashbackPartnerPayments).where(eq(cashbackPartnerPayments.businessId, id));
    await db.delete(cashbackTransactions).where(eq(cashbackTransactions.relatedBusinessId, id));
    await db.delete(cashbackRules).where(eq(cashbackRules.businessId, id));
    await db.delete(autoPublishHistory).where(eq(autoPublishHistory.businessId, id));
    await db.delete(autoPublishSettings).where(eq(autoPublishSettings.businessId, id));
    await db.delete(aiImageGenerations).where(eq(aiImageGenerations.businessId, id));

    // Delete reviews (after their replies/votes are deleted)
    if (reviewIds.length > 0) {
      await db.delete(reviews).where(inArray(reviews.id, reviewIds));
    }
    await db.delete(reviews).where(eq(reviews.businessId, id));

    await db.delete(favorites).where(eq(favorites.businessId, id));
    await db.delete(businessMembers).where(eq(businessMembers.businessId, id));
    await db.delete(payments).where(eq(payments.businessId, id));
    await db.delete(events).where(eq(events.businessId, id));
    await db.delete(promotions).where(eq(promotions.businessId, id));
    await db.delete(cityBanners).where(eq(cityBanners.businessId, id));

    // Delete business
    await db.delete(businesses).where(eq(businesses.id, id));

    // Reset owner role to user
    await db.update(users).set({ role: 'user' }).where(eq(users.id, ownerId));

    return c.json({ success: true, message: 'Business deleted' });
  } catch (error: any) {
    console.error('[DELETE BUSINESS] Error details:', {
      businessId: id,
      message: error?.message,
      detail: error?.detail,
      code: error?.code,
      constraint: error?.constraint,
    });
    return c.json({ error: 'Failed to delete business', detail: error?.detail || error?.message }, 500);
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

    // Delete photos
    await db.delete(cityPhotos).where(eq(cityPhotos.cityId, id));

    // Delete city
    await db.delete(cities).where(eq(cities.id, id));

    return c.json({ success: true, message: 'City deleted' });
  } catch (error) {
    console.error('Delete city error:', error);
    return c.json({ error: 'Failed to delete city' }, 500);
  }
});

// ==================== CITY PHOTOS (Carousel) ====================

// Get all photos for a city
admin.get('/cities/:cityId/photos', async (c) => {
  const { cityId } = c.req.param();

  try {
    const result = await db
      .select()
      .from(cityPhotos)
      .where(eq(cityPhotos.cityId, cityId))
      .orderBy(cityPhotos.position);

    // Get city info
    const [city] = await db.select().from(cities).where(eq(cities.id, cityId));

    return c.json({ photos: result, city });
  } catch (error) {
    console.error('City photos error:', error);
    return c.json({ error: 'Failed to fetch city photos' }, 500);
  }
});

// Create photo for a city
admin.post('/cities/:cityId/photos', async (c) => {
  const { cityId } = c.req.param();
  const body = await c.req.json();

  try {
    // Get max position
    const maxPositionResult = await db
      .select({ maxPos: sql<number>`COALESCE(MAX(${cityPhotos.position}), -1)` })
      .from(cityPhotos)
      .where(eq(cityPhotos.cityId, cityId));

    const nextPosition = (maxPositionResult[0]?.maxPos ?? -1) + 1;

    const [created] = await db
      .insert(cityPhotos)
      .values({
        cityId,
        title: body.title,
        imageUrl: body.imageUrl,
        position: body.position ?? nextPosition,
        isActive: body.isActive ?? true,
      })
      .returning();

    return c.json(created);
  } catch (error) {
    console.error('Create photo error:', error);
    return c.json({ error: 'Failed to create photo' }, 500);
  }
});

// Update photo
admin.patch('/cities/:cityId/photos/:photoId', async (c) => {
  const { photoId } = c.req.param();
  const body = await c.req.json();

  try {
    const updateData: any = {
      updatedAt: new Date(),
    };

    if (body.title !== undefined) updateData.title = body.title;
    if (body.imageUrl !== undefined) updateData.imageUrl = body.imageUrl;
    if (body.position !== undefined) updateData.position = body.position;
    if (body.isActive !== undefined) updateData.isActive = body.isActive;

    const [updated] = await db
      .update(cityPhotos)
      .set(updateData)
      .where(eq(cityPhotos.id, photoId))
      .returning();

    return c.json(updated);
  } catch (error) {
    console.error('Update photo error:', error);
    return c.json({ error: 'Failed to update photo' }, 500);
  }
});

// Delete photo
admin.delete('/cities/:cityId/photos/:photoId', async (c) => {
  const { photoId } = c.req.param();

  try {
    await db.delete(cityPhotos).where(eq(cityPhotos.id, photoId));
    return c.json({ success: true });
  } catch (error) {
    console.error('Delete photo error:', error);
    return c.json({ error: 'Failed to delete photo' }, 500);
  }
});

// ==================== CASHBACK SYSTEM MANAGEMENT ====================

// Get cashback statistics
admin.get('/cashback/stats', async (c) => {
  try {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    // Total wallets and balance
    const [walletsStats] = await db.select({
      count: count(),
      totalBalance: sql<number>`COALESCE(SUM(CAST(${cashbackWallets.balance} AS NUMERIC)), 0)::numeric`,
      totalEarned: sql<number>`COALESCE(SUM(CAST(${cashbackWallets.totalEarned} AS NUMERIC)), 0)::numeric`,
      totalSpent: sql<number>`COALESCE(SUM(CAST(${cashbackWallets.totalSpent} AS NUMERIC)), 0)::numeric`,
    }).from(cashbackWallets);

    // Payments stats
    const [paymentsTotal] = await db.select({ count: count() }).from(cashbackPartnerPayments);
    const [paymentsConfirmed] = await db.select({ count: count() }).from(cashbackPartnerPayments).where(eq(cashbackPartnerPayments.status, 'confirmed'));
    const [paymentsPending] = await db.select({ count: count() }).from(cashbackPartnerPayments).where(eq(cashbackPartnerPayments.status, 'pending'));

    // Recent payments
    const [recentPayments] = await db.select({
      totalAmount: sql<number>`COALESCE(SUM(CAST(${cashbackPartnerPayments.totalAmount} AS NUMERIC)), 0)::numeric`,
      cashbackUsed: sql<number>`COALESCE(SUM(CAST(${cashbackPartnerPayments.cashbackUsed} AS NUMERIC)), 0)::numeric`,
      cashbackGiven: sql<number>`COALESCE(SUM(CAST(${cashbackPartnerPayments.cashbackEarned} AS NUMERIC)), 0)::numeric`,
    })
    .from(cashbackPartnerPayments)
    .where(and(
      eq(cashbackPartnerPayments.status, 'confirmed'),
      gte(cashbackPartnerPayments.createdAt, thirtyDaysAgo)
    ));

    // Active rules
    const [activeRules] = await db.select({ count: count() }).from(cashbackRules).where(eq(cashbackRules.isActive, true));

    return c.json({
      wallets: {
        total: walletsStats.count,
        totalBalance: parseFloat(String(walletsStats.totalBalance || 0)),
        totalEarned: parseFloat(String(walletsStats.totalEarned || 0)),
        totalSpent: parseFloat(String(walletsStats.totalSpent || 0)),
      },
      payments: {
        total: paymentsTotal.count,
        confirmed: paymentsConfirmed.count,
        pending: paymentsPending.count,
      },
      last30Days: {
        totalRevenue: parseFloat(String(recentPayments.totalAmount || 0)),
        cashbackUsed: parseFloat(String(recentPayments.cashbackUsed || 0)),
        cashbackGiven: parseFloat(String(recentPayments.cashbackGiven || 0)),
      },
      activeRules: activeRules.count,
    });
  } catch (error) {
    console.error('Cashback stats error:', error);
    return c.json({ error: 'Failed to fetch cashback stats' }, 500);
  }
});

// Get cashback rules
admin.get('/cashback/rules', async (c) => {
  try {
    const rules = await db
      .select({
        id: cashbackRules.id,
        name: cashbackRules.name,
        description: cashbackRules.description,
        type: cashbackRules.type,
        value: cashbackRules.value,
        minPurchase: cashbackRules.minPurchase,
        maxCashback: cashbackRules.maxCashback,
        category: cashbackRules.category,
        isPremiumOnly: cashbackRules.isPremiumOnly,
        isActive: cashbackRules.isActive,
        priority: cashbackRules.priority,
        validFrom: cashbackRules.validFrom,
        validUntil: cashbackRules.validUntil,
        usageCount: cashbackRules.usageCount,
        totalCashbackGiven: cashbackRules.totalCashbackGiven,
        businessId: cashbackRules.businessId,
        businessName: businesses.name,
        createdAt: cashbackRules.createdAt,
      })
      .from(cashbackRules)
      .leftJoin(businesses, eq(cashbackRules.businessId, businesses.id))
      .orderBy(desc(cashbackRules.priority), desc(cashbackRules.createdAt));

    return c.json({
      rules: rules.map(r => ({
        ...r,
        value: parseFloat(r.value),
        minPurchase: r.minPurchase ? parseFloat(r.minPurchase) : 0,
        maxCashback: r.maxCashback ? parseFloat(r.maxCashback) : null,
        totalCashbackGiven: parseFloat(r.totalCashbackGiven || '0'),
      })),
    });
  } catch (error) {
    console.error('Cashback rules error:', error);
    return c.json({ error: 'Failed to fetch rules' }, 500);
  }
});

// Create cashback rule
admin.post('/cashback/rules', async (c) => {
  const body = await c.req.json();

  try {
    const [rule] = await db
      .insert(cashbackRules)
      .values({
        name: body.name,
        description: body.description,
        type: body.type,
        value: String(body.value),
        minPurchase: body.minPurchase ? String(body.minPurchase) : '0',
        maxCashback: body.maxCashback ? String(body.maxCashback) : null,
        category: body.category || null,
        businessId: body.businessId || null,
        isPremiumOnly: body.isPremiumOnly ?? true,
        isActive: body.isActive ?? true,
        priority: body.priority ?? 0,
        validFrom: body.validFrom ? new Date(body.validFrom) : new Date(),
        validUntil: body.validUntil ? new Date(body.validUntil) : null,
      })
      .returning();

    return c.json(rule);
  } catch (error) {
    console.error('Create rule error:', error);
    return c.json({ error: 'Failed to create rule' }, 500);
  }
});

// Update cashback rule
admin.patch('/cashback/rules/:id', async (c) => {
  const { id } = c.req.param();
  const body = await c.req.json();

  try {
    const updateData: any = { updatedAt: new Date() };

    if (body.name !== undefined) updateData.name = body.name;
    if (body.description !== undefined) updateData.description = body.description;
    if (body.type !== undefined) updateData.type = body.type;
    if (body.value !== undefined) updateData.value = String(body.value);
    if (body.minPurchase !== undefined) updateData.minPurchase = String(body.minPurchase);
    if (body.maxCashback !== undefined) updateData.maxCashback = body.maxCashback ? String(body.maxCashback) : null;
    if (body.category !== undefined) updateData.category = body.category;
    if (body.businessId !== undefined) updateData.businessId = body.businessId || null;
    if (body.isPremiumOnly !== undefined) updateData.isPremiumOnly = body.isPremiumOnly;
    if (body.isActive !== undefined) updateData.isActive = body.isActive;
    if (body.priority !== undefined) updateData.priority = body.priority;
    if (body.validFrom !== undefined) updateData.validFrom = new Date(body.validFrom);
    if (body.validUntil !== undefined) updateData.validUntil = body.validUntil ? new Date(body.validUntil) : null;

    const [updated] = await db
      .update(cashbackRules)
      .set(updateData)
      .where(eq(cashbackRules.id, id))
      .returning();

    return c.json(updated);
  } catch (error) {
    console.error('Update rule error:', error);
    return c.json({ error: 'Failed to update rule' }, 500);
  }
});

// Delete cashback rule
admin.delete('/cashback/rules/:id', async (c) => {
  const { id } = c.req.param();

  try {
    await db.delete(cashbackRules).where(eq(cashbackRules.id, id));
    return c.json({ success: true });
  } catch (error) {
    console.error('Delete rule error:', error);
    return c.json({ error: 'Failed to delete rule' }, 500);
  }
});

// Get cashback payments
admin.get('/cashback/payments', async (c) => {
  const { status, limit = '20', offset = '0' } = c.req.query();

  try {
    let conditions = [];
    if (status && status !== 'all') {
      conditions.push(eq(cashbackPartnerPayments.status, status as any));
    }

    const payments = await db
      .select({
        id: cashbackPartnerPayments.id,
        totalAmount: cashbackPartnerPayments.totalAmount,
        cashbackUsed: cashbackPartnerPayments.cashbackUsed,
        cashbackEarned: cashbackPartnerPayments.cashbackEarned,
        status: cashbackPartnerPayments.status,
        confirmationCode: cashbackPartnerPayments.confirmationCode,
        createdAt: cashbackPartnerPayments.createdAt,
        confirmedAt: cashbackPartnerPayments.confirmedAt,
        userName: users.name,
        userEmail: users.email,
        businessName: businesses.name,
      })
      .from(cashbackPartnerPayments)
      .leftJoin(users, eq(cashbackPartnerPayments.userId, users.id))
      .leftJoin(businesses, eq(cashbackPartnerPayments.businessId, businesses.id))
      .where(conditions.length > 0 ? and(...conditions) : undefined)
      .orderBy(desc(cashbackPartnerPayments.createdAt))
      .limit(Number(limit))
      .offset(Number(offset));

    const [total] = await db.select({ count: count() }).from(cashbackPartnerPayments);

    return c.json({
      payments: payments.map(p => ({
        ...p,
        totalAmount: parseFloat(p.totalAmount),
        cashbackUsed: parseFloat(p.cashbackUsed),
        cashbackEarned: parseFloat(p.cashbackEarned),
      })),
      total: total.count,
    });
  } catch (error) {
    console.error('Payments error:', error);
    return c.json({ error: 'Failed to fetch payments' }, 500);
  }
});

// ==================== REFERRAL SYSTEM MANAGEMENT ====================

// Get referral statistics
admin.get('/referral/stats', async (c) => {
  try {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    // Total codes
    const [codesTotal] = await db.select({ count: count() }).from(referralCodes);
    const [codesActive] = await db.select({ count: count() }).from(referralCodes).where(eq(referralCodes.isActive, true));

    // Total referrals
    const [referralsTotal] = await db.select({ count: count() }).from(referrals);
    const [referralsConverted] = await db.select({ count: count() }).from(referrals).where(eq(referrals.status, 'premium_converted'));

    // Total rewards
    const [totalRewardsGiven] = await db.select({
      total: sql<number>`COALESCE(SUM(CAST(${referralCodes.totalRewardsEarned} AS NUMERIC)), 0)::numeric`,
    }).from(referralCodes);

    // Recent referrals
    const [recentReferrals] = await db.select({ count: count() }).from(referrals).where(gte(referrals.createdAt, thirtyDaysAgo));

    // Top referrers
    const topReferrers = await db
      .select({
        userId: referralCodes.userId,
        userName: users.name,
        userEmail: users.email,
        code: referralCodes.code,
        usageCount: referralCodes.usageCount,
        totalRewards: referralCodes.totalRewardsEarned,
        premiumConversions: referralCodes.premiumConversions,
      })
      .from(referralCodes)
      .leftJoin(users, eq(referralCodes.userId, users.id))
      .orderBy(desc(referralCodes.usageCount))
      .limit(10);

    return c.json({
      codes: {
        total: codesTotal.count,
        active: codesActive.count,
      },
      referrals: {
        total: referralsTotal.count,
        premiumConverted: referralsConverted.count,
        conversionRate: referralsTotal.count > 0
          ? Math.round((referralsConverted.count / referralsTotal.count) * 100 * 10) / 10
          : 0,
      },
      rewards: {
        totalGiven: parseFloat(String(totalRewardsGiven.total || 0)),
      },
      last30Days: {
        newReferrals: recentReferrals.count,
      },
      topReferrers: topReferrers.map(r => ({
        ...r,
        totalRewards: parseFloat(r.totalRewards || '0'),
      })),
    });
  } catch (error) {
    console.error('Referral stats error:', error);
    return c.json({ error: 'Failed to fetch referral stats' }, 500);
  }
});

// Get referral reward configs
admin.get('/referral/rewards', async (c) => {
  try {
    const configs = await db
      .select()
      .from(referralRewardsConfig)
      .orderBy(referralRewardsConfig.rewardType);

    return c.json({
      rewards: configs.map(r => ({
        ...r,
        referrerAmount: parseFloat(r.referrerAmount),
        referredAmount: parseFloat(r.referredAmount),
      })),
    });
  } catch (error) {
    console.error('Rewards config error:', error);
    return c.json({ error: 'Failed to fetch rewards config' }, 500);
  }
});

// Create/Update referral reward config
admin.put('/referral/rewards/:type', async (c) => {
  const { type } = c.req.param();
  const body = await c.req.json();

  try {
    // Check if exists
    const [existing] = await db
      .select()
      .from(referralRewardsConfig)
      .where(eq(referralRewardsConfig.rewardType, type as any))
      .limit(1);

    if (existing) {
      // Update
      const [updated] = await db
        .update(referralRewardsConfig)
        .set({
          referrerAmount: String(body.referrerAmount),
          referredAmount: String(body.referredAmount),
          description: body.description,
          isActive: body.isActive ?? true,
          validFrom: body.validFrom ? new Date(body.validFrom) : undefined,
          validUntil: body.validUntil ? new Date(body.validUntil) : null,
          updatedAt: new Date(),
        })
        .where(eq(referralRewardsConfig.id, existing.id))
        .returning();

      return c.json(updated);
    } else {
      // Create
      const [created] = await db
        .insert(referralRewardsConfig)
        .values({
          rewardType: type as any,
          referrerAmount: String(body.referrerAmount),
          referredAmount: String(body.referredAmount),
          description: body.description,
          isActive: body.isActive ?? true,
          validFrom: body.validFrom ? new Date(body.validFrom) : new Date(),
          validUntil: body.validUntil ? new Date(body.validUntil) : null,
        })
        .returning();

      return c.json(created);
    }
  } catch (error) {
    console.error('Update rewards error:', error);
    return c.json({ error: 'Failed to update rewards config' }, 500);
  }
});

// Get all referral codes (for admin overview)
admin.get('/referral/codes', async (c) => {
  const { limit = '20', offset = '0' } = c.req.query();

  try {
    const codes = await db
      .select({
        id: referralCodes.id,
        code: referralCodes.code,
        isActive: referralCodes.isActive,
        usageCount: referralCodes.usageCount,
        maxUsages: referralCodes.maxUsages,
        totalRewardsEarned: referralCodes.totalRewardsEarned,
        premiumConversions: referralCodes.premiumConversions,
        expiresAt: referralCodes.expiresAt,
        createdAt: referralCodes.createdAt,
        userName: users.name,
        userEmail: users.email,
      })
      .from(referralCodes)
      .leftJoin(users, eq(referralCodes.userId, users.id))
      .orderBy(desc(referralCodes.createdAt))
      .limit(Number(limit))
      .offset(Number(offset));

    const [total] = await db.select({ count: count() }).from(referralCodes);

    return c.json({
      codes: codes.map(c => ({
        ...c,
        totalRewardsEarned: parseFloat(c.totalRewardsEarned || '0'),
      })),
      total: total.count,
    });
  } catch (error) {
    console.error('Codes error:', error);
    return c.json({ error: 'Failed to fetch codes' }, 500);
  }
});

// Deactivate referral code
admin.patch('/referral/codes/:id/deactivate', async (c) => {
  const { id } = c.req.param();

  try {
    const [updated] = await db
      .update(referralCodes)
      .set({ isActive: false })
      .where(eq(referralCodes.id, id))
      .returning();

    return c.json(updated);
  } catch (error) {
    console.error('Deactivate code error:', error);
    return c.json({ error: 'Failed to deactivate code' }, 500);
  }
});

// Get all referrals
admin.get('/referral/list', async (c) => {
  const { status, limit = '20', offset = '0' } = c.req.query();

  try {
    let conditions = [];
    if (status && status !== 'all') {
      conditions.push(eq(referrals.status, status as any));
    }

    // This is a complex query, we'll use raw SQL for the aliases
    const referralsList = await db
      .select({
        id: referrals.id,
        status: referrals.status,
        referrerReward: referrals.referrerReward,
        referredReward: referrals.referredReward,
        referrerRewardPaid: referrals.referrerRewardPaid,
        referredRewardPaid: referrals.referredRewardPaid,
        registeredAt: referrals.registeredAt,
        convertedAt: referrals.convertedAt,
        createdAt: referrals.createdAt,
        code: referralCodes.code,
      })
      .from(referrals)
      .leftJoin(referralCodes, eq(referrals.codeId, referralCodes.id))
      .where(conditions.length > 0 ? and(...conditions) : undefined)
      .orderBy(desc(referrals.createdAt))
      .limit(Number(limit))
      .offset(Number(offset));

    const [total] = await db.select({ count: count() }).from(referrals);

    return c.json({
      referrals: referralsList.map(r => ({
        ...r,
        referrerReward: parseFloat(r.referrerReward || '0'),
        referredReward: parseFloat(r.referredReward || '0'),
      })),
      total: total.count,
    });
  } catch (error) {
    console.error('Referrals list error:', error);
    return c.json({ error: 'Failed to fetch referrals' }, 500);
  }
});

export default admin;
