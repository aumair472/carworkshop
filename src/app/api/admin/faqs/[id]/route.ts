import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/service'
import { getActingUser } from '@/lib/auth-guard'
import { sanitizeHTML } from '@/lib/sanitize'
import { logAudit } from '@/lib/audit'
import { revalidatePage } from '@/lib/revalidate'
import { FaqUpdateSchema } from '@/lib/schemas/faq'

interface RouteContext { params: Promise<{ id: string }> }

export async function GET(_req: NextRequest, { params }: RouteContext) {
  try {
    const { id } = await params
    const acting = await getActingUser()
    if (!acting) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const service = createServiceClient()
    const { data, error } = await service.from('faqs').select('*').eq('id', id).single()
    if (error || !data) return NextResponse.json({ error: 'Not found' }, { status: 404 })
    return NextResponse.json({ faq: data })
  } catch (err) {
    console.error('GET /api/admin/faqs/[id]:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function PATCH(req: NextRequest, { params }: RouteContext) {
  try {
    const { id } = await params
    const acting = await getActingUser()
    if (!acting) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const body: unknown = await req.json()
    const parsed = FaqUpdateSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ error: 'Invalid data', details: parsed.error.flatten().fieldErrors }, { status: 400 })
    }

    const d = parsed.data
    const service = createServiceClient()
    const { error } = await service
      .from('faqs')
      .update({
        ...d,
        ...(d.description_html !== undefined ? { description_html: sanitizeHTML(d.description_html) } : {}),
        ...(d.arabic_description_html !== undefined ? { arabic_description_html: sanitizeHTML(d.arabic_description_html) } : {}),
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })

    await revalidatePage('static', 'faq')
    await logAudit({ userId: acting.id, action: 'update', table: 'faqs', recordId: id })
    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('PATCH /api/admin/faqs/[id]:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(_req: NextRequest, { params }: RouteContext) {
  try {
    const { id } = await params
    const acting = await getActingUser()
    if (!acting) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const service = createServiceClient()
    const { error } = await service.from('faqs').delete().eq('id', id)
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })

    await revalidatePage('static', 'faq')
    await logAudit({ userId: acting.id, action: 'delete', table: 'faqs', recordId: id })
    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('DELETE /api/admin/faqs/[id]:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
