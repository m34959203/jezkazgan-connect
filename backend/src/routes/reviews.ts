import { Hono } from 'hono';
import { db } from '../db';
import {
  reviews, reviewReplies, reviewVotes, users, businesses, events
} from '../db/schema';
import { eq, and, desc, asc, sql, or } from 'drizzle-orm';
import { authMiddleware, adminMiddleware, getCurrentUser, optionalAuthMiddleware } from '../middleware/auth';
import { z } from 'zod';
import { zValidator } from '@hono/zod-validator';

const app = new Hono();

// Create review
const createReviewSchema = z.object({
  targetType: z.enum(['business', 'event']),
  businessId: z.string().uuid().optional(),
  eventId: z.string().uuid().optional(),
  rating: z.number().int().min(1).max(5),
  title: z.string().max(200).optional(),
  content: z.string().max(5000).optional(),
  pros: z.string().max(1000).optional(),
  cons: z.string().max(1000).optional(),
  images: z.array(z.string().url()).max(5).optional(),
});

app.post('/', authMiddleware, zValidator('json', createReviewSchema), async (c) => {
  const user = getCurrentUser(c);
  if (!user) {
    return c.json({ error: 'Unauthorized' }, 401);
  }

  const data = c.req.valid('json');

  // Validate target
  if (data.targetType === 'business' && !data.businessId) {
    return c.json({ error: 'businessId is required for business reviews' }, 400);
  }
  if (data.targetType === 'event' && !data.eventId) {
    return c.json({ error: 'eventId is required for event reviews' }, 400);
  }

  // Check if user already reviewed this target
  const existingReview = await db
    .select()
    .from(reviews)
    .where(and(
      eq(reviews.userId, user.id),
      data.businessId ? eq(reviews.businessId, data.businessId) : sql`1=1`,
      data.eventId ? eq(reviews.eventId, data.eventId) : sql`1=1`
    ));

  if (existingReview.length > 0) {
    return c.json({ error: 'You have already reviewed this' }, 400);
  }

  // Check if target exists
  if (data.businessId) {
    const [business] = await db
      .select()
      .from(businesses)
      .where(eq(businesses.id, data.businessId));

    if (!business) {
      return c.json({ error: 'Business not found' }, 404);
    }
  }

  if (data.eventId) {
    const [event] = await db
      .select()
      .from(events)
      .where(eq(events.id, data.eventId));

    if (!event) {
      return c.json({ error: 'Event not found' }, 404);
    }
  }

  // Create review
  const [review] = await db
    .insert(reviews)
    .values({
      userId: user.id,
      targetType: data.targetType,
      businessId: data.businessId,
      eventId: data.eventId,
      rating: data.rating,
      title: data.title,
      content: data.content,
      pros: data.pros,
      cons: data.cons,
      images: data.images ? JSON.stringify(data.images) : null,
      isApproved: false, // Requires moderation
    })
    .returning();

  return c.json(review, 201);
});

// Get reviews for a business
app.get('/business/:businessId', optionalAuthMiddleware, async (c) => {
  const businessId = c.req.param('businessId');
  const limit = Number(c.req.query('limit')) || 20;
  const offset = Number(c.req.query('offset')) || 0;
  const sortBy = c.req.query('sort') || 'recent'; // recent, helpful, rating_high, rating_low

  let orderClause;
  switch (sortBy) {
    case 'helpful':
      orderClause = desc(reviews.likesCount);
      break;
    case 'rating_high':
      orderClause = desc(reviews.rating);
      break;
    case 'rating_low':
      orderClause = asc(reviews.rating);
      break;
    default:
      orderClause = desc(reviews.createdAt);
  }

  const reviewList = await db
    .select({
      review: reviews,
      user: {
        id: users.id,
        name: users.name,
        avatar: users.avatar,
      },
    })
    .from(reviews)
    .leftJoin(users, eq(reviews.userId, users.id))
    .where(and(
      eq(reviews.businessId, businessId),
      eq(reviews.isApproved, true)
    ))
    .orderBy(orderClause)
    .limit(limit)
    .offset(offset);

  // Get rating statistics
  const [stats] = await db
    .select({
      avgRating: sql<number>`avg(${reviews.rating})`,
      totalReviews: sql<number>`count(*)`,
      rating5: sql<number>`sum(case when ${reviews.rating} = 5 then 1 else 0 end)`,
      rating4: sql<number>`sum(case when ${reviews.rating} = 4 then 1 else 0 end)`,
      rating3: sql<number>`sum(case when ${reviews.rating} = 3 then 1 else 0 end)`,
      rating2: sql<number>`sum(case when ${reviews.rating} = 2 then 1 else 0 end)`,
      rating1: sql<number>`sum(case when ${reviews.rating} = 1 then 1 else 0 end)`,
    })
    .from(reviews)
    .where(and(
      eq(reviews.businessId, businessId),
      eq(reviews.isApproved, true)
    ));

  return c.json({
    reviews: reviewList.map(r => ({
      ...r.review,
      images: r.review.images ? JSON.parse(r.review.images as string) : [],
      user: r.user,
    })),
    stats: {
      averageRating: Math.round((Number(stats?.avgRating) || 0) * 10) / 10,
      totalReviews: Number(stats?.totalReviews) || 0,
      distribution: {
        5: Number(stats?.rating5) || 0,
        4: Number(stats?.rating4) || 0,
        3: Number(stats?.rating3) || 0,
        2: Number(stats?.rating2) || 0,
        1: Number(stats?.rating1) || 0,
      },
    },
  });
});

