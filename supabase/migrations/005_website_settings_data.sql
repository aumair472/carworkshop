-- Seed default website_settings keys for the admin Website Settings module.
INSERT INTO website_settings (key, value) VALUES
-- GENERAL
('site_name', '"CarWorkshop.ae"'),
('site_tagline', '"Car Service & Repair in UAE"'),
('site_logo_url', 'null'),
('site_favicon_url', 'null'),

-- CONTACT FLOATING BUTTONS
('whatsapp_enabled', 'true'),
('whatsapp_number', '"+971501234567"'),
('whatsapp_message', '"Hi, I would like to book a car service"'),
('whatsapp_position', '"bottom-right"'),

('call_enabled', 'true'),
('call_number', '"+971501234567"'),
('call_position', '"bottom-left"'),

-- HEADER
('header_logo_url', 'null'),
('header_phone_number', '"+971501234567"'),
('header_phone_visible', 'true'),
('header_whatsapp_visible', 'true'),
('header_cta_text', '"Book Now"'),
('header_cta_link', '"/contact"'),
('header_cta_visible', 'true'),
('header_background_color', '"#FFFFFF"'),
('header_text_color', '"#1F2937"'),
('header_sticky', 'true'),

-- NAVIGATION MENU
('nav_items', '[
  {"id":"1","label":"Services","link":"/services","has_dropdown":true,"visible":true,"order":1},
  {"id":"2","label":"Car Brands","link":"/brands","has_dropdown":true,"visible":true,"order":2},
  {"id":"3","label":"Locations","link":"/locations","has_dropdown":false,"visible":true,"order":3},
  {"id":"4","label":"Blog","link":"/blog","has_dropdown":false,"visible":true,"order":4},
  {"id":"5","label":"About","link":"/about","has_dropdown":false,"visible":true,"order":5},
  {"id":"6","label":"Contact","link":"/contact","has_dropdown":false,"visible":true,"order":6}
]'),

-- FOOTER
('footer_logo_url', 'null'),
('footer_tagline', '"UAE trusted car service platform"'),
('footer_background_color', '"#111827"'),
('footer_text_color', '"#FFFFFF"'),
('footer_copyright_text', '"© 2026 CarWorkshop.ae. All rights reserved."'),
('footer_show_services_column', 'true'),
('footer_show_brands_column', 'true'),
('footer_show_locations_column', 'true'),
('footer_column1_title', '"Company"'),
('footer_column2_title', '"Services"'),
('footer_column3_title', '"Car Brands"'),
('footer_column4_title', '"Locations"'),
('footer_custom_links', '[
  {"label":"About Us","link":"/about","column":1,"order":1},
  {"label":"Contact","link":"/contact","column":1,"order":2},
  {"label":"Blog","link":"/blog","column":1,"order":3},
  {"label":"FAQ","link":"/faq","column":1,"order":4},
  {"label":"Privacy Policy","link":"/privacy","column":1,"order":5},
  {"label":"Terms & Conditions","link":"/terms","column":1,"order":6}
]'),

-- SOCIAL MEDIA
('social_instagram_url', 'null'),
('social_facebook_url', 'null'),
('social_linkedin_url', 'null'),
('social_youtube_url', 'null'),
('social_tiktok_url', 'null'),
('social_twitter_url', 'null'),

-- ANNOUNCEMENT BAR
('announcement_bar_enabled', 'false'),
('announcement_bar_text', '"Free pickup & delivery on all bookings this month!"'),
('announcement_bar_bg_color', '"#E8601C"'),
('announcement_bar_text_color', '"#FFFFFF"'),
('announcement_bar_link', 'null')

ON CONFLICT (key) DO NOTHING;
