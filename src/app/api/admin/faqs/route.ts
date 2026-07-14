import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/service'
import { getActingUser } from '@/lib/auth-guard'
import { sanitizeHTML } from '@/lib/sanitize'
import { logAudit } from '@/lib/audit'
import { revalidatePage } from '@/lib/revalidate'
import { FaqCreateSchema } from '@/lib/schemas/faq'

export async function GET() {
  try {
    const acting = await getActingUser()
    if (!acting) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const service = createServiceClient()
    const { data, error } = await service
      .from('faqs')
      .select('*')
      .order('country')
      .order('display_order')
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ faqs: data })
  } catch (err) {
    console.error('GET /api/admin/faqs:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const acting = await getActingUser()
    if (!acting) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const body: unknown = await req.json()
    const parsed = FaqCreateSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ error: 'Invalid data', details: parsed.error.flatten().fieldErrors }, { status: 400 })
    }

    const d = parsed.data
    const service = createServiceClient()
    const { data, error } = await service
      .from('faqs')
      .insert({
        ...d,
        description_html: sanitizeHTML(d.description_html),
        arabic_description_html: sanitizeHTML(d.arabic_description_html),
      })
      .select('id')
      .single()
    if (error || !data) return NextResponse.json({ error: error?.message ?? 'Create failed' }, { status: 500 })

    await revalidatePage('static', 'faq')
    await logAudit({ userId: acting.id, action: 'create', table: 'faqs', recordId: data.id })
    return NextResponse.json({ success: true, id: data.id }, { status: 201 })
  } catch (err) {
    console.error('POST /api/admin/faqs:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
