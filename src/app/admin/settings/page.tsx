import { createServerSupabase } from '@/lib/supabase/server'
import { AdminTopbar } from '@/components/admin/AdminTopbar'
import { Card } from '@/components/ui/Card'

export const metadata = { title: 'Settings' }

export default async function SettingsAdminPage() {
  const supabase = await createServerSupabase()
  const { data: settings } = await supabase
    .from('website_settings')
    .select('*')
    .order('key')

  return (
    <div className="flex flex-col flex-1">
      <AdminTopbar title="Website Settings" />

      <div className="p-6">
        <Card padding="none">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-[#F9FAFB] border-b border-[#E5E7EB]">
                  {['Key', 'Value'].map(h => (
                    <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-[#6B7280]">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F3F4F6]">
                {(settings ?? []).map(s => (
                  <tr key={s.key} className="hover:bg-[#F9FAFB]">
                    <td className="px-4 py-3 font-mono text-xs text-[#374151] font-medium">{s.key}</td>
                    <td className="px-4 py-3 text-[#6B7280] text-xs max-w-md truncate">
                      {typeof s.value === 'object' ? JSON.stringify(s.value) : String(s.value)}
                    </td>
                  </tr>
                ))}
                {!settings?.length && (
                  <tr><td colSpan={2} className="px-4 py-12 text-center text-[#9CA3AF]">No settings configured</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </div>
  )
}
