import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/service'
import { logAudit } from '@/lib/audit'
import { assertApprover } from '@/lib/approval'
import { AssignSchema } from '@/lib/schemas/seo-page'

interface RouteContext { params: Promise<{ id: string }> }

// POST — grant a user access to (assign them to) this page.
export async function POST(req: NextRequest, { params }: RouteContext) {
  try {
    const { id } = await params
    const approver = await assertApprover()
    if (!approver) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

    const body: unknown = await req.json()
    const parsed = AssignSchema.safeParse(body)
    if (!parsed.success) return NextResponse.json({ error: 'Invalid data' }, { status: 400 })

    const service = createServiceClient()
    const { error } = await service
      .from('generated_pages')
      .update({ assignee_id: parsed.data.user_id, assigned_at: new Date().toISOString() })
      .eq('id', id)
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })

    await logAudit({ userId: approver.id, action: 'update', table: 'generated_pages', recordId: id, changes: { assigned: parsed.data.user_id } })
    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('POST /api/admin/seo-pages/[id]/assign:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// DELETE — revoke the current assignment.
export async function DELETE(_req: NextRequest, { params }: RouteContext) {
  try {
    const { id } = await params
    const approver = await assertApprover()
    if (!approver) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

    const service = createServiceClient()
    const { error } = await service
      .from('generated_pages')
      .update({ assignee_id: null, assigned_at: null })
      .eq('id', id)
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })

    await logAudit({ userId: approver.id, action: 'update', table: 'generated_pages', recordId: id, changes: { assigned: null } })
    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('DELETE /api/admin/seo-pages/[id]/assign:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
