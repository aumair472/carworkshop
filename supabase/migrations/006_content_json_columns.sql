-- 006_content_json_columns.sql
-- Editable page-content overlay (content_json) for hub pages so the admin can
-- edit /brands/[slug], /services/[slug] and /locations/[slug] page content the
-- same way generated pages are edited. static_pages also gains content_json for
-- the unified editor (alongside its existing sections_json).

ALTER TABLE brands        ADD COLUMN IF NOT EXISTS content_json JSONB NOT NULL DEFAULT '{}'::JSONB;
ALTER TABLE services      ADD COLUMN IF NOT EXISTS content_json JSONB NOT NULL DEFAULT '{}'::JSONB;
ALTER TABLE locations     ADD COLUMN IF NOT EXISTS content_json JSONB NOT NULL DEFAULT '{}'::JSONB;
ALTER TABLE static_pages  ADD COLUMN IF NOT EXISTS content_json JSONB NOT NULL DEFAULT '{}'::JSONB;
