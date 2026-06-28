import { z } from 'zod'
import { PageContentJsonSchema } from './page-content'

const FAQItemSchema = z.object({
  question: z.string().min(1).max(500),
  answer: z.string().min(1).max(2000),
})

export const CreateLocationSchema = z.object({
  name: z.string().min(1, 'Location name is required').max(100).trim(),
  slug: z.string().min(1).max(120).trim().optional(),
  emirate: z.enum(['Dubai', 'Abu Dhabi', 'Sharjah', 'Ajman', 'Ras Al Khaimah', 'Umm Al Quwain', 'Fujairah']),
  address: z.string().max(500).trim().optional().nullable(),
  lat: z.number().min(-90).max(90).optional().nullable(),
  lng: z.number().min(-180).max(180).optional().nullable(),
  description: z.string().max(10000).optional().nullable(),
  maps_embed_url: z.string().url().optional().nullable(),
  faq_json: z.array(FAQItemSchema).default([]),
  seo_title: z.string().max(60).trim().optional().nullable(),
  seo_description: z.string().max(160).trim().optional().nullable(),
  status: z.enum(['draft', 'published', 'archived']).default('draft'),
  sort_order: z.number().int().min(0).default(0),
  content_json: PageContentJsonSchema.optional(),
})

export const UpdateLocationSchema = CreateLocationSchema.partial()

export type CreateLocationInput = z.infer<typeof CreateLocationSchema>
export type UpdateLocationInput = z.infer<typeof UpdateLocationSchema>
