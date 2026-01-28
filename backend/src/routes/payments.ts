import { Hono } from 'hono';
import { db } from '../db';
import {
  payments, paymentWebhooks, users, businesses, analyticsEvents
} from '../db/schema';
import { eq, and, desc, sql, or } from 'drizzle-orm';
import { authMiddleware, adminMiddleware, getCurrentUser } from '../middleware/auth';
import { z } from 'zod';
import { zValidator } from '@hono/zod-validator';
import { processFirstPurchaseBonus } from './referrals';

const app = new Hono();

// Payment configuration
const PAYMENT_CONFIG = {
  kaspi: {
    merchantId: process.env.KASPI_MERCHANT_ID || '',
    apiKey: process.env.KASPI_API_KEY || '',
    apiUrl: 'https://kaspi.kz/pay/api',
    webhookSecret: process.env.KASPI_WEBHOOK_SECRET || '',
  },
  halyk: {
    terminalId: process.env.HALYK_TERMINAL_ID || '',
    clientId: process.env.HALYK_CLIENT_ID || '',
    clientSecret: process.env.HALYK_CLIENT_SECRET || '',
    apiUrl: 'https://epay.halykbank.kz/api',
    webhookSecret: process.env.HALYK_WEBHOOK_SECRET || '',
  },
};

// Subscription pricing
const SUBSCRIPTION_PRICES = {
  user_premium: { monthly: 1500, yearly: 12000 },
  business_lite: { monthly: 50000, yearly: 500000 },
  business_premium: { monthly: 200000, yearly: 2000000 },
};

// Create payment
const createPaymentSchema = z.object({
  provider: z.enum(['kaspi', 'halyk']),
  type: z.enum(['subscription', 'premium', 'banner', 'other']),
  subscriptionType: z.enum(['user_premium', 'business_lite', 'business_premium']).optional(),
  subscriptionPeriod: z.enum(['monthly', 'yearly']).optional(),
  amount: z.number().optional(), // Override for custom amounts
  businessId: z.string().uuid().optional(),
  description: z.string().optional(),
});

app.post('/create', authMiddleware, zValidator('json', createPaymentSchema), async (c) => {
  const user = getCurrentUser(c);
  if (!user) {
    return c.json({ error: 'Unauthorized' }, 401);
  }

  const body = c.req.valid('json');
  let amount = body.amount;
  let subscriptionDays = 30;

  // Calculate amount for subscriptions
  if (body.type === 'subscription' && body.subscriptionType) {
    const prices = SUBSCRIPTION_PRICES[body.subscriptionType];
    if (!prices) {
      return c.json({ error: 'Invalid subscription type' }, 400);
    }

    const period = body.subscriptionPeriod || 'monthly';
    amount = prices[period];
    subscriptionDays = period === 'yearly' ? 365 : 30;
  }

  if (!amount || amount <= 0) {
    return c.json({ error: 'Invalid amount' }, 400);
  }

  // Create payment record
  const expiresAt = new Date();
  expiresAt.setHours(expiresAt.getHours() + 24); // Payment link valid for 24 hours

  const [payment] = await db
    .insert(payments)
    .values({
      userId: user.id,
      businessId: body.businessId,
      provider: body.provider,
      type: body.type,
      amount,
      status: 'pending',
      description: body.description || `${body.subscriptionType || body.type} subscription`,
      subscriptionType: body.subscriptionType,
      subscriptionDays,
      expiresAt,
    })
    .returning();

  // Generate payment URL based on provider
  let paymentUrl = '';
  let qrCode = '';

  if (body.provider === 'kaspi') {
    // Kaspi QR payment
    // In production, this would call Kaspi API
    const kaspiPaymentData = await generateKaspiPayment(payment.id, amount, body.description || '');
    paymentUrl = kaspiPaymentData.paymentUrl;
    qrCode = kaspiPaymentData.qrCode;
  } else if (body.provider === 'halyk') {
    // Halyk bank payment
    // In production, this would call Halyk API
    const halykPaymentData = await generateHalykPayment(payment.id, amount, body.description || '');
    paymentUrl = halykPaymentData.paymentUrl;
  }

  // Update payment with URL
  await db
    .update(payments)
    .set({ paymentUrl, qrCode })
    .where(eq(payments.id, payment.id));

  // Track analytics
  await db.insert(analyticsEvents).values({
    userId: user.id,
    eventType: 'subscription_started',
    eventData: JSON.stringify({
      paymentId: payment.id,
      provider: body.provider,
      type: body.type,
      amount,
    }),
  });

  return c.json({
    paymentId: payment.id,
    amount,
    currency: 'KZT',
    provider: body.provider,
    paymentUrl: paymentUrl || `https://afisha.kz/pay/${payment.id}`,
    qrCode,
    expiresAt: expiresAt.toISOString(),
  });
});

