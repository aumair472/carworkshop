import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabase } from '@/lib/supabase/server'
import { createServiceClient } from '@/lib/supabase/service'

interface RouteContext {
  params: Promise<{ id: string }>
}

export async function GET(_req: NextRequest, { params }: RouteContext) {
  try {
    const { id } = await params
    const supabase = await createServerSupabase()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const service = createServiceClient()
    const { data, error } = await service.from('brand_models').select('*').eq('brand_id', id).order('sort_order')
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })

    return NextResponse.json({ models: data })
  } catch (err) {
    console.error('GET /api/admin/brands/[id]/models:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
