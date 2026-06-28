export interface NavSubItem {
  label: string
  link: string
}

export interface NavItem {
  id: string
  label: string
  link: string
  has_dropdown: boolean
  visible: boolean
  order: number
  // Custom submenu links. When present, they render instead of the auto
  // services/brands dropdown.
  children?: NavSubItem[]
}

export interface FooterLink {
  label: string
  link: string
  column: 1 | 2 | 3 | 4
  order: number
}

export type ButtonPosition = 'bottom-right' | 'bottom-left'

export interface SiteSettings {
  site_name: string
  site_tagline: string
  site_logo_url: string | null
  site_favicon_url: string | null

  header_logo_url: string | null
  header_phone_number: string
  header_phone_visible: boolean
  header_whatsapp_visible: boolean
  header_cta_text: string
  header_cta_link: string
  header_cta_visible: boolean
  header_background_color: string
  header_text_color: string
  header_sticky: boolean

  // Home hero decorative stat card (4 cells)
  hero_stat_1_value: string
  hero_stat_1_label: string
  hero_stat_2_value: string
  hero_stat_2_label: string
  hero_stat_3_value: string
  hero_stat_3_label: string
  hero_stat_4_value: string
  hero_stat_4_label: string

  whatsapp_enabled: boolean
  whatsapp_number: string
  whatsapp_message: string
  whatsapp_position: ButtonPosition

  call_enabled: boolean
  call_number: string
  call_position: ButtonPosition

  nav_items: NavItem[]

  footer_logo_url: string | null
  footer_background_color: string
  footer_text_color: string
  footer_copyright_text: string
  footer_tagline: string
  footer_show_services_column: boolean
  footer_show_brands_column: boolean
  footer_show_locations_column: boolean
  footer_column1_title: string
  footer_column2_title: string
  footer_column3_title: string
  footer_column4_title: string
  footer_custom_links: FooterLink[]

  // Footer section toggles + business information block
  footer_show_business_info: boolean
  footer_show_quick_nav: boolean
  footer_show_social: boolean
  footer_business_title: string
  footer_business_address: string
  footer_business_phone: string
  footer_business_phone2: string
  footer_business_email: string
  footer_quick_nav_title: string
  footer_social_title: string
  // Optional extra brand links appended after the auto (DB) brands list.
  footer_extra_brands: NavSubItem[]

  // Blog defaults (global CTA + author fallback)
  blog_cta_headline: string
  blog_cta_subheadline: string
  blog_cta_button_text: string
  blog_cta_button_link: string
  default_author_name: string

  social_instagram_url: string | null
  social_facebook_url: string | null
  social_linkedin_url: string | null
  social_youtube_url: string | null
  social_tiktok_url: string | null
  social_twitter_url: string | null

  announcement_bar_enabled: boolean
  announcement_bar_text: string
  announcement_bar_bg_color: string
  announcement_bar_text_color: string
  announcement_bar_link: string | null

  // SEO & Analytics (public — rendered into page source)
  ga4_id: string
  gtm_id: string
  gsc_meta: string
  default_meta_title: string
  default_meta_description: string
  default_og_image: string | null

  // Email / SMTP (server-only — never exposed publicly; secrets masked on GET)
  admin_email: string
  email_provider: 'resend' | 'smtp'
  resend_api_key: string
  resend_from_email: string
  resend_from_name: string
  smtp_host: string
  smtp_port: string
  smtp_user: string
  smtp_password: string
  smtp_from_email: string
  smtp_from_name: string
}

