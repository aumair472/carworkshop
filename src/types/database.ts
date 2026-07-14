export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

type ContentStatus = 'draft' | 'published' | 'archived'
type LeadStatus = 'new' | 'contacted' | 'in_progress' | 'converted' | 'closed'
type UserRole = 'super_admin' | 'admin' | 'editor' | 'content_writer' | 'support_staff' | 'seo_editor'
type AuditAction = 'create' | 'update' | 'delete' | 'publish' | 'unpublish' | 'generate'
type ApprovalStatusEnum = 'pending' | 'approved' | 'resubmission_required' | 'rejected'
type PageTypeEnum = 'brand' | 'brand_service' | 'brand_location' | 'model' | 'model_service' | 'model_location' | 'model_service_location' | 'service' | 'location'

export type Database = {
  public: {
    Tables: {
      brands: {
        Row: {
          id: string
          name: string
          slug: string
          logo_url: string | null
          hero_image_url: string | null
          description: string | null
          common_issues: string | null
          seo_title: string | null
          seo_description: string | null
          og_image_url: string | null
          content_json: Json | null
          seo_json: Json | null
          status: ContentStatus
          sort_order: number
          created_by: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          slug: string
          logo_url?: string | null
          hero_image_url?: string | null
          description?: string | null
          common_issues?: string | null
          seo_title?: string | null
          seo_description?: string | null
          og_image_url?: string | null
          content_json?: Json | null
          seo_json?: Json | null
          status?: ContentStatus
          sort_order?: number
          created_by?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          slug?: string
          logo_url?: string | null
          hero_image_url?: string | null
          description?: string | null
          common_issues?: string | null
          seo_title?: string | null
          seo_description?: string | null
          og_image_url?: string | null
          content_json?: Json | null
          seo_json?: Json | null
          status?: ContentStatus
          sort_order?: number
          created_by?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      brand_models: {
        Row: {
          id: string
          brand_id: string
          name: string
          slug: string
          image_url: string | null
          description: string | null
          common_issues: string | null
          year_from: number | null
          year_to: number | null
          sort_order: number
          status: ContentStatus
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          brand_id: string
          name: string
          slug: string
          image_url?: string | null
          description?: string | null
          common_issues?: string | null
          year_from?: number | null
          year_to?: number | null
          sort_order?: number
          status?: ContentStatus
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          brand_id?: string
          name?: string
          slug?: string
          image_url?: string | null
          description?: string | null
          common_issues?: string | null
          year_from?: number | null
          year_to?: number | null
          sort_order?: number
          status?: ContentStatus
          updated_at?: string
        }
        Relationships: []
      }
      services: {
        Row: {
          id: string
          name: string
          slug: string
          short_description: string | null
          content: string | null
          icon_url: string | null
          image_url: string | null
          starting_price: number | null
          includes_json: Json
          faq_json: Json
          seo_title: string | null
          seo_description: string | null
          og_image_url: string | null
          schema_type: string
          content_json: Json | null
          seo_json: Json | null
          status: ContentStatus
          sort_order: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          slug: string
          short_description?: string | null
          content?: string | null
          icon_url?: string | null
          image_url?: string | null
          starting_price?: number | null
          includes_json?: Json
          faq_json?: Json
          seo_title?: string | null
          seo_description?: string | null
          og_image_url?: string | null
          schema_type?: string
          content_json?: Json | null
          seo_json?: Json | null
          status?: ContentStatus
          sort_order?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          slug?: string
          short_description?: string | null
          content?: string | null
          icon_url?: string | null
          image_url?: string | null
          starting_price?: number | null
          includes_json?: Json
          faq_json?: Json
          seo_title?: string | null
          seo_description?: string | null
          og_image_url?: string | null
          schema_type?: string
          content_json?: Json | null
          seo_json?: Json | null
          status?: ContentStatus
          sort_order?: number
          updated_at?: string
        }
        Relationships: []
      }
      locations: {
        Row: {
          id: string
          name: string
          slug: string
          emirate: string
          address: string | null
          lat: number | null
          lng: number | null
          description: string | null
          maps_embed_url: string | null
          faq_json: Json
          seo_title: string | null
          seo_description: string | null
          content_json: Json | null
          seo_json: Json | null
          status: ContentStatus
          sort_order: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          slug: string
          emirate: string
          address?: string | null
          lat?: number | null
          lng?: number | null
          description?: string | null
          maps_embed_url?: string | null
          faq_json?: Json
          seo_title?: string | null
          seo_description?: string | null
          content_json?: Json | null
          seo_json?: Json | null
          status?: ContentStatus
          sort_order?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          slug?: string
          emirate?: string
          address?: string | null
          lat?: number | null
          lng?: number | null
          description?: string | null
          maps_embed_url?: string | null
          faq_json?: Json
          seo_title?: string | null
          seo_description?: string | null
          content_json?: Json | null
          seo_json?: Json | null
          status?: ContentStatus
          sort_order?: number
          updated_at?: string
        }
        Relationships: []
      }
      brand_service_map: {
        Row: {
          id: string
          brand_id: string
          service_id: string
          price_override: number | null
          is_active: boolean
        }
        Insert: {
          id?: string
          brand_id: string
          service_id: string
          price_override?: number | null
          is_active?: boolean
        }
        Update: {
          price_override?: number | null
          is_active?: boolean
        }
        Relationships: []
      }
      brand_model_service_map: {
        Row: {
          id: string
          brand_model_id: string
          service_id: string
          price_override: number | null
          is_active: boolean
        }
        Insert: {
          id?: string
          brand_model_id: string
          service_id: string
          price_override?: number | null
          is_active?: boolean
        }
        Update: {
          price_override?: number | null
          is_active?: boolean
        }
        Relationships: []
      }
      brand_location_map: {
        Row: {
          id: string
          brand_id: string
          location_id: string
          is_active: boolean
        }
        Insert: {
          id?: string
          brand_id: string
          location_id: string
          is_active?: boolean
        }
        Update: {
          is_active?: boolean
        }
        Relationships: []
      }
      generated_pages: {
        Row: {
          id: string
          page_type: PageTypeEnum
          brand_id: string | null
          model_id: string | null
          service_id: string | null
          location_id: string | null
          slug: string
          h1: string
          meta_title: string
          meta_description: string
          og_image_url: string | null
          content_json: Json | null
          seo_json: Json | null
          template_id: string | null
          status: ContentStatus
          generated_at: string
          updated_at: string
          approval_status: ApprovalStatusEnum
          assignee_id: string | null
          assigned_at: string | null
          created_by: string | null
          country: string
          state: string | null
          template: string
          arabic_title: string | null
          meta_keyword: string | null
          schema_headline: string | null
          schema_description: string | null
          image_png_url: string | null
          image_webp_url: string | null
          image_title: string | null
          image_alt: string | null
          short_description: string | null
          arabic_short_description: string | null
          arabic_complete_description: string | null
          is_expensive_car: boolean
          display_in_footer: boolean
          use_dynamic_content: boolean
        }
        Insert: {
          id?: string
          page_type: PageTypeEnum
          brand_id?: string | null
          model_id?: string | null
          service_id?: string | null
          location_id?: string | null
          slug: string
          h1: string
          meta_title: string
          meta_description: string
          og_image_url?: string | null
          content_json?: Json | null
          seo_json?: Json | null
          template_id?: string | null
          status?: ContentStatus
          generated_at?: string
          updated_at?: string
          approval_status?: ApprovalStatusEnum
          assignee_id?: string | null
          assigned_at?: string | null
          created_by?: string | null
          country?: string
          state?: string | null
          template?: string
          arabic_title?: string | null
          meta_keyword?: string | null
          schema_headline?: string | null
          schema_description?: string | null
          image_png_url?: string | null
          image_webp_url?: string | null
          image_title?: string | null
          image_alt?: string | null
          short_description?: string | null
          arabic_short_description?: string | null
          arabic_complete_description?: string | null
          is_expensive_car?: boolean
          display_in_footer?: boolean
          use_dynamic_content?: boolean
        }
        Update: {
          page_type?: PageTypeEnum
          brand_id?: string | null
          model_id?: string | null
          service_id?: string | null
          location_id?: string | null
          slug?: string
          h1?: string
          meta_title?: string
          meta_description?: string
          og_image_url?: string | null
          content_json?: Json | null
          seo_json?: Json | null
          template_id?: string | null
          status?: ContentStatus
          updated_at?: string
          approval_status?: ApprovalStatusEnum
          assignee_id?: string | null
          assigned_at?: string | null
          created_by?: string | null
          country?: string
          state?: string | null
          template?: string
          arabic_title?: string | null
          meta_keyword?: string | null
          schema_headline?: string | null
          schema_description?: string | null
          image_png_url?: string | null
          image_webp_url?: string | null
          image_title?: string | null
          image_alt?: string | null
          short_description?: string | null
          arabic_short_description?: string | null
          arabic_complete_description?: string | null
          is_expensive_car?: boolean
          display_in_footer?: boolean
          use_dynamic_content?: boolean
        }
        Relationships: []
      }
      page_templates: {
        Row: {
          id: string
          name: string
          page_type: PageTypeEnum
          sections_json: Json
          is_default: boolean
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          page_type: PageTypeEnum
          sections_json: Json
          is_default?: boolean
          created_at?: string
        }
        Update: {
          name?: string
          sections_json?: Json
          is_default?: boolean
        }
        Relationships: []
      }
      static_pages: {
        Row: {
          id: string
          title: string
          slug: string
          sections_json: Json
          content_json: Json | null
          seo_json: Json | null
          seo_title: string | null
          seo_description: string | null
          og_image_url: string | null
          status: ContentStatus
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          title: string
          slug: string
          sections_json?: Json
          content_json?: Json | null
          seo_json?: Json | null
          seo_title?: string | null
          seo_description?: string | null
          og_image_url?: string | null
          status?: ContentStatus
          created_at?: string
          updated_at?: string
        }
        Update: {
          title?: string
          slug?: string
          sections_json?: Json
          content_json?: Json | null
          seo_json?: Json | null
          seo_title?: string | null
          seo_description?: string | null
          og_image_url?: string | null
          status?: ContentStatus
          updated_at?: string
        }
        Relationships: []
      }
      blog_categories: {
        Row: {
          id: string
          name: string
          slug: string
          description: string | null
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          slug: string
          description?: string | null
          created_at?: string
        }
        Update: {
          name?: string
          slug?: string
          description?: string | null
        }
        Relationships: []
      }
      blog_posts: {
        Row: {
          id: string
          title: string
          slug: string
          excerpt: string | null
          content: string | null
          featured_image: string | null
          seo_json: Json | null
          author_id: string | null
          category_id: string | null
          seo_title: string | null
          seo_description: string | null
          status: ContentStatus
          published_at: string | null
          scheduled_at: string | null
          created_at: string
          updated_at: string
          approval_status: ApprovalStatusEnum
          assignee_id: string | null
          assigned_at: string | null
          country: string
          state: string | null
          arabic_title: string | null
          arabic_content: string | null
          arabic_excerpt: string | null
          blockquote: string | null
          arabic_blockquote: string | null
          is_featured: boolean
          meta_keyword: string | null
          image_png_url: string | null
          image_webp_url: string | null
          image_title: string | null
          image_alt: string | null
          tags: string | null
          tags_ar: string | null
        }
        Insert: {
          id?: string
          title: string
          slug: string
          excerpt?: string | null
          content?: string | null
          featured_image?: string | null
          seo_json?: Json | null
          author_id?: string | null
          category_id?: string | null
          seo_title?: string | null
          seo_description?: string | null
          status?: ContentStatus
          published_at?: string | null
          scheduled_at?: string | null
          created_at?: string
          updated_at?: string
          approval_status?: ApprovalStatusEnum
          assignee_id?: string | null
          assigned_at?: string | null
          country?: string
          state?: string | null
          arabic_title?: string | null
          arabic_content?: string | null
          arabic_excerpt?: string | null
          blockquote?: string | null
          arabic_blockquote?: string | null
          is_featured?: boolean
          meta_keyword?: string | null
          image_png_url?: string | null
          image_webp_url?: string | null
          image_title?: string | null
          image_alt?: string | null
          tags?: string | null
          tags_ar?: string | null
        }
        Update: {
          title?: string
          slug?: string
          excerpt?: string | null
          content?: string | null
          featured_image?: string | null
          seo_json?: Json | null
          author_id?: string | null
          category_id?: string | null
          seo_title?: string | null
          seo_description?: string | null
          status?: ContentStatus
          published_at?: string | null
          scheduled_at?: string | null
          updated_at?: string
          approval_status?: ApprovalStatusEnum
          assignee_id?: string | null
          assigned_at?: string | null
          country?: string
          state?: string | null
          arabic_title?: string | null
          arabic_content?: string | null
          arabic_excerpt?: string | null
          blockquote?: string | null
          arabic_blockquote?: string | null
          is_featured?: boolean
          meta_keyword?: string | null
          image_png_url?: string | null
          image_webp_url?: string | null
          image_title?: string | null
          image_alt?: string | null
          tags?: string | null
          tags_ar?: string | null
        }
        Relationships: []
      }
      blog_tags: {
        Row: { id: string; name: string; slug: string }
        Insert: { id?: string; name: string; slug: string }
        Update: { name?: string; slug?: string }
        Relationships: []
      }
      blog_post_tags: {
        Row: { post_id: string; tag_id: string }
        Insert: { post_id: string; tag_id: string }
        Update: { post_id?: string; tag_id?: string }
        Relationships: []
      }
      media: {
        Row: {
          id: string
          filename: string
          original_name: string
          url: string
          alt_text: string
          mime_type: string
          size_bytes: number
          width: number | null
          height: number | null
          folder: string
          uploaded_by: string | null
          created_at: string
        }
        Insert: {
          id?: string
          filename: string
          original_name: string
          url: string
          alt_text?: string
          mime_type: string
          size_bytes: number
          width?: number | null
          height?: number | null
          folder?: string
          uploaded_by?: string | null
          created_at?: string
        }
        Update: {
          alt_text?: string
          folder?: string
        }
        Relationships: []
      }
      form_submissions: {
        Row: {
          id: string
          name: string
          phone: string
          email: string | null
          service_id: string | null
          brand_id: string | null
          model_id: string | null
          location_id: string | null
          message: string | null
          source_url: string
          source_page_slug: string | null
          ip_address: string | null
          user_agent: string | null
          status: LeadStatus
          notes: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          phone: string
          email?: string | null
          service_id?: string | null
          brand_id?: string | null
          model_id?: string | null
          location_id?: string | null
          message?: string | null
          source_url: string
          source_page_slug?: string | null
          ip_address?: string | null
          user_agent?: string | null
          status?: LeadStatus
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          status?: LeadStatus
          notes?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      website_settings: {
        Row: {
          key: string
          value: Json
          updated_at: string
          updated_by: string | null
        }
        Insert: {
          key: string
          value: Json
          updated_at?: string
          updated_by?: string | null
        }
        Update: {
          value?: Json
          updated_at?: string
          updated_by?: string | null
        }
        Relationships: []
      }
      audit_logs: {
        Row: {
          id: string
          user_id: string | null
          action: AuditAction
          table_name: string
          record_id: string
          changes_json: Json | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id?: string | null
          action: AuditAction
          table_name: string
          record_id: string
          changes_json?: Json | null
          created_at?: string
        }
        Update: {
          id?: string
        }
        Relationships: []
      }
      users: {
        Row: {
          id: string
          email: string
          full_name: string
          role: UserRole
          avatar_url: string | null
          is_active: boolean
          last_login: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          full_name: string
          role?: UserRole
          avatar_url?: string | null
          is_active?: boolean
          last_login?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          email?: string
          full_name?: string
          role?: UserRole
          avatar_url?: string | null
          is_active?: boolean
          last_login?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      faqs: {
        Row: {
          id: string
          country: string
          name: string
          arabic_name: string | null
          description_html: string
          arabic_description_html: string
          display_order: number
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          country?: string
          name: string
          arabic_name?: string | null
          description_html?: string
          arabic_description_html?: string
          display_order?: number
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          country?: string
          name?: string
          arabic_name?: string | null
          description_html?: string
          arabic_description_html?: string
          display_order?: number
          is_active?: boolean
          updated_at?: string
        }
        Relationships: []
      }
      language_keys: {
        Row: {
          id: string
          key_name: string
          slug: string
          value_en: string
          value_ar: string
          comment: string | null
          is_published: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          key_name: string
          slug: string
          value_en?: string
          value_ar?: string
          comment?: string | null
          is_published?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          key_name?: string
          slug?: string
          value_en?: string
          value_ar?: string
          comment?: string | null
          is_published?: boolean
          updated_at?: string
        }
        Relationships: []
      }
      search_content: {
        Row: {
          id: string
          title: string
          url: string
          keywords: string[]
          description: string | null
          display_order: number
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          title: string
          url: string
          keywords?: string[]
          description?: string | null
          display_order?: number
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          title?: string
          url?: string
          keywords?: string[]
          description?: string | null
          display_order?: number
          is_active?: boolean
          updated_at?: string
        }
        Relationships: []
      }
    }
    Views: Record<string, never>
    Functions: Record<string, never>
    Enums: {
      content_status: ContentStatus
      lead_status: LeadStatus
      user_role: UserRole
      audit_action: AuditAction
      page_type: PageTypeEnum
      approval_status: ApprovalStatusEnum
    }
    CompositeTypes: Record<string, never>
  }
}
