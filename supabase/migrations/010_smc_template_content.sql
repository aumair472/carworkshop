-- 010_smc_template_content.sql
-- SMC-style template fields for generated_pages (Service Page / Brand Page
-- templates). `template` continues to be free-text; app now writes
-- 'template_1' (service page) or 'template_2' (brand page) instead of the
-- old standard/repair/service values. Existing image_png_url/webp_url/
-- title/alt columns (from 009) are reused as "Image Top"; these add Icon,
-- Bottom, Large and Mobile image slots plus key points / highlight text.
-- Everything structured (service packages, warranty policy, quick links,
-- how-it-works, FAQs beyond the faqs table) lives in the existing
-- content_json JSONB overlay — no new columns needed for those.

ALTER TABLE generated_pages
  ADD COLUMN IF NOT EXISTS highlight_text TEXT,
  ADD COLUMN IF NOT EXISTS mid_category_title TEXT,
  ADD COLUMN IF NOT EXISTS key_points TEXT,
  ADD COLUMN IF NOT EXISTS icon_image_png_url TEXT,
  ADD COLUMN IF NOT EXISTS icon_image_webp_url TEXT,
  ADD COLUMN IF NOT EXISTS icon_image_title TEXT,
  ADD COLUMN IF NOT EXISTS icon_image_alt TEXT,
  ADD COLUMN IF NOT EXISTS image_bottom_png_url TEXT,
  ADD COLUMN IF NOT EXISTS image_bottom_webp_url TEXT,
  ADD COLUMN IF NOT EXISTS image_bottom_title TEXT,
  ADD COLUMN IF NOT EXISTS image_bottom_alt TEXT,
  ADD COLUMN IF NOT EXISTS image_large_url TEXT,
  ADD COLUMN IF NOT EXISTS image_mobile_url TEXT;
