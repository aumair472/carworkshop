import { z } from 'zod'

export const ROBOTS_OPTIONS = ['index,follow', 'index,nofollow', 'noindex,follow', 'noindex,nofollow'] as const
export const CHANGE_FREQ_OPTIONS = ['always', 'hourly', 'daily', 'weekly', 'monthly', 'yearly', 'never'] as const
export const SCHEMA_TYPES = ['Service', 'FAQPage', 'LocalBusiness', 'Article', 'HowTo', 'BreadcrumbList', 'Organization', 'WebPage', 'Product', 'Review', 'custom'] as const

// One admin-defined structured-data block.
export const SeoSchemaEntry = z.object({
  type: z.enum(SCHEMA_TYPES),
  auto: z.boolean().optional(),
  data: z.record(z.string(), z.unknown()).optional(),
  json: z.string().max(20000).optional(),
})

// Per-page SEO overlay stored in <table>.seo_json. Everything optional.
export const SeoJsonSchema = z.object({
  meta_title: z.string().max(120).optional(),
  meta_description: z.string().max(320).optional(),
  canonical: z.string().max(500).optional(),
  robots: z.enum(ROBOTS_OPTIONS).optional(),
  og_title: z.string().max(200).optional(),
  og_description: z.string().max(400).optional(),
  og_image: z.string().max(1000).nullable().optional(),
  focus_keyword: z.string().max(120).optional(),
  sitemap_priority: z.number().min(0).max(1).optional(),
  change_freq: z.enum(CHANGE_FREQ_OPTIONS).optional(),
  hreflang: z.array(z.object({ lang: z.string().max(10), url: z.string().max(500) })).max(30).optional(),
  schemas: z.array(SeoSchemaEntry).max(20).optional(),
}).strip()

export type SeoJson = z.infer<typeof SeoJsonSchema>
export type SeoSchemaEntryT = z.infer<typeof SeoSchemaEntry>
