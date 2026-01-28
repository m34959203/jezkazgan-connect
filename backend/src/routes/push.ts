import { Hono } from 'hono';
import { db } from '../db';
import {
  pushSubscriptions, notifications, users
} from '../db/schema';
import { eq, and, desc, sql, inArray } from 'drizzle-orm';
import { authMiddleware, adminMiddleware, getCurrentUser } from '../middleware/auth';
import { z } from 'zod';
import { zValidator } from '@hono/zod-validator';

const app = new Hono();

// Web Push VAPID keys (would be in env in production)
const VAPID_CONFIG = {
  publicKey: process.env.VAPID_PUBLIC_KEY || 'BEl62iUYgUivxIkv69yViEuiBIa-Ib9-SkvMeAtA3LFgDzkrxZJjSgSnfckjBJuBkr3qBUYIHBQFLXYp5Nksh8U',
  privateKey: process.env.VAPID_PRIVATE_KEY || '',
  subject: process.env.VAPID_SUBJECT || 'mailto:support@afisha.kz',
};

// Get VAPID public key (for frontend)
app.get('/vapid-key', (c) => {
  return c.json({ publicKey: VAPID_CONFIG.publicKey });
});

// Subscribe to push notifications
const subscribeSchema = z.object({
  endpoint: z.string().url(),
  keys: z.object({
    p256dh: z.string(),
    auth: z.string(),
  }),
});

app.post('/subscribe', authMiddleware, zValidator('json', subscribeSchema), async (c) => {
  const user = getCurrentUser(c);
  if (!user) {
    return c.json({ error: 'Unauthorized' }, 401);
  }

  const { endpoint, keys } = c.req.valid('json');
  const userAgent = c.req.header('user-agent');

  // Check if subscription already exists
  const [existing] = await db
    .select()
    .from(pushSubscriptions)
    .where(and(
      eq(pushSubscriptions.userId, user.id),
      eq(pushSubscriptions.endpoint, endpoint)
    ));

  if (existing) {
    // Update existing subscription
    await db
      .update(pushSubscriptions)
      .set({
        p256dh: keys.p256dh,
        auth: keys.auth,
        userAgent,
        isActive: true,
        lastUsedAt: new Date(),
      })
      .where(eq(pushSubscriptions.id, existing.id));

    return c.json({ success: true, subscriptionId: existing.id });
  }

  // Create new subscription
  const [subscription] = await db
    .insert(pushSubscriptions)
    .values({
      userId: user.id,
      endpoint,
      p256dh: keys.p256dh,
      auth: keys.auth,
      userAgent,
    })
    .returning();

  return c.json({ success: true, subscriptionId: subscription.id });
});

// Unsubscribe from push notifications
app.post('/unsubscribe', authMiddleware, async (c) => {
  const user = getCurrentUser(c);
  if (!user) {
    return c.json({ error: 'Unauthorized' }, 401);
  }

  const body = await c.req.json();
  const endpoint = body.endpoint;

  if (endpoint) {
    // Unsubscribe specific endpoint
    await db
      .update(pushSubscriptions)
      .set({ isActive: false })
      .where(and(
        eq(pushSubscriptions.userId, user.id),
        eq(pushSubscriptions.endpoint, endpoint)
      ));
  } else {
    // Unsubscribe all
    await db
      .update(pushSubscriptions)
      .set({ isActive: false })
      .where(eq(pushSubscriptions.userId, user.id));
  }

  return c.json({ success: true });
});

// Get user notifications
app.get('/notifications', authMiddleware, async (c) => {
  const user = getCurrentUser(c);
  if (!user) {
    return c.json({ error: 'Unauthorized' }, 401);
  }

  const limit = Number(c.req.query('limit')) || 20;
  const offset = Number(c.req.query('offset')) || 0;
  const unreadOnly = c.req.query('unread') === 'true';

  let query = db
    .select()
    .from(notifications)
    .where(eq(notifications.userId, user.id))
    .orderBy(desc(notifications.createdAt))
    .limit(limit)
    .offset(offset);

  if (unreadOnly) {
    query = db
      .select()
      .from(notifications)
      .where(and(
        eq(notifications.userId, user.id),
        eq(notifications.isRead, false)
      ))
      .orderBy(desc(notifications.createdAt))
      .limit(limit)
      .offset(offset);
  }

  const notificationList = await query;

  // Get unread count
  const [unreadCount] = await db
    .select({ count: sql<number>`count(*)` })
    .from(notifications)
    .where(and(
      eq(notifications.userId, user.id),
      eq(notifications.isRead, false)
    ));

  return c.json({
    notifications: notificationList,
    unreadCount: Number(unreadCount?.count) || 0,
  });
});

