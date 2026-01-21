// Referral system routes for Premium users
import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { z } from 'zod';
import { eq, and, desc, gte, lte, isNull, or, sql, count } from 'drizzle-orm';
import {
  db,
  referralCodes,
  referrals,
  referralRewardsConfig,
  cashbackWallets,
  cashbackTransactions,
  users
} from '../db';
import { authMiddleware, optionalAuthMiddleware, getCurrentUser, type AuthUser } from '../middleware/auth';
import { customAlphabet } from 'nanoid';

const app = new Hono<{ Variables: { user: AuthUser } }>();

// Generate referral code (only uppercase letters and numbers)
const generateReferralCode = customAlphabet('ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789', 8);

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

  const [wallet] = await db
    .insert(cashbackWallets)
    .values({ userId })
    .returning();

  return wallet;
}

// Helper: Get reward config for a type
async function getRewardConfig(rewardType: 'registration' | 'premium_conversion' | 'first_purchase') {
  const now = new Date();

  const [config] = await db
    .select()
    .from(referralRewardsConfig)
    .where(
      and(
        eq(referralRewardsConfig.rewardType, rewardType),
        eq(referralRewardsConfig.isActive, true),
        lte(referralRewardsConfig.validFrom, now),
        or(
          isNull(referralRewardsConfig.validUntil),
          gte(referralRewardsConfig.validUntil, now)
        )
      )
    )
    .limit(1);

  return config;
}

// Helper: Pay referral reward
async function payReferralReward(
  referralId: string,
  userId: string,
  amount: number,
  isReferrer: boolean,
  description: string
) {
  if (amount <= 0) return;

  const wallet = await getOrCreateWallet(userId);
  const currentBalance = parseFloat(wallet.balance);
  const newBalance = currentBalance + amount;

  // Update wallet
  await db
    .update(cashbackWallets)
    .set({
      balance: newBalance.toString(),
      totalEarned: (parseFloat(wallet.totalEarned) + amount).toString(),
      updatedAt: new Date(),
    })
    .where(eq(cashbackWallets.id, wallet.id));

  // Create transaction
  await db.insert(cashbackTransactions).values({
    walletId: wallet.id,
    type: 'referral',
    amount: amount.toString(),
    balanceBefore: currentBalance.toString(),
    balanceAfter: newBalance.toString(),
    description,
    status: 'completed',
    relatedReferralId: referralId,
    expiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 year
  });

  // Mark reward as paid
  if (isReferrer) {
    await db
      .update(referrals)
      .set({ referrerRewardPaid: true })
      .where(eq(referrals.id, referralId));
  } else {
    await db
      .update(referrals)
      .set({ referredRewardPaid: true })
      .where(eq(referrals.id, referralId));
  }
}

// ============================================
// PUBLIC ENDPOINTS (for registration)
// ============================================

// GET /referral/validate/:code - Validate referral code (public)
app.get('/validate/:code', async (c) => {
  const code = c.req.param('code').toUpperCase();

  const [referralCode] = await db
    .select({
      id: referralCodes.id,
      code: referralCodes.code,
      isActive: referralCodes.isActive,
      usageCount: referralCodes.usageCount,
      maxUsages: referralCodes.maxUsages,
      expiresAt: referralCodes.expiresAt,
      referrerName: users.name,
    })
    .from(referralCodes)
    .leftJoin(users, eq(referralCodes.userId, users.id))
    .where(eq(referralCodes.code, code))
    .limit(1);

  if (!referralCode) {
    return c.json({ valid: false, error: 'Код не найден' }, 404);
  }

  if (!referralCode.isActive) {
    return c.json({ valid: false, error: 'Код деактивирован' }, 400);
  }

  if (referralCode.maxUsages && referralCode.usageCount >= referralCode.maxUsages) {
    return c.json({ valid: false, error: 'Код достиг лимита использований' }, 400);
  }

  if (referralCode.expiresAt && new Date(referralCode.expiresAt) < new Date()) {
    return c.json({ valid: false, error: 'Срок действия кода истёк' }, 400);
  }

  // Get reward info
  const registrationReward = await getRewardConfig('registration');

  return c.json({
    valid: true,
    code: referralCode.code,
    referrerName: referralCode.referrerName,
    bonusAmount: registrationReward ? parseFloat(registrationReward.referredAmount) : 0,
    message: registrationReward
      ? `Вы получите ${registrationReward.referredAmount} ₸ бонусом после регистрации!`
      : 'Код действителен',
  });
});

