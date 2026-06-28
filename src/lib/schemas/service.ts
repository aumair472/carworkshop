import { z } from 'zod'
import { PageContentJsonSchema } from './page-content'

const FAQItemSchema = z.object({
  question: z.string().min(1).max(500),
  answer: z.string().min(1).max(2000),
})

export const CreateServiceSchema = z.object({
  name: z.string().min(1, 'Service name is required').max(100).trim(),
  slug: z.string().min(1).max(120).trim().optional(),
  short_description: z.string().max(300).trim().optional().nullable(),
  content: z.string().max(50000).optional().nullable(),
  icon_url: z.string().url().optional().nullable(),
  image_url: z.string().url().optional().nullable(),
  starting_price: z.number().min(0).max(99999).optional().nullable(),
  includes_json: z.array(z.string()).default([]),
  faq_json: z.array(FAQItemSchema).default([]),
  seo_title: z.string().max(60).trim().optional().nullable(),
  seo_description: z.string().max(160).trim().optional().nullable(),
  og_image_url: z.string().url().optional().nullable(),
  schema_type: z.string().default('Service'),
  status: z.enum(['draft', 'published', 'archived']).default('draft'),
  sort_order: z.number().int().min(0).default(0),
  content_json: PageContentJsonSchema.optional(),
})

export const UpdateServiceSchema = CreateServiceSchema.partial()

export type CreateServiceInput = z.infer<typeof CreateServiceSchema>
export type UpdateServiceInput = z.infer<typeof UpdateServiceSchema>