// Get reviews for an event
app.get('/event/:eventId', optionalAuthMiddleware, async (c) => {
  const eventId = c.req.param('eventId');
  const limit = Number(c.req.query('limit')) || 20;
  const offset = Number(c.req.query('offset')) || 0;

  const reviewList = await db
    .select({
      review: reviews,
      user: {
        id: users.id,
        name: users.name,
        avatar: users.avatar,
      },
    })
    .from(reviews)
    .leftJoin(users, eq(reviews.userId, users.id))
    .where(and(
      eq(reviews.eventId, eventId),
      eq(reviews.isApproved, true)
    ))
    .orderBy(desc(reviews.createdAt))
    .limit(limit)
    .offset(offset);

  // Get stats
  const [stats] = await db
    .select({
      avgRating: sql<number>`avg(${reviews.rating})`,
      totalReviews: sql<number>`count(*)`,
    })
    .from(reviews)
    .where(and(
      eq(reviews.eventId, eventId),
      eq(reviews.isApproved, true)
    ));

  return c.json({
    reviews: reviewList.map(r => ({
      ...r.review,
      images: r.review.images ? JSON.parse(r.review.images as string) : [],
      user: r.user,
    })),
    stats: {
      averageRating: Math.round((Number(stats?.avgRating) || 0) * 10) / 10,
      totalReviews: Number(stats?.totalReviews) || 0,
    },
  });
});

// Get single review with replies
app.get('/:id', optionalAuthMiddleware, async (c) => {
  const reviewId = c.req.param('id');
  const user = getCurrentUser(c);

  const [review] = await db
    .select({
      review: reviews,
      user: {
        id: users.id,
        name: users.name,
        avatar: users.avatar,
      },
    })
    .from(reviews)
    .leftJoin(users, eq(reviews.userId, users.id))
    .where(eq(reviews.id, reviewId));

  if (!review) {
    return c.json({ error: 'Review not found' }, 404);
  }

  // Get replies
  const replies = await db
    .select({
      reply: reviewReplies,
      user: {
        id: users.id,
        name: users.name,
        avatar: users.avatar,
      },
    })
    .from(reviewReplies)
    .leftJoin(users, eq(reviewReplies.userId, users.id))
    .where(eq(reviewReplies.reviewId, reviewId))
    .orderBy(asc(reviewReplies.createdAt));

  // Check if current user has voted
  let userVote = null;
  if (user) {
    const [vote] = await db
      .select()
      .from(reviewVotes)
      .where(and(
        eq(reviewVotes.reviewId, reviewId),
        eq(reviewVotes.userId, user.id)
      ));
    userVote = vote ? (vote.isHelpful ? 'helpful' : 'not_helpful') : null;
  }

  return c.json({
    ...review.review,
    images: review.review.images ? JSON.parse(review.review.images as string) : [],
    user: review.user,
    replies: replies.map(r => ({ ...r.reply, user: r.user })),
    userVote,
  });
});

// Update review
const updateReviewSchema = z.object({
  rating: z.number().int().min(1).max(5).optional(),
  title: z.string().max(200).optional(),
  content: z.string().max(5000).optional(),
  pros: z.string().max(1000).optional(),
  cons: z.string().max(1000).optional(),
  images: z.array(z.string().url()).max(5).optional(),
});

