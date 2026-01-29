import { Hono } from 'hono';
import { db, collaborations, collabResponses, users, businesses, cities } from '../db';
import { eq, desc, and } from 'drizzle-orm';
import { authMiddleware, optionalAuthMiddleware, type AuthUser } from '../middleware/auth';

const collaborationsRouter = new Hono<{ Variables: { user?: AuthUser } }>();

// Get all collaborations (public, with optional filters)
collaborationsRouter.get('/', optionalAuthMiddleware, async (c) => {
  try {
    const cityId = c.req.query('cityId');
    const category = c.req.query('category');
    const status = c.req.query('status');

    let query = db
      .select({
        id: collaborations.id,
        title: collaborations.title,
        description: collaborations.description,
        category: collaborations.category,
        budget: collaborations.budget,
        status: collaborations.status,
        responseCount: collaborations.responseCount,
        createdAt: collaborations.createdAt,
        updatedAt: collaborations.updatedAt,
        cityId: collaborations.cityId,
        cityName: cities.name,
        creatorId: collaborations.creatorId,
        creatorName: users.name,
        businessId: collaborations.businessId,
        businessName: businesses.name,
      })
      .from(collaborations)
      .leftJoin(cities, eq(collaborations.cityId, cities.id))
      .leftJoin(users, eq(collaborations.creatorId, users.id))
      .leftJoin(businesses, eq(collaborations.businessId, businesses.id))
      .orderBy(desc(collaborations.createdAt))
      .$dynamic();

    // Build conditions array for filtering
    const conditions = [];

    if (cityId) {
      conditions.push(eq(collaborations.cityId, cityId));
    }

    if (category) {
      conditions.push(eq(collaborations.category, category as any));
    }

    if (status) {
      conditions.push(eq(collaborations.status, status as any));
    }

    // Apply conditions if any exist
    if (conditions.length > 0) {
      query = query.where(and(...conditions));
    }

    const collaborationsList = await query.limit(50);

    return c.json(collaborationsList);
  } catch (error) {
    console.error('Collaborations error:', error);
    return c.json({ error: 'Failed to fetch collaborations' }, 500);
  }
});

// Get single collaboration with responses
collaborationsRouter.get('/:id', optionalAuthMiddleware, async (c) => {
  const { id } = c.req.param();

  try {
    const [collaboration] = await db
      .select({
        id: collaborations.id,
        title: collaborations.title,
        description: collaborations.description,
        category: collaborations.category,
        budget: collaborations.budget,
        status: collaborations.status,
        responseCount: collaborations.responseCount,
        createdAt: collaborations.createdAt,
        updatedAt: collaborations.updatedAt,
        cityId: collaborations.cityId,
        cityName: cities.name,
        creatorId: collaborations.creatorId,
        creatorName: users.name,
        businessId: collaborations.businessId,
        businessName: businesses.name,
      })
      .from(collaborations)
      .leftJoin(cities, eq(collaborations.cityId, cities.id))
      .leftJoin(users, eq(collaborations.creatorId, users.id))
      .leftJoin(businesses, eq(collaborations.businessId, businesses.id))
      .where(eq(collaborations.id, id))
      .limit(1);

    if (!collaboration) {
      return c.json({ error: 'Collaboration not found' }, 404);
    }

    // Get responses for this collaboration
    const responses = await db
      .select({
        id: collabResponses.id,
        message: collabResponses.message,
        createdAt: collabResponses.createdAt,
        userId: collabResponses.userId,
        userName: users.name,
        userAvatar: users.avatar,
      })
      .from(collabResponses)
      .leftJoin(users, eq(collabResponses.userId, users.id))
      .where(eq(collabResponses.collabId, id))
      .orderBy(desc(collabResponses.createdAt));

    return c.json({ ...collaboration, responses });
  } catch (error) {
    console.error('Collaboration error:', error);
    return c.json({ error: 'Failed to fetch collaboration' }, 500);
  }
});

