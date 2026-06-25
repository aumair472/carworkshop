-- Seed data for development/testing

-- ─── Services ────────────────────────────────────────────────────────────────
INSERT INTO services (name, slug, short_description, starting_price, status, sort_order) VALUES
  ('Oil Change', 'oil-change', 'Full synthetic or semi-synthetic engine oil change with filter replacement', 149.00, 'published', 1),
  ('Brake Repair', 'brake-repair', 'Brake pad, disc and caliper inspection and replacement', 299.00, 'published', 2),
  ('Car Detailing', 'car-detailing', 'Full interior and exterior car detailing service', 349.00, 'published', 3),
  ('AC Service', 'ac-service', 'Air conditioning system check, regas and repair', 199.00, 'published', 4),
  ('Battery Replacement', 'battery-replacement', 'Car battery testing and replacement with warranty', 249.00, 'published', 5);

-- ─── Locations ───────────────────────────────────────────────────────────────
INSERT INTO locations (name, slug, emirate, status, sort_order) VALUES
  ('Dubai', 'dubai', 'Dubai', 'published', 1),
  ('Abu Dhabi', 'abu-dhabi', 'Abu Dhabi', 'published', 2),
  ('Sharjah', 'sharjah', 'Sharjah', 'published', 3),
  ('Dubai Marina', 'dubai-marina', 'Dubai', 'published', 4),
  ('Downtown Dubai', 'downtown-dubai', 'Dubai', 'published', 5),
  ('Jumeirah', 'jumeirah', 'Dubai', 'published', 6);

-- ─── Brands ──────────────────────────────────────────────────────────────────
INSERT INTO brands (name, slug, description, status, sort_order) VALUES
  ('Audi', 'audi', 'Expert Audi service and repair in UAE by certified technicians.', 'published', 1),
  ('BMW', 'bmw', 'Professional BMW service and maintenance in UAE.', 'published', 2),
  ('Toyota', 'toyota', 'Trusted Toyota service and repair across UAE.', 'published', 3),
  ('Mercedes-Benz', 'mercedes-benz', 'Premium Mercedes-Benz service by certified specialists.', 'published', 4),
  ('Nissan', 'nissan', 'Expert Nissan maintenance and repair services in UAE.', 'published', 5);

-- ─── Brand Models ─────────────────────────────────────────────────────────────
INSERT INTO brand_models (brand_id, name, slug, status, sort_order)
SELECT b.id, m.name, m.slug, 'published', m.ord
FROM brands b
CROSS JOIN (VALUES
  ('A1', 'a1', 1), ('A3', 'a3', 2), ('A4', 'a4', 3), ('A5', 'a5', 4),
  ('A6', 'a6', 5), ('Q3', 'q3', 6), ('Q5', 'q5', 7), ('Q7', 'q7', 8)
) AS m(name, slug, ord)
WHERE b.slug = 'audi';

INSERT INTO brand_models (brand_id, name, slug, status, sort_order)
SELECT b.id, m.name, m.slug, 'published', m.ord
FROM brands b
CROSS JOIN (VALUES
  ('1 Series', '1-series', 1), ('3 Series', '3-series', 2), ('5 Series', '5-series', 3),
  ('7 Series', '7-series', 4), ('X3', 'x3', 5), ('X5', 'x5', 6), ('X7', 'x7', 7)
) AS m(name, slug, ord)
WHERE b.slug = 'bmw';

INSERT INTO brand_models (brand_id, name, slug, status, sort_order)
SELECT b.id, m.name, m.slug, 'published', m.ord
FROM brands b
CROSS JOIN (VALUES
  ('Camry', 'camry', 1), ('Corolla', 'corolla', 2), ('Land Cruiser', 'land-cruiser', 3),
  ('Yaris', 'yaris', 4), ('RAV4', 'rav4', 5), ('Fortuner', 'fortuner', 6), ('Hilux', 'hilux', 7)
) AS m(name, slug, ord)
WHERE b.slug = 'toyota';

-- ─── Brand-Service mappings ───────────────────────────────────────────────────
INSERT INTO brand_service_map (brand_id, service_id, is_active)
SELECT b.id, s.id, true
FROM brands b, services s
WHERE b.slug IN ('audi', 'bmw', 'toyota', 'mercedes-benz', 'nissan');

-- ─── Brand-Location mappings ──────────────────────────────────────────────────
INSERT INTO brand_location_map (brand_id, location_id, is_active)
SELECT b.id, l.id, true
FROM brands b, locations l
WHERE b.slug IN ('audi', 'bmw', 'toyota', 'mercedes-benz', 'nissan')
  AND l.slug IN ('dubai', 'abu-dhabi', 'sharjah');

-- ─── Website Settings ─────────────────────────────────────────────────────────
INSERT INTO website_settings (key, value) VALUES
  ('phone', '"04 XXX XXXX"'),
  ('whatsapp', '"971501234567"'),
  ('email', '"info@carworkshop.ae"'),
  ('address', '"Dubai, UAE"'),
  ('trust_stats', '[{"value":"10,000+","label":"Cars Serviced"},{"value":"12-Month","label":"Warranty"},{"value":"Free","label":"Pickup & Delivery"},{"value":"UAE","label":"Certified Technicians"}]'),
  ('social_instagram', '"https://instagram.com/carworkshop.ae"'),
  ('social_facebook', '"https://facebook.com/carworkshop.ae"');

-- ─── Page Templates ───────────────────────────────────────────────────────────
INSERT INTO page_templates (name, page_type, is_default, sections_json) VALUES
  ('Standard Model Service', 'model_service', true, '["hero","service_explainer","pricing","process_steps","why_choose_us","related_services","other_models","location_pills","reviews","faq","cta_banner"]'),
  ('Standard Brand', 'brand', true, '["hero","service_cards","models_grid","location_pills","reviews","faq","cta_banner"]'),
  ('Standard Model', 'model', true, '["hero","service_grid","pricing","location_pills","reviews","faq","cta_banner"]');
