import { NextResponse } from 'next/server'
import { getActingUser } from '@/lib/auth-guard'
import { createServiceClient } from '@/lib/supabase/service'

// Returns the current admin user's role + display name (used by client UI).
export async function GET() {
  const acting = await getActingUser()
  if (!acting) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const service = createServiceClient()
  const { data } = await service.from('users').select('full_name, email').eq('id', acting.id).maybeSingle()
  return NextResponse.json({ id: acting.id, role: acting.role, full_name: data?.full_name ?? null, email: data?.email ?? null })
}
