import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/service'
import { getActingUser } from '@/lib/auth-guard'
import { logAudit } from '@/lib/audit'
import { LanguageKeyCreateSchema } from '@/lib/schemas/language-key'

export async function GET(req: NextRequest) {
  try {
    const acting = await getActingUser()
    if (!acting) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const sp = req.nextUrl.searchParams
    const service = createServiceClient()
    let query = service.from('language_keys').select('*').order('created_at', { ascending: false })
    if (sp.get('name')) query = query.or(`key_name.ilike.%${sp.get('name')!}%,slug.ilike.%${sp.get('name')!}%`)

    const { data, error } = await query.limit(2000)
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ keys: data })
  } catch (err) {
    console.error('GET /api/admin/language-keys:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const acting = await getActingUser()
    if (!acting) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const body: unknown = await req.json()
    const parsed = LanguageKeyCreateSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ error: 'Invalid data', details: parsed.error.flatten().fieldErrors }, { status: 400 })
    }

    const service = createServiceClient()
    const { data, error } = await service.from('language_keys').insert(parsed.data).select('id').single()
    if (error || !data) return NextResponse.json({ error: error?.message ?? 'Create failed' }, { status: 500 })

    await logAudit({ userId: acting.id, action: 'create', table: 'language_keys', recordId: data.id })
    return NextResponse.json({ success: true, id: data.id }, { status: 201 })
  } catch (err) {
    console.error('POST /api/admin/language-keys:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