// Mark notification as read
app.put('/notifications/:id/read', authMiddleware, async (c) => {
  const user = getCurrentUser(c);
  const notificationId = c.req.param('id');

  await db
    .update(notifications)
    .set({ isRead: true, readAt: new Date() })
    .where(and(
      eq(notifications.id, notificationId),
      eq(notifications.userId, user!.id)
    ));

  return c.json({ success: true });
});

// Mark all notifications as read
app.put('/notifications/read-all', authMiddleware, async (c) => {
  const user = getCurrentUser(c);

  await db
    .update(notifications)
    .set({ isRead: true, readAt: new Date() })
    .where(and(
      eq(notifications.userId, user!.id),
      eq(notifications.isRead, false)
    ));

  return c.json({ success: true });
});

// Delete notification
app.delete('/notifications/:id', authMiddleware, async (c) => {
  const user = getCurrentUser(c);
  const notificationId = c.req.param('id');

  await db
    .delete(notifications)
    .where(and(
      eq(notifications.id, notificationId),
      eq(notifications.userId, user!.id)
    ));

  return c.json({ success: true });
});

// Send push notification (internal function)
export async function sendPushNotification(
  userId: string,
  notification: {
    type: 'event_reminder' | 'promotion_new' | 'business_verified' | 'payment_success' |
          'subscription_expiring' | 'referral_bonus' | 'event_approved' | 'event_rejected' | 'system';
    title: string;
    body: string;
    icon?: string;
    link?: string;
    data?: Record<string, unknown>;
  }
): Promise<void> {
  try {
    // Save notification to DB
    const [savedNotification] = await db
      .insert(notifications)
      .values({
        userId,
        type: notification.type,
        title: notification.title,
        body: notification.body,
        icon: notification.icon,
        link: notification.link,
        data: notification.data ? JSON.stringify(notification.data) : null,
      })
      .returning();

    // Get user's active push subscriptions
    const subscriptions = await db
      .select()
      .from(pushSubscriptions)
      .where(and(
        eq(pushSubscriptions.userId, userId),
        eq(pushSubscriptions.isActive, true)
      ));

    if (subscriptions.length === 0) {
      return; // No subscriptions
    }

    // Send push to all subscriptions
    // In production, use web-push library
    for (const sub of subscriptions) {
      try {
        await sendWebPush(sub, {
          title: notification.title,
          body: notification.body,
          icon: notification.icon || '/icons/notification-icon.png',
          badge: '/icons/badge-icon.png',
          data: {
            notificationId: savedNotification.id,
            link: notification.link,
            ...notification.data,
          },
        });

        // Update notification as pushed
        await db
          .update(notifications)
          .set({ isPushed: true })
          .where(eq(notifications.id, savedNotification.id));

        // Update subscription last used
        await db
          .update(pushSubscriptions)
          .set({ lastUsedAt: new Date() })
          .where(eq(pushSubscriptions.id, sub.id));

      } catch (pushError) {
        console.error('Push send error:', pushError);
        // If push fails, mark subscription as inactive
        if ((pushError as any).statusCode === 410) {
          await db
            .update(pushSubscriptions)
            .set({ isActive: false })
            .where(eq(pushSubscriptions.id, sub.id));
        }
      }
    }
  } catch (error) {
    console.error('Error sending push notification:', error);
  }
}

// Send web push (mock implementation)
async function sendWebPush(
  subscription: { endpoint: string; p256dh: string; auth: string },
  payload: { title: string; body: string; icon?: string; badge?: string; data?: Record<string, unknown> }
): Promise<void> {
  // In production, use web-push library:
  // const webpush = require('web-push');
  // webpush.setVapidDetails(VAPID_CONFIG.subject, VAPID_CONFIG.publicKey, VAPID_CONFIG.privateKey);
  // await webpush.sendNotification(subscription, JSON.stringify(payload));

  console.log('Would send push notification:', {
    endpoint: subscription.endpoint,
    payload,
  });
}

// Send bulk notifications (admin)
const bulkNotificationSchema = z.object({
  userIds: z.array(z.string().uuid()).optional(),
  type: z.enum([
    'event_reminder', 'promotion_new', 'business_verified', 'payment_success',
    'subscription_expiring', 'referral_bonus', 'event_approved', 'event_rejected', 'system'
  ]),
  title: z.string().min(1),
  body: z.string().min(1),
  icon: z.string().optional(),
  link: z.string().optional(),
  filters: z.object({
    isPremium: z.boolean().optional(),
    role: z.string().optional(),
    cityId: z.string().uuid().optional(),
  }).optional(),
});

