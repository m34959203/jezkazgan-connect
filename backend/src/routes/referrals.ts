import { Hono } from 'hono';
import { db } from '../db';
import {
  referralCodes, referrals, referralBonuses, users, payments,
  analyticsEvents
} from '../db/schema';
import { eq, and, desc, sql } from 'drizzle-orm';
import { authMiddleware, getCurrentUser } from '../middleware/auth';
import { z } from 'zod';
import { zValidator } from '@hono/zod-validator';

const app = new Hono();

// Generate unique referral code
function generateReferralCode(name: string): string {
  const base = name ? name.substring(0, 4).toUpperCase().replace(/[^A-Z]/g, '') : 'USER';
  const random = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `${base}${random}`;
}

// Referral bonus configuration
const REFERRAL_CONFIG = {
  referrerBonusPercent: 10, // 10% от первой покупки
  referredBonusAmount: 500, // 500₸ бонус новому пользователю
  minPurchaseForBonus: 1000, // Минимальная покупка для получения бонуса
  maxBonusPerReferral: 5000, // Максимальный бонус с одного реферала
};

// Get or create referral code for current user
app.get('/my-code', authMiddleware, async (c) => {
  const user = getCurrentUser(c);
  if (!user) {
    return c.json({ error: 'Unauthorized' }, 401);
  }

  // Check if user already has a referral code
  let [existingCode] = await db
    .select()
    .from(referralCodes)
    .where(eq(referralCodes.userId, user.id));

  if (!existingCode) {
    // Create new referral code
    const code = generateReferralCode(user.name || '');
    [existingCode] = await db
      .insert(referralCodes)
      .values({
        userId: user.id,
        code,
      })
      .returning();
  }

  return c.json({
    code: existingCode.code,
    usageCount: existingCode.usageCount,
    totalEarnings: existingCode.totalEarnings,
    isActive: existingCode.isActive,
    shareUrl: `https://afisha.kz/register?ref=${existingCode.code}`,
  });
});

// Get referral statistics
app.get('/stats', authMiddleware, async (c) => {
  const user = getCurrentUser(c);
  if (!user) {
    return c.json({ error: 'Unauthorized' }, 401);
  }

  // Get referral code
  const [code] = await db
    .select()
    .from(referralCodes)
    .where(eq(referralCodes.userId, user.id));

  if (!code) {
    return c.json({
      totalReferrals: 0,
      convertedReferrals: 0,
      pendingBonuses: 0,
      paidBonuses: 0,
      conversionRate: 0,
    });
  }

  // Get referral stats
  const referralStats = await db
    .select({
      total: sql<number>`count(*)`,
      converted: sql<number>`sum(case when ${referrals.status} = 'converted' then 1 else 0 end)`,
    })
    .from(referrals)
    .where(eq(referrals.referrerId, user.id));

  // Get bonus stats
  const bonusStats = await db
    .select({
      pending: sql<number>`sum(case when ${referralBonuses.status} = 'pending' then ${referralBonuses.amount} else 0 end)`,
      paid: sql<number>`sum(case when ${referralBonuses.status} = 'paid' then ${referralBonuses.amount} else 0 end)`,
    })
    .from(referralBonuses)
    .where(eq(referralBonuses.userId, user.id));

  const total = Number(referralStats[0]?.total) || 0;
  const converted = Number(referralStats[0]?.converted) || 0;

  return c.json({
    totalReferrals: total,
    convertedReferrals: converted,
    pendingBonuses: Number(bonusStats[0]?.pending) || 0,
    paidBonuses: Number(bonusStats[0]?.paid) || 0,
    conversionRate: total > 0 ? Math.round((converted / total) * 100) : 0,
    config: REFERRAL_CONFIG,
  });
});

// Get list of referrals
app.get('/list', authMiddleware, async (c) => {
  const user = getCurrentUser(c);
  if (!user) {
    return c.json({ error: 'Unauthorized' }, 401);
  }

  const limit = Number(c.req.query('limit')) || 20;
  const offset = Number(c.req.query('offset')) || 0;

  const referralList = await db
    .select({
      id: referrals.id,
      status: referrals.status,
      firstPurchaseAt: referrals.firstPurchaseAt,
      firstPurchaseAmount: referrals.firstPurchaseAmount,
      bonusEarned: referrals.bonusEarned,
      createdAt: referrals.createdAt,
      referredUser: {
        id: users.id,
        name: users.name,
        avatar: users.avatar,
      },
    })
    .from(referrals)
    .leftJoin(users, eq(referrals.referredId, users.id))
    .where(eq(referrals.referrerId, user.id))
    .orderBy(desc(referrals.createdAt))
    .limit(limit)
    .offset(offset);

  return c.json(referralList);
});

// Validate referral code (for registration)
app.get('/validate/:code', async (c) => {
  const code = c.req.param('code');

  const [referralCode] = await db
    .select({
      code: referralCodes.code,
      isActive: referralCodes.isActive,
      userName: users.name,
    })
    .from(referralCodes)
    .leftJoin(users, eq(referralCodes.userId, users.id))
    .where(eq(referralCodes.code, code.toUpperCase()));

  if (!referralCode || !referralCode.isActive) {
    return c.json({ valid: false, error: 'Invalid or inactive referral code' });
  }

  return c.json({
    valid: true,
    code: referralCode.code,
    referrerName: referralCode.userName,
    bonusAmount: REFERRAL_CONFIG.referredBonusAmount,
  });
});

