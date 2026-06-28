import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabase } from '@/lib/supabase/server'
import { createServiceClient } from '@/lib/supabase/service'
import type { ContentStatus, PageType } from '@/types'

export async function GET(req: NextRequest) {
  try {
    const supabase = await createServerSupabase()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const sp = new URL(req.url).searchParams
    const search = sp.get('search')?.trim() ?? ''
    const type = sp.get('type') ?? ''
    const brandId = sp.get('brand') ?? ''
    const status = sp.get('status') ?? ''
    const page = Math.max(1, Number(sp.get('page') ?? '1') || 1)
    const limit = Math.min(100, Math.max(1, Number(sp.get('limit') ?? '20') || 20))
    const from = (page - 1) * limit
    const to = from + limit - 1

    const service = createServiceClient()
    let query = service
      .from('generated_pages')
      .select('id, slug, h1, page_type, status, brand_id, model_id, service_id, location_id, updated_at', { count: 'exact' })

    if (search) query = query.or(`slug.ilike.%${search}%,h1.ilike.%${search}%`)
    if (type) query = query.eq('page_type', type as PageType)
    if (brandId) query = query.eq('brand_id', brandId)
    if (status) query = query.eq('status', status as ContentStatus)

    query = query.order('updated_at', { ascending: false }).range(from, to)

    const { data, count, error } = await query
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })

    const total = count ?? 0
    return NextResponse.json({
      pages: data ?? [],
      total,
      totalPages: Math.max(1, Math.ceil(total / limit)),
      page,
    })
  } catch (err) {
    console.error('GET /api/admin/pages:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
