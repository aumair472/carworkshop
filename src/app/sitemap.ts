import type { MetadataRoute } from 'next'
import { createServiceClient } from '@/lib/supabase/service'
import type { SeoJson } from '@/lib/schemas/seo'

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://carworkshop.ae'

// Google allows 50k URLs per sitemap file; stay under with headroom.
const CHUNK = 45000

// Cache the rendered sitemap for 6h instead of rebuilding on every crawl.
// Newly published pages appear within this window.
export const revalidate = 21600

type Freq = MetadataRoute.Sitemap[number]['changeFrequency']

// In-memory static routes (always first).
const STATIC_PAGES: MetadataRoute.Sitemap = [
  { url: BASE_URL, lastModified: new Date(), changeFrequency: 'weekly', priority: 1 },
  { url: `${BASE_URL}/services`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.9 },
  { url: `${BASE_URL}/brands`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.9 },
  { url: `${BASE_URL}/locations`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.9 },
  { url: `${BASE_URL}/blog`, lastModified: new Date(), changeFrequency: 'daily', priority: 0.8 },
  { url: `${BASE_URL}/about`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.5 },
  { url: `${BASE_URL}/contact`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.7 },
]

// Ordered list of DB-backed URL sources. `path` builds the public URL from a row slug.
type Table = 'brands' | 'services' | 'locations' | 'blog_posts' | 'generated_pages'
interface Segment { table: Table; path: (slug: string) => string; freq: Freq; priority: number }

const SEGMENTS: Segment[] = [
  { table: 'brands', path: s => `${BASE_URL}/brands/${s}`, freq: 'weekly', priority: 0.8 },
  { table: 'services', path: s => `${BASE_URL}/services/${s}`, freq: 'weekly', priority: 0.8 },
  { table: 'locations', path: s => `${BASE_URL}/locations/${s}`, freq: 'weekly', priority: 0.7 },
  { table: 'blog_posts', path: s => `${BASE_URL}/blog/${s}`, freq: 'monthly', priority: 0.6 },
  // Programmatic pages (model hubs, model+service, brand+service, 4D). slug is the
  // full path under /brands, e.g. "audi/a4/oil-change/dubai".
  { table: 'generated_pages', path: s => `${BASE_URL}/brands/${s}`, freq: 'weekly', priority: 0.6 },
]

interface Row { slug: string; updated_at: string; seo_json: SeoJson | null }

function countPublished(table: Table) {
  const supabase = createServiceClient()
  return supabase.from(table).select('*', { count: 'exact', head: true }).eq('status', 'published')
}

// Fetch [localStart, localEnd) of a table's published rows in stable slug order.
// Pages internally in 1000-row steps so we never hit PostgREST's per-request
// max-rows cap (Supabase default ~1000), no matter how large the slice.
const PAGE = 1000
async function fetchSlice(table: Table, localStart: number, localEnd: number): Promise<Row[]> {
  const supabase = createServiceClient()
  const rows: Row[] = []
  for (let from = localStart; from < localEnd; from += PAGE) {
    const to = Math.min(from + PAGE, localEnd) - 1
    const { data } = await supabase
      .from(table)
      .select('slug, updated_at, seo_json')
      .eq('status', 'published')
      .order('slug', { ascending: true })
      .range(from, to)
    if (!data || data.length === 0) break
    rows.push(...(data as Row[]))
  }
  return rows
}

function toEntry(row: Row, seg: Segment): MetadataRoute.Sitemap[number] {
  const seo = row.seo_json ?? {}
  return {
    url: seg.path(row.slug),
    lastModified: new Date(row.updated_at),
    changeFrequency: (seo.change_freq as Freq) ?? seg.freq,
    priority: typeof seo.sitemap_priority === 'number' ? seo.sitemap_priority : seg.priority,
  }
}

// Total URL count across static + all published DB rows.
async function totalCount(): Promise<number> {
  const counts = await Promise.all(SEGMENTS.map(s => countPublished(s.table)))
  const dyn = counts.reduce((sum, c) => sum + (c.count ?? 0), 0)
  return STATIC_PAGES.length + dyn
}

// Number of sitemap shard files. Shared by generateSitemaps (Next) and the
// custom sitemap-index route (Next doesn't auto-generate an index).
export async function getShardCount(): Promise<number> {
  if (!process.env.SUPABASE_SERVICE_ROLE_KEY) return 1
  const total = await totalCount()
  return Math.max(1, Math.ceil(total / CHUNK))
}

// Next.js calls this to discover how many sitemap files to emit.
export async function generateSitemaps() {
  const shards = await getShardCount()
  return Array.from({ length: shards }, (_, i) => ({ id: i }))
}

export default async function sitemap({ id }: { id: Promise<string> }): Promise<MetadataRoute.Sitemap> {
  const shard = Number(await id) || 0
  const winStart = shard * CHUNK
  const winEnd = winStart + CHUNK

  if (!process.env.SUPABASE_SERVICE_ROLE_KEY) return STATIC_PAGES

  const out: MetadataRoute.Sitemap = []
  let base = 0

  // Static routes occupy the first slots.
  {
    const localStart = Math.max(0, winStart - base)
    const localEnd = Math.min(STATIC_PAGES.length, winEnd - base)
    if (localStart < localEnd) out.push(...STATIC_PAGES.slice(localStart, localEnd))
    base += STATIC_PAGES.length
  }

  // Walk DB segments; fetch only the slice overlapping this shard's window.
  const counts = await Promise.all(SEGMENTS.map(s => countPublished(s.table)))
  for (let i = 0; i < SEGMENTS.length; i++) {
    const seg = SEGMENTS[i]
    const cnt = counts[i].count ?? 0
    const localStart = Math.max(0, winStart - base)
    const localEnd = Math.min(cnt, winEnd - base)
    if (localStart < localEnd) {
      const rows = await fetchSlice(seg.table, localStart, localEnd)
      out.push(...rows.map(r => toEntry(r, seg)))
    }
    base += cnt
    if (base >= winEnd) break
  }

  return out
}
