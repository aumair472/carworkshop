import { z } from 'zod'

export const CreateBlogPostSchema = z.object({
  title: z.string().min(1, 'Title is required').max(300).trim(),
  slug: z.string().min(1).max(320).trim().optional(),
  excerpt: z.string().max(500).trim().optional().nullable(),
  content: z.string().optional().nullable(),
  featured_image: z.string().url().optional().nullable(),
  author_id: z.string().uuid().optional().nullable(),
  category_id: z.string().uuid().optional().nullable(),
  seo_title: z.string().max(60).trim().optional().nullable(),
  seo_description: z.string().max(160).trim().optional().nullable(),
  status: z.enum(['draft', 'published', 'archived']).default('draft'),
  published_at: z.string().datetime().optional().nullable(),
  scheduled_at: z.string().datetime().optional().nullable(),
  tag_ids: z.array(z.string().uuid()).default([]),
})

export const UpdateBlogPostSchema = CreateBlogPostSchema.partial()

export const CreateBlogCategorySchema = z.object({
  name: z.string().min(1).max(100).trim(),
  slug: z.string().min(1).max(120).trim().optional(),
  description: z.string().max(500).trim().optional().nullable(),
})

export type CreateBlogPostInput = z.infer<typeof CreateBlogPostSchema>
export type UpdateBlogPostInput = z.infer<typeof UpdateBlogPostSchema>
export type CreateBlogCategoryInput = z.infer<typeof CreateBlogCategorySchema>