app.put('/:id', authMiddleware, zValidator('json', updateReviewSchema), async (c) => {
  const user = getCurrentUser(c);
  const reviewId = c.req.param('id');
  const data = c.req.valid('json');

  // Check ownership
  const [review] = await db
    .select()
    .from(reviews)
    .where(and(
      eq(reviews.id, reviewId),
      eq(reviews.userId, user!.id)
    ));

  if (!review) {
    return c.json({ error: 'Review not found or not authorized' }, 404);
  }

  // Update review
  const [updated] = await db
    .update(reviews)
    .set({
      ...data,
      images: data.images ? JSON.stringify(data.images) : review.images,
      isApproved: false, // Re-moderate after edit
      updatedAt: new Date(),
    })
    .where(eq(reviews.id, reviewId))
    .returning();

  return c.json(updated);
});

// Delete review
app.delete('/:id', authMiddleware, async (c) => {
  const user = getCurrentUser(c);
  const reviewId = c.req.param('id');

  // Check ownership
  const [review] = await db
    .select()
    .from(reviews)
    .where(and(
      eq(reviews.id, reviewId),
      eq(reviews.userId, user!.id)
    ));

  if (!review) {
    return c.json({ error: 'Review not found or not authorized' }, 404);
  }

  // Delete related data
  await db.delete(reviewVotes).where(eq(reviewVotes.reviewId, reviewId));
  await db.delete(reviewReplies).where(eq(reviewReplies.reviewId, reviewId));
  await db.delete(reviews).where(eq(reviews.id, reviewId));

  return c.json({ success: true });
});

// Vote on review (helpful/not helpful)
app.post('/:id/vote', authMiddleware, async (c) => {
  const user = getCurrentUser(c);
  const reviewId = c.req.param('id');
  const body = await c.req.json();
  const isHelpful = body.isHelpful === true;

  // Check if review exists
  const [review] = await db
    .select()
    .from(reviews)
    .where(eq(reviews.id, reviewId));

  if (!review) {
    return c.json({ error: 'Review not found' }, 404);
  }

  // Cannot vote on own review
  if (review.userId === user!.id) {
    return c.json({ error: 'Cannot vote on your own review' }, 400);
  }

  // Check existing vote
  const [existingVote] = await db
    .select()
    .from(reviewVotes)
    .where(and(
      eq(reviewVotes.reviewId, reviewId),
      eq(reviewVotes.userId, user!.id)
    ));

  if (existingVote) {
    if (existingVote.isHelpful === isHelpful) {
      // Remove vote
      await db.delete(reviewVotes).where(eq(reviewVotes.id, existingVote.id));

      // Update counts
      if (isHelpful) {
        await db.update(reviews)
          .set({ likesCount: sql`${reviews.likesCount} - 1` })
          .where(eq(reviews.id, reviewId));
      } else {
        await db.update(reviews)
          .set({ dislikesCount: sql`${reviews.dislikesCount} - 1` })
          .where(eq(reviews.id, reviewId));
      }

      return c.json({ voted: false });
    } else {
      // Change vote
      await db.update(reviewVotes)
        .set({ isHelpful })
        .where(eq(reviewVotes.id, existingVote.id));

      // Update counts
      if (isHelpful) {
        await db.update(reviews)
          .set({
            likesCount: sql`${reviews.likesCount} + 1`,
            dislikesCount: sql`${reviews.dislikesCount} - 1`,
          })
          .where(eq(reviews.id, reviewId));
      } else {
        await db.update(reviews)
          .set({
            likesCount: sql`${reviews.likesCount} - 1`,
            dislikesCount: sql`${reviews.dislikesCount} + 1`,
          })
          .where(eq(reviews.id, reviewId));
      }

      return c.json({ voted: true, isHelpful });
    }
  }

  // Create new vote
  await db.insert(reviewVotes).values({
    reviewId,
    userId: user!.id,
    isHelpful,
  });

  // Update counts
  if (isHelpful) {
    await db.update(reviews)
      .set({ likesCount: sql`${reviews.likesCount} + 1` })
      .where(eq(reviews.id, reviewId));
  } else {
    await db.update(reviews)
      .set({ dislikesCount: sql`${reviews.dislikesCount} + 1` })
      .where(eq(reviews.id, reviewId));
  }

  return c.json({ voted: true, isHelpful });
});

