export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      audit_logs: {
        Row: {
          action: Database["public"]["Enums"]["audit_action"]
          changes_json: Json | null
          created_at: string
          id: string
          record_id: string
          table_name: string
          user_id: string | null
        }
        Insert: {
          action: Database["public"]["Enums"]["audit_action"]
          changes_json?: Json | null
          created_at?: string
          id?: string
          record_id: string
          table_name: string
          user_id?: string | null
        }
        Update: {
          action?: Database["public"]["Enums"]["audit_action"]
          changes_json?: Json | null
          created_at?: string
          id?: string
          record_id?: string
          table_name?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "audit_logs_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      blog_categories: {
        Row: {
          created_at: string
          description: string | null
          id: string
          name: string
          slug: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          name: string
          slug: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          name?: string
          slug?: string
        }
        Relationships: []
      }
      blog_post_tags: {
        Row: {
          post_id: string
          tag_id: string
        }
        Insert: {
          post_id: string
          tag_id: string
        }
        Update: {
          post_id?: string
          tag_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "blog_post_tags_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "blog_posts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "blog_post_tags_tag_id_fkey"
            columns: ["tag_id"]
            isOneToOne: false
            referencedRelation: "blog_tags"
            referencedColumns: ["id"]
          },
        ]
      }
      blog_posts: {
        Row: {
          approval_status: Database["public"]["Enums"]["approval_status"]
          arabic_blockquote: string | null
          arabic_content: string | null
          arabic_excerpt: string | null
          arabic_title: string | null
          assigned_at: string | null
          assignee_id: string | null
          author_id: string | null
          blockquote: string | null
          category_id: string | null
          content: string | null
          country: string
          created_at: string
          excerpt: string | null
          featured_image: string | null
          id: string
          image_alt: string | null
          image_png_url: string | null
          image_title: string | null
          image_webp_url: string | null
          is_featured: boolean
          meta_keyword: string | null
          published_at: string | null
          scheduled_at: string | null
          seo_description: string | null
          seo_json: Json
          seo_title: string | null
          slug: string
          state: string | null
          status: Database["public"]["Enums"]["content_status"]
          tags: string | null
          tags_ar: string | null
          title: string
          updated_at: string
        }
        Insert: {
          approval_status?: Database["public"]["Enums"]["approval_status"]
          arabic_blockquote?: string | null
          arabic_content?: string | null
          arabic_excerpt?: string | null
          arabic_title?: string | null
          assigned_at?: string | null
          assignee_id?: string | null
          author_id?: string | null
          blockquote?: string | null
          category_id?: string | null
          content?: string | null
          country?: string
          created_at?: string
          excerpt?: string | null
          featured_image?: string | null
          id?: string
          image_alt?: string | null
          image_png_url?: string | null
          image_title?: string | null
          image_webp_url?: string | null
          is_featured?: boolean
          meta_keyword?: string | null
          published_at?: string | null
          scheduled_at?: string | null
          seo_description?: string | null
          seo_json?: Json
          seo_title?: string | null
          slug: string
          state?: string | null
          status?: Database["public"]["Enums"]["content_status"]
          tags?: string | null
          tags_ar?: string | null
          title: string
          updated_at?: string
        }
        Update: {
          approval_status?: Database["public"]["Enums"]["approval_status"]
          arabic_blockquote?: string | null
          arabic_content?: string | null
          arabic_excerpt?: string | null
          arabic_title?: string | null
          assigned_at?: string | null
          assignee_id?: string | null
          author_id?: string | null
          blockquote?: string | null
          category_id?: string | null
          content?: string | null
          country?: string
          created_at?: string
          excerpt?: string | null
          featured_image?: string | null
          id?: string
          image_alt?: string | null
          image_png_url?: string | null
          image_title?: string | null
          image_webp_url?: string | null
          is_featured?: boolean
          meta_keyword?: string | null
          published_at?: string | null
          scheduled_at?: string | null
          seo_description?: string | null
          seo_json?: Json
          seo_title?: string | null
          slug?: string
          state?: string | null
          status?: Database["public"]["Enums"]["content_status"]
          tags?: string | null
          tags_ar?: string | null
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "blog_posts_assignee_id_fkey"
            columns: ["assignee_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "blog_posts_author_id_fkey"
            columns: ["author_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "blog_posts_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "blog_categories"
            referencedColumns: ["id"]
          },
        ]
      }
      blog_tags: {
        Row: {
          id: string
          name: string
          slug: string
        }
        Insert: {
          id?: string
          name: string
          slug: string
        }
        Update: {
          id?: string
          name?: string
          slug?: string
        }
        Relationships: []
      }
      brand_location_map: {
        Row: {
          brand_id: string
          id: string
          is_active: boolean
          location_id: string
        }
        Insert: {
          brand_id: string
          id?: string
          is_active?: boolean
          location_id: string
        }
        Update: {
          brand_id?: string
          id?: string
          is_active?: boolean
          location_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "brand_location_map_brand_id_fkey"
            columns: ["brand_id"]
            isOneToOne: false
            referencedRelation: "brands"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "brand_location_map_location_id_fkey"
            columns: ["location_id"]
            isOneToOne: false
            referencedRelation: "locations"
            referencedColumns: ["id"]
          },
        ]
      }
      brand_model_service_map: {
        Row: {
          brand_model_id: string
          id: string
          is_active: boolean
          price_override: number | null
          service_id: string
        }
        Insert: {
          brand_model_id: string
          id?: string
          is_active?: boolean
          price_override?: number | null
          service_id: string
        }
        Update: {
          brand_model_id?: string
          id?: string
          is_active?: boolean
          price_override?: number | null
          service_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "brand_model_service_map_brand_model_id_fkey"
            columns: ["brand_model_id"]
            isOneToOne: false
            referencedRelation: "brand_models"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "brand_model_service_map_service_id_fkey"
            columns: ["service_id"]
            isOneToOne: false
            referencedRelation: "services"
            referencedColumns: ["id"]
          },
        ]
      }
      brand_models: {
        Row: {
          brand_id: string
          common_issues: string | null
          created_at: string
          description: string | null
          id: string
          image_url: string | null
          name: string
          slug: string
          sort_order: number
          status: Database["public"]["Enums"]["content_status"]
          updated_at: string
          year_from: number | null
          year_to: number | null
        }
        Insert: {
          brand_id: string
          common_issues?: string | null
          created_at?: string
          description?: string | null
          id?: string
          image_url?: string | null
          name: string
          slug: string
          sort_order?: number
          status?: Database["public"]["Enums"]["content_status"]
          updated_at?: string
          year_from?: number | null
          year_to?: number | null
        }
        Update: {
          brand_id?: string
          common_issues?: string | null
          created_at?: string
          description?: string | null
          id?: string
          image_url?: string | null
          name?: string
          slug?: string
          sort_order?: number
          status?: Database["public"]["Enums"]["content_status"]
          updated_at?: string
          year_from?: number | null
          year_to?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "brand_models_brand_id_fkey"
            columns: ["brand_id"]
            isOneToOne: false
            referencedRelation: "brands"
            referencedColumns: ["id"]
          },
        ]
      }
      brand_service_map: {
        Row: {
          brand_id: string
          id: string
          is_active: boolean
          price_override: number | null
          service_id: string
        }
        Insert: {
          brand_id: string
          id?: string
          is_active?: boolean
          price_override?: number | null
          service_id: string
        }
        Update: {
          brand_id?: string
          id?: string
          is_active?: boolean
          price_override?: number | null
          service_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "brand_service_map_brand_id_fkey"
            columns: ["brand_id"]
            isOneToOne: false
            referencedRelation: "brands"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "brand_service_map_service_id_fkey"
            columns: ["service_id"]
            isOneToOne: false
            referencedRelation: "services"
            referencedColumns: ["id"]
          },
        ]
      }
      brands: {
        Row: {
          common_issues: string | null
          content_json: Json
          created_at: string
          created_by: string | null
          description: string | null
          hero_image_url: string | null
          id: string
          logo_url: string | null
          name: string
          og_image_url: string | null
          seo_description: string | null
          seo_json: Json
          seo_title: string | null
          slug: string
          sort_order: number
          status: Database["public"]["Enums"]["content_status"]
          updated_at: string
        }
        Insert: {
          common_issues?: string | null
          content_json?: Json
          created_at?: string
          created_by?: string | null
          description?: string | null
          hero_image_url?: string | null
          id?: string
          logo_url?: string | null
          name: string
          og_image_url?: string | null
          seo_description?: string | null
          seo_json?: Json
          seo_title?: string | null
          slug: string
          sort_order?: number
          status?: Database["public"]["Enums"]["content_status"]
          updated_at?: string
        }
        Update: {
          common_issues?: string | null
          content_json?: Json
          created_at?: string
          created_by?: string | null
          description?: string | null
          hero_image_url?: string | null
          id?: string
          logo_url?: string | null
          name?: string
          og_image_url?: string | null
          seo_description?: string | null
          seo_json?: Json
          seo_title?: string | null
          slug?: string
          sort_order?: number
          status?: Database["public"]["Enums"]["content_status"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "brands_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      faqs: {
        Row: {
          arabic_description_html: string
          arabic_name: string | null
          country: string
          created_at: string
          description_html: string
          display_order: number
          id: string
          is_active: boolean
          name: string
          updated_at: string
        }
        Insert: {
          arabic_description_html?: string
          arabic_name?: string | null
          country?: string
          created_at?: string
          description_html?: string
          display_order?: number
          id?: string
          is_active?: boolean
          name: string
          updated_at?: string
        }
        Update: {
          arabic_description_html?: string
          arabic_name?: string | null
          country?: string
          created_at?: string
          description_html?: string
          display_order?: number
          id?: string
          is_active?: boolean
          name?: string
          updated_at?: string
        }
        Relationships: []
      }
      form_submissions: {
        Row: {
          brand_id: string | null
          created_at: string
          email: string | null
          id: string
          ip_address: unknown
          location_id: string | null
          message: string | null
          model_id: string | null
          name: string
          notes: string | null
          phone: string
          service_id: string | null
          source_page_slug: string | null
          source_url: string
          status: Database["public"]["Enums"]["lead_status"]
          updated_at: string
          user_agent: string | null
        }
        Insert: {
          brand_id?: string | null
          created_at?: string
          email?: string | null
          id?: string
          ip_address?: unknown
          location_id?: string | null
          message?: string | null
          model_id?: string | null
          name: string
          notes?: string | null
          phone: string
          service_id?: string | null
          source_page_slug?: string | null
          source_url: string
          status?: Database["public"]["Enums"]["lead_status"]
          updated_at?: string
          user_agent?: string | null
        }
        Update: {
          brand_id?: string | null
          created_at?: string
          email?: string | null
          id?: string
          ip_address?: unknown
          location_id?: string | null
          message?: string | null
          model_id?: string | null
          name?: string
          notes?: string | null
          phone?: string
          service_id?: string | null
          source_page_slug?: string | null
          source_url?: string
          status?: Database["public"]["Enums"]["lead_status"]
          updated_at?: string
          user_agent?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "form_submissions_brand_id_fkey"
            columns: ["brand_id"]
            isOneToOne: false
            referencedRelation: "brands"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "form_submissions_location_id_fkey"
            columns: ["location_id"]
            isOneToOne: false
            referencedRelation: "locations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "form_submissions_model_id_fkey"
            columns: ["model_id"]
            isOneToOne: false
            referencedRelation: "brand_models"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "form_submissions_service_id_fkey"
            columns: ["service_id"]
            isOneToOne: false
            referencedRelation: "services"
            referencedColumns: ["id"]
          },
        ]
      }
      generated_pages: {
        Row: {
          approval_status: Database["public"]["Enums"]["approval_status"]
          arabic_complete_description: string | null
          arabic_short_description: string | null
          arabic_title: string | null
          assigned_at: string | null
          assignee_id: string | null
          brand_id: string | null
          content_json: Json | null
          country: string
          created_by: string | null
          display_in_footer: boolean
          generated_at: string
          h1: string
          highlight_text: string | null
          icon_image_alt: string | null
          icon_image_png_url: string | null
          icon_image_title: string | null
          icon_image_webp_url: string | null
          id: string
          image_alt: string | null
          image_bottom_alt: string | null
          image_bottom_png_url: string | null
          image_bottom_title: string | null
          image_bottom_webp_url: string | null
          image_large_url: string | null
          image_mobile_url: string | null
          image_png_url: string | null
          image_title: string | null
          image_webp_url: string | null
          is_expensive_car: boolean
          key_points: string | null
          location_id: string | null
          meta_description: string
          meta_keyword: string | null
          meta_title: string
          mid_category_title: string | null
          model_id: string | null
          og_image_url: string | null
          page_type: Database["public"]["Enums"]["page_type"]
          schema_description: string | null
          schema_headline: string | null
          seo_json: Json
          service_id: string | null
          short_description: string | null
          slug: string
          state: string | null
          status: Database["public"]["Enums"]["content_status"]
          template: string
          template_id: string | null
          updated_at: string
          use_dynamic_content: boolean
        }
        Insert: {
          approval_status?: Database["public"]["Enums"]["approval_status"]
          arabic_complete_description?: string | null
          arabic_short_description?: string | null
          arabic_title?: string | null
          assigned_at?: string | null
          assignee_id?: string | null
          brand_id?: string | null
          content_json?: Json | null
          country?: string
          created_by?: string | null
          display_in_footer?: boolean
          generated_at?: string
          h1: string
          highlight_text?: string | null
          icon_image_alt?: string | null
          icon_image_png_url?: string | null
          icon_image_title?: string | null
          icon_image_webp_url?: string | null
          id?: string
          image_alt?: string | null
          image_bottom_alt?: string | null
          image_bottom_png_url?: string | null
          image_bottom_title?: string | null
          image_bottom_webp_url?: string | null
          image_large_url?: string | null
          image_mobile_url?: string | null
          image_png_url?: string | null
          image_title?: string | null
          image_webp_url?: string | null
          is_expensive_car?: boolean
          key_points?: string | null
          location_id?: string | null
          meta_description: string
          meta_keyword?: string | null
          meta_title: string
          mid_category_title?: string | null
          model_id?: string | null
          og_image_url?: string | null
          page_type: Database["public"]["Enums"]["page_type"]
          schema_description?: string | null
          schema_headline?: string | null
          seo_json?: Json
          service_id?: string | null
          short_description?: string | null
          slug: string
          state?: string | null
          status?: Database["public"]["Enums"]["content_status"]
          template?: string
          template_id?: string | null
          updated_at?: string
          use_dynamic_content?: boolean
        }
        Update: {
          approval_status?: Database["public"]["Enums"]["approval_status"]
          arabic_complete_description?: string | null
          arabic_short_description?: string | null
          arabic_title?: string | null
          assigned_at?: string | null
          assignee_id?: string | null
          brand_id?: string | null
          content_json?: Json | null
          country?: string
          created_by?: string | null
          display_in_footer?: boolean
          generated_at?: string
          h1?: string
          highlight_text?: string | null
          icon_image_alt?: string | null
          icon_image_png_url?: string | null
          icon_image_title?: string | null
          icon_image_webp_url?: string | null
          id?: string
          image_alt?: string | null
          image_bottom_alt?: string | null
          image_bottom_png_url?: string | null
          image_bottom_title?: string | null
          image_bottom_webp_url?: string | null
          image_large_url?: string | null
          image_mobile_url?: string | null
          image_png_url?: string | null
          image_title?: string | null
          image_webp_url?: string | null
          is_expensive_car?: boolean
          key_points?: string | null
          location_id?: string | null
          meta_description?: string
          meta_keyword?: string | null
          meta_title?: string
          mid_category_title?: string | null
          model_id?: string | null
          og_image_url?: string | null
          page_type?: Database["public"]["Enums"]["page_type"]
          schema_description?: string | null
          schema_headline?: string | null
          seo_json?: Json
          service_id?: string | null
          short_description?: string | null
          slug?: string
          state?: string | null
          status?: Database["public"]["Enums"]["content_status"]
          template?: string
          template_id?: string | null
          updated_at?: string
          use_dynamic_content?: boolean
        }
        Relationships: [
          {
            foreignKeyName: "generated_pages_assignee_id_fkey"
            columns: ["assignee_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "generated_pages_brand_id_fkey"
            columns: ["brand_id"]
            isOneToOne: false
            referencedRelation: "brands"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "generated_pages_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "generated_pages_location_id_fkey"
            columns: ["location_id"]
            isOneToOne: false
            referencedRelation: "locations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "generated_pages_model_id_fkey"
            columns: ["model_id"]
            isOneToOne: false
            referencedRelation: "brand_models"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "generated_pages_service_id_fkey"
            columns: ["service_id"]
            isOneToOne: false
            referencedRelation: "services"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "generated_pages_template_id_fkey"
            columns: ["template_id"]
            isOneToOne: false
            referencedRelation: "page_templates"
            referencedColumns: ["id"]
          },
        ]
      }
      language_keys: {
        Row: {
          comment: string | null
          created_at: string
          id: string
          is_published: boolean
          key_name: string
          slug: string
          updated_at: string
          value_ar: string
          value_en: string
        }
        Insert: {
          comment?: string | null
          created_at?: string
          id?: string
          is_published?: boolean
          key_name: string
          slug: string
          updated_at?: string
          value_ar?: string
          value_en?: string
        }
        Update: {
          comment?: string | null
          created_at?: string
          id?: string
          is_published?: boolean
          key_name?: string
          slug?: string
          updated_at?: string
          value_ar?: string
          value_en?: string
        }
        Relationships: []
      }
      locations: {
        Row: {
          address: string | null
          content_json: Json
          created_at: string
          description: string | null
          emirate: string
          faq_json: Json | null
          id: string
          lat: number | null
          lng: number | null
          maps_embed_url: string | null
          name: string
          seo_description: string | null
          seo_json: Json
          seo_title: string | null
          slug: string
          sort_order: number
          status: Database["public"]["Enums"]["content_status"]
          updated_at: string
        }
        Insert: {
          address?: string | null
          content_json?: Json
          created_at?: string
          description?: string | null
          emirate: string
          faq_json?: Json | null
          id?: string
          lat?: number | null
          lng?: number | null
          maps_embed_url?: string | null
          name: string
          seo_description?: string | null
          seo_json?: Json
          seo_title?: string | null
          slug: string
          sort_order?: number
          status?: Database["public"]["Enums"]["content_status"]
          updated_at?: string
        }
        Update: {
          address?: string | null
          content_json?: Json
          created_at?: string
          description?: string | null
          emirate?: string
          faq_json?: Json | null
          id?: string
          lat?: number | null
          lng?: number | null
          maps_embed_url?: string | null
          name?: string
          seo_description?: string | null
          seo_json?: Json
          seo_title?: string | null
          slug?: string
          sort_order?: number
          status?: Database["public"]["Enums"]["content_status"]
          updated_at?: string
        }
        Relationships: []
      }
      media: {
        Row: {
          alt_text: string | null
          created_at: string
          filename: string
          folder: string
          height: number | null
          id: string
          mime_type: string
          original_name: string
          size_bytes: number
          uploaded_by: string | null
          url: string
          width: number | null
        }
        Insert: {
          alt_text?: string | null
          created_at?: string
          filename: string
          folder?: string
          height?: number | null
          id?: string
          mime_type: string
          original_name: string
          size_bytes: number
          uploaded_by?: string | null
          url: string
          width?: number | null
        }
        Update: {
          alt_text?: string | null
          created_at?: string
          filename?: string
          folder?: string
          height?: number | null
          id?: string
          mime_type?: string
          original_name?: string
          size_bytes?: number
          uploaded_by?: string | null
          url?: string
          width?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "media_uploaded_by_fkey"
            columns: ["uploaded_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      page_templates: {
        Row: {
          created_at: string
          id: string
          is_default: boolean
          name: string
          page_type: Database["public"]["Enums"]["page_type"]
          sections_json: Json
        }
        Insert: {
          created_at?: string
          id?: string
          is_default?: boolean
          name: string
          page_type: Database["public"]["Enums"]["page_type"]
          sections_json: Json
        }
        Update: {
          created_at?: string
          id?: string
          is_default?: boolean
          name?: string
          page_type?: Database["public"]["Enums"]["page_type"]
          sections_json?: Json
        }
        Relationships: []
      }
      search_content: {
        Row: {
          created_at: string
          description: string | null
          display_order: number
          id: string
          is_active: boolean
          keywords: string[]
          title: string
          updated_at: string
          url: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          display_order?: number
          id?: string
          is_active?: boolean
          keywords?: string[]
          title: string
          updated_at?: string
          url: string
        }
        Update: {
          created_at?: string
          description?: string | null
          display_order?: number
          id?: string
          is_active?: boolean
          keywords?: string[]
          title?: string
          updated_at?: string
          url?: string
        }
        Relationships: []
      }
      service_location_map: {
        Row: {
          created_at: string
          custom_price: number | null
          is_active: boolean
          location_id: string
          notes: string | null
          service_id: string
        }
        Insert: {
          created_at?: string
          custom_price?: number | null
          is_active?: boolean
          location_id: string
          notes?: string | null
          service_id: string
        }
        Update: {
          created_at?: string
          custom_price?: number | null
          is_active?: boolean
          location_id?: string
          notes?: string | null
          service_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "service_location_map_location_id_fkey"
            columns: ["location_id"]
            isOneToOne: false
            referencedRelation: "locations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "service_location_map_service_id_fkey"
            columns: ["service_id"]
            isOneToOne: false
            referencedRelation: "services"
            referencedColumns: ["id"]
          },
        ]
      }
      services: {
        Row: {
          content: string | null
          content_json: Json
          created_at: string
          faq_json: Json | null
          icon_url: string | null
          id: string
          image_url: string | null
          includes_json: Json | null
          name: string
          og_image_url: string | null
          schema_type: string | null
          seo_description: string | null
          seo_json: Json
          seo_title: string | null
          short_description: string | null
          slug: string
          sort_order: number
          starting_price: number | null
          status: Database["public"]["Enums"]["content_status"]
          updated_at: string
        }
        Insert: {
          content?: string | null
          content_json?: Json
          created_at?: string
          faq_json?: Json | null
          icon_url?: string | null
          id?: string
          image_url?: string | null
          includes_json?: Json | null
          name: string
          og_image_url?: string | null
          schema_type?: string | null
          seo_description?: string | null
          seo_json?: Json
          seo_title?: string | null
          short_description?: string | null
          slug: string
          sort_order?: number
          starting_price?: number | null
          status?: Database["public"]["Enums"]["content_status"]
          updated_at?: string
        }
        Update: {
          content?: string | null
          content_json?: Json
          created_at?: string
          faq_json?: Json | null
          icon_url?: string | null
          id?: string
          image_url?: string | null
          includes_json?: Json | null
          name?: string
          og_image_url?: string | null
          schema_type?: string | null
          seo_description?: string | null
          seo_json?: Json
          seo_title?: string | null
          short_description?: string | null
          slug?: string
          sort_order?: number
          starting_price?: number | null
          status?: Database["public"]["Enums"]["content_status"]
          updated_at?: string
        }
        Relationships: []
      }
      static_pages: {
        Row: {
          content_json: Json
          created_at: string
          id: string
          og_image_url: string | null
          sections_json: Json
          seo_description: string | null
          seo_json: Json
          seo_title: string | null
          slug: string
          status: Database["public"]["Enums"]["content_status"]
          title: string
          updated_at: string
        }
        Insert: {
          content_json?: Json
          created_at?: string
          id?: string
          og_image_url?: string | null
          sections_json?: Json
          seo_description?: string | null
          seo_json?: Json
          seo_title?: string | null
          slug: string
          status?: Database["public"]["Enums"]["content_status"]
          title: string
          updated_at?: string
        }
        Update: {
          content_json?: Json
          created_at?: string
          id?: string
          og_image_url?: string | null
          sections_json?: Json
          seo_description?: string | null
          seo_json?: Json
          seo_title?: string | null
          slug?: string
          status?: Database["public"]["Enums"]["content_status"]
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      users: {
        Row: {
          avatar_url: string | null
          created_at: string
          email: string
          full_name: string
          id: string
          is_active: boolean
          last_login: string | null
          role: Database["public"]["Enums"]["user_role"]
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          email: string
          full_name: string
          id: string
          is_active?: boolean
          last_login?: string | null
          role?: Database["public"]["Enums"]["user_role"]
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          email?: string
          full_name?: string
          id?: string
          is_active?: boolean
          last_login?: string | null
          role?: Database["public"]["Enums"]["user_role"]
          updated_at?: string
        }
        Relationships: []
      }
      website_settings: {
        Row: {
          key: string
          updated_at: string
          updated_by: string | null
          value: Json
        }
        Insert: {
          key: string
          updated_at?: string
          updated_by?: string | null
          value: Json
        }
        Update: {
          key?: string
          updated_at?: string
          updated_by?: string | null
          value?: Json
        }
        Relationships: [
          {
            foreignKeyName: "website_settings_updated_by_fkey"
            columns: ["updated_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      is_staff: { Args: { roles: string[] }; Returns: boolean }
      show_limit: { Args: never; Returns: number }
      show_trgm: { Args: { "": string }; Returns: string[] }
    }
    Enums: {
      approval_status:
        | "pending"
        | "approved"
        | "resubmission_required"
        | "rejected"
      audit_action:
        | "create"
        | "update"
        | "delete"
        | "publish"
        | "unpublish"
        | "generate"
      content_status: "draft" | "published" | "archived"
      lead_status: "new" | "contacted" | "in_progress" | "converted" | "closed"
      page_type:
        | "brand"
        | "brand_service"
        | "brand_location"
        | "model"
        | "model_service"
        | "model_location"
        | "model_service_location"
        | "service"
        | "location"
      user_role:
        | "super_admin"
        | "admin"
        | "editor"
        | "content_writer"
        | "support_staff"
        | "seo_editor"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      approval_status: [
        "pending",
        "approved",
        "resubmission_required",
        "rejected",
      ],
      audit_action: [
        "create",
        "update",
        "delete",
        "publish",
        "unpublish",
        "generate",
      ],
      content_status: ["draft", "published", "archived"],
      lead_status: ["new", "contacted", "in_progress", "converted", "closed"],
      page_type: [
        "brand",
        "brand_service",
        "brand_location",
        "model",
        "model_service",
        "model_location",
        "model_service_location",
        "service",
        "location",
      ],
      user_role: [
        "super_admin",
        "admin",
        "editor",
        "content_writer",
        "support_staff",
        "seo_editor",
      ],
    },
  },
} as const
