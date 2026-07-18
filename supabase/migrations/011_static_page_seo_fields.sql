-- Static Page SEO module: extra fields for the SMC-style admin editor.
-- seo_title / seo_description / status / slug already exist and are reused
-- as Meta Title / Meta Description / Publish Status / URL Slug.
-- Image reuses seo_json.og_image (already supported by resolveSEO/seoToMetadata).
ALTER TABLE static_pages
  ADD COLUMN IF NOT EXISTS sub_title TEXT,
  ADD COLUMN IF NOT EXISTS h3_text TEXT,
  ADD COLUMN IF NOT EXISTS short_description TEXT,
  ADD COLUMN IF NOT EXISTS meta_keyword TEXT;