// ============================================
// AUTHENTICATED ENDPOINTS
// ============================================

app.use('*', authMiddleware);

// GET /referral/code - Get user's referral code
app.get('/code', async (c) => {
  const user = getCurrentUser(c);
  if (!user) {
    return c.json({ error: 'Unauthorized' }, 401);
  }

  // Check if premium (only premium users can have referral codes)
  if (!user.isPremium) {
    return c.json({
      error: 'Premium required',
      message: 'Реферальная программа доступна только для Premium пользователей',
    }, 403);
  }

  // Find existing code
  const [existingCode] = await db
    .select()
    .from(referralCodes)
    .where(
      and(
        eq(referralCodes.userId, user.id),
        eq(referralCodes.isActive, true)
      )
    )
    .limit(1);

  if (existingCode) {
    return c.json({
      code: existingCode.code,
      usageCount: existingCode.usageCount,
      maxUsages: existingCode.maxUsages,
      totalRewardsEarned: parseFloat(existingCode.totalRewardsEarned || '0'),
      premiumConversions: existingCode.premiumConversions,
      shareUrl: `https://afisha.kz/register?ref=${existingCode.code}`,
      shareMessage: `Регистрируйся на Afisha.kz по моему коду ${existingCode.code} и получи бонус!`,
    });
  }

  return c.json({
    code: null,
    message: 'У вас пока нет реферального кода. Создайте его!',
  });
});

// POST /referral/generate - Generate new referral code
app.post('/generate', async (c) => {
  const user = getCurrentUser(c);
  if (!user) {
    return c.json({ error: 'Unauthorized' }, 401);
  }

  if (!user.isPremium) {
    return c.json({
      error: 'Premium required',
      message: 'Реферальная программа доступна только для Premium пользователей',
    }, 403);
  }

  // Check if already has active code
  const [existingCode] = await db
    .select()
    .from(referralCodes)
    .where(
      and(
        eq(referralCodes.userId, user.id),
        eq(referralCodes.isActive, true)
      )
    )
    .limit(1);

  if (existingCode) {
    return c.json({
      error: 'У вас уже есть активный реферальный код',
      code: existingCode.code,
    }, 400);
  }

  // Generate unique code
  let code = generateReferralCode();
  let attempts = 0;

  while (attempts < 10) {
    const [existing] = await db
      .select({ id: referralCodes.id })
      .from(referralCodes)
      .where(eq(referralCodes.code, code))
      .limit(1);

    if (!existing) break;
    code = generateReferralCode();
    attempts++;
  }

  // Create code
  const [newCode] = await db
    .insert(referralCodes)
    .values({
      userId: user.id,
      code,
    })
    .returning();

  return c.json({
    code: newCode.code,
    shareUrl: `https://afisha.kz/register?ref=${newCode.code}`,
    shareMessage: `Регистрируйся на Afisha.kz по моему коду ${newCode.code} и получи бонус!`,
    message: 'Ваш реферальный код создан!',
  });
});

// POST /referral/apply - Apply referral code (for new users after registration)
const applyCodeSchema = z.object({
  code: z.string().min(4).max(20),
});

