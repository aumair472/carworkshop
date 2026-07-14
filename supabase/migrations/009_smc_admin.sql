-- 009_smc_admin.sql
-- Admin rebuild (ServiceMyCar workflow): approval workflow + assignees on
-- generated_pages/blog_posts, SEO/Arabic/image columns, and new tables for
-- FAQs, language keys and search content.

-- NOTE: CREATE TYPE cannot use IF NOT EXISTS on older PG; wrap in DO block.
DO $$ BEGIN
  CREATE TYPE approval_status AS ENUM ('pending','approved','resubmission_required','rejected');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- ─── generated_pages: approval workflow + SMC fields ────────────────────────
ALTER TABLE generated_pages
  ADD COLUMN IF NOT EXISTS approval_status approval_status NOT NULL DEFAULT 'approved',
  ADD COLUMN IF NOT EXISTS assignee_id UUID REFERENCES users(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS assigned_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS created_by UUID REFERENCES users(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS country TEXT NOT NULL DEFAULT 'AE',
  ADD COLUMN IF NOT EXISTS state TEXT,
  ADD COLUMN IF NOT EXISTS template TEXT NOT NULL DEFAULT 'standard',
  ADD COLUMN IF NOT EXISTS arabic_title TEXT,
  ADD COLUMN IF NOT EXISTS meta_keyword TEXT,
  ADD COLUMN IF NOT EXISTS schema_headline TEXT,
  ADD COLUMN IF NOT EXISTS schema_description TEXT,
  ADD COLUMN IF NOT EXISTS image_png_url TEXT,
  ADD COLUMN IF NOT EXISTS image_webp_url TEXT,
  ADD COLUMN IF NOT EXISTS image_title TEXT,
  ADD COLUMN IF NOT EXISTS image_alt TEXT,
  ADD COLUMN IF NOT EXISTS short_description TEXT,
  ADD COLUMN IF NOT EXISTS arabic_short_description TEXT,
  ADD COLUMN IF NOT EXISTS arabic_complete_description TEXT,
  ADD COLUMN IF NOT EXISTS is_expensive_car BOOLEAN NOT NULL DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS display_in_footer BOOLEAN NOT NULL DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS use_dynamic_content BOOLEAN NOT NULL DEFAULT FALSE;

CREATE INDEX IF NOT EXISTS idx_generated_pages_approval ON generated_pages(approval_status);
CREATE INDEX IF NOT EXISTS idx_generated_pages_assignee ON generated_pages(assignee_id);

-- ─── blog_posts: approval workflow + Arabic/SMC fields ──────────────────────
ALTER TABLE blog_posts
  ADD COLUMN IF NOT EXISTS approval_status approval_status NOT NULL DEFAULT 'approved',
  ADD COLUMN IF NOT EXISTS assignee_id UUID REFERENCES users(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS assigned_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS country TEXT NOT NULL DEFAULT 'AE',
  ADD COLUMN IF NOT EXISTS state TEXT,
  ADD COLUMN IF NOT EXISTS arabic_title TEXT,
  ADD COLUMN IF NOT EXISTS arabic_content TEXT,
  ADD COLUMN IF NOT EXISTS arabic_excerpt TEXT,
  ADD COLUMN IF NOT EXISTS blockquote TEXT,
  ADD COLUMN IF NOT EXISTS arabic_blockquote TEXT,
  ADD COLUMN IF NOT EXISTS is_featured BOOLEAN NOT NULL DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS meta_keyword TEXT,
  ADD COLUMN IF NOT EXISTS image_png_url TEXT,
  ADD COLUMN IF NOT EXISTS image_webp_url TEXT,
  ADD COLUMN IF NOT EXISTS image_title TEXT,
  ADD COLUMN IF NOT EXISTS image_alt TEXT,
  ADD COLUMN IF NOT EXISTS tags TEXT,
  ADD COLUMN IF NOT EXISTS tags_ar TEXT;

CREATE INDEX IF NOT EXISTS idx_blog_posts_approval ON blog_posts(approval_status);

-- ─── faqs ────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS faqs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  country TEXT NOT NULL DEFAULT 'AE',
  name TEXT NOT NULL,
  arabic_name TEXT,
  description_html TEXT NOT NULL DEFAULT '',
  arabic_description_html TEXT NOT NULL DEFAULT '',
  display_order INT NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_faqs_country_order ON faqs(country, display_order);

ALTER TABLE faqs ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "public_read_faqs" ON faqs;
CREATE POLICY "public_read_faqs" ON faqs FOR SELECT USING (is_active = true);
DROP POLICY IF EXISTS "admin_all_faqs" ON faqs;
CREATE POLICY "admin_all_faqs" ON faqs
  FOR ALL USING (EXISTS (SELECT 1 FROM users WHERE users.id = auth.uid() AND users.role IN ('super_admin','admin','editor','content_writer','seo_editor')));

-- ─── language_keys ───────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS language_keys (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  key_name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  value_en TEXT NOT NULL DEFAULT '',
  value_ar TEXT NOT NULL DEFAULT '',
  comment TEXT,
  is_published BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE language_keys ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "public_read_language_keys" ON language_keys;
CREATE POLICY "public_read_language_keys" ON language_keys FOR SELECT USING (is_published = true);
DROP POLICY IF EXISTS "admin_all_language_keys" ON language_keys;
CREATE POLICY "admin_all_language_keys" ON language_keys
  FOR ALL USING (EXISTS (SELECT 1 FROM users WHERE users.id = auth.uid() AND users.role IN ('super_admin','admin','editor','seo_editor')));

-- ─── search_content ──────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS search_content (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  url TEXT NOT NULL,
  keywords TEXT[] NOT NULL DEFAULT '{}',
  description TEXT,
  display_order INT NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE search_content ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "public_read_search_content" ON search_content;
CREATE POLICY "public_read_search_content" ON search_content FOR SELECT USING (is_active = true);
DROP POLICY IF EXISTS "admin_all_search_content" ON search_content;
CREATE POLICY "admin_all_search_content" ON search_content
  FOR ALL USING (EXISTS (SELECT 1 FROM users WHERE users.id = auth.uid() AND users.role IN ('super_admin','admin','editor','seo_editor')));
