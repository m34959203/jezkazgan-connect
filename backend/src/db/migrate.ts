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

    console.log('[Migration] All migrations completed successfully!');
  } catch (error) {
    console.error('[Migration] Error running migrations:', error);
    // Don't throw - let the server start anyway
  }
}