app.post('/apply', zValidator('json', applyCodeSchema), async (c) => {
  const user = getCurrentUser(c);
  if (!user) {
    return c.json({ error: 'Unauthorized' }, 401);
  }

  const { code } = c.req.valid('json');
  const upperCode = code.toUpperCase();

  // Check if user already used a referral code
  const [existingReferral] = await db
    .select()
    .from(referrals)
    .where(eq(referrals.referredId, user.id))
    .limit(1);

  if (existingReferral) {
    return c.json({ error: 'Вы уже использовали реферальный код' }, 400);
  }

  // Find the code
  const [referralCode] = await db
    .select()
    .from(referralCodes)
    .where(eq(referralCodes.code, upperCode))
    .limit(1);

  if (!referralCode) {
    return c.json({ error: 'Код не найден' }, 404);
  }

  // Validate code
  if (!referralCode.isActive) {
    return c.json({ error: 'Код деактивирован' }, 400);
  }

  if (referralCode.userId === user.id) {
    return c.json({ error: 'Нельзя использовать свой собственный код' }, 400);
  }

  if (referralCode.maxUsages && referralCode.usageCount >= referralCode.maxUsages) {
    return c.json({ error: 'Код достиг лимита использований' }, 400);
  }

  if (referralCode.expiresAt && new Date(referralCode.expiresAt) < new Date()) {
    return c.json({ error: 'Срок действия кода истёк' }, 400);
  }

  // Get reward config
  const registrationReward = await getRewardConfig('registration');
  const referrerAmount = registrationReward ? parseFloat(registrationReward.referrerAmount) : 0;
  const referredAmount = registrationReward ? parseFloat(registrationReward.referredAmount) : 0;

  // Create referral record
  const [referral] = await db
    .insert(referrals)
    .values({
      referrerId: referralCode.userId,
      referredId: user.id,
      codeId: referralCode.id,
      status: 'registered',
      referrerReward: referrerAmount.toString(),
      referredReward: referredAmount.toString(),
      registeredAt: new Date(),
    })
    .returning();

  // Update code usage count
  await db
    .update(referralCodes)
    .set({
      usageCount: sql`${referralCodes.usageCount} + 1`,
    })
    .where(eq(referralCodes.id, referralCode.id));

  // Pay rewards immediately for registration
  if (referrerAmount > 0) {
    await payReferralReward(
      referral.id,
      referralCode.userId,
      referrerAmount,
      true,
      `Бонус за приглашение нового пользователя`
    );
  }

  if (referredAmount > 0) {
    await payReferralReward(
      referral.id,
      user.id,
      referredAmount,
      false,
      `Приветственный бонус по реферальному коду`
    );
  }

  // Update total rewards on code
  await db
    .update(referralCodes)
    .set({
      totalRewardsEarned: sql`${referralCodes.totalRewardsEarned} + ${referrerAmount}`,
    })
    .where(eq(referralCodes.id, referralCode.id));

  // Get referrer name
  const [referrer] = await db
    .select({ name: users.name })
    .from(users)
    .where(eq(users.id, referralCode.userId))
    .limit(1);

  return c.json({
    success: true,
    message: 'Реферальный код применён!',
    bonusReceived: referredAmount,
    referrerName: referrer?.name,
  });
});

// GET /referral/stats - Get referral statistics
app.get('/stats', async (c) => {
  const user = getCurrentUser(c);
  if (!user) {
    return c.json({ error: 'Unauthorized' }, 401);
  }

  if (!user.isPremium) {
    return c.json({ error: 'Premium required' }, 403);
  }

  // Get user's referral code
  const [code] = await db
    .select()
    .from(referralCodes)
    .where(
      and(
        eq(referralCodes.userId, user.id),
        eq(referralCodes.isActive, true)
      )
    )
    .limit(1);

  if (!code) {
    return c.json({
      hasCode: false,
      message: 'Создайте реферальный код для просмотра статистики',
    });
  }

  // Get referrals
  const userReferrals = await db
    .select({
      id: referrals.id,
      status: referrals.status,
      referrerReward: referrals.referrerReward,
      referrerRewardPaid: referrals.referrerRewardPaid,
      registeredAt: referrals.registeredAt,
      convertedAt: referrals.convertedAt,
      referredName: users.name,
    })
    .from(referrals)
    .leftJoin(users, eq(referrals.referredId, users.id))
    .where(eq(referrals.referrerId, user.id))
    .orderBy(desc(referrals.createdAt));

  const stats = {
    totalReferrals: userReferrals.length,
    registeredReferrals: userReferrals.filter(r => r.status !== 'pending').length,
    premiumConversions: userReferrals.filter(r => r.status === 'premium_converted').length,
    totalEarned: parseFloat(code.totalRewardsEarned || '0'),
    pendingRewards: userReferrals
      .filter(r => !r.referrerRewardPaid)
      .reduce((sum, r) => sum + parseFloat(r.referrerReward || '0'), 0),
  };

  return c.json({
    hasCode: true,
    code: code.code,
    stats,
    referrals: userReferrals.map(r => ({
      id: r.id,
      status: r.status,
      reward: parseFloat(r.referrerReward || '0'),
      rewardPaid: r.referrerRewardPaid,
      referredName: r.referredName || 'Пользователь',
      registeredAt: r.registeredAt,
      convertedAt: r.convertedAt,
    })),
  });
});

