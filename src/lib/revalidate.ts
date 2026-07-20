import { revalidatePath } from 'next/cache'

export type RevalidateType =
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
  'blog-listing': ['/blog'],
  blog: ['/blog'],
}

// Single source of truth for which public paths an entity change must refresh.
// Used by both the direct helper (admin routes) and the /api/revalidate webhook.
export function pathsForRevalidate(type: RevalidateType, slug?: string): string[] {
  switch (type) {
    case 'blog': return [`/blog/${slug}`, '/blog']
    case 'generated': {
      // slug is the full page path (e.g. "dubai/audi/oil-change"); every
      // ancestor segment (state hub, brand hub) may also embed this page in
      // its own auto-assembled sections, so refresh the whole chain.
      if (!slug) return []
      const parts = slug.split('/')
      const out = [`/${slug}`]
      for (let i = 1; i < parts.length; i++) out.push(`/${parts.slice(0, i).join('/')}`)
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
