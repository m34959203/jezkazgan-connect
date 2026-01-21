// Cashback system routes for Premium users
import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { z } from 'zod';
import { eq, and, desc, gte, lte, isNull, or, sql } from 'drizzle-orm';
import {
  db,
  cashbackWallets,
  cashbackTransactions,
  cashbackRules,
  cashbackPartnerPayments,
  businesses,
  users,
  events,
  promotions
} from '../db';
import { authMiddleware, getCurrentUser, type AuthUser } from '../middleware/auth';
import { nanoid } from 'nanoid';

const app = new Hono<{ Variables: { user: AuthUser } }>();

// All routes require authentication
app.use('*', authMiddleware);

// Helper: Get or create wallet for user
async function getOrCreateWallet(userId: string) {
  const existing = await db
    .select()
    .from(cashbackWallets)
    .where(eq(cashbackWallets.userId, userId))
    .limit(1);

  if (existing.length > 0) {
    return existing[0];
  }

  // Create new wallet
  const [wallet] = await db
    .insert(cashbackWallets)
    .values({ userId })
    .returning();

  return wallet;
}

// Helper: Generate confirmation code
function generateConfirmationCode(): string {
  return nanoid(8).toUpperCase(); // 8 character code like "A1B2C3D4"
}

// Helper: Calculate cashback based on rules
async function calculateCashback(
  businessId: string,
  amount: number,
  isPremiumUser: boolean
): Promise<{ cashback: number; ruleId: string | null }> {
  const now = new Date();

  // Get applicable rules (business-specific or global)
  const rules = await db
    .select()
    .from(cashbackRules)
    .where(
      and(
        eq(cashbackRules.isActive, true),
        or(
          eq(cashbackRules.businessId, businessId),
          isNull(cashbackRules.businessId)
        ),
        lte(cashbackRules.validFrom, now),
        or(
          isNull(cashbackRules.validUntil),
          gte(cashbackRules.validUntil, now)
        ),
        // Premium only check
        or(
          eq(cashbackRules.isPremiumOnly, false),
          isPremiumUser ? sql`true` : eq(cashbackRules.isPremiumOnly, false)
        )
      )
    )
    .orderBy(desc(cashbackRules.priority));

  if (rules.length === 0) {
    return { cashback: 0, ruleId: null };
  }

  // Find best applicable rule
  for (const rule of rules) {
    const minPurchase = parseFloat(rule.minPurchase || '0');
    if (amount < minPurchase) continue;

    let cashback = 0;
    if (rule.type === 'percentage') {
      cashback = amount * (parseFloat(rule.value) / 100);
    } else {
      cashback = parseFloat(rule.value);
    }

    // Apply max limit
    if (rule.maxCashback) {
      cashback = Math.min(cashback, parseFloat(rule.maxCashback));
    }

    return { cashback: Math.round(cashback * 100) / 100, ruleId: rule.id };
  }

  return { cashback: 0, ruleId: null };
}

// ============================================
// WALLET ENDPOINTS
// ============================================

// GET /cashback/wallet - Get user's cashback wallet
app.get('/wallet', async (c) => {
  const user = getCurrentUser(c);
  if (!user) {
    return c.json({ error: 'Unauthorized' }, 401);
  }

  // Check if premium
  if (!user.isPremium) {
    return c.json({
      error: 'Premium required',
      message: 'Система кешбека доступна только для Premium пользователей'
    }, 403);
  }

  const wallet = await getOrCreateWallet(user.id);

  return c.json({
    wallet: {
      id: wallet.id,
      balance: parseFloat(wallet.balance),
      totalEarned: parseFloat(wallet.totalEarned),
      totalSpent: parseFloat(wallet.totalSpent),
      totalExpired: parseFloat(wallet.totalExpired),
    },
    currency: 'KZT',
  });
});

