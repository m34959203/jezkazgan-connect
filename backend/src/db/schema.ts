import { pgTable, text, timestamp, boolean, integer, uuid, pgEnum, numeric } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

// Enums
export const userRoleEnum = pgEnum('user_role', ['user', 'business', 'moderator', 'admin']);
export const businessTierEnum = pgEnum('business_tier', ['free', 'lite', 'premium']);
export const eventCategoryEnum = pgEnum('event_category', [
  'concerts', 'education', 'seminars', 'leisure', 'sports', 'children', 'exhibitions', 'other'
]);
export const businessCategoryEnum = pgEnum('business_category', [
  'restaurants', 'cafes', 'sports', 'beauty', 'education', 'services', 'shopping', 'entertainment', 'other'
]);

// Cashback system enums
export const cashbackTransactionTypeEnum = pgEnum('cashback_transaction_type', [
  'earn',           // Начисление за покупку
  'spend',          // Списание при оплате
  'refund',         // Возврат кешбека
  'bonus',          // Бонусное начисление
  'referral',       // Начисление за реферала
  'premium_bonus',  // Бонус за premium подписку
  'expired'         // Истекший кешбек
]);

export const cashbackTransactionStatusEnum = pgEnum('cashback_transaction_status', [
  'pending',    // Ожидает подтверждения
  'completed',  // Завершена
  'cancelled',  // Отменена
  'expired'     // Истекла
]);

export const cashbackPaymentStatusEnum = pgEnum('cashback_payment_status', [
  'pending',    // Ожидает оплаты
  'confirmed',  // Подтверждена
  'rejected',   // Отклонена
  'refunded'    // Возвращена
]);

export const cashbackPaymentMethodEnum = pgEnum('cashback_payment_method', [
  'cash',          // Наличные
  'card',          // Карта
  'qr',            // QR оплата
  'cashback_only', // Только кешбек
  'mixed'          // Смешанная оплата
]);

export const cashbackRuleTypeEnum = pgEnum('cashback_rule_type', [
  'percentage', // Процент от покупки
  'fixed'       // Фиксированная сумма
]);

// Referral system enums
export const referralStatusEnum = pgEnum('referral_status', [
  'pending',           // Ожидает регистрации
  'registered',        // Зарегистрирован
  'activated',         // Активирован (первый вход)
  'premium_converted'  // Стал premium пользователем
]);

export const referralRewardTypeEnum = pgEnum('referral_reward_type', [
  'registration',        // За регистрацию
  'premium_conversion',  // За конверсию в premium
  'first_purchase'       // За первую покупку
]);

