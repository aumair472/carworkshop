import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/service'
import { logAudit } from '@/lib/audit'
import { assertApprover } from '@/lib/approval'
import { BulkIdsSchema } from '@/lib/schemas/seo-page'
import { z } from 'zod'

const BulkRejectSchema = BulkIdsSchema.extend({
  action: z.enum(['reject', 'resubmission_required']).default('reject'),
})

// POST /api/admin/seo-pages/bulk-reject — reject or mark resubmission required.
export async function POST(req: NextRequest) {
  try {
    const approver = await assertApprover()
    if (!approver) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

    const body: unknown = await req.json()
    const parsed = BulkRejectSchema.safeParse(body)
    if (!parsed.success) return NextResponse.json({ error: 'Invalid data' }, { status: 400 })

    const status = parsed.data.action === 'reject' ? 'rejected' : 'resubmission_required'
    const service = createServiceClient()
    const { data, error } = await service
      .from('generated_pages')
      .update({ approval_status: status, updated_at: new Date().toISOString() })
      .in('id', parsed.data.ids)
      .select('id')
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })

    await Promise.all((data ?? []).map(p =>
      logAudit({ userId: approver.id, action: 'update', table: 'generated_pages', recordId: p.id, changes: { approval: parsed.data.action } })
    ))
    return NextResponse.json({ success: true, count: data?.length ?? 0 })
  } catch (err) {
    console.error('POST /api/admin/seo-pages/bulk-reject:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
