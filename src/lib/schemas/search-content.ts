import { z } from 'zod'

export const SearchContentCreateSchema = z.object({
  title: z.string().min(1).max(300),
  url: z.string().min(1).max(500),
  keywords: z.array(z.string().max(100)).max(50).default([]),
  description: z.string().max(2000).nullable().optional(),
  display_order: z.number().int().min(0).default(0),
  is_active: z.boolean().default(true),
})

export const SearchContentUpdateSchema = SearchContentCreateSchema.partial()
