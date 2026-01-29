import { Hono } from 'hono';
import { db, communities, communityMembers, users, cities } from '../db';
import { eq, desc, count, and } from 'drizzle-orm';
import { authMiddleware, optionalAuthMiddleware, type AuthUser } from '../middleware/auth';

const communitiesRouter = new Hono<{ Variables: { user?: AuthUser } }>();

// Get all communities (public)
communitiesRouter.get('/', optionalAuthMiddleware, async (c) => {
  try {
    const userId = c.get('user')?.id;

    const communitiesList = await db
      .select({
        id: communities.id,
        name: communities.name,
        description: communities.description,
        image: communities.image,
        isPrivate: communities.isPrivate,
        membersCount: communities.membersCount,
        createdAt: communities.createdAt,
        cityId: communities.cityId,
        cityName: cities.name,
        creatorId: communities.creatorId,
      })
      .from(communities)
      .leftJoin(cities, eq(communities.cityId, cities.id))
      .orderBy(desc(communities.membersCount))
      .limit(50);

    // Check if user is a member of each community
    let membershipMap: Record<string, boolean> = {};
    if (userId) {
      const memberships = await db
        .select({ communityId: communityMembers.communityId })
        .from(communityMembers)
        .where(eq(communityMembers.userId, userId));

      membershipMap = memberships.reduce((acc, m) => {
        acc[m.communityId] = true;
        return acc;
      }, {} as Record<string, boolean>);
    }

    return c.json(communitiesList.map(community => ({
      ...community,
      isMember: !!membershipMap[community.id],
    })));
  } catch (error) {
    console.error('Communities error:', error);
    return c.json({ error: 'Failed to fetch communities' }, 500);
  }
});

// Get single community
communitiesRouter.get('/:id', optionalAuthMiddleware, async (c) => {
  const { id } = c.req.param();
  const userId = c.get('user')?.id;

  try {
    const [community] = await db
      .select({
        id: communities.id,
        name: communities.name,
        description: communities.description,
        image: communities.image,
        isPrivate: communities.isPrivate,
        membersCount: communities.membersCount,
        createdAt: communities.createdAt,
        cityId: communities.cityId,
        cityName: cities.name,
        creatorId: communities.creatorId,
      })
      .from(communities)
      .leftJoin(cities, eq(communities.cityId, cities.id))
      .where(eq(communities.id, id))
      .limit(1);

    if (!community) {
      return c.json({ error: 'Community not found' }, 404);
    }

    // Check if user is a member
    let isMember = false;
    if (userId) {
      const [membership] = await db
        .select()
        .from(communityMembers)
        .where(and(
          eq(communityMembers.communityId, id),
          eq(communityMembers.userId, userId)
        ))
        .limit(1);
      isMember = !!membership;
    }

    return c.json({ ...community, isMember });
  } catch (error) {
    console.error('Community error:', error);
    return c.json({ error: 'Failed to fetch community' }, 500);
  }
});

// Create community (requires auth)
communitiesRouter.post('/', authMiddleware, async (c) => {
  const user = c.get('user');
  const { name, description, image, cityId, isPrivate } = await c.req.json();

  if (!name || !cityId) {
    return c.json({ error: 'Name and city are required' }, 400);
  }

  try {
    const [community] = await db
      .insert(communities)
      .values({
        name,
        description,
        image,
        cityId,
        creatorId: user.id,
        isPrivate: isPrivate || false,
        membersCount: 1,
      })
      .returning();

    // Add creator as member with admin role
    await db.insert(communityMembers).values({
      communityId: community.id,
      userId: user.id,
      role: 'admin',
    });

    return c.json(community);
  } catch (error) {
    console.error('Create community error:', error);
    return c.json({ error: 'Failed to create community' }, 500);
  }
});

// Join community (requires auth)
communitiesRouter.post('/:id/join', authMiddleware, async (c) => {
  const { id } = c.req.param();
  const user = c.get('user');

  try {
    // Check if already a member
    const [existing] = await db
      .select()
      .from(communityMembers)
      .where(and(
        eq(communityMembers.communityId, id),
        eq(communityMembers.userId, user.id)
      ))
      .limit(1);

    if (existing) {
      return c.json({ error: 'Already a member' }, 400);
    }

    // Add member
    await db.insert(communityMembers).values({
      communityId: id,
      userId: user.id,
      role: 'member',
    });

    // Update members count
    await db.execute(
      `UPDATE communities SET members_count = members_count + 1 WHERE id = '${id}'`
    );

    return c.json({ success: true, message: 'Joined community' });
  } catch (error) {
    console.error('Join community error:', error);
    return c.json({ error: 'Failed to join community' }, 500);
  }
});

// Leave community (requires auth)
communitiesRouter.post('/:id/leave', authMiddleware, async (c) => {
  const { id } = c.req.param();
  const user = c.get('user');

  try {
    // Check membership
    const [membership] = await db
      .select()
      .from(communityMembers)
      .where(and(
        eq(communityMembers.communityId, id),
        eq(communityMembers.userId, user.id)
      ))
      .limit(1);

    if (!membership) {
      return c.json({ error: 'Not a member' }, 400);
    }

    // Cannot leave if admin and only admin
    if (membership.role === 'admin') {
      const [adminCount] = await db
        .select({ count: count() })
        .from(communityMembers)
        .where(and(
          eq(communityMembers.communityId, id),
          eq(communityMembers.role, 'admin')
        ));

      if (adminCount.count <= 1) {
        return c.json({ error: 'Cannot leave: you are the only admin' }, 400);
      }
    }

    // Remove member
    await db.delete(communityMembers).where(
      and(
        eq(communityMembers.communityId, id),
        eq(communityMembers.userId, user.id)
      )
    );

    // Update members count
    await db.execute(
      `UPDATE communities SET members_count = GREATEST(members_count - 1, 0) WHERE id = '${id}'`
    );

    return c.json({ success: true, message: 'Left community' });
  } catch (error) {
    console.error('Leave community error:', error);
    return c.json({ error: 'Failed to leave community' }, 500);
  }
});

export default communitiesRouter;
