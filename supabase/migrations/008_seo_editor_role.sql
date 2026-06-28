-- 008_seo_editor_role.sql
-- Adds the 'seo_editor' role. This user may edit only seo_json across content
-- tables and read leads; cannot generate, delete, change status, or edit content.
--
-- NOTE: ALTER TYPE ... ADD VALUE cannot run inside a transaction block on some
-- Postgres versions. If your migration runner wraps statements in a transaction,
-- run this single statement on its own (e.g. Supabase SQL editor) first.

ALTER TYPE user_role ADD VALUE IF NOT EXISTS 'seo_editor';

-- Column-restricted RLS: seo_editor may UPDATE rows but only the seo_json column.
-- We enforce "only seo_json changed" by requiring every other column to equal its
-- OLD value. Implemented via a trigger because RLS WITH CHECK cannot reference OLD.

CREATE OR REPLACE FUNCTION enforce_seo_editor_seo_json_only()
RETURNS TRIGGER AS $$
DECLARE
  is_seo_editor BOOLEAN;
BEGIN
  SELECT (role = 'seo_editor') INTO is_seo_editor FROM public.users WHERE id = auth.uid();
  IF COALESCE(is_seo_editor, false) THEN
    -- Disallow any change other than seo_json + updated_at.
    IF to_jsonb(NEW) - 'seo_json' - 'updated_at' IS DISTINCT FROM to_jsonb(OLD) - 'seo_json' - 'updated_at' THEN
      RAISE EXCEPTION 'seo_editor may only update seo_json';
    END IF;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trg_seo_editor_brands ON brands;
CREATE TRIGGER trg_seo_editor_brands BEFORE UPDATE ON brands FOR EACH ROW EXECUTE FUNCTION enforce_seo_editor_seo_json_only();
DROP TRIGGER IF EXISTS trg_seo_editor_services ON services;
CREATE TRIGGER trg_seo_editor_services BEFORE UPDATE ON services FOR EACH ROW EXECUTE FUNCTION enforce_seo_editor_seo_json_only();
DROP TRIGGER IF EXISTS trg_seo_editor_locations ON locations;
CREATE TRIGGER trg_seo_editor_locations BEFORE UPDATE ON locations FOR EACH ROW EXECUTE FUNCTION enforce_seo_editor_seo_json_only();
DROP TRIGGER IF EXISTS trg_seo_editor_static_pages ON static_pages;
CREATE TRIGGER trg_seo_editor_static_pages BEFORE UPDATE ON static_pages FOR EACH ROW EXECUTE FUNCTION enforce_seo_editor_seo_json_only();
DROP TRIGGER IF EXISTS trg_seo_editor_generated_pages ON generated_pages;
CREATE TRIGGER trg_seo_editor_generated_pages BEFORE UPDATE ON generated_pages FOR EACH ROW EXECUTE FUNCTION enforce_seo_editor_seo_json_only();
DROP TRIGGER IF EXISTS trg_seo_editor_blog_posts ON blog_posts;
CREATE TRIGGER trg_seo_editor_blog_posts BEFORE UPDATE ON blog_posts FOR EACH ROW EXECUTE FUNCTION enforce_seo_editor_seo_json_only();
