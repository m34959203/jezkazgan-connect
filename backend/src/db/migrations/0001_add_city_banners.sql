-- Add city_banners table for advertising banners on city pages
CREATE TABLE IF NOT EXISTS "city_banners" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "city_id" uuid NOT NULL REFERENCES "cities"("id"),
  "business_id" uuid REFERENCES "businesses"("id"),
  "title" text NOT NULL,
  "description" text,
  "image_url" text NOT NULL,
  "link" text,
  "link_type" text DEFAULT 'external',
  "position" integer DEFAULT 0,
  "is_active" boolean DEFAULT true,
  "start_date" timestamp,
  "end_date" timestamp,
  "views_count" integer DEFAULT 0,
  "clicks_count" integer DEFAULT 0,
  "created_at" timestamp DEFAULT now() NOT NULL,
  "updated_at" timestamp DEFAULT now() NOT NULL
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS "city_banners_city_id_idx" ON "city_banners"("city_id");
CREATE INDEX IF NOT EXISTS "city_banners_business_id_idx" ON "city_banners"("business_id");
CREATE INDEX IF NOT EXISTS "city_banners_is_active_idx" ON "city_banners"("is_active");
