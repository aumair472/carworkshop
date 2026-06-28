-- 007_seo_json_columns.sql
-- Full per-page SEO control. Adds a seo_json JSONB overlay to every editable
-- content table. Shape (all optional):
--   {
--     "meta_title": string, "meta_description": string, "canonical": string,
--     "robots": "index,follow" | "index,nofollow" | "noindex,follow" | "noindex,nofollow",
--     "og_title": string, "og_description": string, "og_image": string|null,
--     "focus_keyword": string, "sitemap_priority": number, "change_freq": string,
--     "hreflang": [{ "lang": string, "url": string }],
--     "schemas": [ { "type": "FAQPage", "auto": true }
--                | { "type": "LocalBusiness"|"HowTo"|"Service"|..., "data": {...} }
--                | { "type": "custom", "json": "{...}" } ]
--   }

ALTER TABLE brands          ADD COLUMN IF NOT EXISTS seo_json JSONB NOT NULL DEFAULT '{}'::JSONB;
ALTER TABLE services        ADD COLUMN IF NOT EXISTS seo_json JSONB NOT NULL DEFAULT '{}'::JSONB;
ALTER TABLE locations       ADD COLUMN IF NOT EXISTS seo_json JSONB NOT NULL DEFAULT '{}'::JSONB;
ALTER TABLE static_pages    ADD COLUMN IF NOT EXISTS seo_json JSONB NOT NULL DEFAULT '{}'::JSONB;
ALTER TABLE generated_pages ADD COLUMN IF NOT EXISTS seo_json JSONB NOT NULL DEFAULT '{}'::JSONB;
ALTER TABLE blog_posts      ADD COLUMN IF NOT EXISTS seo_json JSONB NOT NULL DEFAULT '{}'::JSONB;
