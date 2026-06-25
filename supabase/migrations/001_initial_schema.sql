-- ─── Extensions ──────────────────────────────────────────────────────────────
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- ─── Enums ───────────────────────────────────────────────────────────────────
CREATE TYPE content_status AS ENUM ('draft', 'published', 'archived');
CREATE TYPE lead_status AS ENUM ('new', 'contacted', 'in_progress', 'converted', 'closed');
CREATE TYPE user_role AS ENUM ('super_admin', 'admin', 'editor', 'content_writer', 'support_staff');
CREATE TYPE audit_action AS ENUM ('create', 'update', 'delete', 'publish', 'unpublish', 'generate');
CREATE TYPE page_type AS ENUM (
  'brand', 'brand_service', 'brand_location',
  'model', 'model_service', 'model_location',
  'model_service_location', 'service', 'location'
);

-- ─── Users (extends Supabase Auth) ───────────────────────────────────────────
CREATE TABLE users (
  id          UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email       TEXT NOT NULL UNIQUE,
  full_name   TEXT NOT NULL,
  role        user_role NOT NULL DEFAULT 'content_writer',
  avatar_url  TEXT,
  is_active   BOOLEAN NOT NULL DEFAULT true,
  last_login  TIMESTAMPTZ,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─── Brands ──────────────────────────────────────────────────────────────────
CREATE TABLE brands (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name            TEXT NOT NULL,
  slug            TEXT NOT NULL UNIQUE,
  logo_url        TEXT,
  hero_image_url  TEXT,
  description     TEXT,
  common_issues   TEXT,
  seo_title       TEXT,
  seo_description TEXT,
  og_image_url    TEXT,
  status          content_status NOT NULL DEFAULT 'draft',
  sort_order      INTEGER NOT NULL DEFAULT 0,
  created_by      UUID REFERENCES users(id),
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_brands_slug ON brands(slug);
CREATE INDEX idx_brands_status ON brands(status);

-- ─── Brand Models ─────────────────────────────────────────────────────────────
CREATE TABLE brand_models (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  brand_id        UUID NOT NULL REFERENCES brands(id) ON DELETE CASCADE,
  name            TEXT NOT NULL,
  slug            TEXT NOT NULL,
  image_url       TEXT,
  description     TEXT,
  common_issues   TEXT,
  year_from       INTEGER,
  year_to         INTEGER,
  sort_order      INTEGER NOT NULL DEFAULT 0,
  status          content_status NOT NULL DEFAULT 'draft',
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(brand_id, slug)
);
CREATE INDEX idx_brand_models_brand_id ON brand_models(brand_id);
CREATE INDEX idx_brand_models_slug ON brand_models(slug);

-- ─── Services ────────────────────────────────────────────────────────────────
CREATE TABLE services (
  id               UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name             TEXT NOT NULL,
  slug             TEXT NOT NULL UNIQUE,
  short_description TEXT,
  content          TEXT,
  icon_url         TEXT,
  image_url        TEXT,
  starting_price   DECIMAL(10,2),
  includes_json    JSONB DEFAULT '[]'::JSONB,
  faq_json         JSONB DEFAULT '[]'::JSONB,
  seo_title        TEXT,
  seo_description  TEXT,
  og_image_url     TEXT,
  schema_type      TEXT DEFAULT 'Service',
  status           content_status NOT NULL DEFAULT 'draft',
  sort_order       INTEGER NOT NULL DEFAULT 0,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_services_slug ON services(slug);
CREATE INDEX idx_services_status ON services(status);

-- ─── Locations ───────────────────────────────────────────────────────────────
CREATE TABLE locations (
  id               UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name             TEXT NOT NULL,
  slug             TEXT NOT NULL UNIQUE,
  emirate          TEXT NOT NULL,
  address          TEXT,
  lat              DECIMAL(10,8),
  lng              DECIMAL(11,8),
  description      TEXT,
  maps_embed_url   TEXT,
  faq_json         JSONB DEFAULT '[]'::JSONB,
  seo_title        TEXT,
  seo_description  TEXT,
  status           content_status NOT NULL DEFAULT 'draft',
  sort_order       INTEGER NOT NULL DEFAULT 0,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_locations_slug ON locations(slug);
CREATE INDEX idx_locations_emirate ON locations(emirate);

-- ─── Relationship Maps ────────────────────────────────────────────────────────
CREATE TABLE brand_service_map (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  brand_id        UUID NOT NULL REFERENCES brands(id) ON DELETE CASCADE,
  service_id      UUID NOT NULL REFERENCES services(id) ON DELETE CASCADE,
  price_override  DECIMAL(10,2),
  is_active       BOOLEAN NOT NULL DEFAULT true,
  UNIQUE(brand_id, service_id)
);

CREATE TABLE brand_model_service_map (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  brand_model_id  UUID NOT NULL REFERENCES brand_models(id) ON DELETE CASCADE,
  service_id      UUID NOT NULL REFERENCES services(id) ON DELETE CASCADE,
  price_override  DECIMAL(10,2),
  is_active       BOOLEAN NOT NULL DEFAULT true,
  UNIQUE(brand_model_id, service_id)
);

CREATE TABLE brand_location_map (
  id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  brand_id     UUID NOT NULL REFERENCES brands(id) ON DELETE CASCADE,
  location_id  UUID NOT NULL REFERENCES locations(id) ON DELETE CASCADE,
  is_active    BOOLEAN NOT NULL DEFAULT true,
  UNIQUE(brand_id, location_id)
);

-- ─── Page Templates ───────────────────────────────────────────────────────────
CREATE TABLE page_templates (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name            TEXT NOT NULL,
  page_type       page_type NOT NULL,
  sections_json   JSONB NOT NULL,
  is_default      BOOLEAN NOT NULL DEFAULT false,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─── Generated Pages ──────────────────────────────────────────────────────────
CREATE TABLE generated_pages (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  page_type       page_type NOT NULL,
  brand_id        UUID REFERENCES brands(id) ON DELETE SET NULL,
  model_id        UUID REFERENCES brand_models(id) ON DELETE SET NULL,
  service_id      UUID REFERENCES services(id) ON DELETE SET NULL,
  location_id     UUID REFERENCES locations(id) ON DELETE SET NULL,
  slug            TEXT NOT NULL UNIQUE,
  h1              TEXT NOT NULL,
  meta_title      TEXT NOT NULL,
  meta_description TEXT NOT NULL,
  og_image_url    TEXT,
  content_json    JSONB,
  template_id     UUID REFERENCES page_templates(id),
  status          content_status NOT NULL DEFAULT 'draft',
  generated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_generated_pages_slug ON generated_pages(slug);
CREATE INDEX idx_generated_pages_brand ON generated_pages(brand_id);
CREATE INDEX idx_generated_pages_model ON generated_pages(model_id);
CREATE INDEX idx_generated_pages_service ON generated_pages(service_id);
CREATE INDEX idx_generated_pages_status ON generated_pages(status);

-- ─── Static Pages ─────────────────────────────────────────────────────────────
CREATE TABLE static_pages (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title           TEXT NOT NULL,
  slug            TEXT NOT NULL UNIQUE,
  sections_json   JSONB NOT NULL DEFAULT '[]'::JSONB,
  seo_title       TEXT,
  seo_description TEXT,
  og_image_url    TEXT,
  status          content_status NOT NULL DEFAULT 'draft',
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─── Blog ─────────────────────────────────────────────────────────────────────
CREATE TABLE blog_categories (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name        TEXT NOT NULL,
  slug        TEXT NOT NULL UNIQUE,
  description TEXT,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE blog_posts (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title           TEXT NOT NULL,
  slug            TEXT NOT NULL UNIQUE,
  excerpt         TEXT,
  content         TEXT,
  featured_image  TEXT,
  author_id       UUID REFERENCES users(id),
  category_id     UUID REFERENCES blog_categories(id),
  seo_title       TEXT,
  seo_description TEXT,
  status          content_status NOT NULL DEFAULT 'draft',
  published_at    TIMESTAMPTZ,
  scheduled_at    TIMESTAMPTZ,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_blog_posts_slug ON blog_posts(slug);
CREATE INDEX idx_blog_posts_status ON blog_posts(status);
CREATE INDEX idx_blog_posts_category ON blog_posts(category_id);

CREATE TABLE blog_tags (
  id   UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE
);

CREATE TABLE blog_post_tags (
  post_id UUID REFERENCES blog_posts(id) ON DELETE CASCADE,
  tag_id  UUID REFERENCES blog_tags(id) ON DELETE CASCADE,
  PRIMARY KEY (post_id, tag_id)
);

-- ─── Media ────────────────────────────────────────────────────────────────────
CREATE TABLE media (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  filename      TEXT NOT NULL,
  original_name TEXT NOT NULL,
  url           TEXT NOT NULL,
  alt_text      TEXT DEFAULT '',
  mime_type     TEXT NOT NULL,
  size_bytes    INTEGER NOT NULL,
  width         INTEGER,
  height        INTEGER,
  folder        TEXT NOT NULL DEFAULT 'general',
  uploaded_by   UUID REFERENCES users(id),
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_media_folder ON media(folder);

-- ─── Form Submissions (Leads) ─────────────────────────────────────────────────
CREATE TABLE form_submissions (
  id                UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name              TEXT NOT NULL,
  phone             TEXT NOT NULL,
  email             TEXT,
  service_id        UUID REFERENCES services(id) ON DELETE SET NULL,
  brand_id          UUID REFERENCES brands(id) ON DELETE SET NULL,
  model_id          UUID REFERENCES brand_models(id) ON DELETE SET NULL,
  location_id       UUID REFERENCES locations(id) ON DELETE SET NULL,
  message           TEXT,
  source_url        TEXT NOT NULL,
  source_page_slug  TEXT,
  ip_address        INET,
  user_agent        TEXT,
  status            lead_status NOT NULL DEFAULT 'new',
  notes             TEXT,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_leads_status ON form_submissions(status);
CREATE INDEX idx_leads_created_at ON form_submissions(created_at DESC);

-- ─── Website Settings ─────────────────────────────────────────────────────────
CREATE TABLE website_settings (
  key         TEXT PRIMARY KEY,
  value       JSONB NOT NULL,
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_by  UUID REFERENCES users(id)
);

-- ─── Audit Logs ───────────────────────────────────────────────────────────────
CREATE TABLE audit_logs (
  id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id      UUID REFERENCES users(id) ON DELETE SET NULL,
  action       audit_action NOT NULL,
  table_name   TEXT NOT NULL,
  record_id    TEXT NOT NULL,
  changes_json JSONB,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_audit_logs_user ON audit_logs(user_id);
CREATE INDEX idx_audit_logs_table ON audit_logs(table_name, record_id);
