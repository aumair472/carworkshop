import { z } from 'zod'

// SMC-style SEO Page editor payload (generated_pages).
export const SeoPageUpdateSchema = z.object({
  country: z.string().length(2).optional(),
  state: z.string().max(60).nullable().optional(),
  template: z.string().max(60).optional(),
  h1: z.string().min(1).max(300).optional(),
  arabic_title: z.string().max(300).nullable().optional(),
  slug: z.string().min(1).max(300).regex(/^[a-z0-9/-]+$/, 'Lowercase letters, numbers, hyphens and slashes only').optional(),
  meta_title: z.string().min(1).max(100).optional(),
  meta_keyword: z.string().max(500).nullable().optional(),
  meta_description: z.string().max(300).optional(),
  schema_headline: z.string().max(200).nullable().optional(),
  schema_description: z.string().max(1000).nullable().optional(),
  brand_id: z.string().uuid().nullable().optional(),
  model_id: z.string().uuid().nullable().optional(),
  image_png_url: z.string().url().nullable().optional(),
  image_webp_url: z.string().url().nullable().optional(),
  image_title: z.string().max(200).nullable().optional(),
  image_alt: z.string().max(300).nullable().optional(),
  use_dynamic_content: z.boolean().optional(),
  short_description: z.string().max(50000).nullable().optional(),
  arabic_short_description: z.string().max(50000).nullable().optional(),
  arabic_complete_description: z.string().max(100000).nullable().optional(),
  // "Complete Description" maps onto content_json.main_content downstream.
  complete_description: z.string().max(100000).nullable().optional(),
  status: z.enum(['draft', 'published', 'archived']).optional(),
  is_expensive_car: z.boolean().optional(),
  display_in_footer: z.boolean().optional(),
})

export const SeoPageCreateSchema = SeoPageUpdateSchema.extend({
  page_type: z.enum(['brand', 'brand_service', 'brand_location', 'model', 'model_service', 'model_location', 'model_service_location', 'service', 'location']).default('brand'),
  h1: z.string().min(1).max(300),
  slug: z.string().min(1).max(300).regex(/^[a-z0-9/-]+$/),
  meta_title: z.string().min(1).max(100),
  meta_description: z.string().min(1).max(300),
})

export const BulkIdsSchema = z.object({ ids: z.array(z.string().uuid()).min(1).max(200) })

export const AssignSchema = z.object({ user_id: z.string().uuid() })

export const ApproveSchema = z.object({ action: z.enum(['approve', 'reject', 'resubmission_required']) })
