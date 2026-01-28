import { neon } from '@neondatabase/serverless';

/**
 * Run database migrations programmatically
 * Creates missing tables if they don't exist
 */
export async function runMigrations() {
  if (!process.env.DATABASE_URL) {
    console.log('[Migration] DATABASE_URL not set, skipping migrations');
    return;
  }

  console.log('[Migration] Running database migrations...');
  const sql = neon(process.env.DATABASE_URL);

  try {
    // Create ai_image_generations table if not exists
    await sql`
      CREATE TABLE IF NOT EXISTS ai_image_generations (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        business_id UUID NOT NULL REFERENCES businesses(id),
        user_id UUID NOT NULL REFERENCES users(id),
        prompt TEXT NOT NULL,
        style TEXT,
        generated_image_url TEXT,
        status TEXT NOT NULL DEFAULT 'pending',
        error_message TEXT,
        used_for TEXT,
        used_for_id UUID,
        credits_used INTEGER DEFAULT 1,
        created_at TIMESTAMP NOT NULL DEFAULT NOW()
      )
    `;
    console.log('[Migration] ✓ ai_image_generations table ready');

    // Create city_photos table if not exists
    await sql`
      CREATE TABLE IF NOT EXISTS city_photos (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        city_id UUID NOT NULL REFERENCES cities(id),
        title TEXT NOT NULL,
        image_url TEXT NOT NULL,
        position INTEGER DEFAULT 0,
        is_active BOOLEAN DEFAULT true,
        created_at TIMESTAMP NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMP NOT NULL DEFAULT NOW()
      )
    `;
    console.log('[Migration] ✓ city_photos table ready');

    // Create city_banners table if not exists
    await sql`
      CREATE TABLE IF NOT EXISTS city_banners (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        city_id UUID NOT NULL REFERENCES cities(id),
        business_id UUID REFERENCES businesses(id),
        title TEXT NOT NULL,
        description TEXT,
        image_url TEXT NOT NULL,
        link TEXT,
        link_type TEXT DEFAULT 'external',
        position INTEGER DEFAULT 0,
        is_active BOOLEAN DEFAULT true,
        start_date TIMESTAMP,
        end_date TIMESTAMP,
        views_count INTEGER DEFAULT 0,
        clicks_count INTEGER DEFAULT 0,
        created_at TIMESTAMP NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMP NOT NULL DEFAULT NOW()
      )
    `;
    console.log('[Migration] ✓ city_banners table ready');

    // Create auto_publish_settings table if not exists
    await sql`
      DO $$ BEGIN
        CREATE TYPE social_platform AS ENUM ('telegram', 'instagram', 'vk', 'facebook');
      EXCEPTION
        WHEN duplicate_object THEN NULL;
      END $$;
    `;

    await sql`
      CREATE TABLE IF NOT EXISTS auto_publish_settings (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        business_id UUID NOT NULL REFERENCES businesses(id),
        platform social_platform NOT NULL,
        is_enabled BOOLEAN DEFAULT false,
        telegram_bot_token TEXT,
        telegram_channel_id TEXT,
        instagram_access_token TEXT,
        instagram_business_account_id TEXT,
        vk_access_token TEXT,
        vk_group_id TEXT,
        facebook_access_token TEXT,
        facebook_page_id TEXT,
        publish_events BOOLEAN DEFAULT true,
        publish_promotions BOOLEAN DEFAULT true,
        auto_publish_on_create BOOLEAN DEFAULT false,
        created_at TIMESTAMP NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMP NOT NULL DEFAULT NOW()
      )
    `;
    console.log('[Migration] ✓ auto_publish_settings table ready');

    // Create auto_publish_history table if not exists
    await sql`
      DO $$ BEGIN
        CREATE TYPE auto_publish_status AS ENUM ('pending', 'published', 'failed');
      EXCEPTION
        WHEN duplicate_object THEN NULL;
      END $$;
    `;

    await sql`
      CREATE TABLE IF NOT EXISTS auto_publish_history (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        business_id UUID NOT NULL REFERENCES businesses(id),
        platform social_platform NOT NULL,
        content_type TEXT NOT NULL,
        content_id UUID NOT NULL,
        status auto_publish_status NOT NULL DEFAULT 'pending',
        external_post_id TEXT,
        external_post_url TEXT,
        error_message TEXT,
        retry_count INTEGER DEFAULT 0,
        published_at TIMESTAMP,
        created_at TIMESTAMP NOT NULL DEFAULT NOW()
      )
    `;
    console.log('[Migration] ✓ auto_publish_history table ready');

    // ============================================
    // CASHBACK SYSTEM TABLES
    // ============================================

    // Create cashback enums
    await sql`
      DO $$ BEGIN
        CREATE TYPE cashback_transaction_type AS ENUM ('earn', 'spend', 'refund', 'bonus', 'referral', 'premium_bonus', 'expired');
      EXCEPTION
        WHEN duplicate_object THEN NULL;
      END $$;
    `;

    await sql`
      DO $$ BEGIN
        CREATE TYPE cashback_transaction_status AS ENUM ('pending', 'completed', 'cancelled', 'expired');
      EXCEPTION
        WHEN duplicate_object THEN NULL;
      END $$;
    `;

    await sql`
      DO $$ BEGIN
        CREATE TYPE cashback_payment_status AS ENUM ('pending', 'confirmed', 'rejected', 'refunded');
      EXCEPTION
        WHEN duplicate_object THEN NULL;
      END $$;
    `;

    await sql`
      DO $$ BEGIN
        CREATE TYPE cashback_payment_method AS ENUM ('cash', 'card', 'qr', 'cashback_only', 'mixed');
      EXCEPTION
        WHEN duplicate_object THEN NULL;
      END $$;
    `;

    await sql`
      DO $$ BEGIN
        CREATE TYPE cashback_rule_type AS ENUM ('percentage', 'fixed');
      EXCEPTION
        WHEN duplicate_object THEN NULL;
      END $$;
    `;

    // Create cashback_wallets table
    await sql`
      CREATE TABLE IF NOT EXISTS cashback_wallets (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID NOT NULL UNIQUE REFERENCES users(id),
        balance NUMERIC(12, 2) NOT NULL DEFAULT 0,
        total_earned NUMERIC(12, 2) NOT NULL DEFAULT 0,
        total_spent NUMERIC(12, 2) NOT NULL DEFAULT 0,
        total_expired NUMERIC(12, 2) NOT NULL DEFAULT 0,
        created_at TIMESTAMP NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMP NOT NULL DEFAULT NOW()
      )
    `;
    console.log('[Migration] ✓ cashback_wallets table ready');

    // Create cashback_rules table
    await sql`
      CREATE TABLE IF NOT EXISTS cashback_rules (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        business_id UUID REFERENCES businesses(id),
        name TEXT NOT NULL,
        description TEXT,
        type cashback_rule_type NOT NULL,
        value NUMERIC(5, 2) NOT NULL,
        min_purchase NUMERIC(12, 2) DEFAULT 0,
        max_cashback NUMERIC(12, 2),
        category TEXT,
        is_premium_only BOOLEAN NOT NULL DEFAULT true,
        is_active BOOLEAN NOT NULL DEFAULT true,
        priority INTEGER DEFAULT 0,
        valid_from TIMESTAMP NOT NULL DEFAULT NOW(),
        valid_until TIMESTAMP,
        usage_count INTEGER DEFAULT 0,
        total_cashback_given NUMERIC(12, 2) DEFAULT 0,
        created_at TIMESTAMP NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMP NOT NULL DEFAULT NOW()
      )
    `;
    console.log('[Migration] ✓ cashback_rules table ready');

    // Create cashback_transactions table
    await sql`
      CREATE TABLE IF NOT EXISTS cashback_transactions (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        wallet_id UUID NOT NULL REFERENCES cashback_wallets(id),
        type cashback_transaction_type NOT NULL,
        amount NUMERIC(12, 2) NOT NULL,
        balance_before NUMERIC(12, 2) NOT NULL,
        balance_after NUMERIC(12, 2) NOT NULL,
        description TEXT,
        status cashback_transaction_status NOT NULL DEFAULT 'completed',
        related_business_id UUID REFERENCES businesses(id),
        related_event_id UUID REFERENCES events(id),
        related_promotion_id UUID REFERENCES promotions(id),
        related_payment_id UUID,
        related_referral_id UUID,
        expires_at TIMESTAMP,
        expired_at TIMESTAMP,
        created_at TIMESTAMP NOT NULL DEFAULT NOW()
      )
    `;
    console.log('[Migration] ✓ cashback_transactions table ready');

    // Create cashback_partner_payments table
    await sql`
      CREATE TABLE IF NOT EXISTS cashback_partner_payments (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID NOT NULL REFERENCES users(id),
        business_id UUID NOT NULL REFERENCES businesses(id),
        total_amount NUMERIC(12, 2) NOT NULL,
        cashback_used NUMERIC(12, 2) NOT NULL DEFAULT 0,
        cashback_earned NUMERIC(12, 2) NOT NULL DEFAULT 0,
        amount_paid NUMERIC(12, 2) NOT NULL,
        payment_method cashback_payment_method NOT NULL DEFAULT 'mixed',
        status cashback_payment_status NOT NULL DEFAULT 'pending',
        confirmation_code TEXT NOT NULL UNIQUE,
        confirmed_at TIMESTAMP,
        confirmed_by UUID REFERENCES users(id),
        rejection_reason TEXT,
        applied_rule_id UUID REFERENCES cashback_rules(id),
        related_event_id UUID REFERENCES events(id),
        related_promotion_id UUID REFERENCES promotions(id),
        notes TEXT,
        created_at TIMESTAMP NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMP NOT NULL DEFAULT NOW()
      )
    `;
    console.log('[Migration] ✓ cashback_partner_payments table ready');

    // ============================================
    // REFERRAL SYSTEM TABLES
    // ============================================

    // Create referral enums
    await sql`
      DO $$ BEGIN
        CREATE TYPE referral_status AS ENUM ('pending', 'registered', 'activated', 'premium_converted');
      EXCEPTION
        WHEN duplicate_object THEN NULL;
      END $$;
    `;

    await sql`
      DO $$ BEGIN
        CREATE TYPE referral_reward_type AS ENUM ('registration', 'premium_conversion', 'first_purchase');
      EXCEPTION
        WHEN duplicate_object THEN NULL;
      END $$;
    `;

    // Create referral_codes table
    await sql`
      CREATE TABLE IF NOT EXISTS referral_codes (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID NOT NULL REFERENCES users(id),
        code TEXT NOT NULL UNIQUE,
        is_active BOOLEAN NOT NULL DEFAULT true,
        usage_count INTEGER NOT NULL DEFAULT 0,
        max_usages INTEGER,
        total_rewards_earned NUMERIC(12, 2) DEFAULT 0,
        premium_conversions INTEGER DEFAULT 0,
        created_at TIMESTAMP NOT NULL DEFAULT NOW(),
        expires_at TIMESTAMP
      )
    `;
    console.log('[Migration] ✓ referral_codes table ready');

    // Create referrals table
    await sql`
      CREATE TABLE IF NOT EXISTS referrals (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        referrer_id UUID NOT NULL REFERENCES users(id),
        referred_id UUID NOT NULL REFERENCES users(id),
        code_id UUID NOT NULL REFERENCES referral_codes(id),
        status referral_status NOT NULL DEFAULT 'pending',
        referrer_reward NUMERIC(12, 2) DEFAULT 0,
        referred_reward NUMERIC(12, 2) DEFAULT 0,
        referrer_reward_paid BOOLEAN DEFAULT false,
        referred_reward_paid BOOLEAN DEFAULT false,
        registered_at TIMESTAMP,
        activated_at TIMESTAMP,
        converted_at TIMESTAMP,
        created_at TIMESTAMP NOT NULL DEFAULT NOW()
      )
    `;
    console.log('[Migration] ✓ referrals table ready');

    // Create referral_rewards_config table
    await sql`
      CREATE TABLE IF NOT EXISTS referral_rewards_config (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        reward_type referral_reward_type NOT NULL UNIQUE,
        referrer_amount NUMERIC(12, 2) NOT NULL,
        referred_amount NUMERIC(12, 2) NOT NULL,
        description TEXT,
        is_active BOOLEAN NOT NULL DEFAULT true,
        valid_from TIMESTAMP NOT NULL DEFAULT NOW(),
        valid_until TIMESTAMP,
        created_at TIMESTAMP NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMP NOT NULL DEFAULT NOW()
      )
    `;
    console.log('[Migration] ✓ referral_rewards_config table ready');

    // Create indexes for cashback and referral tables
    await sql`
      CREATE INDEX IF NOT EXISTS cashback_wallets_user_id_idx ON cashback_wallets(user_id);
      CREATE INDEX IF NOT EXISTS cashback_transactions_wallet_id_idx ON cashback_transactions(wallet_id);
      CREATE INDEX IF NOT EXISTS cashback_transactions_type_idx ON cashback_transactions(type);
      CREATE INDEX IF NOT EXISTS cashback_rules_business_id_idx ON cashback_rules(business_id);
      CREATE INDEX IF NOT EXISTS cashback_rules_is_active_idx ON cashback_rules(is_active);
      CREATE INDEX IF NOT EXISTS cashback_partner_payments_user_id_idx ON cashback_partner_payments(user_id);
      CREATE INDEX IF NOT EXISTS cashback_partner_payments_business_id_idx ON cashback_partner_payments(business_id);
      CREATE INDEX IF NOT EXISTS cashback_partner_payments_status_idx ON cashback_partner_payments(status);
      CREATE INDEX IF NOT EXISTS cashback_partner_payments_confirmation_code_idx ON cashback_partner_payments(confirmation_code);
      CREATE INDEX IF NOT EXISTS referral_codes_user_id_idx ON referral_codes(user_id);
      CREATE INDEX IF NOT EXISTS referral_codes_code_idx ON referral_codes(code);
      CREATE INDEX IF NOT EXISTS referrals_referrer_id_idx ON referrals(referrer_id);
      CREATE INDEX IF NOT EXISTS referrals_referred_id_idx ON referrals(referred_id);
    `;
    console.log('[Migration] ✓ Indexes created for cashback and referral tables');

    // Insert default referral rewards config
    await sql`
      INSERT INTO referral_rewards_config (reward_type, referrer_amount, referred_amount, description, is_active)
      VALUES
        ('registration', 500, 300, 'Бонус за регистрацию по реферальному коду', true),
        ('premium_conversion', 1000, 500, 'Бонус когда приглашённый становится Premium', true),
        ('first_purchase', 200, 100, 'Бонус за первую покупку приглашённого', false)
      ON CONFLICT (reward_type) DO NOTHING
    `;
    console.log('[Migration] ✓ Default referral rewards config inserted');

    // Insert default cashback rule
    await sql`
      INSERT INTO cashback_rules (name, description, type, value, min_purchase, is_premium_only, is_active, priority)
      VALUES ('Стандартный кешбек', 'Базовый кешбек для всех Premium пользователей', 'percentage', 5, 500, true, true, 0)
      ON CONFLICT DO NOTHING
    `;
    console.log('[Migration] ✓ Default cashback rule inserted');

    // ============================================
    // ADD MISSING COLUMNS TO EXISTING TABLES
    // ============================================

    // Add missing columns to referral_codes table
    await sql`
      DO $$ BEGIN
        ALTER TABLE referral_codes ADD COLUMN IF NOT EXISTS total_earnings NUMERIC(12, 2) DEFAULT 0;
      EXCEPTION
        WHEN duplicate_column THEN NULL;
      END $$;
    `;

    // Add missing columns to referrals table
    await sql`
      DO $$ BEGIN
        ALTER TABLE referrals ADD COLUMN IF NOT EXISTS referral_code_id UUID REFERENCES referral_codes(id);
        ALTER TABLE referrals ADD COLUMN IF NOT EXISTS first_purchase_at TIMESTAMP;
        ALTER TABLE referrals ADD COLUMN IF NOT EXISTS first_purchase_amount INTEGER;
        ALTER TABLE referrals ADD COLUMN IF NOT EXISTS bonus_earned NUMERIC(12, 2) DEFAULT 0;
        ALTER TABLE referrals ADD COLUMN IF NOT EXISTS bonus_given NUMERIC(12, 2) DEFAULT 0;
      EXCEPTION
        WHEN duplicate_column THEN NULL;
      END $$;
    `;
    console.log('[Migration] ✓ Added missing columns to referral tables');

    // ============================================
    // REFERRAL BONUSES TABLE
    // ============================================

    await sql`
      DO $$ BEGIN
        CREATE TYPE referral_bonus_type AS ENUM ('first_purchase', 'registration', 'withdrawal');
      EXCEPTION
        WHEN duplicate_object THEN NULL;
      END $$;
    `;

    await sql`
      DO $$ BEGIN
        CREATE TYPE referral_bonus_status AS ENUM ('pending', 'approved', 'paid', 'rejected');
      EXCEPTION
        WHEN duplicate_object THEN NULL;
      END $$;
    `;

    await sql`
      CREATE TABLE IF NOT EXISTS referral_bonuses (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID NOT NULL REFERENCES users(id),
        referral_id UUID REFERENCES referrals(id),
        type referral_bonus_type NOT NULL,
        amount NUMERIC(12, 2) NOT NULL,
        status referral_bonus_status NOT NULL DEFAULT 'pending',
        description TEXT,
        created_at TIMESTAMP NOT NULL DEFAULT NOW()
      )
    `;
    console.log('[Migration] ✓ referral_bonuses table ready');

    // ============================================
    // ANALYTICS EVENTS TABLE
    // ============================================

    await sql`
      CREATE TABLE IF NOT EXISTS analytics_events (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID REFERENCES users(id),
        session_id TEXT,
        event_type TEXT NOT NULL,
        event_data TEXT,
        source TEXT DEFAULT 'web',
        referrer TEXT,
        utm_source TEXT,
        utm_medium TEXT,
        utm_campaign TEXT,
        ip_address TEXT,
        user_agent TEXT,
        device_type TEXT,
        created_at TIMESTAMP NOT NULL DEFAULT NOW()
      )
    `;
    console.log('[Migration] ✓ analytics_events table ready');

    // ============================================
    // PAYMENTS SYSTEM TABLES
    // ============================================

    await sql`
      DO $$ BEGIN
        CREATE TYPE payment_provider AS ENUM ('kaspi', 'halyk');
      EXCEPTION
        WHEN duplicate_object THEN NULL;
      END $$;
    `;

    await sql`
      DO $$ BEGIN
        CREATE TYPE payment_type AS ENUM ('subscription', 'premium', 'banner', 'other');
      EXCEPTION
        WHEN duplicate_object THEN NULL;
      END $$;
    `;

    await sql`
      DO $$ BEGIN
        CREATE TYPE payment_status AS ENUM ('pending', 'completed', 'failed', 'refunded', 'cancelled');
      EXCEPTION
        WHEN duplicate_object THEN NULL;
      END $$;
    `;

    await sql`
      DO $$ BEGIN
        CREATE TYPE subscription_type AS ENUM ('user_premium', 'business_lite', 'business_premium');
      EXCEPTION
        WHEN duplicate_object THEN NULL;
      END $$;
    `;

    await sql`
      CREATE TABLE IF NOT EXISTS payments (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID NOT NULL REFERENCES users(id),
        business_id UUID REFERENCES businesses(id),
        provider payment_provider NOT NULL,
        type payment_type NOT NULL,
        amount INTEGER NOT NULL,
        status payment_status NOT NULL DEFAULT 'pending',
        description TEXT,
        subscription_type subscription_type,
        subscription_days INTEGER,
        payment_url TEXT,
        qr_code TEXT,
        external_id TEXT,
        external_status TEXT,
        paid_at TIMESTAMP,
        expires_at TIMESTAMP,
        created_at TIMESTAMP NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMP NOT NULL DEFAULT NOW()
      )
    `;
    console.log('[Migration] ✓ payments table ready');

    await sql`
      CREATE TABLE IF NOT EXISTS payment_webhooks (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        provider payment_provider NOT NULL,
        event_type TEXT NOT NULL,
        payload TEXT NOT NULL,
        signature TEXT,
        is_processed BOOLEAN DEFAULT false,
        processed_at TIMESTAMP,
        created_at TIMESTAMP NOT NULL DEFAULT NOW()
      )
    `;
    console.log('[Migration] ✓ payment_webhooks table ready');

    // ============================================
    // PUSH NOTIFICATIONS TABLES
    // ============================================

    await sql`
      CREATE TABLE IF NOT EXISTS push_subscriptions (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID NOT NULL REFERENCES users(id),
        endpoint TEXT NOT NULL,
        p256dh TEXT NOT NULL,
        auth TEXT NOT NULL,
        user_agent TEXT,
        is_active BOOLEAN DEFAULT true,
        last_used_at TIMESTAMP,
        created_at TIMESTAMP NOT NULL DEFAULT NOW()
      )
    `;
    console.log('[Migration] ✓ push_subscriptions table ready');

    await sql`
      DO $$ BEGIN
        CREATE TYPE notification_type AS ENUM (
          'event_reminder', 'promotion_new', 'business_verified', 'payment_success',
          'subscription_expiring', 'referral_bonus', 'event_approved', 'event_rejected', 'system'
        );
      EXCEPTION
        WHEN duplicate_object THEN NULL;
      END $$;
    `;

    await sql`
      CREATE TABLE IF NOT EXISTS notifications (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID NOT NULL REFERENCES users(id),
        type notification_type NOT NULL,
        title TEXT NOT NULL,
        body TEXT NOT NULL,
        icon TEXT,
        link TEXT,
        data TEXT,
        is_read BOOLEAN DEFAULT false,
        read_at TIMESTAMP,
        is_pushed BOOLEAN DEFAULT false,
        created_at TIMESTAMP NOT NULL DEFAULT NOW()
      )
    `;
    console.log('[Migration] ✓ notifications table ready');

    // ============================================
    // REVIEWS SYSTEM TABLES
    // ============================================

    await sql`
      DO $$ BEGIN
        CREATE TYPE review_target_type AS ENUM ('business', 'event');
      EXCEPTION
        WHEN duplicate_object THEN NULL;
      END $$;
    `;

    await sql`
      CREATE TABLE IF NOT EXISTS reviews (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID NOT NULL REFERENCES users(id),
        target_type review_target_type NOT NULL,
        business_id UUID REFERENCES businesses(id),
        event_id UUID REFERENCES events(id),
        rating INTEGER NOT NULL,
        title TEXT,
        content TEXT,
        pros TEXT,
        cons TEXT,
        images TEXT,
        likes_count INTEGER DEFAULT 0,
        dislikes_count INTEGER DEFAULT 0,
        reply_count INTEGER DEFAULT 0,
        is_approved BOOLEAN DEFAULT false,
        created_at TIMESTAMP NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMP NOT NULL DEFAULT NOW()
      )
    `;
    console.log('[Migration] ✓ reviews table ready');

    await sql`
      CREATE TABLE IF NOT EXISTS review_replies (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        review_id UUID NOT NULL REFERENCES reviews(id),
        user_id UUID NOT NULL REFERENCES users(id),
        content TEXT NOT NULL,
        is_business_reply BOOLEAN DEFAULT false,
        created_at TIMESTAMP NOT NULL DEFAULT NOW()
      )
    `;
    console.log('[Migration] ✓ review_replies table ready');

    await sql`
      CREATE TABLE IF NOT EXISTS review_votes (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        review_id UUID NOT NULL REFERENCES reviews(id),
        user_id UUID NOT NULL REFERENCES users(id),
        is_helpful BOOLEAN NOT NULL,
        created_at TIMESTAMP NOT NULL DEFAULT NOW()
      )
    `;
    console.log('[Migration] ✓ review_votes table ready');

    // Create indexes for new tables
    await sql`
      CREATE INDEX IF NOT EXISTS referral_bonuses_user_id_idx ON referral_bonuses(user_id);
      CREATE INDEX IF NOT EXISTS analytics_events_user_id_idx ON analytics_events(user_id);
      CREATE INDEX IF NOT EXISTS analytics_events_event_type_idx ON analytics_events(event_type);
      CREATE INDEX IF NOT EXISTS analytics_events_created_at_idx ON analytics_events(created_at);
      CREATE INDEX IF NOT EXISTS payments_user_id_idx ON payments(user_id);
      CREATE INDEX IF NOT EXISTS payments_status_idx ON payments(status);
      CREATE INDEX IF NOT EXISTS push_subscriptions_user_id_idx ON push_subscriptions(user_id);
      CREATE INDEX IF NOT EXISTS notifications_user_id_idx ON notifications(user_id);
      CREATE INDEX IF NOT EXISTS notifications_is_read_idx ON notifications(is_read);
      CREATE INDEX IF NOT EXISTS reviews_user_id_idx ON reviews(user_id);
      CREATE INDEX IF NOT EXISTS reviews_business_id_idx ON reviews(business_id);
      CREATE INDEX IF NOT EXISTS reviews_event_id_idx ON reviews(event_id);
      CREATE INDEX IF NOT EXISTS review_replies_review_id_idx ON review_replies(review_id);
      CREATE INDEX IF NOT EXISTS review_votes_review_id_idx ON review_votes(review_id);
    `;
    console.log('[Migration] ✓ Indexes created for new tables');

    // ============================================
    // COMPLAINTS SYSTEM TABLE
    // ============================================

    await sql`
      DO $$ BEGIN
        CREATE TYPE complaint_target_type AS ENUM ('business', 'event', 'promotion', 'review', 'user');
      EXCEPTION
        WHEN duplicate_object THEN NULL;
      END $$;
    `;

    await sql`
      DO $$ BEGIN
        CREATE TYPE complaint_status AS ENUM ('pending', 'reviewing', 'resolved', 'rejected');
      EXCEPTION
        WHEN duplicate_object THEN NULL;
      END $$;
    `;

    await sql`
      DO $$ BEGIN
        CREATE TYPE complaint_reason AS ENUM ('spam', 'fraud', 'inappropriate', 'outdated', 'copyright', 'fake', 'offensive', 'other');
      EXCEPTION
        WHEN duplicate_object THEN NULL;
      END $$;
    `;

    await sql`
      CREATE TABLE IF NOT EXISTS complaints (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        reporter_id UUID NOT NULL REFERENCES users(id),
        target_type complaint_target_type NOT NULL,
        target_id UUID NOT NULL,
        reason complaint_reason NOT NULL,
        description TEXT,
        status complaint_status NOT NULL DEFAULT 'pending',
        resolution TEXT,
        resolved_by_id UUID REFERENCES users(id),
        resolved_at TIMESTAMP,
        created_at TIMESTAMP NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMP NOT NULL DEFAULT NOW()
      )
    `;
    console.log('[Migration] ✓ complaints table ready');

    await sql`
      CREATE INDEX IF NOT EXISTS complaints_reporter_id_idx ON complaints(reporter_id);
      CREATE INDEX IF NOT EXISTS complaints_target_type_idx ON complaints(target_type);
      CREATE INDEX IF NOT EXISTS complaints_status_idx ON complaints(status);
      CREATE INDEX IF NOT EXISTS complaints_created_at_idx ON complaints(created_at);
    `;
    console.log('[Migration] ✓ Indexes created for complaints table');

    console.log('[Migration] All migrations completed successfully!');
  } catch (error) {
    console.error('[Migration] Error running migrations:', error);
    // Don't throw - let the server start anyway
  }
}
