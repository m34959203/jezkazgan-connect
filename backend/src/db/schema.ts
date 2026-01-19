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