// GET /cashback/transactions - Get transaction history
app.get('/transactions', async (c) => {
  const user = getCurrentUser(c);
  if (!user) {
    return c.json({ error: 'Unauthorized' }, 401);
  }

  if (!user.isPremium) {
    return c.json({ error: 'Premium required' }, 403);
  }

  const wallet = await getOrCreateWallet(user.id);

  const limit = parseInt(c.req.query('limit') || '20');
  const offset = parseInt(c.req.query('offset') || '0');
  const type = c.req.query('type'); // earn, spend, etc.

  let query = db
    .select({
      id: cashbackTransactions.id,
      type: cashbackTransactions.type,
      amount: cashbackTransactions.amount,
      balanceBefore: cashbackTransactions.balanceBefore,
      balanceAfter: cashbackTransactions.balanceAfter,
      description: cashbackTransactions.description,
      status: cashbackTransactions.status,
      businessId: cashbackTransactions.relatedBusinessId,
      businessName: businesses.name,
      createdAt: cashbackTransactions.createdAt,
      expiresAt: cashbackTransactions.expiresAt,
    })
    .from(cashbackTransactions)
    .leftJoin(businesses, eq(cashbackTransactions.relatedBusinessId, businesses.id))
    .where(eq(cashbackTransactions.walletId, wallet.id))
    .orderBy(desc(cashbackTransactions.createdAt))
    .limit(limit)
    .offset(offset);

  const transactions = await query;

  return c.json({
    transactions: transactions.map(t => ({
      ...t,
      amount: parseFloat(t.amount),
      balanceBefore: parseFloat(t.balanceBefore),
      balanceAfter: parseFloat(t.balanceAfter),
    })),
    pagination: {
      limit,
      offset,
      hasMore: transactions.length === limit,
    },
  });
});

// ============================================
// PARTNER PAYMENTS
// ============================================

// Schema for creating payment
const createPaymentSchema = z.object({
  businessId: z.string().uuid(),
  totalAmount: z.number().positive(),
  useCashback: z.number().min(0).optional().default(0),
  eventId: z.string().uuid().optional(),
  promotionId: z.string().uuid().optional(),
  notes: z.string().max(500).optional(),
});

// POST /cashback/pay - Create payment at partner with cashback
app.post('/pay', zValidator('json', createPaymentSchema), async (c) => {
  const user = getCurrentUser(c);
  if (!user) {
    return c.json({ error: 'Unauthorized' }, 401);
  }

  if (!user.isPremium) {
    return c.json({ error: 'Premium required' }, 403);
  }

  const data = c.req.valid('json');
  const wallet = await getOrCreateWallet(user.id);

  // Verify business exists and is verified
  const [business] = await db
    .select()
    .from(businesses)
    .where(eq(businesses.id, data.businessId))
    .limit(1);

  if (!business) {
    return c.json({ error: 'Бизнес не найден' }, 404);
  }

  if (!business.isVerified) {
    return c.json({ error: 'Бизнес не верифицирован для приёма кешбека' }, 400);
  }

  // Check available cashback
  const availableBalance = parseFloat(wallet.balance);
  const requestedCashback = Math.min(data.useCashback, availableBalance, data.totalAmount);

  // Calculate amount to pay
  const amountPaid = data.totalAmount - requestedCashback;

  // Calculate cashback to earn
  const { cashback: cashbackEarned, ruleId } = await calculateCashback(
    data.businessId,
    data.totalAmount,
    user.isPremium
  );

  // Determine payment method
  let paymentMethod: 'cash' | 'card' | 'qr' | 'cashback_only' | 'mixed' = 'mixed';
  if (requestedCashback >= data.totalAmount) {
    paymentMethod = 'cashback_only';
  } else if (requestedCashback === 0) {
    paymentMethod = 'card';
  }

  // Generate confirmation code
  const confirmationCode = generateConfirmationCode();

  // Create payment record
  const [payment] = await db
    .insert(cashbackPartnerPayments)
    .values({
      userId: user.id,
      businessId: data.businessId,
      totalAmount: data.totalAmount.toString(),
      cashbackUsed: requestedCashback.toString(),
      cashbackEarned: cashbackEarned.toString(),
      amountPaid: amountPaid.toString(),
      paymentMethod,
      confirmationCode,
      appliedRuleId: ruleId,
      relatedEventId: data.eventId,
      relatedPromotionId: data.promotionId,
      notes: data.notes,
    })
    .returning();

  return c.json({
    payment: {
      id: payment.id,
      confirmationCode: payment.confirmationCode,
      totalAmount: data.totalAmount,
      cashbackUsed: requestedCashback,
      cashbackEarned,
      amountToPay: amountPaid,
      status: payment.status,
      businessName: business.name,
    },
    message: 'Покажите код подтверждения сотруднику для завершения оплаты',
    instructions: {
      ru: `Ваш код: ${confirmationCode}. Покажите этот код кассиру для списания кешбека и оплаты.`,
      kz: `Сіздің кодыңыз: ${confirmationCode}. Кассирге көрсетіңіз.`,
    },
  });
});

