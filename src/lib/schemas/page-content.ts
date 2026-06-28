import { z } from 'zod'

// Editable content_json overlay shared by generated_pages and the hub tables
// (brands, services, locations, static_pages). Every field is optional; public
// pages fall back to auto-generated values when a field is absent.
export const PageContentJsonSchema = z.object({
  hero: z.object({
    h1: z.string().max(200).optional(),
    subheadline: z.string().max(300).optional(),
    image_url: z.string().url().nullable().optional(),
  }).optional(),
  main_content: z.string().max(50000).nullable().optional(),
  service_details: z.object({
    price: z.number().min(0).max(99999).nullable().optional(),
    includes: z.array(z.string().max(200)).max(30).optional(),
  }).optional(),
  faqs: z.array(z.object({ q: z.string().max(500), a: z.string().max(2000) })).max(30).optional(),
  why_choose_us: z.object({
    visible: z.boolean().optional(),
    heading: z.string().max(200).optional(),
    items: z.array(z.object({
      icon: z.string().max(20).optional(),
      title: z.string().max(120).optional(),
      description: z.string().max(500).optional(),
    })).max(12).optional(),
  }).optional(),
  cta: z.object({
    headline: z.string().max(200).optional(),
    button_text: z.string().max(60).optional(),
    button_link: z.string().max(300).optional(),
  }).optional(),
})

export type PageContentJson = z.infer<typeof PageContentJsonSchema>
