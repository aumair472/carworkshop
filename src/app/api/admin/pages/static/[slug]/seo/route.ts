import { NextRequest } from 'next/server'
import { handleSeoUpdate } from '@/lib/seo-route'
import { STATIC_PAGE_PATHS } from '../../route'

// Static pages keyed by slug (home/about/contact/faq/privacy/terms + *-listing).
export async function PUT(req: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  return handleSeoUpdate(req, {
    table: 'static_pages',
    idColumn: 'slug',
    idValue: slug,
    pathFor: () => STATIC_PAGE_PATHS[slug] ?? `/${slug}`,
  })
}