// GET /cashback/payments - Get user's payment history
app.get('/payments', async (c) => {
  const user = getCurrentUser(c);
  if (!user) {
    return c.json({ error: 'Unauthorized' }, 401);
  }

  const limit = parseInt(c.req.query('limit') || '20');
  const offset = parseInt(c.req.query('offset') || '0');
  const status = c.req.query('status');

  let conditions = [eq(cashbackPartnerPayments.userId, user.id)];
  if (status) {
    conditions.push(eq(cashbackPartnerPayments.status, status as any));
  }

  const payments = await db
    .select({
      id: cashbackPartnerPayments.id,
      totalAmount: cashbackPartnerPayments.totalAmount,
      cashbackUsed: cashbackPartnerPayments.cashbackUsed,
      cashbackEarned: cashbackPartnerPayments.cashbackEarned,
      amountPaid: cashbackPartnerPayments.amountPaid,
      status: cashbackPartnerPayments.status,
      confirmationCode: cashbackPartnerPayments.confirmationCode,
      businessName: businesses.name,
      businessLogo: businesses.logo,
      createdAt: cashbackPartnerPayments.createdAt,
      confirmedAt: cashbackPartnerPayments.confirmedAt,
    })
    .from(cashbackPartnerPayments)
    .leftJoin(businesses, eq(cashbackPartnerPayments.businessId, businesses.id))
    .where(and(...conditions))
    .orderBy(desc(cashbackPartnerPayments.createdAt))
    .limit(limit)
    .offset(offset);

  return c.json({
    payments: payments.map(p => ({
      ...p,
      totalAmount: parseFloat(p.totalAmount),
      cashbackUsed: parseFloat(p.cashbackUsed),
      cashbackEarned: parseFloat(p.cashbackEarned),
      amountPaid: parseFloat(p.amountPaid),
    })),
    pagination: { limit, offset, hasMore: payments.length === limit },
  });
});

// GET /cashback/payment/:id - Get specific payment details
app.get('/payment/:id', async (c) => {
  const user = getCurrentUser(c);
  if (!user) {
    return c.json({ error: 'Unauthorized' }, 401);
  }

  const paymentId = c.req.param('id');

  const [payment] = await db
    .select({
      id: cashbackPartnerPayments.id,
      totalAmount: cashbackPartnerPayments.totalAmount,
      cashbackUsed: cashbackPartnerPayments.cashbackUsed,
      cashbackEarned: cashbackPartnerPayments.cashbackEarned,
      amountPaid: cashbackPartnerPayments.amountPaid,
      status: cashbackPartnerPayments.status,
      confirmationCode: cashbackPartnerPayments.confirmationCode,
      paymentMethod: cashbackPartnerPayments.paymentMethod,
      rejectionReason: cashbackPartnerPayments.rejectionReason,
      notes: cashbackPartnerPayments.notes,
      businessId: cashbackPartnerPayments.businessId,
      businessName: businesses.name,
      businessLogo: businesses.logo,
      businessAddress: businesses.address,
      createdAt: cashbackPartnerPayments.createdAt,
      confirmedAt: cashbackPartnerPayments.confirmedAt,
    })
    .from(cashbackPartnerPayments)
    .leftJoin(businesses, eq(cashbackPartnerPayments.businessId, businesses.id))
    .where(
      and(
        eq(cashbackPartnerPayments.id, paymentId),
        eq(cashbackPartnerPayments.userId, user.id)
      )
    )
    .limit(1);

  if (!payment) {
    return c.json({ error: 'Платёж не найден' }, 404);
  }

  return c.json({
    payment: {
      ...payment,
      totalAmount: parseFloat(payment.totalAmount),
      cashbackUsed: parseFloat(payment.cashbackUsed),
      cashbackEarned: parseFloat(payment.cashbackEarned),
      amountPaid: parseFloat(payment.amountPaid),
    },
  });
});

// ============================================
// BUSINESS CONFIRMATION ENDPOINTS
// ============================================

// Schema for confirmation
const confirmPaymentSchema = z.object({
  confirmationCode: z.string().min(4).max(20),
});