// Reply to review
const replySchema = z.object({
  content: z.string().min(1).max(2000),
});

app.post('/:id/reply', authMiddleware, zValidator('json', replySchema), async (c) => {
  const user = getCurrentUser(c);
  const reviewId = c.req.param('id');
  const { content } = c.req.valid('json');

  // Check if review exists
  const [review] = await db
    .select()
    .from(reviews)
    .where(eq(reviews.id, reviewId));

  if (!review) {
    return c.json({ error: 'Review not found' }, 404);
  }

  // Check if user is business owner (for business reply)
  let isBusinessReply = false;
  if (review.businessId) {
    const [business] = await db
      .select()
      .from(businesses)
      .where(and(
        eq(businesses.id, review.businessId),
        eq(businesses.ownerId, user!.id)
      ));
    isBusinessReply = !!business;
  }

  // Create reply
  const [reply] = await db
    .insert(reviewReplies)
    .values({
      reviewId,
      userId: user!.id,
      content,
      isBusinessReply,
    })
    .returning();

  // Update reply count
  await db.update(reviews)
    .set({ replyCount: sql`${reviews.replyCount} + 1` })
    .where(eq(reviews.id, reviewId));

  return c.json(reply, 201);
});

// Delete reply
app.delete('/reply/:replyId', authMiddleware, async (c) => {
  const user = getCurrentUser(c);
  const replyId = c.req.param('replyId');

  // Check ownership
  const [reply] = await db
    .select()
    .from(reviewReplies)
    .where(and(
      eq(reviewReplies.id, replyId),
      eq(reviewReplies.userId, user!.id)
    ));

  if (!reply) {
    return c.json({ error: 'Reply not found or not authorized' }, 404);
  }

  await db.delete(reviewReplies).where(eq(reviewReplies.id, replyId));

  // Update reply count
  await db.update(reviews)
    .set({ replyCount: sql`${reviews.replyCount} - 1` })
    .where(eq(reviews.id, reply.reviewId));

  return c.json({ success: true });
});

// Admin: Get pending reviews
app.get('/admin/pending', adminMiddleware, async (c) => {
  const limit = Number(c.req.query('limit')) || 20;
  const offset = Number(c.req.query('offset')) || 0;

  const pendingReviews = await db
    .select({
      review: reviews,
      user: {
        id: users.id,
        name: users.name,
        email: users.email,
      },
      businessName: businesses.name,
      eventTitle: events.title,
    })
    .from(reviews)
    .leftJoin(users, eq(reviews.userId, users.id))
    .leftJoin(businesses, eq(reviews.businessId, businesses.id))
    .leftJoin(events, eq(reviews.eventId, events.id))
    .where(eq(reviews.isApproved, false))
    .orderBy(desc(reviews.createdAt))
    .limit(limit)
    .offset(offset);

  return c.json(pendingReviews);
});

// Admin: Approve/Reject review
app.patch('/admin/:id', adminMiddleware, async (c) => {
  const reviewId = c.req.param('id');
  const body = await c.req.json();
  const isApproved = body.isApproved === true;

  await db.update(reviews)
    .set({ isApproved })
    .where(eq(reviews.id, reviewId));

  return c.json({ success: true, isApproved });
});

// Admin: Delete review
app.delete('/admin/:id', adminMiddleware, async (c) => {
  const reviewId = c.req.param('id');

  await db.delete(reviewVotes).where(eq(reviewVotes.reviewId, reviewId));
  await db.delete(reviewReplies).where(eq(reviewReplies.reviewId, reviewId));
  await db.delete(reviews).where(eq(reviews.id, reviewId));

  return c.json({ success: true });
});

// Get user's reviews
app.get('/user/my-reviews', authMiddleware, async (c) => {
  const user = getCurrentUser(c);
  const limit = Number(c.req.query('limit')) || 20;
  const offset = Number(c.req.query('offset')) || 0;

  const userReviews = await db
    .select({
      review: reviews,
      businessName: businesses.name,
      eventTitle: events.title,
    })
    .from(reviews)
    .leftJoin(businesses, eq(reviews.businessId, businesses.id))
    .leftJoin(events, eq(reviews.eventId, events.id))
    .where(eq(reviews.userId, user!.id))
    .orderBy(desc(reviews.createdAt))
    .limit(limit)
    .offset(offset);

  return c.json(userReviews);
});

export default app;
