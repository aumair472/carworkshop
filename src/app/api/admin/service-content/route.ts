import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/service'
import { getActingUser } from '@/lib/auth-guard'

// Service Content = generated_pages of service-ish page types (service pages,
// brand service pages, location pages). Editing goes through /api/admin/seo-pages/[id].
const SERVICE_PAGE_TYPES = ['service', 'brand_service', 'model_service', 'model_service_location', 'brand_location', 'model_location', 'location'] as const

export async function GET(req: NextRequest) {
  try {
    const acting = await getActingUser()
    if (!acting) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const sp = req.nextUrl.searchParams
    const service = createServiceClient()
    let query = service
      .from('generated_pages')
      .select('id, page_type, brand_id, slug, h1, status, approval_status, assignee_id, assigned_at, created_by, country, state, updated_at, generated_at')
      .in('page_type', [...SERVICE_PAGE_TYPES])
      .order('updated_at', { ascending: false })

    if (sp.get('name')) query = query.ilike('h1', `%${sp.get('name')!}%`)

    const { data, error } = await query.limit(2000)
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ pages: data })
  } catch (err) {
    console.error('GET /api/admin/service-content:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
