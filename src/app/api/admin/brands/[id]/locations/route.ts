import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabase } from '@/lib/supabase/server'
import { createServiceClient } from '@/lib/supabase/service'
import { logAudit } from '@/lib/audit'
import { z } from 'zod'

interface RouteContext {
  params: Promise<{ id: string }>
}

const AssignSchema = z.object({
  location_ids: z.array(z.string().uuid()).max(200),
})

export async function GET(_req: NextRequest, { params }: RouteContext) {
  try {
    const { id } = await params
    const supabase = await createServerSupabase()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const service = createServiceClient()
    const { data, error } = await service.from('brand_location_map').select('location_id').eq('brand_id', id).eq('is_active', true)
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })

    return NextResponse.json({ location_ids: (data ?? []).map(r => r.location_id) })
  } catch (err) {
    console.error('GET /api/admin/brands/[id]/locations:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// Replace the full set of assigned locations for this brand.
export async function PUT(req: NextRequest, { params }: RouteContext) {
  try {
    const { id } = await params
    const supabase = await createServerSupabase()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const body: unknown = await req.json()
    const parsed = AssignSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ error: 'Invalid data', details: parsed.error.flatten().fieldErrors }, { status: 400 })
    }

    const service = createServiceClient()
    const { error: delErr } = await service.from('brand_location_map').delete().eq('brand_id', id)
    if (delErr) return NextResponse.json({ error: delErr.message }, { status: 500 })

    if (parsed.data.location_ids.length > 0) {
      const rows = parsed.data.location_ids.map(location_id => ({ brand_id: id, location_id, is_active: true }))
      const { error } = await service.from('brand_location_map').insert(rows)
      if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    }

    await logAudit({ userId: user.id, action: 'update', table: 'brand_location_map', recordId: id })
    return NextResponse.json({ success: true, count: parsed.data.location_ids.length })
  } catch (err) {
    console.error('PUT /api/admin/brands/[id]/locations:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
