import { createServerSupabase } from '@/lib/supabase/server'
import { AdminTopbar } from '@/components/admin/AdminTopbar'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import Link from 'next/link'
import type { ContentStatus } from '@/types'

export const metadata = { title: 'Generated Pages' }

export default async function PagesAdminPage() {
  const supabase = await createServerSupabase()
  const { data: pages, count } = await supabase
    .from('generated_pages')
    .select('id, slug, page_type, status, generated_at', { count: 'exact' })
    .order('generated_at', { ascending: false })
    .limit(50)

  return (
    <div className="flex flex-col flex-1">
      <AdminTopbar
        title={`Generated Pages (${count ?? 0})`}
        actions={
          <Link href="/admin/pages/generate" className="px-4 py-2 rounded-md bg-[#E8601C] text-white text-sm font-semibold hover:bg-[#D15518] transition-colors">
            ⚡ Generate Pages
          </Link>
        }
      />

      <div className="p-6">
        <Card padding="none">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-[#F9FAFB] border-b border-[#E5E7EB]">
                  {['Slug', 'Type', 'Status', 'Created', 'Actions'].map(h => (
                    <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-[#6B7280]">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F3F4F6]">
                {(pages ?? []).map(page => (
                  <tr key={page.id} className="hover:bg-[#F9FAFB]">
                    <td className="px-4 py-3 font-mono text-xs text-[#374151] max-w-xs truncate">{page.slug}</td>
                    <td className="px-4 py-3 text-[#6B7280] text-xs">{page.page_type}</td>
                    <td className="px-4 py-3">
                      <Badge variant={page.status as ContentStatus}>{page.status}</Badge>
                    </td>
                    <td className="px-4 py-3 text-[#9CA3AF] text-xs">
                      {new Date(page.generated_at).toLocaleDateString('en-AE')}
                    </td>
                    <td className="px-4 py-3">
                      <a href={`/${page.slug}`} target="_blank" rel="noopener noreferrer" className="text-[#4472C4] hover:underline text-xs font-medium">View</a>
                    </td>
                  </tr>
                ))}
                {!pages?.length && (
                  <tr><td colSpan={5} className="px-4 py-12 text-center text-[#9CA3AF]">No generated pages yet. Click ⚡ Generate Pages.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </div>
  )
}
