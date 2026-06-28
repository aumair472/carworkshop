import { NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/service'
import { getActingUser } from '@/lib/auth-guard'
import { SEO_ROLES } from '@/lib/seo-route'

// SEO health metrics across all published generated pages. Available to every
// role that can edit SEO (including seo_editor).
export async function GET() {
  try {
    const acting = await getActingUser()
    if (!acting) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    if (!SEO_ROLES.includes(acting.role)) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

    const sb = createServiceClient()
    const base = () => sb.from('generated_pages').select('*', { count: 'exact', head: true }).eq('status', 'published')

    const [total, noMetaTitle, noMetaDesc, noindex, withCustom] = await Promise.all([
      base(),
      base().or('meta_title.is.null,meta_title.eq.'),
      base().or('meta_description.is.null,meta_description.eq.'),
      base().ilike('seo_json->>robots', '%noindex%'),
      base().neq('seo_json', '{}'),
    ])

    return NextResponse.json({
      total: total.count ?? 0,
      missingMetaTitle: noMetaTitle.count ?? 0,
      missingMetaDescription: noMetaDesc.count ?? 0,
      noindex: noindex.count ?? 0,
      withCustomSeo: withCustom.count ?? 0,
    })
  } catch (err) {
    console.error('GET /api/admin/seo/health:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
