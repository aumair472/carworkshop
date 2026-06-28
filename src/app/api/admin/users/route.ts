import { NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/service'
import { getActingUser } from '@/lib/auth-guard'

export async function GET() {
  try {
    const acting = await getActingUser()
    if (!acting) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const service = createServiceClient()
    const { data, error } = await service.from('users').select('id, email, full_name, role, is_active, last_login, created_at').order('created_at', { ascending: false })
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })

    return NextResponse.json({ users: data, currentUserId: acting.id, currentRole: acting.role })
  } catch (err) {
    console.error('GET /api/admin/users:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
