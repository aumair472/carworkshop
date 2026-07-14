import { z } from 'zod'

export const LanguageKeyCreateSchema = z.object({
  key_name: z.string().min(1).max(500),
  slug: z.string().min(1).max(200).regex(/^[a-z0-9_]+$/, 'Lowercase letters, numbers and underscores only'),
  value_en: z.string().max(5000).default(''),
  value_ar: z.string().max(5000).default(''),
  comment: z.string().max(1000).nullable().optional(),
  is_published: z.boolean().default(true),
})

export const LanguageKeyUpdateSchema = LanguageKeyCreateSchema.partial()