// Generate Kaspi payment (mock implementation)
async function generateKaspiPayment(paymentId: string, amount: number, description: string) {
  // In production, this would call Kaspi Pay API
  // https://kaspi.kz/pay/api/v1/payments

  if (PAYMENT_CONFIG.kaspi.merchantId && PAYMENT_CONFIG.kaspi.apiKey) {
    // TODO: Real Kaspi API integration
    // const response = await fetch(`${PAYMENT_CONFIG.kaspi.apiUrl}/v1/payments`, {
    //   method: 'POST',
    //   headers: {
    //     'Authorization': `Bearer ${PAYMENT_CONFIG.kaspi.apiKey}`,
    //     'Content-Type': 'application/json',
    //   },
    //   body: JSON.stringify({
    //     merchantId: PAYMENT_CONFIG.kaspi.merchantId,
    //     amount,
    //     orderId: paymentId,
    //     description,
    //     returnUrl: `https://afisha.kz/payment/success?id=${paymentId}`,
    //     failureUrl: `https://afisha.kz/payment/failure?id=${paymentId}`,
    //   }),
    // });
  }

  // Mock response for development
  return {
    paymentUrl: `https://kaspi.kz/pay?orderId=${paymentId}&amount=${amount}`,
    qrCode: `kaspi://pay?orderId=${paymentId}&amount=${amount}`, // Would be actual QR data
  };
}

// Generate Halyk payment (mock implementation)
async function generateHalykPayment(paymentId: string, amount: number, description: string) {
  // In production, this would call Halyk Epay API
  // https://epay.halykbank.kz/api/v1/auth

  if (PAYMENT_CONFIG.halyk.clientId && PAYMENT_CONFIG.halyk.clientSecret) {
    // TODO: Real Halyk API integration
    // 1. Get auth token
    // 2. Create payment
    // const tokenResponse = await fetch(`${PAYMENT_CONFIG.halyk.apiUrl}/auth`, {
    //   method: 'POST',
    //   body: JSON.stringify({
    //     grant_type: 'client_credentials',
    //     client_id: PAYMENT_CONFIG.halyk.clientId,
    //     client_secret: PAYMENT_CONFIG.halyk.clientSecret,
    //   }),
    // });
  }

  // Mock response for development
  return {
    paymentUrl: `https://epay.halykbank.kz/pay?orderId=${paymentId}&amount=${amount}`,
  };
}

// Check payment status
app.get('/status/:id', authMiddleware, async (c) => {
  const user = getCurrentUser(c);
  const paymentId = c.req.param('id');

  const [payment] = await db
    .select()
    .from(payments)
    .where(and(
      eq(payments.id, paymentId),
      eq(payments.userId, user!.id)
    ));

  if (!payment) {
    return c.json({ error: 'Payment not found' }, 404);
  }

  return c.json({
    id: payment.id,
    status: payment.status,
    amount: payment.amount,
    provider: payment.provider,
    type: payment.type,
    paidAt: payment.paidAt,
    paymentUrl: payment.paymentUrl,
    qrCode: payment.qrCode,
    expiresAt: payment.expiresAt,
  });
});

