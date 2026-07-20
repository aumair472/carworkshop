import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/service'
import { getActingUser } from '@/lib/auth-guard'

// Service Content = generated_pages using a service-ish template. Editing goes
// through /api/admin/seo-pages/[id].
const SERVICE_TEMPLATE_TYPES = ['brand_service', 'brand_model_service', 'general_service'] as const

export async function GET(req: NextRequest) {
  try {
    const acting = await getActingUser()
    if (!acting) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const sp = req.nextUrl.searchParams
    const service = createServiceClient()
    let query = service
      .from('generated_pages')
      .select('id, template_type, brand_id, slug, h1, status, approval_status, assignee_id, assigned_at, created_by, country, state, updated_at, generated_at')
      .in('template_type', [...SERVICE_TEMPLATE_TYPES])
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
