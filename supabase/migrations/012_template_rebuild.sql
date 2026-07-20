-- 012_template_rebuild.sql
-- Clean-slate rebuild of generated_pages around 5 explicit templates
-- (brand, brand_service, brand_model, brand_model_service, general_service).
-- Old SMC "template" free-text field, image slots, highlight/mid-category/
-- key-points fields, and the old page_type enum values are dropped in favor
-- of a single template_type enum. Existing rows are cleared (clean slate).

DO $$ BEGIN
  CREATE TYPE template_type AS ENUM ('brand', 'brand_service', 'brand_model', 'brand_model_service', 'general_service');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

TRUNCATE TABLE generated_pages;

ALTER TABLE generated_pages
  ADD COLUMN IF NOT EXISTS template_type template_type;

-- Backfill can't map cleanly from the old free-text `template` column, and
-- the table was just truncated, so default new rows going forward only.
UPDATE generated_pages SET template_type = 'general_service' WHERE template_type IS NULL;
ALTER TABLE generated_pages ALTER COLUMN template_type SET NOT NULL;

ALTER TABLE generated_pages
  DROP COLUMN IF EXISTS page_type,
  DROP COLUMN IF EXISTS service_id,
  DROP COLUMN IF EXISTS location_id,
  DROP COLUMN IF EXISTS template_id,
  DROP COLUMN IF EXISTS og_image_url,
  DROP COLUMN IF EXISTS template,
  DROP COLUMN IF EXISTS schema_headline,
  DROP COLUMN IF EXISTS schema_description,
  DROP COLUMN IF EXISTS image_png_url,
  DROP COLUMN IF EXISTS image_webp_url,
  DROP COLUMN IF EXISTS image_title,
  DROP COLUMN IF EXISTS image_alt,
  DROP COLUMN IF EXISTS is_expensive_car,
  DROP COLUMN IF EXISTS highlight_text,
  DROP COLUMN IF EXISTS mid_category_title,
  DROP COLUMN IF EXISTS key_points,
  DROP COLUMN IF EXISTS icon_image_png_url,
  DROP COLUMN IF EXISTS icon_image_webp_url,
  DROP COLUMN IF EXISTS icon_image_title,
  DROP COLUMN IF EXISTS icon_image_alt,
  DROP COLUMN IF EXISTS image_bottom_png_url,
  DROP COLUMN IF EXISTS image_bottom_webp_url,
  DROP COLUMN IF EXISTS image_bottom_title,
  DROP COLUMN IF EXISTS image_bottom_alt,
  DROP COLUMN IF EXISTS image_large_url,
  DROP COLUMN IF EXISTS image_mobile_url,
  DROP COLUMN IF EXISTS use_dynamic_content;

CREATE INDEX IF NOT EXISTS idx_generated_pages_template_type ON generated_pages(template_type);
CREATE INDEX IF NOT EXISTS idx_generated_pages_brand_state ON generated_pages(brand_id, state);
CREATE INDEX IF NOT EXISTS idx_generated_pages_model_state ON generated_pages(model_id, state);
