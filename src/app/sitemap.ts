import type { MetadataRoute } from 'next'
import { createServiceClient } from '@/lib/supabase/service'

const BASE_URL = 'https://carworkshop.ae'

export const dynamic = 'force-dynamic'

const STATIC_PAGES: MetadataRoute.Sitemap = [
  { url: BASE_URL, lastModified: new Date(), changeFrequency: 'weekly', priority: 1 },
  { url: `${BASE_URL}/services`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.9 },
  { url: `${BASE_URL}/brands`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.9 },
  { url: `${BASE_URL}/locations`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.9 },
  { url: `${BASE_URL}/blog`, lastModified: new Date(), changeFrequency: 'daily', priority: 0.8 },
  { url: `${BASE_URL}/about`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.5 },
  { url: `${BASE_URL}/contact`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.7 },
]

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  if (!process.env.SUPABASE_SERVICE_ROLE_KEY) return STATIC_PAGES

  const supabase = createServiceClient()

  const [{ data: brands }, { data: services }, { data: locations }, { data: posts }, { data: models }] = await Promise.all([
    supabase.from('brands').select('slug, updated_at').eq('status', 'published'),
    supabase.from('services').select('slug, updated_at').eq('status', 'published'),
    supabase.from('locations').select('slug, updated_at').eq('status', 'published'),
    supabase.from('blog_posts').select('slug, updated_at').eq('status', 'published'),
    supabase.from('brand_models').select('slug, updated_at').eq('status', 'published'),
  ])

  const brandPages: MetadataRoute.Sitemap = (brands ?? []).map(b => ({
    url: `${BASE_URL}/brands/${b.slug}`,
    lastModified: new Date(b.updated_at),
    changeFrequency: 'weekly',
    priority: 0.8,
  }))

  const servicePages: MetadataRoute.Sitemap = (services ?? []).map(s => ({
    url: `${BASE_URL}/services/${s.slug}`,
    lastModified: new Date(s.updated_at),
    changeFrequency: 'weekly',
    priority: 0.8,
  }))

  const locationPages: MetadataRoute.Sitemap = (locations ?? []).map(l => ({
    url: `${BASE_URL}/locations/${l.slug}`,
    lastModified: new Date(l.updated_at),
    changeFrequency: 'weekly',
    priority: 0.7,
  }))

  const blogPages: MetadataRoute.Sitemap = (posts ?? []).map(p => ({
    url: `${BASE_URL}/blog/${p.slug}`,
    lastModified: new Date(p.updated_at),
    changeFrequency: 'monthly',
    priority: 0.6,
  }))

  const modelPages: MetadataRoute.Sitemap = (models ?? []).map(m => ({
    url: `${BASE_URL}/models/${m.slug}`,
    lastModified: new Date(m.updated_at),
    changeFrequency: 'weekly' as const,
    priority: 0.7,
  }))

  return [...STATIC_PAGES, ...brandPages, ...servicePages, ...locationPages, ...blogPages, ...modelPages]
}
