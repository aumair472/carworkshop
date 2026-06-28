import { createServerSupabase } from '@/lib/supabase/server'
import { createServiceClient } from '@/lib/supabase/service'
import type { UserRole } from '@/types'

export interface ActingUser { id: string; role: UserRole }

// Resolve the authenticated admin user and their role (from the users table).
export async function getActingUser(): Promise<ActingUser | null> {
  const supabase = await createServerSupabase()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null
  const service = createServiceClient()
  const { data } = await service.from('users').select('role').eq('id', user.id).maybeSingle()
  return { id: user.id, role: (data?.role ?? 'content_writer') as UserRole }
}