// POST /cashback/confirm - Business confirms payment
app.post('/confirm', zValidator('json', confirmPaymentSchema), async (c) => {
  const user = getCurrentUser(c);
  if (!user) {
    return c.json({ error: 'Unauthorized' }, 401);
  }

  // User must be business owner or member
  if (user.role !== 'business' && user.role !== 'admin') {
    return c.json({ error: 'Требуется бизнес аккаунт' }, 403);
  }

  const { confirmationCode } = c.req.valid('json');

  // Find payment by code
  const [payment] = await db
    .select()
    .from(cashbackPartnerPayments)
    .where(eq(cashbackPartnerPayments.confirmationCode, confirmationCode))
    .limit(1);

  if (!payment) {
    return c.json({ error: 'Платёж не найден. Проверьте код.' }, 404);
  }

  if (payment.status !== 'pending') {
    return c.json({
      error: 'Платёж уже обработан',
      status: payment.status
    }, 400);
  }

  // Check if user is associated with the business
  const [business] = await db
    .select()
    .from(businesses)
    .where(eq(businesses.id, payment.businessId))
    .limit(1);

  if (!business) {
    return c.json({ error: 'Бизнес не найден' }, 404);
  }

  // Verify user has access (owner or admin)
  if (business.ownerId !== user.id && user.role !== 'admin') {
    // TODO: Check business members table
    return c.json({ error: 'Нет доступа к этому бизнесу' }, 403);
  }

  // Get customer's wallet
  const customerWallet = await getOrCreateWallet(payment.userId);
  const currentBalance = parseFloat(customerWallet.balance);
  const cashbackUsed = parseFloat(payment.cashbackUsed);
  const cashbackEarned = parseFloat(payment.cashbackEarned);

  // Verify sufficient balance
  if (cashbackUsed > currentBalance) {
    return c.json({
      error: 'Недостаточно кешбека на балансе клиента',
      required: cashbackUsed,
      available: currentBalance,
    }, 400);
  }

  // Start transaction
  const newBalance = currentBalance - cashbackUsed + cashbackEarned;

  // Update wallet
  await db
    .update(cashbackWallets)
    .set({
      balance: newBalance.toString(),
      totalSpent: (parseFloat(customerWallet.totalSpent) + cashbackUsed).toString(),
      totalEarned: (parseFloat(customerWallet.totalEarned) + cashbackEarned).toString(),
      updatedAt: new Date(),
    })
    .where(eq(cashbackWallets.id, customerWallet.id));

  // Create spend transaction if cashback was used
  if (cashbackUsed > 0) {
    await db.insert(cashbackTransactions).values({
      walletId: customerWallet.id,
      type: 'spend',
      amount: (-cashbackUsed).toString(),
      balanceBefore: currentBalance.toString(),
      balanceAfter: (currentBalance - cashbackUsed).toString(),
      description: `Оплата в ${business.name}`,
      status: 'completed',
      relatedBusinessId: business.id,
      relatedPaymentId: payment.id,
    });
  }

  // Create earn transaction if cashback was earned
  if (cashbackEarned > 0) {
    await db.insert(cashbackTransactions).values({
      walletId: customerWallet.id,
      type: 'earn',
      amount: cashbackEarned.toString(),
      balanceBefore: (currentBalance - cashbackUsed).toString(),
      balanceAfter: newBalance.toString(),
      description: `Кешбек за покупку в ${business.name}`,
      status: 'completed',
      relatedBusinessId: business.id,
      relatedPaymentId: payment.id,
      expiresAt: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000), // 90 days
    });
  }

  // Update payment status
  await db
    .update(cashbackPartnerPayments)
    .set({
      status: 'confirmed',
      confirmedAt: new Date(),
      confirmedBy: user.id,
      updatedAt: new Date(),
    })
    .where(eq(cashbackPartnerPayments.id, payment.id));

  // Update rule usage stats
  if (payment.appliedRuleId) {
    await db
      .update(cashbackRules)
      .set({
        usageCount: sql`${cashbackRules.usageCount} + 1`,
        totalCashbackGiven: sql`${cashbackRules.totalCashbackGiven} + ${cashbackEarned}`,
      })
      .where(eq(cashbackRules.id, payment.appliedRuleId));
  }

  // Get customer info for response
  const [customer] = await db
    .select({ name: users.name, email: users.email })
    .from(users)
    .where(eq(users.id, payment.userId))
    .limit(1);

  return c.json({
    success: true,
    message: 'Платёж подтверждён',
    payment: {
      id: payment.id,
      totalAmount: parseFloat(payment.totalAmount),
      cashbackUsed,
      cashbackEarned,
      amountPaid: parseFloat(payment.amountPaid),
      customerName: customer?.name || 'Клиент',
    },
  });
});

