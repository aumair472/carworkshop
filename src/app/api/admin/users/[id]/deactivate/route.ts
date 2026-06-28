import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { createServiceClient } from '@/lib/supabase/service'
import { getActingUser } from '@/lib/auth-guard'
import { logAudit } from '@/lib/audit'

interface RouteContext { params: Promise<{ id: string }> }
const Schema = z.object({ is_active: z.boolean() })

export async function PUT(req: NextRequest, { params }: RouteContext) {
  try {
    const { id } = await params
    const acting = await getActingUser()
    if (!acting) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    if (acting.role !== 'super_admin') return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    if (id === acting.id) return NextResponse.json({ error: 'You cannot deactivate yourself.' }, { status: 400 })

    const body: unknown = await req.json()
    const parsed = Schema.safeParse(body)
    if (!parsed.success) return NextResponse.json({ error: 'Invalid data' }, { status: 400 })

    const service = createServiceClient()
    const { error } = await service.from('users').update({ is_active: parsed.data.is_active }).eq('id', id)
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })

    await logAudit({ userId: acting.id, action: 'update', table: 'users', recordId: id })
    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('PUT /api/admin/users/[id]/deactivate:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