// Get payment history
app.get('/history', authMiddleware, async (c) => {
  const user = getCurrentUser(c);
  if (!user) {
    return c.json({ error: 'Unauthorized' }, 401);
  }

  const limit = Number(c.req.query('limit')) || 20;
  const offset = Number(c.req.query('offset')) || 0;

  const paymentHistory = await db
    .select()
    .from(payments)
    .where(eq(payments.userId, user.id))
    .orderBy(desc(payments.createdAt))
    .limit(limit)
    .offset(offset);

  return c.json(paymentHistory);
});

// Webhook handlers for payment providers
// Kaspi webhook
app.post('/webhook/kaspi', async (c) => {
  const body = await c.req.text();
  const signature = c.req.header('X-Kaspi-Signature');

  // Log webhook
  await db.insert(paymentWebhooks).values({
    provider: 'kaspi',
    eventType: 'webhook_received',
    payload: body,
    signature,
  });

  try {
    // Verify signature (in production)
    // const isValid = verifyKaspiSignature(body, signature, PAYMENT_CONFIG.kaspi.webhookSecret);
    // if (!isValid) {
    //   return c.json({ error: 'Invalid signature' }, 401);
    // }

    const data = JSON.parse(body);

    // Find payment
    const [payment] = await db
      .select()
      .from(payments)
      .where(eq(payments.id, data.orderId || data.externalId));

    if (!payment) {
      return c.json({ error: 'Payment not found' }, 404);
    }

    // Process based on event type
    if (data.status === 'success' || data.event === 'payment.success') {
      await processSuccessfulPayment(payment.id);
    } else if (data.status === 'failed' || data.event === 'payment.failed') {
      await db
        .update(payments)
        .set({ status: 'failed', externalStatus: data.status })
        .where(eq(payments.id, payment.id));
    }

    // Update webhook as processed
    await db
      .update(paymentWebhooks)
      .set({ isProcessed: true, processedAt: new Date() })
      .where(eq(paymentWebhooks.payload, body));

    return c.json({ success: true });
  } catch (error) {
    console.error('Kaspi webhook error:', error);
    return c.json({ error: 'Webhook processing failed' }, 500);
  }
});

// Halyk webhook
app.post('/webhook/halyk', async (c) => {
  const body = await c.req.text();
  const signature = c.req.header('X-Halyk-Signature');

  // Log webhook
  await db.insert(paymentWebhooks).values({
    provider: 'halyk',
    eventType: 'webhook_received',
    payload: body,
    signature,
  });

  try {
    const data = JSON.parse(body);

    const [payment] = await db
      .select()
      .from(payments)
      .where(eq(payments.id, data.orderId));

    if (!payment) {
      return c.json({ error: 'Payment not found' }, 404);
    }

    if (data.code === '00' || data.status === 'auth') {
      await processSuccessfulPayment(payment.id);
    } else {
      await db
        .update(payments)
        .set({ status: 'failed', externalStatus: data.code })
        .where(eq(payments.id, payment.id));
    }

    return c.json({ success: true });
  } catch (error) {
    console.error('Halyk webhook error:', error);
    return c.json({ error: 'Webhook processing failed' }, 500);
  }
});

// Process successful payment
async function processSuccessfulPayment(paymentId: string) {
  const [payment] = await db
    .select()
    .from(payments)
    .where(eq(payments.id, paymentId));

  if (!payment || payment.status === 'completed') {
    return; // Already processed
  }

  // Update payment status
  await db
    .update(payments)
    .set({
      status: 'completed',
      paidAt: new Date(),
      updatedAt: new Date(),
    })
    .where(eq(payments.id, paymentId));

  // Apply subscription
  if (payment.type === 'subscription' && payment.subscriptionType) {
    const subscriptionUntil = new Date();
    subscriptionUntil.setDate(subscriptionUntil.getDate() + (payment.subscriptionDays || 30));

    if (payment.subscriptionType === 'user_premium') {
      // Update user premium status
      await db
        .update(users)
        .set({
          isPremium: true,
          premiumUntil: subscriptionUntil,
          updatedAt: new Date(),
        })
        .where(eq(users.id, payment.userId));

      // Track premium conversion
      await db.insert(analyticsEvents).values({
        userId: payment.userId,
        eventType: 'premium_conversion',
        eventData: JSON.stringify({
          paymentId,
          amount: payment.amount,
          subscriptionDays: payment.subscriptionDays,
        }),
      });
    } else if (payment.businessId) {
      // Update business tier
      const tier = payment.subscriptionType === 'business_premium' ? 'premium' : 'lite';
      await db
        .update(businesses)
        .set({
          tier,
          tierUntil: subscriptionUntil,
          updatedAt: new Date(),
        })
        .where(eq(businesses.id, payment.businessId));

      // Track tier upgrade
      await db.insert(analyticsEvents).values({
        userId: payment.userId,
        eventType: 'business_tier_upgrade',
        eventData: JSON.stringify({
          paymentId,
          businessId: payment.businessId,
          tier,
          amount: payment.amount,
        }),
      });
    }
  }

  // Process referral bonus for first purchase
  await processFirstPurchaseBonus(payment.userId, payment.amount, paymentId);
}

