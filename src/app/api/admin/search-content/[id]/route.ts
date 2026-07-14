import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/service'
import { getActingUser } from '@/lib/auth-guard'
import { logAudit } from '@/lib/audit'
import { SearchContentUpdateSchema } from '@/lib/schemas/search-content'

interface RouteContext { params: Promise<{ id: string }> }

export async function PATCH(req: NextRequest, { params }: RouteContext) {
  try {
    const { id } = await params
    const acting = await getActingUser()
    if (!acting) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const body: unknown = await req.json()
    const parsed = SearchContentUpdateSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ error: 'Invalid data', details: parsed.error.flatten().fieldErrors }, { status: 400 })
    }

    const service = createServiceClient()
    const { error } = await service
      .from('search_content')
      .update({ ...parsed.data, updated_at: new Date().toISOString() })
      .eq('id', id)
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })

    await logAudit({ userId: acting.id, action: 'update', table: 'search_content', recordId: id })
    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('PATCH /api/admin/search-content/[id]:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(_req: NextRequest, { params }: RouteContext) {
  try {
    const { id } = await params
    const acting = await getActingUser()
    if (!acting) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const service = createServiceClient()
    const { error } = await service.from('search_content').delete().eq('id', id)
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })

    await logAudit({ userId: acting.id, action: 'delete', table: 'search_content', recordId: id })
    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('DELETE /api/admin/search-content/[id]:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