// Default values — used as fallback when a key is missing from the DB.
export const DEFAULT_SETTINGS: SiteSettings = {
  site_name: 'CarWorkshop.ae',
  site_tagline: 'Car Service & Repair in UAE',
  site_logo_url: null,
  site_favicon_url: null,

  header_logo_url: null,
  header_phone_number: '+971501234567',
  header_phone_visible: true,
  header_whatsapp_visible: true,
  header_cta_text: 'Book Now',
  header_cta_link: '/contact',
  header_cta_visible: true,
  header_background_color: '#FFFFFF',
  header_text_color: '#1F2937',
  header_sticky: true,

  hero_stat_1_value: 'From AED 149',
  hero_stat_1_label: 'Starting Price',
  hero_stat_2_value: '10,000+',
  hero_stat_2_label: 'Cars Serviced',
  hero_stat_3_value: '4.9★',
  hero_stat_3_label: 'Average Rating',
  hero_stat_4_value: '7 Emirates',
  hero_stat_4_label: 'Coverage',

  whatsapp_enabled: true,
  whatsapp_number: '+971501234567',
  whatsapp_message: 'Hi, I would like to book a car service',
  whatsapp_position: 'bottom-right',

  call_enabled: true,
  call_number: '+971501234567',
  call_position: 'bottom-left',

  nav_items: [
    { id: '1', label: 'Services', link: '/services', has_dropdown: true, visible: true, order: 1 },
    { id: '2', label: 'Car Brands', link: '/brands', has_dropdown: true, visible: true, order: 2 },
    { id: '3', label: 'Locations', link: '/locations', has_dropdown: false, visible: true, order: 3 },
    { id: '4', label: 'Blog', link: '/blog', has_dropdown: false, visible: true, order: 4 },
    { id: '5', label: 'About', link: '/about', has_dropdown: false, visible: true, order: 5 },
    { id: '6', label: 'Contact', link: '/contact', has_dropdown: false, visible: true, order: 6 },
  ],

  footer_logo_url: null,
  footer_background_color: '#111827',
  footer_text_color: '#FFFFFF',
  footer_copyright_text: '© 2026 CarWorkshop.ae. All rights reserved.',
  footer_tagline: 'UAE trusted car service platform',
  footer_show_services_column: true,
  footer_show_brands_column: true,
  footer_show_locations_column: true,
  footer_column1_title: 'Company',
  footer_column2_title: 'Services',
  footer_column3_title: 'Car Brands',
  footer_column4_title: 'Locations',
  footer_custom_links: [
    { label: 'Home', link: '/', column: 1, order: 1 },
    { label: 'How It Works', link: '/#how-it-works', column: 1, order: 2 },
    { label: 'FAQs', link: '/faq', column: 1, order: 3 },
    { label: 'Contact Us', link: '/contact', column: 1, order: 4 },
    { label: 'Blog', link: '/blog', column: 1, order: 5 },
    { label: 'Terms & Conditions', link: '/terms', column: 1, order: 6 },
    { label: 'Privacy Policy', link: '/privacy', column: 1, order: 7 },
  ],

  footer_show_business_info: true,
  footer_show_quick_nav: true,
  footer_show_social: true,
  footer_business_title: 'Business Information',
  footer_business_address: 'Al Quoz Industrial Area, Dubai, UAE',
  footer_business_phone: '+971501234567',
  footer_business_phone2: '',
  footer_business_email: 'info@carworkshop.ae',
  footer_quick_nav_title: 'Quick Navigation',
  footer_social_title: 'Connect With Us',
  footer_extra_brands: [],

  blog_cta_headline: 'Book Your Car Service Today',
  blog_cta_subheadline: 'Free pickup & delivery across UAE',
  blog_cta_button_text: 'Book Now',
  blog_cta_button_link: '/contact',
  default_author_name: 'CarWorkshop Team',

  social_instagram_url: null,
  social_facebook_url: null,
  social_linkedin_url: null,
  social_youtube_url: null,
  social_tiktok_url: null,
  social_twitter_url: null,

  announcement_bar_enabled: false,
  announcement_bar_text: 'Free pickup & delivery on all bookings this month!',
  announcement_bar_bg_color: '#E8601C',
  announcement_bar_text_color: '#FFFFFF',
  announcement_bar_link: null,

  ga4_id: '',
  gtm_id: '',
  gsc_meta: '',
  default_meta_title: 'CarWorkshop.ae | Car Service & Repair in UAE',
  default_meta_description: "UAE's trusted car service platform. Certified technicians, transparent pricing, free pickup & delivery.",
  default_og_image: null,

  admin_email: 'info@carworkshop.ae',
  email_provider: 'resend',
  resend_api_key: '',
  resend_from_email: 'noreply@carworkshop.ae',
  resend_from_name: 'CarWorkshop.ae',
  smtp_host: '',
  smtp_port: '587',
  smtp_user: '',
  smtp_password: '',
  smtp_from_email: '',
  smtp_from_name: '',
}

// Keys exposed to the public /api/settings endpoint and public components.
export const PUBLIC_SETTING_KEYS: Array<keyof SiteSettings> = [
  'site_name', 'site_tagline', 'site_logo_url',
  'header_logo_url', 'header_phone_number', 'header_phone_visible', 'header_whatsapp_visible',
  'header_cta_text', 'header_cta_link', 'header_cta_visible', 'header_background_color', 'header_text_color', 'header_sticky',
  'hero_stat_1_value', 'hero_stat_1_label', 'hero_stat_2_value', 'hero_stat_2_label',
  'hero_stat_3_value', 'hero_stat_3_label', 'hero_stat_4_value', 'hero_stat_4_label',
  'blog_cta_headline', 'blog_cta_subheadline', 'blog_cta_button_text', 'blog_cta_button_link', 'default_author_name',
  'whatsapp_enabled', 'whatsapp_number', 'whatsapp_message', 'whatsapp_position',
  'call_enabled', 'call_number', 'call_position',
  'nav_items',
  'footer_logo_url', 'footer_background_color', 'footer_text_color', 'footer_copyright_text', 'footer_tagline',
  'footer_show_services_column', 'footer_show_brands_column', 'footer_show_locations_column',
  'footer_column1_title', 'footer_column2_title', 'footer_column3_title', 'footer_column4_title', 'footer_custom_links',
  'footer_show_business_info', 'footer_show_quick_nav', 'footer_show_social',
  'footer_business_title', 'footer_business_address', 'footer_business_phone', 'footer_business_phone2', 'footer_business_email',
  'footer_quick_nav_title', 'footer_social_title', 'footer_extra_brands',
  'social_instagram_url', 'social_facebook_url', 'social_linkedin_url', 'social_youtube_url', 'social_tiktok_url', 'social_twitter_url',
  'announcement_bar_enabled', 'announcement_bar_text', 'announcement_bar_bg_color', 'announcement_bar_text_color', 'announcement_bar_link',
  'ga4_id', 'gtm_id', 'gsc_meta', 'default_meta_title', 'default_meta_description', 'default_og_image',
]

// Secret settings — masked in admin GET responses, never sent to the public endpoint.
export const SECRET_SETTING_KEYS: Array<keyof SiteSettings> = ['resend_api_key', 'smtp_password']

// Server-only settings — never serialized to client components / public payloads.
export const SERVER_ONLY_SETTING_KEYS: Array<keyof SiteSettings> = [
  'admin_email', 'email_provider', 'resend_api_key', 'resend_from_email', 'resend_from_name',
  'smtp_host', 'smtp_port', 'smtp_user', 'smtp_password', 'smtp_from_email', 'smtp_from_name',
]
