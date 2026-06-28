import { NextResponse } from 'next/server'
import { createServerSupabase } from '@/lib/supabase/server'
import { createServiceClient } from '@/lib/supabase/service'

// Canonical static pages managed by the CMS.
export const STATIC_PAGES: Array<{ slug: string; title: string }> = [
  { slug: 'home', title: 'Home' },
  { slug: 'about', title: 'About' },
  { slug: 'contact', title: 'Contact' },
  { slug: 'faq', title: 'FAQ' },
  { slug: 'privacy', title: 'Privacy Policy' },
  { slug: 'terms', title: 'Terms & Conditions' },
  { slug: 'services-listing', title: 'Services List Page' },
  { slug: 'brands-listing', title: 'Brands List Page' },
  { slug: 'locations-listing', title: 'Locations List Page' },
  { slug: 'blog-listing', title: 'Blog List Page' },
]

// Maps a static-page slug to the public path(s) to revalidate after save.
export const STATIC_PAGE_PATHS: Record<string, string> = {
  home: '/',
  'services-listing': '/services',
  'brands-listing': '/brands',
  'locations-listing': '/locations',
  'blog-listing': '/blog',
}

export async function GET() {
  try {
    const supabase = await createServerSupabase()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const service = createServiceClient()
    const { data: existing } = await service.from('static_pages').select('id, slug, title, status, updated_at')
    const bySlug = new Map((existing ?? []).map(r => [r.slug, r]))

    const pages = STATIC_PAGES.map(p => {
      const row = bySlug.get(p.slug)
      return {
        slug: p.slug,
        title: row?.title ?? p.title,
        status: row?.status ?? 'draft',
        updated_at: row?.updated_at ?? null,
        exists: !!row,
      }
    })

    return NextResponse.json({ pages })
  } catch (err) {
    console.error('GET /api/admin/pages/static:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
