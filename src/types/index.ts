import type { Database } from './database'

export type Brand = Database['public']['Tables']['brands']['Row']
export type BrandModel = Database['public']['Tables']['brand_models']['Row']
export type Service = Database['public']['Tables']['services']['Row']
export type Location = Database['public']['Tables']['locations']['Row']
export type GeneratedPage = Database['public']['Tables']['generated_pages']['Row']
export type FormSubmission = Database['public']['Tables']['form_submissions']['Row']
export type BlogPost = Database['public']['Tables']['blog_posts']['Row']
export type BlogCategory = Database['public']['Tables']['blog_categories']['Row']
export type BlogTag = Database['public']['Tables']['blog_tags']['Row']
export type Media = Database['public']['Tables']['media']['Row']
export type WebsiteSetting = Database['public']['Tables']['website_settings']['Row']
export type AuditLog = Database['public']['Tables']['audit_logs']['Row']
export type User = Database['public']['Tables']['users']['Row']
export type PageTemplate = Database['public']['Tables']['page_templates']['Row']
export type BrandServiceMap = Database['public']['Tables']['brand_service_map']['Row']
export type BrandLocationMap = Database['public']['Tables']['brand_location_map']['Row']

export type InsertBrand = Database['public']['Tables']['brands']['Insert']
export type InsertBrandModel = Database['public']['Tables']['brand_models']['Insert']
export type InsertService = Database['public']['Tables']['services']['Insert']
export type InsertLocation = Database['public']['Tables']['locations']['Insert']
export type InsertGeneratedPage = Database['public']['Tables']['generated_pages']['Insert']
export type InsertFormSubmission = Database['public']['Tables']['form_submissions']['Insert']
export type InsertBlogPost = Database['public']['Tables']['blog_posts']['Insert']

export type UpdateBrand = Database['public']['Tables']['brands']['Update']
export type UpdateBrandModel = Database['public']['Tables']['brand_models']['Update']
export type UpdateService = Database['public']['Tables']['services']['Update']
export type UpdateLocation = Database['public']['Tables']['locations']['Update']
export type UpdateGeneratedPage = Database['public']['Tables']['generated_pages']['Update']
export type UpdateFormSubmission = Database['public']['Tables']['form_submissions']['Update']
export type UpdateBlogPost = Database['public']['Tables']['blog_posts']['Update']

export type ContentStatus = 'draft' | 'published' | 'archived'
export type LeadStatus = 'new' | 'contacted' | 'in_progress' | 'converted' | 'closed'
export type UserRole = 'super_admin' | 'admin' | 'editor' | 'content_writer' | 'support_staff'
export type PageType = 'brand' | 'brand_service' | 'brand_location' | 'model' | 'model_service' | 'model_location' | 'model_service_location' | 'service' | 'location'

export interface FAQItem {
  question: string
  answer: string
}

export interface TrustStat {
  value: string
  label: string
}

export interface ServiceWithPrice extends Service {
  price_override?: number | null
}

export interface BrandWithRelations extends Brand {
  brand_models?: BrandModel[]
  brand_service_map?: Array<BrandServiceMap & { services: Service }>
  brand_location_map?: Array<BrandLocationMap & { locations: Location }>
}

export interface PageMeta {
  meta_title: string
  meta_description: string
}

export interface MetaContext {
  type: PageType
  brand?: Pick<Brand, 'name' | 'slug'>
  model?: Pick<BrandModel, 'name' | 'slug'>
  service?: Pick<Service, 'name' | 'slug'>
  location?: Pick<Location, 'name' | 'slug'>
}
