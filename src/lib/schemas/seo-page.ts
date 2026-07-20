import { z } from 'zod'

export const TEMPLATE_TYPES = ['brand', 'brand_service', 'brand_model', 'brand_model_service', 'general_service'] as const
export type TemplateTypeValue = (typeof TEMPLATE_TYPES)[number]

// Templates that require a car make selection (all but general_service).
export const TEMPLATES_REQUIRING_BRAND: TemplateTypeValue[] = ['brand', 'brand_service', 'brand_model', 'brand_model_service']
// Templates that require a car model selection (page blocked without one).
export const TEMPLATES_REQUIRING_MODEL: TemplateTypeValue[] = ['brand_model', 'brand_model_service']

// SEO Page editor payload (generated_pages) — 5-template system.
export const SeoPageUpdateSchema = z.object({
  country: z.string().length(2).optional(),
  state: z.string().max(60).nullable().optional(),
  template_type: z.enum(TEMPLATE_TYPES).optional(),
  h1: z.string().min(1).max(300).optional(),
  arabic_title: z.string().max(300).nullable().optional(),
  slug: z.string().min(1).max(300).regex(/^[a-z0-9/-]+$/, 'Lowercase letters, numbers, hyphens and slashes only').optional(),
  meta_title: z.string().min(1).max(100).optional(),
  meta_keyword: z.string().max(500).nullable().optional(),
  meta_description: z.string().max(300).optional(),
  brand_id: z.string().uuid().nullable().optional(),
  model_id: z.string().uuid().nullable().optional(),
  short_description: z.string().max(50000).nullable().optional(),
  arabic_short_description: z.string().max(50000).nullable().optional(),
  arabic_complete_description: z.string().max(100000).nullable().optional(),
  // "Complete Description" maps onto content_json.main_content downstream.
  complete_description: z.string().max(100000).nullable().optional(),
  status: z.enum(['draft', 'published', 'archived']).optional(),
  display_in_footer: z.boolean().optional(),
  content_json: z.record(z.string(), z.unknown()).nullable().optional(),
})

export const SeoPageCreateSchema = SeoPageUpdateSchema.extend({
  template_type: z.enum(TEMPLATE_TYPES).default('general_service'),
  h1: z.string().min(1).max(300),
  slug: z.string().min(1).max(300).regex(/^[a-z0-9/-]+$/),
  meta_title: z.string().min(1).max(100),
  meta_description: z.string().min(1).max(300),
}).superRefine((data, ctx) => {
  if (TEMPLATES_REQUIRING_BRAND.includes(data.template_type) && !data.brand_id) {
    ctx.addIssue({ code: 'custom', path: ['brand_id'], message: 'Car Make is required for this template' })
  }
  if (TEMPLATES_REQUIRING_MODEL.includes(data.template_type) && !data.model_id) {
    ctx.addIssue({ code: 'custom', path: ['model_id'], message: 'Car Model is required for this template' })
  }
})

export const BulkIdsSchema = z.object({ ids: z.array(z.string().uuid()).min(1).max(200) })

export const AssignSchema = z.object({ user_id: z.string().uuid() })

export const ApproveSchema = z.object({ action: z.enum(['approve', 'reject', 'resubmission_required']) })