// Users
export const users = pgTable('users', {
  id: uuid('id').primaryKey().defaultRandom(),
  email: text('email').notNull().unique(),
  passwordHash: text('password_hash'),
  name: text('name'),
  phone: text('phone'),
  avatar: text('avatar'),
  role: userRoleEnum('role').default('user').notNull(),
  isPremium: boolean('is_premium').default(false),
  premiumUntil: timestamp('premium_until'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Cities
export const cities = pgTable('cities', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: text('name').notNull(),
  nameKz: text('name_kz'),
  slug: text('slug').notNull().unique(),
  region: text('region'),
  population: integer('population'),
  isActive: boolean('is_active').default(true),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// City Banners (рекламные баннеры для городов)
export const cityBanners = pgTable('city_banners', {
  id: uuid('id').primaryKey().defaultRandom(),
  cityId: uuid('city_id').references(() => cities.id).notNull(),
  businessId: uuid('business_id').references(() => businesses.id), // опционально - привязка к премиум бизнесу
  title: text('title').notNull(),
  description: text('description'),
  imageUrl: text('image_url').notNull(),
  link: text('link'), // внешняя ссылка или внутренняя
  linkType: text('link_type').default('external'), // 'external', 'business', 'event', 'promotion'
  position: integer('position').default(0), // для сортировки
  isActive: boolean('is_active').default(true),
  startDate: timestamp('start_date'),
  endDate: timestamp('end_date'),
  viewsCount: integer('views_count').default(0),
  clicksCount: integer('clicks_count').default(0),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// City Photos (фото для карусели на главной странице)
export const cityPhotos = pgTable('city_photos', {
  id: uuid('id').primaryKey().defaultRandom(),
  cityId: uuid('city_id').references(() => cities.id).notNull(),
  title: text('title').notNull(),
  imageUrl: text('image_url').notNull(),
  position: integer('position').default(0), // для сортировки
  isActive: boolean('is_active').default(true),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Businesses
export const businesses = pgTable('businesses', {
  id: uuid('id').primaryKey().defaultRandom(),
  ownerId: uuid('owner_id').references(() => users.id).notNull(),
  cityId: uuid('city_id').references(() => cities.id).notNull(),
  name: text('name').notNull(),
  description: text('description'),
  category: businessCategoryEnum('category').notNull(),
  address: text('address'),
  phone: text('phone'),
  whatsapp: text('whatsapp'),
  instagram: text('instagram'),
  website: text('website'),
  logo: text('logo'),
  cover: text('cover'),
  isVerified: boolean('is_verified').default(false),
  tier: businessTierEnum('tier').default('free').notNull(),
  tierUntil: timestamp('tier_until'),
  postsThisMonth: integer('posts_this_month').default(0),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Events
export const events = pgTable('events', {
  id: uuid('id').primaryKey().defaultRandom(),
  cityId: uuid('city_id').references(() => cities.id).notNull(),
  businessId: uuid('business_id').references(() => businesses.id),
  creatorId: uuid('creator_id').references(() => users.id).notNull(),
  title: text('title').notNull(),
  description: text('description'),
  category: eventCategoryEnum('category').notNull(),
  image: text('image'),
  isImageAiGenerated: boolean('is_image_ai_generated').default(false), // Kazakhstan AI Law compliance
  videoUrl: text('video_url'), // Business Premium: видео формат для событий
  videoThumbnail: text('video_thumbnail'), // Превью для видео
  date: timestamp('date').notNull(),
  endDate: timestamp('end_date'),
  location: text('location'),
  address: text('address'),
  price: integer('price'),
  maxPrice: integer('max_price'),
  isFree: boolean('is_free').default(false),
  isFeatured: boolean('is_featured').default(false),
  isApproved: boolean('is_approved').default(false),
  viewsCount: integer('views_count').default(0),
  savesCount: integer('saves_count').default(0),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Promotions (Акции)
export const promotions = pgTable('promotions', {
  id: uuid('id').primaryKey().defaultRandom(),
  businessId: uuid('business_id').references(() => businesses.id).notNull(),
  cityId: uuid('city_id').references(() => cities.id).notNull(),
  title: text('title').notNull(),
  description: text('description'),
  image: text('image'),
  isImageAiGenerated: boolean('is_image_ai_generated').default(false), // Kazakhstan AI Law compliance
  discount: text('discount'),
  conditions: text('conditions'),
  validFrom: timestamp('valid_from').defaultNow(),
  validUntil: timestamp('valid_until').notNull(),
  isActive: boolean('is_active').default(true),
  isPremiumOnly: boolean('is_premium_only').default(false),
  viewsCount: integer('views_count').default(0),
  savesCount: integer('saves_count').default(0),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// Business Team Members (Сотрудники бизнеса)
export const businessMemberRoleEnum = pgEnum('business_member_role', ['admin', 'editor', 'viewer']);

export const businessMembers = pgTable('business_members', {
  id: uuid('id').primaryKey().defaultRandom(),
  businessId: uuid('business_id').references(() => businesses.id).notNull(),
  userId: uuid('user_id').references(() => users.id).notNull(),
  role: businessMemberRoleEnum('role').default('editor').notNull(),
  invitedBy: uuid('invited_by').references(() => users.id).notNull(),
  invitedAt: timestamp('invited_at').defaultNow().notNull(),
  acceptedAt: timestamp('accepted_at'),
  isActive: boolean('is_active').default(true),
});

// Favorites (Избранное)
export const favorites = pgTable('favorites', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').references(() => users.id).notNull(),
  eventId: uuid('event_id').references(() => events.id),
  businessId: uuid('business_id').references(() => businesses.id),
  promotionId: uuid('promotion_id').references(() => promotions.id),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// Communities
export const communities = pgTable('communities', {
  id: uuid('id').primaryKey().defaultRandom(),
  cityId: uuid('city_id').references(() => cities.id).notNull(),
  creatorId: uuid('creator_id').references(() => users.id).notNull(),
  name: text('name').notNull(),
  description: text('description'),
  image: text('image'),
  isPrivate: boolean('is_private').default(false),
  membersCount: integer('members_count').default(0),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// Community Members
export const communityMembers = pgTable('community_members', {
  id: uuid('id').primaryKey().defaultRandom(),
  communityId: uuid('community_id').references(() => communities.id).notNull(),
  userId: uuid('user_id').references(() => users.id).notNull(),
  role: text('role').default('member'),
  joinedAt: timestamp('joined_at').defaultNow().notNull(),
});

// Business Premium: Настройки авто-публикации в соцсетях
export const socialPlatformEnum = pgEnum('social_platform', ['telegram', 'instagram', 'vk', 'facebook']);

export const autoPublishSettings = pgTable('auto_publish_settings', {
  id: uuid('id').primaryKey().defaultRandom(),
  businessId: uuid('business_id').references(() => businesses.id).notNull(),
  platform: socialPlatformEnum('platform').notNull(),
  isEnabled: boolean('is_enabled').default(false),
  // Telegram settings
  telegramBotToken: text('telegram_bot_token'),
  telegramChannelId: text('telegram_channel_id'),
  // Instagram settings (через официальный API)
  instagramAccessToken: text('instagram_access_token'),
  instagramBusinessAccountId: text('instagram_business_account_id'),
  // VK settings
  vkAccessToken: text('vk_access_token'),
  vkGroupId: text('vk_group_id'),
  // Facebook settings
  facebookAccessToken: text('facebook_access_token'),
  facebookPageId: text('facebook_page_id'),
  // Настройки публикации
  publishEvents: boolean('publish_events').default(true),
  publishPromotions: boolean('publish_promotions').default(true),
  autoPublishOnCreate: boolean('auto_publish_on_create').default(false), // Автоматически при создании
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Business Premium: История авто-публикаций
export const autoPublishHistoryStatusEnum = pgEnum('auto_publish_status', ['pending', 'published', 'failed']);

export const autoPublishHistory = pgTable('auto_publish_history', {
  id: uuid('id').primaryKey().defaultRandom(),
  businessId: uuid('business_id').references(() => businesses.id).notNull(),
  platform: socialPlatformEnum('platform').notNull(),
  contentType: text('content_type').notNull(), // 'event' | 'promotion'
  contentId: uuid('content_id').notNull(), // ID события или акции
  status: autoPublishHistoryStatusEnum('status').default('pending').notNull(),
  externalPostId: text('external_post_id'), // ID поста в соцсети
  externalPostUrl: text('external_post_url'), // Ссылка на пост
  errorMessage: text('error_message'),
  retryCount: integer('retry_count').default(0), // Количество попыток
  publishedAt: timestamp('published_at'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// Business Premium: ИИ генерация изображений (Nano Banana)
export const aiImageGenerations = pgTable('ai_image_generations', {
  id: uuid('id').primaryKey().defaultRandom(),
  businessId: uuid('business_id').references(() => businesses.id).notNull(),
  userId: uuid('user_id').references(() => users.id).notNull(),
  prompt: text('prompt').notNull(),
  style: text('style'), // 'banner', 'promo', 'event', 'logo'
  generatedImageUrl: text('generated_image_url'),
  status: text('status').default('pending').notNull(), // 'pending', 'generating', 'completed', 'failed'
  errorMessage: text('error_message'),
  usedFor: text('used_for'), // 'event', 'promotion', 'banner' - где было использовано
  usedForId: uuid('used_for_id'), // ID события/акции где использовано
  creditsUsed: integer('credits_used').default(1),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// ============================================
// CASHBACK SYSTEM - Premium Users (B2C)
// ============================================

// Кошелёк кешбека пользователя
export const cashbackWallets = pgTable('cashback_wallets', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').references(() => users.id).notNull().unique(),
  balance: numeric('balance', { precision: 12, scale: 2 }).default('0').notNull(), // Текущий баланс в тенге
  totalEarned: numeric('total_earned', { precision: 12, scale: 2 }).default('0').notNull(), // Всего заработано
  totalSpent: numeric('total_spent', { precision: 12, scale: 2 }).default('0').notNull(), // Всего потрачено
  totalExpired: numeric('total_expired', { precision: 12, scale: 2 }).default('0').notNull(), // Всего истекло
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Транзакции кешбека
export const cashbackTransactions = pgTable('cashback_transactions', {
  id: uuid('id').primaryKey().defaultRandom(),
  walletId: uuid('wallet_id').references(() => cashbackWallets.id).notNull(),
  type: cashbackTransactionTypeEnum('type').notNull(),
  amount: numeric('amount', { precision: 12, scale: 2 }).notNull(), // Сумма транзакции
  balanceBefore: numeric('balance_before', { precision: 12, scale: 2 }).notNull(), // Баланс до
  balanceAfter: numeric('balance_after', { precision: 12, scale: 2 }).notNull(), // Баланс после
  description: text('description'), // Описание транзакции
  status: cashbackTransactionStatusEnum('status').default('completed').notNull(),
  // Связи с бизнесами и контентом
  relatedBusinessId: uuid('related_business_id').references(() => businesses.id),
  relatedEventId: uuid('related_event_id').references(() => events.id),
  relatedPromotionId: uuid('related_promotion_id').references(() => promotions.id),
  relatedPaymentId: uuid('related_payment_id'), // FK на cashback_partner_payments
  relatedReferralId: uuid('related_referral_id'), // FK на referrals
  // Дата истечения (для ограниченного кешбека)
  expiresAt: timestamp('expires_at'),
  expiredAt: timestamp('expired_at'), // Когда фактически истёк
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// Правила начисления кешбека
export const cashbackRules = pgTable('cashback_rules', {
  id: uuid('id').primaryKey().defaultRandom(),
  businessId: uuid('business_id').references(() => businesses.id), // null = глобальное правило
  name: text('name').notNull(), // Название правила
  description: text('description'), // Описание для пользователей
  type: cashbackRuleTypeEnum('type').notNull(),
  value: numeric('value', { precision: 5, scale: 2 }).notNull(), // Процент или фикс. сумма
  minPurchase: numeric('min_purchase', { precision: 12, scale: 2 }).default('0'), // Минимальная сумма покупки
  maxCashback: numeric('max_cashback', { precision: 12, scale: 2 }), // Макс. кешбек за транзакцию
  // Ограничения
  category: businessCategoryEnum('category'), // null = все категории
  isPremiumOnly: boolean('is_premium_only').default(true).notNull(), // Только для premium
  isActive: boolean('is_active').default(true).notNull(),
  priority: integer('priority').default(0), // Приоритет (выше = важнее)
  validFrom: timestamp('valid_from').defaultNow().notNull(),
  validUntil: timestamp('valid_until'),
  // Статистика
  usageCount: integer('usage_count').default(0),
  totalCashbackGiven: numeric('total_cashback_given', { precision: 12, scale: 2 }).default('0'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Платежи с кешбеком у партнёров
export const cashbackPartnerPayments = pgTable('cashback_partner_payments', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').references(() => users.id).notNull(),
  businessId: uuid('business_id').references(() => businesses.id).notNull(),
  // Суммы
  totalAmount: numeric('total_amount', { precision: 12, scale: 2 }).notNull(), // Общая сумма покупки
  cashbackUsed: numeric('cashback_used', { precision: 12, scale: 2 }).default('0').notNull(), // Использовано кешбека
  cashbackEarned: numeric('cashback_earned', { precision: 12, scale: 2 }).default('0').notNull(), // Начислено кешбека
  amountPaid: numeric('amount_paid', { precision: 12, scale: 2 }).notNull(), // Доплата (totalAmount - cashbackUsed)
  // Метод оплаты
  paymentMethod: cashbackPaymentMethodEnum('payment_method').default('mixed').notNull(),
  // Статус
  status: cashbackPaymentStatusEnum('status').default('pending').notNull(),
  // Код подтверждения (генерируется для пользователя)
  confirmationCode: text('confirmation_code').notNull().unique(),
  // Подтверждение бизнесом
  confirmedAt: timestamp('confirmed_at'),
  confirmedBy: uuid('confirmed_by').references(() => users.id), // Сотрудник бизнеса
  rejectionReason: text('rejection_reason'),
  // Примененное правило
  appliedRuleId: uuid('applied_rule_id').references(() => cashbackRules.id),
  // Связь с событием/акцией (опционально)
  relatedEventId: uuid('related_event_id').references(() => events.id),
  relatedPromotionId: uuid('related_promotion_id').references(() => promotions.id),
  // Метаданные
  notes: text('notes'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// ============================================
// REFERRAL SYSTEM - Premium Users
// ============================================

// Реферальные коды
export const referralCodes = pgTable('referral_codes', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').references(() => users.id).notNull(),
  code: text('code').notNull().unique(), // Уникальный код, например IVAN2024
  isActive: boolean('is_active').default(true).notNull(),
  usageCount: integer('usage_count').default(0).notNull(), // Сколько раз использован
  maxUsages: integer('max_usages'), // null = безлимит
  // Статистика
  totalRewardsEarned: numeric('total_rewards_earned', { precision: 12, scale: 2 }).default('0'),
  totalEarnings: numeric('total_earnings', { precision: 12, scale: 2 }).default('0'), // Alias for routes
  premiumConversions: integer('premium_conversions').default(0), // Сколько стали premium
  createdAt: timestamp('created_at').defaultNow().notNull(),
  expiresAt: timestamp('expires_at'), // Дата истечения кода
});

// Реферальные связи
export const referrals = pgTable('referrals', {
  id: uuid('id').primaryKey().defaultRandom(),
  referrerId: uuid('referrer_id').references(() => users.id).notNull(), // Кто пригласил
  referredId: uuid('referred_id').references(() => users.id).notNull(), // Кто был приглашён
  codeId: uuid('code_id').references(() => referralCodes.id).notNull(), // Использованный код
  referralCodeId: uuid('referral_code_id').references(() => referralCodes.id), // Alias for routes
  status: referralStatusEnum('status').default('pending').notNull(),
  // Награды
  referrerReward: numeric('referrer_reward', { precision: 12, scale: 2 }).default('0'), // Награда приглашающему
  referredReward: numeric('referred_reward', { precision: 12, scale: 2 }).default('0'), // Награда приглашённому
  referrerRewardPaid: boolean('referrer_reward_paid').default(false),
  referredRewardPaid: boolean('referred_reward_paid').default(false),
  // First purchase tracking (for routes)
  firstPurchaseAt: timestamp('first_purchase_at'),
  firstPurchaseAmount: integer('first_purchase_amount'),
  bonusEarned: numeric('bonus_earned', { precision: 12, scale: 2 }).default('0'),
  bonusGiven: numeric('bonus_given', { precision: 12, scale: 2 }).default('0'),
  // Даты
  registeredAt: timestamp('registered_at'), // Когда зарегистрировался
  activatedAt: timestamp('activated_at'), // Когда активировался
  convertedAt: timestamp('converted_at'), // Когда стал premium
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// Настройки наград реферальной программы (админ)
export const referralRewardsConfig = pgTable('referral_rewards_config', {
  id: uuid('id').primaryKey().defaultRandom(),
  rewardType: referralRewardTypeEnum('reward_type').notNull().unique(),
  referrerAmount: numeric('referrer_amount', { precision: 12, scale: 2 }).notNull(), // Награда приглашающему
  referredAmount: numeric('referred_amount', { precision: 12, scale: 2 }).notNull(), // Награда приглашённому
  description: text('description'), // Описание для отображения
  isActive: boolean('is_active').default(true).notNull(),
  validFrom: timestamp('valid_from').defaultNow().notNull(),
  validUntil: timestamp('valid_until'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// ============================================
// REFERRAL BONUSES
// ============================================

export const referralBonusTypeEnum = pgEnum('referral_bonus_type', [
  'first_purchase',  // Бонус за первую покупку
  'registration',    // Бонус за регистрацию
  'withdrawal'       // Вывод средств
]);

export const referralBonusStatusEnum = pgEnum('referral_bonus_status', [
  'pending',   // Ожидает
  'approved',  // Подтверждён
  'paid',      // Выплачен
  'rejected'   // Отклонён
]);

export const referralBonuses = pgTable('referral_bonuses', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').references(() => users.id).notNull(),
  referralId: uuid('referral_id').references(() => referrals.id),
  type: referralBonusTypeEnum('type').notNull(),
  amount: numeric('amount', { precision: 12, scale: 2 }).notNull(),
  status: referralBonusStatusEnum('status').default('pending').notNull(),
  description: text('description'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// ============================================
// ANALYTICS EVENTS
// ============================================

export const analyticsEventTypeEnum = pgEnum('analytics_event_type', [
  'page_view',
  'event_view',
  'business_view',
  'promotion_view',
  'premium_conversion',
  'business_tier_upgrade',
  'referral_signup',
  'first_purchase',
  'subscription_started',
  'subscription_cancelled'
]);

export const analyticsEvents = pgTable('analytics_events', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').references(() => users.id),
  sessionId: text('session_id'),
  eventType: text('event_type').notNull(),
  eventData: text('event_data'), // JSON string
  source: text('source').default('web'),
  referrer: text('referrer'),
  utmSource: text('utm_source'),
  utmMedium: text('utm_medium'),
  utmCampaign: text('utm_campaign'),
  ipAddress: text('ip_address'),
  userAgent: text('user_agent'),
  deviceType: text('device_type'), // desktop, mobile, tablet
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// ============================================
// PAYMENTS SYSTEM
// ============================================

export const paymentProviderEnum = pgEnum('payment_provider', ['kaspi', 'halyk']);
export const paymentTypeEnum = pgEnum('payment_type', ['subscription', 'premium', 'banner', 'other']);
export const paymentStatusEnum = pgEnum('payment_status', ['pending', 'completed', 'failed', 'refunded', 'cancelled']);
export const subscriptionTypeEnum = pgEnum('subscription_type', ['user_premium', 'business_lite', 'business_premium']);

export const payments = pgTable('payments', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').references(() => users.id).notNull(),
  businessId: uuid('business_id').references(() => businesses.id),
  provider: paymentProviderEnum('provider').notNull(),
  type: paymentTypeEnum('type').notNull(),
  amount: integer('amount').notNull(), // В тенге
  status: paymentStatusEnum('status').default('pending').notNull(),
  description: text('description'),
  subscriptionType: subscriptionTypeEnum('subscription_type'),
  subscriptionDays: integer('subscription_days'),
  paymentUrl: text('payment_url'),
  qrCode: text('qr_code'),
  externalId: text('external_id'), // ID в платёжной системе
  externalStatus: text('external_status'),
  paidAt: timestamp('paid_at'),
  expiresAt: timestamp('expires_at'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const paymentWebhooks = pgTable('payment_webhooks', {
  id: uuid('id').primaryKey().defaultRandom(),
  provider: paymentProviderEnum('provider').notNull(),
  eventType: text('event_type').notNull(),
  payload: text('payload').notNull(), // JSON
  signature: text('signature'),
  isProcessed: boolean('is_processed').default(false),
  processedAt: timestamp('processed_at'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// ============================================
// PUSH NOTIFICATIONS
// ============================================

export const pushSubscriptions = pgTable('push_subscriptions', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').references(() => users.id).notNull(),
  endpoint: text('endpoint').notNull(),
  p256dh: text('p256dh').notNull(),
  auth: text('auth').notNull(),
  userAgent: text('user_agent'),
  isActive: boolean('is_active').default(true),
  lastUsedAt: timestamp('last_used_at'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const notificationTypeEnum = pgEnum('notification_type', [
  'event_reminder',
  'promotion_new',
  'business_verified',
  'payment_success',
  'subscription_expiring',
  'referral_bonus',
  'event_approved',
  'event_rejected',
  'system'
]);

export const notifications = pgTable('notifications', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').references(() => users.id).notNull(),
  type: notificationTypeEnum('type').notNull(),
  title: text('title').notNull(),
  body: text('body').notNull(),
  icon: text('icon'),
  link: text('link'),
  data: text('data'), // JSON string
  isRead: boolean('is_read').default(false),
  readAt: timestamp('read_at'),
  isPushed: boolean('is_pushed').default(false),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// ============================================
// REVIEWS SYSTEM
// ============================================

export const reviewTargetTypeEnum = pgEnum('review_target_type', ['business', 'event']);

export const reviews = pgTable('reviews', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').references(() => users.id).notNull(),
  targetType: reviewTargetTypeEnum('target_type').notNull(),
  businessId: uuid('business_id').references(() => businesses.id),
  eventId: uuid('event_id').references(() => events.id),
  rating: integer('rating').notNull(), // 1-5
  title: text('title'),
  content: text('content'),
  pros: text('pros'),
  cons: text('cons'),
  images: text('images'), // JSON array of URLs
  likesCount: integer('likes_count').default(0),
  dislikesCount: integer('dislikes_count').default(0),
  replyCount: integer('reply_count').default(0),
  isApproved: boolean('is_approved').default(false),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const reviewReplies = pgTable('review_replies', {
  id: uuid('id').primaryKey().defaultRandom(),
  reviewId: uuid('review_id').references(() => reviews.id).notNull(),
  userId: uuid('user_id').references(() => users.id).notNull(),
  content: text('content').notNull(),
  isBusinessReply: boolean('is_business_reply').default(false),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const reviewVotes = pgTable('review_votes', {
  id: uuid('id').primaryKey().defaultRandom(),
  reviewId: uuid('review_id').references(() => reviews.id).notNull(),
  userId: uuid('user_id').references(() => users.id).notNull(),
  isHelpful: boolean('is_helpful').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// Relations
export const usersRelations = relations(users, ({ many, one }) => ({
  businesses: many(businesses),
  events: many(events),
  favorites: many(favorites),
  communities: many(communityMembers),
  // Cashback
  cashbackWallet: one(cashbackWallets),
  cashbackPayments: many(cashbackPartnerPayments),
  // Referral
  referralCodes: many(referralCodes),
  referralsAsReferrer: many(referrals, { relationName: 'referrer' }),
  referralsAsReferred: many(referrals, { relationName: 'referred' }),
}));

export const citiesRelations = relations(cities, ({ many }) => ({
  businesses: many(businesses),
  events: many(events),
  promotions: many(promotions),
  communities: many(communities),
  banners: many(cityBanners),
  photos: many(cityPhotos),
}));

export const cityPhotosRelations = relations(cityPhotos, ({ one }) => ({
  city: one(cities, { fields: [cityPhotos.cityId], references: [cities.id] }),
}));

export const cityBannersRelations = relations(cityBanners, ({ one }) => ({
  city: one(cities, { fields: [cityBanners.cityId], references: [cities.id] }),
  business: one(businesses, { fields: [cityBanners.businessId], references: [businesses.id] }),
}));

export const businessesRelations = relations(businesses, ({ one, many }) => ({
  owner: one(users, { fields: [businesses.ownerId], references: [users.id] }),
  city: one(cities, { fields: [businesses.cityId], references: [cities.id] }),
  events: many(events),
  promotions: many(promotions),
  members: many(businessMembers),
  autoPublishSettings: many(autoPublishSettings),
  autoPublishHistory: many(autoPublishHistory),
  aiImageGenerations: many(aiImageGenerations),
  // Cashback
  cashbackRules: many(cashbackRules),
  cashbackPayments: many(cashbackPartnerPayments),
}));

export const businessMembersRelations = relations(businessMembers, ({ one }) => ({
  business: one(businesses, { fields: [businessMembers.businessId], references: [businesses.id] }),
  user: one(users, { fields: [businessMembers.userId], references: [users.id] }),
  inviter: one(users, { fields: [businessMembers.invitedBy], references: [users.id] }),
}));

export const eventsRelations = relations(events, ({ one, many }) => ({
  city: one(cities, { fields: [events.cityId], references: [cities.id] }),
  business: one(businesses, { fields: [events.businessId], references: [businesses.id] }),
  creator: one(users, { fields: [events.creatorId], references: [users.id] }),
  favorites: many(favorites),
}));

export const promotionsRelations = relations(promotions, ({ one, many }) => ({
  business: one(businesses, { fields: [promotions.businessId], references: [businesses.id] }),
  city: one(cities, { fields: [promotions.cityId], references: [cities.id] }),
  favorites: many(favorites),
}));

export const communitiesRelations = relations(communities, ({ one, many }) => ({
  city: one(cities, { fields: [communities.cityId], references: [cities.id] }),
  creator: one(users, { fields: [communities.creatorId], references: [users.id] }),
  members: many(communityMembers),
}));

// Business Premium Relations
export const autoPublishSettingsRelations = relations(autoPublishSettings, ({ one }) => ({
  business: one(businesses, { fields: [autoPublishSettings.businessId], references: [businesses.id] }),
}));

export const autoPublishHistoryRelations = relations(autoPublishHistory, ({ one }) => ({
  business: one(businesses, { fields: [autoPublishHistory.businessId], references: [businesses.id] }),
}));

export const aiImageGenerationsRelations = relations(aiImageGenerations, ({ one }) => ({
  business: one(businesses, { fields: [aiImageGenerations.businessId], references: [businesses.id] }),
  user: one(users, { fields: [aiImageGenerations.userId], references: [users.id] }),
}));

// ============================================
// CASHBACK SYSTEM RELATIONS
// ============================================

export const cashbackWalletsRelations = relations(cashbackWallets, ({ one, many }) => ({
  user: one(users, { fields: [cashbackWallets.userId], references: [users.id] }),
  transactions: many(cashbackTransactions),
}));

export const cashbackTransactionsRelations = relations(cashbackTransactions, ({ one }) => ({
  wallet: one(cashbackWallets, { fields: [cashbackTransactions.walletId], references: [cashbackWallets.id] }),
  business: one(businesses, { fields: [cashbackTransactions.relatedBusinessId], references: [businesses.id] }),
  event: one(events, { fields: [cashbackTransactions.relatedEventId], references: [events.id] }),
  promotion: one(promotions, { fields: [cashbackTransactions.relatedPromotionId], references: [promotions.id] }),
}));

export const cashbackRulesRelations = relations(cashbackRules, ({ one, many }) => ({
  business: one(businesses, { fields: [cashbackRules.businessId], references: [businesses.id] }),
  payments: many(cashbackPartnerPayments),
}));

export const cashbackPartnerPaymentsRelations = relations(cashbackPartnerPayments, ({ one }) => ({
  user: one(users, { fields: [cashbackPartnerPayments.userId], references: [users.id] }),
  business: one(businesses, { fields: [cashbackPartnerPayments.businessId], references: [businesses.id] }),
  confirmer: one(users, { fields: [cashbackPartnerPayments.confirmedBy], references: [users.id] }),
  rule: one(cashbackRules, { fields: [cashbackPartnerPayments.appliedRuleId], references: [cashbackRules.id] }),
  event: one(events, { fields: [cashbackPartnerPayments.relatedEventId], references: [events.id] }),
  promotion: one(promotions, { fields: [cashbackPartnerPayments.relatedPromotionId], references: [promotions.id] }),
}));

// ============================================
// REFERRAL SYSTEM RELATIONS
// ============================================

export const referralCodesRelations = relations(referralCodes, ({ one, many }) => ({
  user: one(users, { fields: [referralCodes.userId], references: [users.id] }),
  referrals: many(referrals),
}));

export const referralsRelations = relations(referrals, ({ one }) => ({
  referrer: one(users, { fields: [referrals.referrerId], references: [users.id] }),
  referred: one(users, { fields: [referrals.referredId], references: [users.id] }),
  code: one(referralCodes, { fields: [referrals.codeId], references: [referralCodes.id] }),
}));

export const referralRewardsConfigRelations = relations(referralRewardsConfig, () => ({}));

// ============================================
// REFERRAL BONUSES RELATIONS
// ============================================

export const referralBonusesRelations = relations(referralBonuses, ({ one }) => ({
  user: one(users, { fields: [referralBonuses.userId], references: [users.id] }),
  referral: one(referrals, { fields: [referralBonuses.referralId], references: [referrals.id] }),
}));

// ============================================
// ANALYTICS EVENTS RELATIONS
// ============================================

export const analyticsEventsRelations = relations(analyticsEvents, ({ one }) => ({
  user: one(users, { fields: [analyticsEvents.userId], references: [users.id] }),
}));

// ============================================
// PAYMENTS RELATIONS
// ============================================

export const paymentsRelations = relations(payments, ({ one }) => ({
  user: one(users, { fields: [payments.userId], references: [users.id] }),
  business: one(businesses, { fields: [payments.businessId], references: [businesses.id] }),
}));

export const paymentWebhooksRelations = relations(paymentWebhooks, () => ({}));

// ============================================
// PUSH NOTIFICATIONS RELATIONS
// ============================================

export const pushSubscriptionsRelations = relations(pushSubscriptions, ({ one }) => ({
  user: one(users, { fields: [pushSubscriptions.userId], references: [users.id] }),
}));

export const notificationsRelations = relations(notifications, ({ one }) => ({
  user: one(users, { fields: [notifications.userId], references: [users.id] }),
}));

// ============================================
// REVIEWS RELATIONS
// ============================================

export const reviewsRelations = relations(reviews, ({ one, many }) => ({
  user: one(users, { fields: [reviews.userId], references: [users.id] }),
  business: one(businesses, { fields: [reviews.businessId], references: [businesses.id] }),
  event: one(events, { fields: [reviews.eventId], references: [events.id] }),
  replies: many(reviewReplies),
  votes: many(reviewVotes),
}));

export const reviewRepliesRelations = relations(reviewReplies, ({ one }) => ({
  review: one(reviews, { fields: [reviewReplies.reviewId], references: [reviews.id] }),
  user: one(users, { fields: [reviewReplies.userId], references: [users.id] }),
}));

export const reviewVotesRelations = relations(reviewVotes, ({ one }) => ({
  review: one(reviews, { fields: [reviewVotes.reviewId], references: [reviews.id] }),
  user: one(users, { fields: [reviewVotes.userId], references: [users.id] }),
}));

// ============================================
// COMPLAINTS SYSTEM
// ============================================

export const complaintTargetTypeEnum = pgEnum('complaint_target_type', ['business', 'event', 'promotion', 'review', 'user']);
export const complaintStatusEnum = pgEnum('complaint_status', ['pending', 'reviewing', 'resolved', 'rejected']);
export const complaintReasonEnum = pgEnum('complaint_reason', [
  'spam',              // Спам
  'fraud',             // Мошенничество
  'inappropriate',     // Неприемлемый контент
  'outdated',          // Неактуальная информация
  'copyright',         // Нарушение авторских прав
  'fake',              // Недостоверная информация
  'offensive',         // Оскорбительный контент
  'other'              // Другое
]);

export const complaints = pgTable('complaints', {
  id: uuid('id').primaryKey().defaultRandom(),
  reporterId: uuid('reporter_id').references(() => users.id).notNull(),
  targetType: complaintTargetTypeEnum('target_type').notNull(),
  targetId: uuid('target_id').notNull(),
  reason: complaintReasonEnum('reason').notNull(),
  description: text('description'),
  status: complaintStatusEnum('status').default('pending').notNull(),
  resolution: text('resolution'),
  resolvedById: uuid('resolved_by_id').references(() => users.id),
  resolvedAt: timestamp('resolved_at'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const complaintsRelations = relations(complaints, ({ one }) => ({
  reporter: one(users, { fields: [complaints.reporterId], references: [users.id], relationName: 'reporter' }),
  resolvedBy: one(users, { fields: [complaints.resolvedById], references: [users.id], relationName: 'resolver' }),
}));

// ============================================
// COLLABORATIONS SYSTEM
// ============================================

export const collabStatusEnum = pgEnum('collab_status', ['open', 'in_progress', 'closed']);
export const collabCategoryEnum = pgEnum('collab_category', [
  'photo_video',   // Фото/видео съёмка
  'partnership',   // Партнёрство
  'events',        // Мероприятия
  'marketing',     // Маркетинг
  'delivery',      // Доставка
  'other'          // Другое
]);

export const collaborations = pgTable('collaborations', {
  id: uuid('id').primaryKey().defaultRandom(),
  cityId: uuid('city_id').references(() => cities.id).notNull(),
  creatorId: uuid('creator_id').references(() => users.id).notNull(),
  businessId: uuid('business_id').references(() => businesses.id), // optional
  title: text('title').notNull(),
  description: text('description').notNull(),
  category: collabCategoryEnum('category').notNull(),
  budget: text('budget'), // nullable
  status: collabStatusEnum('status').default('open').notNull(),
  responseCount: integer('response_count').default(0).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const collabResponses = pgTable('collab_responses', {
  id: uuid('id').primaryKey().defaultRandom(),
  collabId: uuid('collab_id').references(() => collaborations.id).notNull(),
  userId: uuid('user_id').references(() => users.id).notNull(),
  message: text('message').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// ============================================
// COLLABORATIONS RELATIONS
// ============================================

export const collaborationsRelations = relations(collaborations, ({ one, many }) => ({
  city: one(cities, { fields: [collaborations.cityId], references: [cities.id] }),
  creator: one(users, { fields: [collaborations.creatorId], references: [users.id] }),
  business: one(businesses, { fields: [collaborations.businessId], references: [businesses.id] }),
  responses: many(collabResponses),
}));

export const collabResponsesRelations = relations(collabResponses, ({ one }) => ({
  collaboration: one(collaborations, { fields: [collabResponses.collabId], references: [collaborations.id] }),
  user: one(users, { fields: [collabResponses.userId], references: [users.id] }),
}));
