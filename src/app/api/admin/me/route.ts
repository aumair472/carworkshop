import { NextResponse } from 'next/server'
import { getActingUser } from '@/lib/auth-guard'

// Returns the current admin user's role (used by client editors to gate UI).
export async function GET() {
  const acting = await getActingUser()
  if (!acting) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  return NextResponse.json({ id: acting.id, role: acting.role })
}
