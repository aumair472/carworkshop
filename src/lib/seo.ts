import type { Metadata } from 'next'
import type { SeoJson, SeoSchemaEntryT } from '@/lib/schemas/seo'

export interface SeoDefaults {
  title: string
  description: string
  url: string
  ogImage?: string | null
}

export interface ResolvedSEO {
  title: string
  description: string
  canonical: string
  robots: string
  ogTitle: string
  ogDescription: string
  ogImage: string | null
  schemas: SeoSchemaEntryT[]
  focusKeyword: string | null
  sitemapPriority: number
  changeFreq: string
}

// Merge the admin seo_json overlay with auto-generated defaults.
export function resolveSEO(seoJson: unknown, defaults: SeoDefaults): ResolvedSEO {
  const s = (seoJson ?? {}) as SeoJson
  return {
    title: s.meta_title || defaults.title,
    description: s.meta_description || defaults.description,
    canonical: s.canonical || defaults.url,
    robots: s.robots || 'index,follow',
    ogTitle: s.og_title || s.meta_title || defaults.title,
    ogDescription: s.og_description || s.meta_description || defaults.description,
    ogImage: s.og_image || defaults.ogImage || null,
    schemas: s.schemas ?? [],
    focusKeyword: s.focus_keyword || null,
    sitemapPriority: s.sitemap_priority ?? 0.7,
    changeFreq: s.change_freq || 'weekly',
  }
}

function robotsToObject(robots: string): Metadata['robots'] {
  const noindex = /noindex/.test(robots)
  const nofollow = /nofollow/.test(robots)
  return { index: !noindex, follow: !nofollow, googleBot: { index: !noindex, follow: !nofollow } }
}

// Build the Next.js Metadata block from a ResolvedSEO. Pages spread this into
// their own generateMetadata return so canonical/robots/OG are all admin-driven.
export function seoToMetadata(seo: ResolvedSEO, urlForOg?: string, keywords?: string | null): Metadata {
  return {
    title: seo.title,
    description: seo.description,
    alternates: { canonical: seo.canonical },
    robots: robotsToObject(seo.robots),
    ...(keywords ? { keywords, other: { 'meta-keywords': keywords } } : {}),
    openGraph: {
      title: seo.ogTitle,
      description: seo.ogDescription,
      type: 'website',
      ...(urlForOg ? { url: urlForOg } : {}),
      // Next.js does not deep-merge `openGraph` across metadata segments — a page
      // returning its own openGraph object without `images` silently drops the
      // root layout's default image entirely (rather than inheriting it). Always
      // supply a fallback so every page keeps a valid social preview image.
      images: [{ url: seo.ogImage || '/og-default.jpg', width: 1200, height: 630, alt: 'CarWorkshop.ae' }],
    },
  }
}

export interface SchemaContext {
  faqs?: Array<{ question: string; answer: string }>
  serviceName?: string
  price?: number | null
}

// Convert admin-defined schema entries into JSON-LD strings. Auto schemas are
// already emitted by the pages themselves; this renders the custom additions.
export function renderSchemas(schemas: SeoSchemaEntryT[], ctx: SchemaContext = {}): string[] {
  const out: string[] = []
  for (const entry of schemas) {
    try {
      if (entry.type === 'custom' && entry.json) {
        JSON.parse(entry.json) // validate
        out.push(entry.json)
        continue
      }
      if (entry.type === 'FAQPage' && (entry.auto || !entry.data) && ctx.faqs?.length) {
        out.push(JSON.stringify({
          '@context': 'https://schema.org',
          '@type': 'FAQPage',
          mainEntity: ctx.faqs.map(f => ({ '@type': 'Question', name: f.question, acceptedAnswer: { '@type': 'Answer', text: f.answer } })),
        }))
        continue
      }
      if (entry.data && Object.keys(entry.data).length > 0) {
        out.push(JSON.stringify({ '@context': 'https://schema.org', '@type': entry.type, ...entry.data }))
      }
    } catch { /* skip invalid */ }
  }
  return out
}
