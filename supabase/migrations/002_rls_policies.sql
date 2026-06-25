-- ─── Row Level Security Policies ─────────────────────────────────────────────

-- brands
ALTER TABLE brands ENABLE ROW LEVEL SECURITY;
CREATE POLICY "public_read_brands" ON brands
  FOR SELECT USING (status = 'published');
CREATE POLICY "admin_all_brands" ON brands
  FOR ALL USING (
    EXISTS (SELECT 1 FROM users WHERE users.id = auth.uid() AND users.role IN ('super_admin', 'admin', 'editor'))
  );

-- brand_models
ALTER TABLE brand_models ENABLE ROW LEVEL SECURITY;
CREATE POLICY "public_read_models" ON brand_models
  FOR SELECT USING (status = 'published');
CREATE POLICY "admin_all_models" ON brand_models
  FOR ALL USING (
    EXISTS (SELECT 1 FROM users WHERE users.id = auth.uid() AND users.role IN ('super_admin', 'admin', 'editor'))
  );

-- services
ALTER TABLE services ENABLE ROW LEVEL SECURITY;
CREATE POLICY "public_read_services" ON services
  FOR SELECT USING (status = 'published');
CREATE POLICY "admin_all_services" ON services
  FOR ALL USING (
    EXISTS (SELECT 1 FROM users WHERE users.id = auth.uid() AND users.role IN ('super_admin', 'admin', 'editor'))
  );

-- locations
ALTER TABLE locations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "public_read_locations" ON locations
  FOR SELECT USING (status = 'published');
CREATE POLICY "admin_all_locations" ON locations
  FOR ALL USING (
    EXISTS (SELECT 1 FROM users WHERE users.id = auth.uid() AND users.role IN ('super_admin', 'admin', 'editor'))
  );

-- brand_service_map
ALTER TABLE brand_service_map ENABLE ROW LEVEL SECURITY;
CREATE POLICY "public_read_brand_service_map" ON brand_service_map FOR SELECT USING (is_active = true);
CREATE POLICY "admin_all_brand_service_map" ON brand_service_map
  FOR ALL USING (EXISTS (SELECT 1 FROM users WHERE users.id = auth.uid() AND users.role IN ('super_admin', 'admin', 'editor')));

-- brand_model_service_map
ALTER TABLE brand_model_service_map ENABLE ROW LEVEL SECURITY;
CREATE POLICY "public_read_brand_model_service_map" ON brand_model_service_map FOR SELECT USING (is_active = true);
CREATE POLICY "admin_all_brand_model_service_map" ON brand_model_service_map
  FOR ALL USING (EXISTS (SELECT 1 FROM users WHERE users.id = auth.uid() AND users.role IN ('super_admin', 'admin', 'editor')));

-- brand_location_map
ALTER TABLE brand_location_map ENABLE ROW LEVEL SECURITY;
CREATE POLICY "public_read_brand_location_map" ON brand_location_map FOR SELECT USING (is_active = true);
CREATE POLICY "admin_all_brand_location_map" ON brand_location_map
  FOR ALL USING (EXISTS (SELECT 1 FROM users WHERE users.id = auth.uid() AND users.role IN ('super_admin', 'admin', 'editor')));

-- generated_pages
ALTER TABLE generated_pages ENABLE ROW LEVEL SECURITY;
CREATE POLICY "public_read_generated_pages" ON generated_pages
  FOR SELECT USING (status = 'published');
CREATE POLICY "admin_all_generated_pages" ON generated_pages
  FOR ALL USING (EXISTS (SELECT 1 FROM users WHERE users.id = auth.uid() AND users.role IN ('super_admin', 'admin', 'editor', 'content_writer')));

-- page_templates
ALTER TABLE page_templates ENABLE ROW LEVEL SECURITY;
CREATE POLICY "public_read_templates" ON page_templates FOR SELECT USING (true);
CREATE POLICY "admin_all_templates" ON page_templates
  FOR ALL USING (EXISTS (SELECT 1 FROM users WHERE users.id = auth.uid() AND users.role IN ('super_admin', 'admin')));

-- static_pages
ALTER TABLE static_pages ENABLE ROW LEVEL SECURITY;
CREATE POLICY "public_read_static_pages" ON static_pages
  FOR SELECT USING (status = 'published');