// Create new collaboration (requires auth)
collaborationsRouter.post('/', authMiddleware, async (c) => {
  const user = c.get('user')!;
  const { title, description, category, cityId, businessId, budget } = await c.req.json();

  if (!title || !description || !category || !cityId) {
    return c.json({ error: 'Title, description, category, and cityId are required' }, 400);
  }

  try {
    const [collaboration] = await db
      .insert(collaborations)
      .values({
        title,
        description,
        category,
        cityId,
        creatorId: user.id,
        businessId: businessId || null,
        budget: budget || null,
        status: 'open',
        responseCount: 0,
      })
      .returning();

    return c.json(collaboration, 201);
  } catch (error) {
    console.error('Create collaboration error:', error);
    return c.json({ error: 'Failed to create collaboration' }, 500);
  }
});

// Respond to collaboration (requires auth)
collaborationsRouter.post('/:id/respond', authMiddleware, async (c) => {
  const { id } = c.req.param();
  const user = c.get('user')!;
  const { message } = await c.req.json();

  if (!message) {
    return c.json({ error: 'Message is required' }, 400);
  }

  try {
    // Check if collaboration exists
    const [collaboration] = await db
      .select()
      .from(collaborations)
      .where(eq(collaborations.id, id))
      .limit(1);

    if (!collaboration) {
      return c.json({ error: 'Collaboration not found' }, 404);
    }

    // Check if user already responded
    const [existingResponse] = await db
      .select()
      .from(collabResponses)
      .where(and(
        eq(collabResponses.collabId, id),
        eq(collabResponses.userId, user.id)
      ))
      .limit(1);

    if (existingResponse) {
      return c.json({ error: 'You have already responded to this collaboration' }, 400);
    }

    // Create response
    const [response] = await db
      .insert(collabResponses)
      .values({
        collabId: id,
        userId: user.id,
        message,
      })
      .returning();

    // Increment response count
    await db.execute(
      `UPDATE collaborations SET response_count = response_count + 1, updated_at = NOW() WHERE id = '${id}'`
    );

    return c.json({ success: true, response }, 201);
  } catch (error) {
    console.error('Respond to collaboration error:', error);
    return c.json({ error: 'Failed to respond to collaboration' }, 500);
  }
});

// Update collaboration status (requires auth, owner only)
collaborationsRouter.put('/:id/status', authMiddleware, async (c) => {
  const { id } = c.req.param();
  const user = c.get('user')!;
  const { status } = await c.req.json();

  if (!status || !['in_progress', 'closed'].includes(status)) {
    return c.json({ error: 'Status must be "in_progress" or "closed"' }, 400);
  }

  try {
    // Check if collaboration exists and user is owner
    const [collaboration] = await db
      .select()
      .from(collaborations)
      .where(eq(collaborations.id, id))
      .limit(1);

    if (!collaboration) {
      return c.json({ error: 'Collaboration not found' }, 404);
    }

    if (collaboration.creatorId !== user.id) {
      return c.json({ error: 'Not authorized to update this collaboration' }, 403);
    }

    // Update status
    const [updated] = await db
      .update(collaborations)
      .set({
        status,
        updatedAt: new Date(),
      })
      .where(eq(collaborations.id, id))
      .returning();

    return c.json(updated);
  } catch (error) {
    console.error('Update collaboration status error:', error);
    return c.json({ error: 'Failed to update collaboration status' }, 500);
  }
});

// Delete collaboration (requires auth, owner only)
collaborationsRouter.delete('/:id', authMiddleware, async (c) => {
  const { id } = c.req.param();
  const user = c.get('user')!;

  try {
    // Check if collaboration exists and user is owner
    const [collaboration] = await db
      .select()
      .from(collaborations)
      .where(eq(collaborations.id, id))
      .limit(1);

    if (!collaboration) {
      return c.json({ error: 'Collaboration not found' }, 404);
    }

    if (collaboration.creatorId !== user.id) {
      return c.json({ error: 'Not authorized to delete this collaboration' }, 403);
    }

    // Delete all responses first
    await db.delete(collabResponses).where(eq(collabResponses.collabId, id));

    // Delete collaboration
    await db.delete(collaborations).where(eq(collaborations.id, id));

    return c.json({ success: true, message: 'Collaboration deleted' });
  } catch (error) {
    console.error('Delete collaboration error:', error);
    return c.json({ error: 'Failed to delete collaboration' }, 500);
  }
});

export default collaborationsRouter;