// Manual payment confirmation (admin only)
app.post('/confirm/:id', adminMiddleware, async (c) => {
  const paymentId = c.req.param('id');

  const [payment] = await db
    .select()
    .from(payments)
    .where(eq(payments.id, paymentId));

  if (!payment) {
    return c.json({ error: 'Payment not found' }, 404);
  }

  if (payment.status === 'completed') {
    return c.json({ error: 'Payment already completed' }, 400);
  }

  await processSuccessfulPayment(paymentId);

  return c.json({ success: true, message: 'Payment confirmed' });
});

// Get pricing info (public)
app.get('/pricing', async (c) => {
  return c.json({
    subscriptions: {
      user_premium: {
        name: 'Premium пользователь',
        description: 'Доступ ко всем акциям и функциям',
        prices: SUBSCRIPTION_PRICES.user_premium,
        features: [
          'Все акции и скидки',
          'QR-коды для скидок',
          'Без рекламы',
          'Приоритетная поддержка',
        ],
      },
      business_lite: {
        name: 'Бизнес Lite',
        description: 'Базовый пакет для бизнеса',
        prices: SUBSCRIPTION_PRICES.business_lite,
        features: [
          '10 публикаций в месяц',
          'Статистика просмотров',
          'Верификация бизнеса',
          'Базовая поддержка',
        ],
      },
      business_premium: {
        name: 'Бизнес Premium',
        description: 'Полный пакет для бизнеса',
        prices: SUBSCRIPTION_PRICES.business_premium,
        features: [
          'Безлимитные публикации',
          'AI генерация изображений',
          'Авто-публикация в соцсети',
          'Видео в событиях',
          'Команда до 5 человек',
          'Приоритетная поддержка',
        ],
      },
    },
    paymentMethods: [
      { id: 'kaspi', name: 'Kaspi Pay / QR', icon: '🏦' },
      { id: 'halyk', name: 'Halyk Bank', icon: '💳' },
    ],
  });
});

// Admin: Get all payments
app.get('/admin/list', adminMiddleware, async (c) => {
  const limit = Number(c.req.query('limit')) || 50;
  const offset = Number(c.req.query('offset')) || 0;
  const status = c.req.query('status');
  const provider = c.req.query('provider');

  let query = db
    .select({
      payment: payments,
      userName: users.name,
      userEmail: users.email,
      businessName: businesses.name,
    })
    .from(payments)
    .leftJoin(users, eq(payments.userId, users.id))
    .leftJoin(businesses, eq(payments.businessId, businesses.id))
    .orderBy(desc(payments.createdAt))
    .limit(limit)
    .offset(offset);

  // Filters would be applied here

  const result = await query;

  // Get totals
  const [totals] = await db
    .select({
      total: sql<number>`sum(case when ${payments.status} = 'completed' then ${payments.amount} else 0 end)`,
      count: sql<number>`count(*)`,
      completed: sql<number>`sum(case when ${payments.status} = 'completed' then 1 else 0 end)`,
    })
    .from(payments);

  return c.json({
    payments: result,
    totals: {
      totalAmount: Number(totals?.total) || 0,
      totalCount: Number(totals?.count) || 0,
      completedCount: Number(totals?.completed) || 0,
    },
  });
});

export default app;
