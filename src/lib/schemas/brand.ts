import { z } from 'zod'

export const CreateBrandSchema = z.object({
  name: z.string().min(1, 'Brand name is required').max(100).trim(),
  slug: z.string().min(1).max(120).trim().optional(),
  description: z.string().max(5000).trim().optional(),
  common_issues: z.string().max(10000).trim().optional(),
  logo_url: z.string().url().optional().nullable(),
  hero_image_url: z.string().url().optional().nullable(),
  seo_title: z.string().max(60).trim().optional().nullable(),
  seo_description: z.string().max(160).trim().optional().nullable(),
  og_image_url: z.string().url().optional().nullable(),
  status: z.enum(['draft', 'published', 'archived']).default('draft'),
  sort_order: z.number().int().min(0).default(0),
})

export const UpdateBrandSchema = CreateBrandSchema.partial()

export type CreateBrandInput = z.infer<typeof CreateBrandSchema>
export type UpdateBrandInput = z.infer<typeof UpdateBrandSchema>
