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
}));

export const businessesRelations = relations(businesses, ({ one, many }) => ({
  owner: one(users, { fields: [businesses.ownerId], references: [users.id] }),
  city: one(cities, { fields: [businesses.cityId], references: [cities.id] }),
  events: many(events),
  promotions: many(promotions),
  members: many(businessMembers),
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
