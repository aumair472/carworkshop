import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { createServiceClient } from '@/lib/supabase/service'
import { getActingUser } from '@/lib/auth-guard'
import { logAudit } from '@/lib/audit'

const PasswordSchema = z.object({ password: z.string().min(8).max(72) })

// Super-admin-only: set a new password for any user.
export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const acting = await getActingUser()
    if (!acting) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    if (acting.role !== 'super_admin') return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

    const parsed = PasswordSchema.safeParse(await req.json())
    if (!parsed.success) return NextResponse.json({ error: 'Password must be 8-72 characters' }, { status: 400 })

    const { id } = await params
    const service = createServiceClient()
    const { error } = await service.auth.admin.updateUserById(id, { password: parsed.data.password })
    if (error) return NextResponse.json({ error: error.message }, { status: 502 })

    await logAudit({ userId: acting.id, action: 'update', table: 'users', recordId: id })
    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('PUT /api/admin/users/[id]/password:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