// POST /cashback/reject - Business rejects payment
const rejectPaymentSchema = z.object({
  confirmationCode: z.string().min(4).max(20),
  reason: z.string().min(1).max(500),
});

app.post('/reject', zValidator('json', rejectPaymentSchema), async (c) => {
  const user = getCurrentUser(c);
  if (!user) {
    return c.json({ error: 'Unauthorized' }, 401);
  }

  if (user.role !== 'business' && user.role !== 'admin') {
    return c.json({ error: 'Требуется бизнес аккаунт' }, 403);
  }

  const { confirmationCode, reason } = c.req.valid('json');

  const [payment] = await db
    .select()
    .from(cashbackPartnerPayments)
    .where(eq(cashbackPartnerPayments.confirmationCode, confirmationCode))
    .limit(1);

  if (!payment) {
    return c.json({ error: 'Платёж не найден' }, 404);
  }

  if (payment.status !== 'pending') {
    return c.json({ error: 'Платёж уже обработан' }, 400);
  }

  // Update payment status
  await db
    .update(cashbackPartnerPayments)
    .set({
      status: 'rejected',
      rejectionReason: reason,
      confirmedBy: user.id,
      updatedAt: new Date(),
    })
    .where(eq(cashbackPartnerPayments.id, payment.id));

  return c.json({
    success: true,
    message: 'Платёж отклонён',
  });
});

// ============================================
// RULES ENDPOINTS
// ============================================

// GET /cashback/rules - Get active cashback rules for a business
app.get('/rules', async (c) => {
  const user = getCurrentUser(c);
  if (!user) {
    return c.json({ error: 'Unauthorized' }, 401);
  }

  const businessId = c.req.query('businessId');
  const now = new Date();

  let conditions = [
    eq(cashbackRules.isActive, true),
    lte(cashbackRules.validFrom, now),
    or(
      isNull(cashbackRules.validUntil),
      gte(cashbackRules.validUntil, now)
    ),
  ];

  if (businessId) {
    conditions.push(
      or(
        eq(cashbackRules.businessId, businessId),
        isNull(cashbackRules.businessId)
      )
    );
  }

  // Show premium-only rules only to premium users
  if (!user.isPremium) {
    conditions.push(eq(cashbackRules.isPremiumOnly, false));
  }

  const rules = await db
    .select({
      id: cashbackRules.id,
      name: cashbackRules.name,
      description: cashbackRules.description,
      type: cashbackRules.type,
      value: cashbackRules.value,
      minPurchase: cashbackRules.minPurchase,
      maxCashback: cashbackRules.maxCashback,
      isPremiumOnly: cashbackRules.isPremiumOnly,
      businessId: cashbackRules.businessId,
      businessName: businesses.name,
      validUntil: cashbackRules.validUntil,
    })
    .from(cashbackRules)
    .leftJoin(businesses, eq(cashbackRules.businessId, businesses.id))
    .where(and(...conditions))
    .orderBy(desc(cashbackRules.priority));

  return c.json({
    rules: rules.map(r => ({
      ...r,
      value: parseFloat(r.value),
      minPurchase: r.minPurchase ? parseFloat(r.minPurchase) : 0,
      maxCashback: r.maxCashback ? parseFloat(r.maxCashback) : null,
    })),
  });
});

// GET /cashback/partners - Get list of partner businesses accepting cashback
app.get('/partners', async (c) => {
  const cityId = c.req.query('cityId');
  const category = c.req.query('category');

  let conditions = [eq(businesses.isVerified, true)];

  if (cityId) {
    conditions.push(eq(businesses.cityId, cityId));
  }

  if (category) {
    conditions.push(eq(businesses.category, category as any));
  }

  // Get businesses that have active cashback rules
  const partners = await db
    .select({
      id: businesses.id,
      name: businesses.name,
      description: businesses.description,
      category: businesses.category,
      logo: businesses.logo,
      address: businesses.address,
      tier: businesses.tier,
    })
    .from(businesses)
    .where(and(...conditions))
    .orderBy(desc(businesses.tier)); // Premium first

  // Get cashback rules for each partner
  const now = new Date();
  const rulesMap = new Map<string, number>();

  for (const partner of partners) {
    const [rule] = await db
      .select({ value: cashbackRules.value, type: cashbackRules.type })
      .from(cashbackRules)
      .where(
        and(
          eq(cashbackRules.isActive, true),
          or(
            eq(cashbackRules.businessId, partner.id),
            isNull(cashbackRules.businessId)
          ),
          lte(cashbackRules.validFrom, now),
          or(
            isNull(cashbackRules.validUntil),
            gte(cashbackRules.validUntil, now)
          )
        )
      )
      .orderBy(desc(cashbackRules.priority))
      .limit(1);

    if (rule) {
      rulesMap.set(partner.id, rule.type === 'percentage' ? parseFloat(rule.value) : 0);
    }
  }

  return c.json({
    partners: partners.map(p => ({
      ...p,
      cashbackPercent: rulesMap.get(p.id) || 0,
    })),
  });
});

