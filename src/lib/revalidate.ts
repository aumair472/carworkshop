import { revalidatePath } from 'next/cache'

export type RevalidateType =
  | 'brand'
  | 'service'
  | 'location'
  | 'blog'
  | 'generated'
  | 'static'
  | 'all'

// Static-page slug → public path(s). Covers content pages + listing slugs.
const STATIC_PATHS: Record<string, string[]> = {
  home: ['/'],
  about: ['/about'],
  contact: ['/contact'],
  faq: ['/faq'],
  privacy: ['/privacy'],
  terms: ['/terms'],
  'services-listing': ['/services'],
  'brands-listing': ['/brands'],
  'locations-listing': ['/locations'],
  'blog-listing': ['/blog'],
  brands: ['/brands'],
  blog: ['/blog'],
}

// Single source of truth for which public paths an entity change must refresh.
// Used by both the direct helper (admin routes) and the /api/revalidate webhook.
export function pathsForRevalidate(type: RevalidateType, slug?: string): string[] {
  switch (type) {
    case 'brand': return [`/brands/${slug}`, '/brands', '/']
    case 'service': return [`/services/${slug}`, '/services', '/']
    case 'location': return [`/locations/${slug}`, '/locations']
    case 'blog': return [`/blog/${slug}`, '/blog']
    case 'generated': {
      // slug is the full path under /brands, e.g. "audi/a4/oil-change".
      if (!slug) return []
      const parts = slug.split('/')
      const out = [`/brands/${slug}`]
      if (parts.length >= 2) out.push(`/brands/${parts[0]}`)          // brand hub
      if (parts.length >= 3) out.push(`/brands/${parts[0]}/${parts[1]}`) // model hub
      return out
    }
    case 'static': return slug ? (STATIC_PATHS[slug] ?? [`/${slug}`]) : []
    case 'all': return ['/']
    default: return []
  }
}

// Direct, in-process ISR invalidation for use inside admin API routes (after a
// successful save). No HTTP round-trip — calls revalidatePath directly, same as
// the SEO handler. Always best-effort: never throws, never fails the save.
export async function revalidatePage(type: RevalidateType, slug?: string): Promise<void> {
  try {
    if (type === 'all') { revalidatePath('/', 'layout'); return }
    for (const p of pathsForRevalidate(type, slug)) {
      try { revalidatePath(p) } catch { /* best-effort per path */ }
    }
  } catch (err) {
    console.error('revalidatePage error:', err)
  }
}