// Apply referral code during registration (called from auth route)
export async function applyReferralCode(
  referredUserId: string,
  referralCodeStr: string
): Promise<{ success: boolean; error?: string }> {
  try {
    // Find referral code
    const [code] = await db
      .select()
      .from(referralCodes)
      .where(and(
        eq(referralCodes.code, referralCodeStr.toUpperCase()),
        eq(referralCodes.isActive, true)
      ));

    if (!code) {
      return { success: false, error: 'Invalid referral code' };
    }

    // Check if user is not referring themselves
    if (code.userId === referredUserId) {
      return { success: false, error: 'Cannot use your own referral code' };
    }

    // Check if user already has a referral
    const [existingReferral] = await db
      .select()
      .from(referrals)
      .where(eq(referrals.referredId, referredUserId));

    if (existingReferral) {
      return { success: false, error: 'User already has a referral' };
    }

    // Create referral record
    await db.insert(referrals).values({
      referrerId: code.userId,
      referredId: referredUserId,
      referralCodeId: code.id,
      status: 'registered',
    });

    // Update usage count
    await db
      .update(referralCodes)
      .set({ usageCount: sql`${referralCodes.usageCount} + 1` })
      .where(eq(referralCodes.id, code.id));

    // Track analytics event
    await db.insert(analyticsEvents).values({
      userId: referredUserId,
      eventType: 'referral_signup',
      eventData: JSON.stringify({
        referrerId: code.userId,
        referralCode: code.code,
      }),
    });

    return { success: true };
  } catch (error) {
    console.error('Error applying referral code:', error);
    return { success: false, error: 'Failed to apply referral code' };
  }
}

// Process first purchase bonus (called from payment webhook)
export async function processFirstPurchaseBonus(
  userId: string,
  purchaseAmount: number,
  paymentId: string
): Promise<void> {
  try {
    // Check if user has a referral
    const [referral] = await db
      .select()
      .from(referrals)
      .where(and(
        eq(referrals.referredId, userId),
        eq(referrals.status, 'registered')
      ));

    if (!referral) {
      return; // No referral to process
    }

    if (purchaseAmount < REFERRAL_CONFIG.minPurchaseForBonus) {
      return; // Purchase too small
    }

    // Calculate referrer bonus
    const referrerBonus = Math.min(
      Math.round(purchaseAmount * (REFERRAL_CONFIG.referrerBonusPercent / 100)),
      REFERRAL_CONFIG.maxBonusPerReferral
    );

    // Update referral status
    await db
      .update(referrals)
      .set({
        status: 'converted',
        firstPurchaseAt: new Date(),
        firstPurchaseAmount: purchaseAmount,
        bonusEarned: referrerBonus,
        bonusGiven: REFERRAL_CONFIG.referredBonusAmount,
      })
      .where(eq(referrals.id, referral.id));

    // Create bonus records
    // Bonus for referrer
    await db.insert(referralBonuses).values({
      userId: referral.referrerId,
      referralId: referral.id,
      type: 'first_purchase',
      amount: referrerBonus,
      status: 'pending',
      description: `Бонус за первую покупку реферала (${purchaseAmount}₸)`,
    });

    // Update referral code earnings
    await db
      .update(referralCodes)
      .set({ totalEarnings: sql`${referralCodes.totalEarnings} + ${referrerBonus}` })
      .where(eq(referralCodes.userId, referral.referrerId));

    // Track analytics
    await db.insert(analyticsEvents).values({
      userId: referral.referredId,
      eventType: 'first_purchase',
      eventData: JSON.stringify({
        paymentId,
        amount: purchaseAmount,
        referrerId: referral.referrerId,
        referrerBonus,
      }),
    });

  } catch (error) {
    console.error('Error processing first purchase bonus:', error);
  }
}

// Get bonus history
app.get('/bonuses', authMiddleware, async (c) => {
  const user = getCurrentUser(c);
  if (!user) {
    return c.json({ error: 'Unauthorized' }, 401);
  }

  const limit = Number(c.req.query('limit')) || 20;
  const offset = Number(c.req.query('offset')) || 0;

  const bonuses = await db
    .select()
    .from(referralBonuses)
    .where(eq(referralBonuses.userId, user.id))
    .orderBy(desc(referralBonuses.createdAt))
    .limit(limit)
    .offset(offset);

  return c.json(bonuses);
});

// Request bonus withdrawal (for future implementation)
const withdrawalSchema = z.object({
  amount: z.number().min(1000, 'Minimum withdrawal is 1000₸'),
  method: z.enum(['kaspi', 'halyk']),
  accountDetails: z.string().min(1),
});

app.post('/withdraw', authMiddleware, zValidator('json', withdrawalSchema), async (c) => {
  const user = getCurrentUser(c);
  if (!user) {
    return c.json({ error: 'Unauthorized' }, 401);
  }

  const { amount, method, accountDetails } = c.req.valid('json');

  // Check available balance
  const [balanceResult] = await db
    .select({
      available: sql<number>`sum(case when ${referralBonuses.status} = 'approved' then ${referralBonuses.amount} else 0 end)`,
    })
    .from(referralBonuses)
    .where(eq(referralBonuses.userId, user.id));

  const available = Number(balanceResult?.available) || 0;

  if (amount > available) {
    return c.json({ error: 'Insufficient balance' }, 400);
  }

  // Create withdrawal bonus record
  const [withdrawal] = await db
    .insert(referralBonuses)
    .values({
      userId: user.id,
      type: 'withdrawal',
      amount: -amount,
      status: 'pending',
      description: `Вывод средств на ${method}: ${accountDetails}`,
    })
    .returning();

  return c.json({
    success: true,
    withdrawalId: withdrawal.id,
    message: 'Withdrawal request submitted. Processing takes 1-3 business days.',
  });
});

export default app;
