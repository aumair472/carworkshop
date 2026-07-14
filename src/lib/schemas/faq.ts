import { z } from 'zod'

export const FaqCreateSchema = z.object({
  country: z.string().length(2).default('AE'),
  name: z.string().min(1).max(500),
  arabic_name: z.string().max(500).nullable().optional(),
  description_html: z.string().max(50000).default(''),
  arabic_description_html: z.string().max(50000).default(''),
  display_order: z.number().int().min(0).default(0),
  is_active: z.boolean().default(true),
})

export const FaqUpdateSchema = FaqCreateSchema.partial()

export const FaqReorderSchema = z.object({
  id: z.string().uuid(),
  direction: z.enum(['up', 'down']),
})
