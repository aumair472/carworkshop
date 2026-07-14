import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/service'
import { logAudit } from '@/lib/audit'
import { revalidatePage } from '@/lib/revalidate'
import { assertApprover, statusForAction } from '@/lib/approval'
import { ApproveSchema } from '@/lib/schemas/seo-page'

interface RouteContext { params: Promise<{ id: string }> }

// POST /api/admin/seo-pages/[id]/approve — approve/reject/resubmission (approver roles only).
export async function POST(req: NextRequest, { params }: RouteContext) {
  try {
    const { id } = await params
    const approver = await assertApprover()
    if (!approver) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

    const body: unknown = await req.json()
    const parsed = ApproveSchema.safeParse(body)
    if (!parsed.success) return NextResponse.json({ error: 'Invalid data' }, { status: 400 })

    const service = createServiceClient()
    const { data, error } = await service
      .from('generated_pages')
      .update({ approval_status: statusForAction(parsed.data.action), updated_at: new Date().toISOString() })
      .eq('id', id)
      .select('slug')
      .single()
    if (error || !data) return NextResponse.json({ error: error?.message ?? 'Update failed' }, { status: 500 })

    await revalidatePage('generated', data.slug)
    await logAudit({ userId: approver.id, action: 'update', table: 'generated_pages', recordId: id, changes: { approval: parsed.data.action } })
    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('POST /api/admin/seo-pages/[id]/approve:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
