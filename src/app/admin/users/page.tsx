import { createServerSupabase } from '@/lib/supabase/server'
import { AdminTopbar } from '@/components/admin/AdminTopbar'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import type { UserRole } from '@/types'

export const metadata = { title: 'Users' }

export default async function UsersAdminPage() {
  const supabase = await createServerSupabase()
  const { data: users, count } = await supabase
    .from('users')
    .select('*', { count: 'exact' })
    .order('created_at', { ascending: false })

  return (
    <div className="flex flex-col flex-1">
      <AdminTopbar title={`Users (${count ?? 0})`} />

      <div className="p-6">
        <Card padding="none">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-[#F9FAFB] border-b border-[#E5E7EB]">
                  {['Email', 'Name', 'Role', 'Active', 'Joined'].map(h => (
                    <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-[#6B7280]">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F3F4F6]">
                {(users ?? []).map(user => (
                  <tr key={user.id} className="hover:bg-[#F9FAFB]">
                    <td className="px-4 py-3 text-[#374151]">{user.email}</td>
                    <td className="px-4 py-3 font-medium text-[#1F2937]">{user.full_name ?? '—'}</td>
                    <td className="px-4 py-3">
                      <Badge variant="info">{user.role as UserRole}</Badge>
                    </td>
                    <td className="px-4 py-3">
                      <span className={user.is_active ? 'text-[#059669]' : 'text-[#DC2626]'}>
                        {user.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-[#9CA3AF] text-xs">
                      {new Date(user.created_at).toLocaleDateString('en-AE')}
                    </td>
                  </tr>
                ))}
                {!users?.length && (
                  <tr><td colSpan={5} className="px-4 py-12 text-center text-[#9CA3AF]">No users found</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </div>
  )
}
