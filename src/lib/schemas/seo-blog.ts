import { z } from 'zod'

// SMC-style SEO Blog editor payload (blog_posts).
export const SeoBlogUpdateSchema = z.object({
  country: z.string().length(2).optional(),
  state: z.string().max(60).nullable().optional(),
  published_at: z.string().nullable().optional(),
  title: z.string().min(1).max(300).optional(),
  arabic_title: z.string().max(300).nullable().optional(),
  slug: z.string().min(1).max(300).regex(/^[a-z0-9-]+$/, 'Lowercase letters, numbers and hyphens only').optional(),
  seo_title: z.string().max(100).nullable().optional(),
  meta_keyword: z.string().max(500).nullable().optional(),
  seo_description: z.string().max(300).nullable().optional(),
  image_png_url: z.string().url().nullable().optional(),
  image_webp_url: z.string().url().nullable().optional(),
  image_title: z.string().max(200).nullable().optional(),
  image_alt: z.string().max(300).nullable().optional(),
  excerpt: z.string().max(2000).nullable().optional(),
  arabic_excerpt: z.string().max(2000).nullable().optional(),
  blockquote: z.string().max(2000).nullable().optional(),
  arabic_blockquote: z.string().max(2000).nullable().optional(),
  content: z.string().max(200000).nullable().optional(),
  arabic_content: z.string().max(200000).nullable().optional(),
  tags: z.string().max(1000).nullable().optional(),
  tags_ar: z.string().max(1000).nullable().optional(),
  status: z.enum(['draft', 'published', 'archived']).optional(),
  is_featured: z.boolean().optional(),
})

export const SeoBlogCreateSchema = SeoBlogUpdateSchema.extend({
  title: z.string().min(1).max(300),
  slug: z.string().min(1).max(300).regex(/^[a-z0-9-]+$/),
})
