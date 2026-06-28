import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { createServiceClient } from '@/lib/supabase/service'
import { getActingUser } from '@/lib/auth-guard'
import { logAudit } from '@/lib/audit'

const InviteSchema = z.object({
  full_name: z.string().min(1).max(120),
  email: z.string().email(),
  password: z.string().min(8).max(72),
  role: z.enum(['super_admin', 'admin', 'editor', 'content_writer', 'support_staff', 'seo_editor']),
})

export async function POST(req: NextRequest) {
  try {
    const acting = await getActingUser()
    if (!acting) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    if (acting.role !== 'super_admin' && acting.role !== 'admin') return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

    const body: unknown = await req.json()
    const parsed = InviteSchema.safeParse(body)
    if (!parsed.success) return NextResponse.json({ error: 'Invalid data', details: parsed.error.flatten().fieldErrors }, { status: 400 })

    const service = createServiceClient()
    // Create the user with a password and pre-confirmed email so they can sign
    // in immediately at /admin/login — no email round-trip / expiring invite.
    const { data: created, error: createErr } = await service.auth.admin.createUser({
      email: parsed.data.email,
      password: parsed.data.password,
      email_confirm: true,
      user_metadata: { full_name: parsed.data.full_name },
    })
    if (createErr || !created?.user) return NextResponse.json({ error: createErr?.message ?? 'Create failed' }, { status: 502 })

    const { error: rowErr } = await service.from('users').upsert({
      id: created.user.id,
      email: parsed.data.email,
      full_name: parsed.data.full_name,
      role: parsed.data.role,
      is_active: true,
    }, { onConflict: 'id' })
    if (rowErr) return NextResponse.json({ error: rowErr.message }, { status: 500 })

    await logAudit({ userId: acting.id, action: 'create', table: 'users', recordId: created.user.id })
    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('POST /api/admin/users/invite:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