CREATE POLICY "admin_all_static_pages" ON static_pages
  FOR ALL USING (EXISTS (SELECT 1 FROM users WHERE users.id = auth.uid() AND users.role IN ('super_admin', 'admin', 'editor', 'content_writer')));

-- blog_categories
ALTER TABLE blog_categories ENABLE ROW LEVEL SECURITY;
CREATE POLICY "public_read_blog_categories" ON blog_categories FOR SELECT USING (true);
CREATE POLICY "admin_all_blog_categories" ON blog_categories
  FOR ALL USING (EXISTS (SELECT 1 FROM users WHERE users.id = auth.uid() AND users.role IN ('super_admin', 'admin', 'editor', 'content_writer')));

-- blog_posts
ALTER TABLE blog_posts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "public_read_blog_posts" ON blog_posts
  FOR SELECT USING (status = 'published');
CREATE POLICY "admin_all_blog_posts" ON blog_posts
  FOR ALL USING (EXISTS (SELECT 1 FROM users WHERE users.id = auth.uid() AND users.role IN ('super_admin', 'admin', 'editor', 'content_writer')));

-- blog_tags
ALTER TABLE blog_tags ENABLE ROW LEVEL SECURITY;
CREATE POLICY "public_read_blog_tags" ON blog_tags FOR SELECT USING (true);
CREATE POLICY "admin_all_blog_tags" ON blog_tags
  FOR ALL USING (EXISTS (SELECT 1 FROM users WHERE users.id = auth.uid() AND users.role IN ('super_admin', 'admin', 'editor', 'content_writer')));

-- blog_post_tags
ALTER TABLE blog_post_tags ENABLE ROW LEVEL SECURITY;
CREATE POLICY "public_read_blog_post_tags" ON blog_post_tags FOR SELECT USING (true);
CREATE POLICY "admin_all_blog_post_tags" ON blog_post_tags
  FOR ALL USING (EXISTS (SELECT 1 FROM users WHERE users.id = auth.uid() AND users.role IN ('super_admin', 'admin', 'editor', 'content_writer')));

-- media
ALTER TABLE media ENABLE ROW LEVEL SECURITY;
CREATE POLICY "public_read_media" ON media FOR SELECT USING (true);
CREATE POLICY "editor_manage_media" ON media
  FOR ALL USING (
    EXISTS (SELECT 1 FROM users WHERE users.id = auth.uid() AND users.role IN ('super_admin', 'admin', 'editor', 'content_writer'))
  );

-- form_submissions
ALTER TABLE form_submissions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "public_insert_leads" ON form_submissions
  FOR INSERT WITH CHECK (true);
CREATE POLICY "admin_read_leads" ON form_submissions
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM users WHERE users.id = auth.uid() AND users.role IN ('super_admin', 'admin', 'support_staff'))
  );
CREATE POLICY "support_update_lead_status" ON form_submissions
  FOR UPDATE USING (
    EXISTS (SELECT 1 FROM users WHERE users.id = auth.uid() AND users.role IN ('super_admin', 'admin', 'support_staff'))
  ) WITH CHECK (true);
CREATE POLICY "admin_delete_leads" ON form_submissions
  FOR DELETE USING (
    EXISTS (SELECT 1 FROM users WHERE users.id = auth.uid() AND users.role IN ('super_admin', 'admin'))
  );

-- website_settings
ALTER TABLE website_settings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "public_read_settings" ON website_settings FOR SELECT USING (true);
CREATE POLICY "admin_all_settings" ON website_settings
  FOR ALL USING (EXISTS (SELECT 1 FROM users WHERE users.id = auth.uid() AND users.role IN ('super_admin', 'admin')));

-- users
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
CREATE POLICY "users_read_own" ON users
  FOR SELECT USING (auth.uid() = id);
CREATE POLICY "super_admin_all_users" ON users
  FOR ALL USING (
    EXISTS (SELECT 1 FROM users u WHERE u.id = auth.uid() AND u.role = 'super_admin')
  );
CREATE POLICY "admin_read_users" ON users
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM users u WHERE u.id = auth.uid() AND u.role IN ('super_admin', 'admin'))
  );

-- audit_logs
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "admin_read_audit" ON audit_logs
  FOR SELECT USING (EXISTS (SELECT 1 FROM users WHERE users.id = auth.uid() AND users.role IN ('super_admin', 'admin')));
CREATE POLICY "service_insert_audit" ON audit_logs
  FOR INSERT WITH CHECK (true);
