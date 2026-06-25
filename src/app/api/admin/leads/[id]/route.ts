import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabase } from '@/lib/supabase/server'
import { createServiceClient } from '@/lib/supabase/service'
import { z } from 'zod'
import { logAudit } from '@/lib/audit'

const UpdateLeadSchema = z.object({
  status: z.enum(['new', 'contacted', 'in_progress', 'converted', 'closed']),
})

interface RouteContext {
  params: Promise<{ id: string }>
}

export async function PATCH(req: NextRequest, { params }: RouteContext) {
  try {
    const { id } = await params
    const supabase = await createServerSupabase()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const body: unknown = await req.json()
    const parsed = UpdateLeadSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ error: 'Invalid data', details: parsed.error.flatten().fieldErrors }, { status: 400 })
    }

    const client = createServiceClient()
    const { data, error } = await client.from('form_submissions').update({ status: parsed.data.status }).eq('id', id).select().single()
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })

    await logAudit({ userId: user.id, action: 'update', table: 'form_submissions', recordId: id })
    return NextResponse.json({ lead: data })
  } catch (err) {
    console.error('PATCH /api/admin/leads/[id]:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(_req: NextRequest, { params }: RouteContext) {
  try {
    const { id } = await params
    const supabase = await createServerSupabase()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const client = createServiceClient()
    const { error } = await client.from('form_submissions').delete().eq('id', id)
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })

    await logAudit({ userId: user.id, action: 'delete', table: 'form_submissions', recordId: id })
    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('DELETE /api/admin/leads/[id]:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