// ============================================
// BUSINESS CASHBACK MANAGEMENT
// ============================================

// GET /cashback/business/stats - Get cashback stats for business owner
app.get('/business/stats', async (c) => {
  const user = getCurrentUser(c);
  if (!user) {
    return c.json({ error: 'Unauthorized' }, 401);
  }

  if (user.role !== 'business' && user.role !== 'admin') {
    return c.json({ error: 'Требуется бизнес аккаунт' }, 403);
  }

  // Get user's business
  const [business] = await db
    .select()
    .from(businesses)
    .where(eq(businesses.ownerId, user.id))
    .limit(1);

  if (!business) {
    return c.json({ error: 'Бизнес не найден' }, 404);
  }

  // Get payment stats
  const payments = await db
    .select({
      status: cashbackPartnerPayments.status,
      totalAmount: cashbackPartnerPayments.totalAmount,
      cashbackUsed: cashbackPartnerPayments.cashbackUsed,
      cashbackEarned: cashbackPartnerPayments.cashbackEarned,
    })
    .from(cashbackPartnerPayments)
    .where(eq(cashbackPartnerPayments.businessId, business.id));

  const stats = {
    totalPayments: payments.length,
    confirmedPayments: payments.filter(p => p.status === 'confirmed').length,
    pendingPayments: payments.filter(p => p.status === 'pending').length,
    totalRevenue: payments
      .filter(p => p.status === 'confirmed')
      .reduce((sum, p) => sum + parseFloat(p.totalAmount), 0),
    totalCashbackUsed: payments
      .filter(p => p.status === 'confirmed')
      .reduce((sum, p) => sum + parseFloat(p.cashbackUsed), 0),
    totalCashbackGiven: payments
      .filter(p => p.status === 'confirmed')
      .reduce((sum, p) => sum + parseFloat(p.cashbackEarned), 0),
  };

  return c.json({ stats });
});

// GET /cashback/business/payments - Get payments for business
app.get('/business/payments', async (c) => {
  const user = getCurrentUser(c);
  if (!user) {
    return c.json({ error: 'Unauthorized' }, 401);
  }

  if (user.role !== 'business' && user.role !== 'admin') {
    return c.json({ error: 'Требуется бизнес аккаунт' }, 403);
  }

  const [business] = await db
    .select()
    .from(businesses)
    .where(eq(businesses.ownerId, user.id))
    .limit(1);

  if (!business) {
    return c.json({ error: 'Бизнес не найден' }, 404);
  }

  const limit = parseInt(c.req.query('limit') || '20');
  const offset = parseInt(c.req.query('offset') || '0');
  const status = c.req.query('status');

  let conditions = [eq(cashbackPartnerPayments.businessId, business.id)];
  if (status) {
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
      customerName: users.name,
      createdAt: cashbackPartnerPayments.createdAt,
      confirmedAt: cashbackPartnerPayments.confirmedAt,
    })
    .from(cashbackPartnerPayments)
    .leftJoin(users, eq(cashbackPartnerPayments.userId, users.id))
    .where(and(...conditions))
    .orderBy(desc(cashbackPartnerPayments.createdAt))
    .limit(limit)
    .offset(offset);

  return c.json({
    payments: payments.map(p => ({
      ...p,
      totalAmount: parseFloat(p.totalAmount),
      cashbackUsed: parseFloat(p.cashbackUsed),
      cashbackEarned: parseFloat(p.cashbackEarned),
    })),
    pagination: { limit, offset, hasMore: payments.length === limit },
  });
});

export default app;
