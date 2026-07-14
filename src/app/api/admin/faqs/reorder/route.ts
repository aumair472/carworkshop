import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/service'
import { getActingUser } from '@/lib/auth-guard'
import { logAudit } from '@/lib/audit'
import { revalidatePage } from '@/lib/revalidate'
import { FaqReorderSchema } from '@/lib/schemas/faq'

// PUT /api/admin/faqs/reorder — swap display_order with the neighbour in the
// same country (▲▼ arrows in the FAQ table).
export async function PUT(req: NextRequest) {
  try {
    const acting = await getActingUser()
    if (!acting) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const body: unknown = await req.json()
    const parsed = FaqReorderSchema.safeParse(body)
    if (!parsed.success) return NextResponse.json({ error: 'Invalid data' }, { status: 400 })

    const { id, direction } = parsed.data
    const service = createServiceClient()

    const { data: current } = await service.from('faqs').select('id, country, display_order').eq('id', id).single()
    if (!current) return NextResponse.json({ error: 'Not found' }, { status: 404 })

    const neighbourQuery = service.from('faqs').select('id, display_order').eq('country', current.country)
    const { data: neighbour } = direction === 'up'
      ? await neighbourQuery.lt('display_order', current.display_order).order('display_order', { ascending: false }).limit(1).maybeSingle()
      : await neighbourQuery.gt('display_order', current.display_order).order('display_order', { ascending: true }).limit(1).maybeSingle()

    if (!neighbour) return NextResponse.json({ success: true, moved: false })

    await Promise.all([
      service.from('faqs').update({ display_order: neighbour.display_order }).eq('id', current.id),
      service.from('faqs').update({ display_order: current.display_order }).eq('id', neighbour.id),
    ])

    await revalidatePage('static', 'faq')
    await logAudit({ userId: acting.id, action: 'update', table: 'faqs', recordId: id, changes: { reorder: direction } })
    return NextResponse.json({ success: true, moved: true })
  } catch (err) {
    console.error('PUT /api/admin/faqs/reorder:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