// GET /referral/rewards - Get reward configuration (public info)
app.get('/rewards', async (c) => {
  const now = new Date();

  const configs = await db
    .select({
      rewardType: referralRewardsConfig.rewardType,
      referrerAmount: referralRewardsConfig.referrerAmount,
      referredAmount: referralRewardsConfig.referredAmount,
      description: referralRewardsConfig.description,
    })
    .from(referralRewardsConfig)
    .where(
      and(
        eq(referralRewardsConfig.isActive, true),
        lte(referralRewardsConfig.validFrom, now),
        or(
          isNull(referralRewardsConfig.validUntil),
          gte(referralRewardsConfig.validUntil, now)
        )
      )
    );

  const rewards = {
    registration: configs.find(c => c.rewardType === 'registration'),
    premiumConversion: configs.find(c => c.rewardType === 'premium_conversion'),
    firstPurchase: configs.find(c => c.rewardType === 'first_purchase'),
  };

  return c.json({
    rewards: {
      registration: rewards.registration ? {
        referrerBonus: parseFloat(rewards.registration.referrerAmount),
        referredBonus: parseFloat(rewards.registration.referredAmount),
        description: rewards.registration.description || 'Бонус за регистрацию по реферальному коду',
      } : null,
      premiumConversion: rewards.premiumConversion ? {
        referrerBonus: parseFloat(rewards.premiumConversion.referrerAmount),
        referredBonus: parseFloat(rewards.premiumConversion.referredAmount),
        description: rewards.premiumConversion.description || 'Дополнительный бонус когда приглашённый становится Premium',
      } : null,
      firstPurchase: rewards.firstPurchase ? {
        referrerBonus: parseFloat(rewards.firstPurchase.referrerAmount),
        referredBonus: parseFloat(rewards.firstPurchase.referredAmount),
        description: rewards.firstPurchase.description || 'Бонус за первую покупку приглашённого',
      } : null,
    },
    programDescription: {
      ru: 'Приглашайте друзей и получайте бонусы на кешбек-кошелёк! Ваши друзья тоже получат приветственный бонус.',
      kz: 'Достарыңызды шақырыңыз және бонустар алыңыз! Сіздің достарыңыз да сәлемдесу бонусын алады.',
    },
  });
});

// POST /referral/deactivate - Deactivate referral code
app.post('/deactivate', async (c) => {
  const user = getCurrentUser(c);
  if (!user) {
    return c.json({ error: 'Unauthorized' }, 401);
  }

  const [code] = await db
    .select()
    .from(referralCodes)
    .where(
      and(
        eq(referralCodes.userId, user.id),
        eq(referralCodes.isActive, true)
      )
    )
    .limit(1);

  if (!code) {
    return c.json({ error: 'Активный код не найден' }, 404);
  }

  await db
    .update(referralCodes)
    .set({ isActive: false })
    .where(eq(referralCodes.id, code.id));

  return c.json({
    success: true,
    message: 'Реферальный код деактивирован',
  });
});

// ============================================
// INTERNAL: Premium conversion tracking
// ============================================

// This would be called when a referred user becomes premium
// Called from the subscription/payment system
export async function onUserBecamePremium(userId: string) {
  // Find referral where this user was referred
  const [referral] = await db
    .select()
    .from(referrals)
    .where(
      and(
        eq(referrals.referredId, userId),
        eq(referrals.status, 'registered') // Not yet converted
      )
    )
    .limit(1);

  if (!referral) return;

  // Get premium conversion reward
  const conversionReward = await getRewardConfig('premium_conversion');
  if (!conversionReward) return;

  const referrerAmount = parseFloat(conversionReward.referrerAmount);
  const referredAmount = parseFloat(conversionReward.referredAmount);

  // Update referral status
  await db
    .update(referrals)
    .set({
      status: 'premium_converted',
      convertedAt: new Date(),
      referrerReward: sql`${referrals.referrerReward} + ${referrerAmount}`,
      referredReward: sql`${referrals.referredReward} + ${referredAmount}`,
    })
    .where(eq(referrals.id, referral.id));

  // Pay conversion rewards
  if (referrerAmount > 0) {
    await payReferralReward(
      referral.id,
      referral.referrerId,
      referrerAmount,
      true,
      'Бонус: ваш реферал стал Premium пользователем!'
    );
  }

  if (referredAmount > 0) {
    await payReferralReward(
      referral.id,
      userId,
      referredAmount,
      false,
      'Бонус за переход на Premium!'
    );
  }

  // Update code stats
  await db
    .update(referralCodes)
    .set({
      premiumConversions: sql`${referralCodes.premiumConversions} + 1`,
      totalRewardsEarned: sql`${referralCodes.totalRewardsEarned} + ${referrerAmount}`,
    })
    .where(eq(referralCodes.id, referral.codeId));
}

export default app;
