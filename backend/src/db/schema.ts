import { pgTable, text, timestamp, boolean, integer, uuid, pgEnum } from 'drizzle-orm/pg-core';
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

// Relations
export const usersRelations = relations(users, ({ many, one }) => ({
  businesses: many(businesses),
  events: many(events),
  favorites: many(favorites),
  communities: many(communityMembers),
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
// REFERRAL SYSTEM (Реферальная система)
// ============================================

export const referralStatusEnum = pgEnum('referral_status', ['pending', 'registered', 'converted', 'expired']);

// Реферальные коды пользователей
export const referralCodes = pgTable('referral_codes', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').references(() => users.id).notNull().unique(),
  code: text('code').notNull().unique(), // Уникальный код, например: "ALEX2024"
  usageCount: integer('usage_count').default(0),
  totalEarnings: integer('total_earnings').default(0), // В тенге
  isActive: boolean('is_active').default(true),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// Рефералы (приглашённые пользователи)
export const referrals = pgTable('referrals', {
  id: uuid('id').primaryKey().defaultRandom(),
  referrerId: uuid('referrer_id').references(() => users.id).notNull(), // Кто пригласил
  referredId: uuid('referred_id').references(() => users.id).notNull(), // Кого пригласили
  referralCodeId: uuid('referral_code_id').references(() => referralCodes.id).notNull(),
  status: referralStatusEnum('status').default('registered').notNull(),
  firstPurchaseAt: timestamp('first_purchase_at'), // Дата первой покупки
  firstPurchaseAmount: integer('first_purchase_amount'), // Сумма первой покупки
  bonusEarned: integer('bonus_earned').default(0), // Бонус реферера
  bonusGiven: integer('bonus_given').default(0), // Бонус рефералу
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// Реферальные бонусы и выплаты
export const referralBonusTypeEnum = pgEnum('referral_bonus_type', ['registration', 'first_purchase', 'subscription', 'withdrawal']);
export const referralBonusStatusEnum = pgEnum('referral_bonus_status', ['pending', 'approved', 'paid', 'rejected']);

export const referralBonuses = pgTable('referral_bonuses', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').references(() => users.id).notNull(),
  referralId: uuid('referral_id').references(() => referrals.id),
  type: referralBonusTypeEnum('type').notNull(),
  amount: integer('amount').notNull(), // В тенге
  status: referralBonusStatusEnum('status').default('pending').notNull(),
  description: text('description'),
  processedAt: timestamp('processed_at'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// ============================================
// PAYMENTS (Платежи Kaspi/Halyk)
// ============================================

export const paymentProviderEnum = pgEnum('payment_provider', ['kaspi', 'halyk', 'stripe', 'manual']);
export const paymentStatusEnum = pgEnum('payment_status', ['pending', 'processing', 'completed', 'failed', 'refunded', 'cancelled']);
export const paymentTypeEnum = pgEnum('payment_type', ['subscription', 'premium', 'banner', 'other']);

// Платежи
export const payments = pgTable('payments', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').references(() => users.id).notNull(),
  businessId: uuid('business_id').references(() => businesses.id), // Если оплата от бизнеса
  provider: paymentProviderEnum('provider').notNull(),
  type: paymentTypeEnum('type').notNull(),
  amount: integer('amount').notNull(), // В тенге
  currency: text('currency').default('KZT').notNull(),
  status: paymentStatusEnum('status').default('pending').notNull(),
  // Данные провайдера
  externalId: text('external_id'), // ID транзакции у провайдера
  externalStatus: text('external_status'), // Статус у провайдера
  paymentUrl: text('payment_url'), // URL для оплаты (QR код, ссылка)
  qrCode: text('qr_code'), // QR код для Kaspi
  // Метаданные
  description: text('description'),
  metadata: text('metadata'), // JSON с доп. данными
  // Для подписок
  subscriptionType: text('subscription_type'), // 'user_premium', 'business_lite', 'business_premium'
  subscriptionDays: integer('subscription_days'), // Количество дней подписки
  // Timestamps
  expiresAt: timestamp('expires_at'), // Срок действия ссылки на оплату
  paidAt: timestamp('paid_at'),
  refundedAt: timestamp('refunded_at'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Webhook логи для платежей
export const paymentWebhooks = pgTable('payment_webhooks', {
  id: uuid('id').primaryKey().defaultRandom(),
  provider: paymentProviderEnum('provider').notNull(),
  paymentId: uuid('payment_id').references(() => payments.id),
  eventType: text('event_type').notNull(), // 'payment.success', 'payment.failed', etc.
  payload: text('payload').notNull(), // Raw JSON
  signature: text('signature'), // Подпись для верификации
  isProcessed: boolean('is_processed').default(false),
  processedAt: timestamp('processed_at'),
  errorMessage: text('error_message'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// ============================================
// FRAUD PROTECTION (Защита от мошенничества)
// ============================================

export const fraudEventTypeEnum = pgEnum('fraud_event_type', [
  'suspicious_login', 'multiple_accounts', 'payment_fraud',
  'referral_abuse', 'rate_limit_exceeded', 'bot_detected'
]);
export const fraudActionEnum = pgEnum('fraud_action', ['warn', 'block_temporary', 'block_permanent', 'require_verification']);

// Логи подозрительной активности
export const fraudLogs = pgTable('fraud_logs', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').references(() => users.id),
  ipAddress: text('ip_address'),
  userAgent: text('user_agent'),
  eventType: fraudEventTypeEnum('event_type').notNull(),
  riskScore: integer('risk_score').default(0), // 0-100
  details: text('details'), // JSON с деталями
  action: fraudActionEnum('action'),
  isReviewed: boolean('is_reviewed').default(false),
  reviewedBy: uuid('reviewed_by').references(() => users.id),
  reviewedAt: timestamp('reviewed_at'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// Заблокированные IP и устройства
export const blockedEntities = pgTable('blocked_entities', {
  id: uuid('id').primaryKey().defaultRandom(),
  entityType: text('entity_type').notNull(), // 'ip', 'device', 'email_domain', 'phone_prefix'
  entityValue: text('entity_value').notNull(),
  reason: text('reason'),
  blockedBy: uuid('blocked_by').references(() => users.id),
  expiresAt: timestamp('expires_at'), // null = permanent
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// Fingerprints устройств для обнаружения мульти-аккаунтов
export const deviceFingerprints = pgTable('device_fingerprints', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').references(() => users.id).notNull(),
  fingerprint: text('fingerprint').notNull(), // Hash устройства
  ipAddress: text('ip_address'),
  userAgent: text('user_agent'),
  lastSeenAt: timestamp('last_seen_at').defaultNow(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// ============================================
// PUSH NOTIFICATIONS (Push-уведомления)
// ============================================

export const pushSubscriptions = pgTable('push_subscriptions', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').references(() => users.id).notNull(),
  endpoint: text('endpoint').notNull(), // Push service endpoint
  p256dh: text('p256dh').notNull(), // Public key
  auth: text('auth').notNull(), // Auth secret
  userAgent: text('user_agent'),
  isActive: boolean('is_active').default(true),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  lastUsedAt: timestamp('last_used_at'),
});

export const notificationTypeEnum = pgEnum('notification_type', [
  'event_reminder', 'promotion_new', 'business_verified',
  'payment_success', 'subscription_expiring', 'referral_bonus',
  'event_approved', 'event_rejected', 'system'
]);

export const notifications = pgTable('notifications', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').references(() => users.id).notNull(),
  type: notificationTypeEnum('type').notNull(),
  title: text('title').notNull(),
  body: text('body').notNull(),
  icon: text('icon'),
  link: text('link'), // URL при клике
  data: text('data'), // JSON с доп. данными
  isRead: boolean('is_read').default(false),
  isPushed: boolean('is_pushed').default(false), // Отправлено через push
  readAt: timestamp('read_at'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// ============================================
// REVIEWS & RATINGS (Отзывы и рейтинги)
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
  pros: text('pros'), // Плюсы
  cons: text('cons'), // Минусы
  images: text('images'), // JSON массив URL изображений
  isVerifiedPurchase: boolean('is_verified_purchase').default(false), // Подтверждённая покупка
  isApproved: boolean('is_approved').default(false), // Модерация
  likesCount: integer('likes_count').default(0),
  dislikesCount: integer('dislikes_count').default(0),
  replyCount: integer('reply_count').default(0),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Ответы на отзывы (от бизнеса или других пользователей)
export const reviewReplies = pgTable('review_replies', {
  id: uuid('id').primaryKey().defaultRandom(),
  reviewId: uuid('review_id').references(() => reviews.id).notNull(),
  userId: uuid('user_id').references(() => users.id).notNull(),
  content: text('content').notNull(),
  isBusinessReply: boolean('is_business_reply').default(false), // Ответ от бизнеса
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// Голоса за полезность отзывов
export const reviewVotes = pgTable('review_votes', {
  id: uuid('id').primaryKey().defaultRandom(),
  reviewId: uuid('review_id').references(() => reviews.id).notNull(),
  userId: uuid('user_id').references(() => users.id).notNull(),
  isHelpful: boolean('is_helpful').notNull(), // true = like, false = dislike
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// ============================================
// ANALYTICS EVENTS (События аналитики)
// ============================================

export const analyticsEventTypeEnum = pgEnum('analytics_event_type', [
  'page_view', 'event_view', 'business_view', 'promotion_view',
  'premium_conversion', 'business_tier_upgrade', 'referral_signup',
  'first_purchase', 'subscription_started', 'subscription_cancelled'
]);

export const analyticsEvents = pgTable('analytics_events', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').references(() => users.id),
  sessionId: text('session_id'),
  eventType: analyticsEventTypeEnum('event_type').notNull(),
  eventData: text('event_data'), // JSON с данными события
  // Источник
  source: text('source'), // 'web', 'mobile', 'api'
  referrer: text('referrer'),
  utmSource: text('utm_source'),
  utmMedium: text('utm_medium'),
  utmCampaign: text('utm_campaign'),
  // Устройство
  ipAddress: text('ip_address'),
  userAgent: text('user_agent'),
  deviceType: text('device_type'), // 'desktop', 'mobile', 'tablet'
  // Геолокация
  country: text('country'),
  city: text('city'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// ============================================
// NEW RELATIONS
// ============================================

// Referral Relations
export const referralCodesRelations = relations(referralCodes, ({ one, many }) => ({
  user: one(users, { fields: [referralCodes.userId], references: [users.id] }),
  referrals: many(referrals),
}));

export const referralsRelations = relations(referrals, ({ one, many }) => ({
  referrer: one(users, { fields: [referrals.referrerId], references: [users.id] }),
  referred: one(users, { fields: [referrals.referredId], references: [users.id] }),
  referralCode: one(referralCodes, { fields: [referrals.referralCodeId], references: [referralCodes.id] }),
  bonuses: many(referralBonuses),
}));

export const referralBonusesRelations = relations(referralBonuses, ({ one }) => ({
  user: one(users, { fields: [referralBonuses.userId], references: [users.id] }),
  referral: one(referrals, { fields: [referralBonuses.referralId], references: [referrals.id] }),
}));

// Payment Relations
export const paymentsRelations = relations(payments, ({ one, many }) => ({
  user: one(users, { fields: [payments.userId], references: [users.id] }),
  business: one(businesses, { fields: [payments.businessId], references: [businesses.id] }),
  webhooks: many(paymentWebhooks),
}));

export const paymentWebhooksRelations = relations(paymentWebhooks, ({ one }) => ({
  payment: one(payments, { fields: [paymentWebhooks.paymentId], references: [payments.id] }),
}));

// Fraud Relations
export const fraudLogsRelations = relations(fraudLogs, ({ one }) => ({
  user: one(users, { fields: [fraudLogs.userId], references: [users.id] }),
  reviewer: one(users, { fields: [fraudLogs.reviewedBy], references: [users.id] }),
}));

export const deviceFingerprintsRelations = relations(deviceFingerprints, ({ one }) => ({
  user: one(users, { fields: [deviceFingerprints.userId], references: [users.id] }),
}));

// Push Notification Relations
export const pushSubscriptionsRelations = relations(pushSubscriptions, ({ one }) => ({
  user: one(users, { fields: [pushSubscriptions.userId], references: [users.id] }),
}));

export const notificationsRelations = relations(notifications, ({ one }) => ({
  user: one(users, { fields: [notifications.userId], references: [users.id] }),
}));

// Review Relations
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

// Analytics Relations
export const analyticsEventsRelations = relations(analyticsEvents, ({ one }) => ({
  user: one(users, { fields: [analyticsEvents.userId], references: [users.id] }),
}));
