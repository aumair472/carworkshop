import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/service'
import { getActingUser } from '@/lib/auth-guard'
import { logAudit } from '@/lib/audit'
import { SearchContentCreateSchema } from '@/lib/schemas/search-content'

export async function GET() {
  try {
    const acting = await getActingUser()
    if (!acting) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const service = createServiceClient()
    const { data, error } = await service.from('search_content').select('*').order('display_order')
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ items: data })
  } catch (err) {
    console.error('GET /api/admin/search-content:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const acting = await getActingUser()
    if (!acting) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const body: unknown = await req.json()
    const parsed = SearchContentCreateSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ error: 'Invalid data', details: parsed.error.flatten().fieldErrors }, { status: 400 })
    }

    const service = createServiceClient()
    const { data, error } = await service.from('search_content').insert(parsed.data).select('id').single()
    if (error || !data) return NextResponse.json({ error: error?.message ?? 'Create failed' }, { status: 500 })

    await logAudit({ userId: acting.id, action: 'create', table: 'search_content', recordId: data.id })
    return NextResponse.json({ success: true, id: data.id }, { status: 201 })
  } catch (err) {
    console.error('POST /api/admin/search-content:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