app.post('/admin/send', adminMiddleware, zValidator('json', bulkNotificationSchema), async (c) => {
  const data = c.req.valid('json');

  let userIds = data.userIds;

  // If no specific users, apply filters
  if (!userIds || userIds.length === 0) {
    let query = db.select({ id: users.id }).from(users);

    if (data.filters?.isPremium !== undefined) {
      query = db.select({ id: users.id }).from(users).where(eq(users.isPremium, data.filters.isPremium));
    }

    if (data.filters?.role) {
      query = db.select({ id: users.id }).from(users).where(eq(users.role, data.filters.role as any));
    }

    const userResults = await query;
    userIds = userResults.map(u => u.id);
  }

  // Send notifications
  let sentCount = 0;
  for (const userId of userIds) {
    await sendPushNotification(userId, {
      type: data.type,
      title: data.title,
      body: data.body,
      icon: data.icon,
      link: data.link,
    });
    sentCount++;
  }

  return c.json({
    success: true,
    sentCount,
    message: `Sent ${sentCount} notifications`,
  });
});

// Admin: Get push subscription stats
app.get('/admin/stats', adminMiddleware, async (c) => {
  const [stats] = await db
    .select({
      totalSubscriptions: sql<number>`count(*)`,
      activeSubscriptions: sql<number>`sum(case when ${pushSubscriptions.isActive} then 1 else 0 end)`,
      uniqueUsers: sql<number>`count(distinct ${pushSubscriptions.userId})`,
    })
    .from(pushSubscriptions);

  const [notificationStats] = await db
    .select({
      totalNotifications: sql<number>`count(*)`,
      unreadNotifications: sql<number>`sum(case when not ${notifications.isRead} then 1 else 0 end)`,
      pushedNotifications: sql<number>`sum(case when ${notifications.isPushed} then 1 else 0 end)`,
    })
    .from(notifications);

  return c.json({
    subscriptions: {
      total: Number(stats?.totalSubscriptions) || 0,
      active: Number(stats?.activeSubscriptions) || 0,
      uniqueUsers: Number(stats?.uniqueUsers) || 0,
    },
    notifications: {
      total: Number(notificationStats?.totalNotifications) || 0,
      unread: Number(notificationStats?.unreadNotifications) || 0,
      pushed: Number(notificationStats?.pushedNotifications) || 0,
    },
  });
});

// Notification templates
export const NotificationTemplates = {
  eventReminder: (eventTitle: string, eventDate: string) => ({
    type: 'event_reminder' as const,
    title: 'Напоминание о событии',
    body: `Событие "${eventTitle}" начнётся ${eventDate}`,
    icon: '/icons/event.png',
  }),

  promotionNew: (businessName: string, discount: string) => ({
    type: 'promotion_new' as const,
    title: 'Новая акция!',
    body: `${businessName}: ${discount}`,
    icon: '/icons/promo.png',
  }),

  businessVerified: (businessName: string) => ({
    type: 'business_verified' as const,
    title: 'Бизнес верифицирован',
    body: `Ваш бизнес "${businessName}" успешно верифицирован`,
    icon: '/icons/verified.png',
  }),

  paymentSuccess: (amount: number) => ({
    type: 'payment_success' as const,
    title: 'Оплата успешна',
    body: `Платёж на сумму ${amount}₸ успешно обработан`,
    icon: '/icons/payment.png',
  }),

  subscriptionExpiring: (daysLeft: number) => ({
    type: 'subscription_expiring' as const,
    title: 'Подписка истекает',
    body: `Ваша подписка истекает через ${daysLeft} дней. Продлите сейчас!`,
    icon: '/icons/subscription.png',
  }),

  referralBonus: (amount: number) => ({
    type: 'referral_bonus' as const,
    title: 'Реферальный бонус!',
    body: `Вы получили ${amount}₸ за приглашённого друга`,
    icon: '/icons/bonus.png',
  }),

  eventApproved: (eventTitle: string) => ({
    type: 'event_approved' as const,
    title: 'Событие одобрено',
    body: `Ваше событие "${eventTitle}" одобрено и опубликовано`,
    icon: '/icons/approved.png',
  }),

  eventRejected: (eventTitle: string, reason?: string) => ({
    type: 'event_rejected' as const,
    title: 'Событие отклонено',
    body: `Событие "${eventTitle}" отклонено${reason ? `: ${reason}` : ''}`,
    icon: '/icons/rejected.png',
  }),
};

export default app;
