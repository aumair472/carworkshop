import { createServerSupabase } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import type { UserRole } from '@/types'

interface RoleGateProps {
  children: React.ReactNode
  requiredRoles?: UserRole[]
}

export async function RoleGate({ children, requiredRoles }: RoleGateProps) {
  const supabase = await createServerSupabase()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/admin/login')
  }

  if (requiredRoles && requiredRoles.length > 0) {
    const { data: profile } = await supabase
      .from('users')
      .select('role, is_active')
      .eq('id', user.id)
      .single()

    if (!profile || !profile.is_active) {
      redirect('/admin/login')
    }

    if (!requiredRoles.includes(profile.role as UserRole)) {
      redirect('/admin')
    }
  }

  return <>{children}</>
}
