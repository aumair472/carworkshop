import { createServerSupabase } from '@/lib/supabase/server'
import { AdminTopbar } from '@/components/admin/AdminTopbar'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import type { LeadStatus } from '@/types'

export const metadata = { title: 'Leads' }

interface SearchParams {
  status?: string
  page?: string
}

const PAGE_SIZE = 25

export default async function LeadsPage({ searchParams }: { searchParams: Promise<SearchParams> }) {
  const { status, page: pageStr } = await searchParams
  const page = Math.max(1, parseInt(pageStr ?? '1', 10))
  const from = (page - 1) * PAGE_SIZE
  const to = from + PAGE_SIZE - 1

  const supabase = await createServerSupabase()

  let query = supabase
    .from('form_submissions')
    .select('*', { count: 'exact' })
    .order('created_at', { ascending: false })
    .range(from, to)

  if (status) {
    query = query.eq('status', status as LeadStatus)
  }

  const { data: leads, count } = await query
  const totalPages = Math.ceil((count ?? 0) / PAGE_SIZE)

  const STATUS_FILTERS: Array<{ value: string; label: string }> = [
    { value: '', label: 'All' },
    { value: 'new', label: 'New' },
    { value: 'contacted', label: 'Contacted' },
    { value: 'in_progress', label: 'In Progress' },
    { value: 'converted', label: 'Converted' },
    { value: 'closed', label: 'Closed' },
  ]

  return (
    <div className="flex flex-col flex-1">
      <AdminTopbar title={`Leads (${count ?? 0})`} />

      <div className="p-6 space-y-4">
        {/* Status filter */}
        <div className="flex gap-2 flex-wrap">
          {STATUS_FILTERS.map(f => (
            <a
              key={f.value}
              href={f.value ? `/admin/leads?status=${f.value}` : '/admin/leads'}
              className={[
                'px-3 py-1.5 rounded-md text-sm font-medium border transition-colors',
                (status ?? '') === f.value
                  ? 'bg-[#4472C4] text-white border-[#4472C4]'
                  : 'border-[#E5E7EB] text-[#6B7280] hover:border-[#4472C4]',
              ].join(' ')}
            >
              {f.label}
            </a>
          ))}
        </div>

        <Card padding="none">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-[#F9FAFB] border-b border-[#E5E7EB]">
                  {['Name', 'Phone', 'Email', 'Message', 'Status', 'Date'].map(h => (
                    <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-[#6B7280]">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F3F4F6]">
                {(leads ?? []).map(lead => (
                  <tr key={lead.id} className="hover:bg-[#F9FAFB]">
                    <td className="px-4 py-3 font-medium text-[#1F2937] whitespace-nowrap">{lead.name}</td>
                    <td className="px-4 py-3 text-[#374151]">
                      <a href={`tel:${lead.phone}`} className="hover:text-[#4472C4]">{lead.phone}</a>
                    </td>
                    <td className="px-4 py-3 text-[#6B7280]">{lead.email ?? '—'}</td>
                    <td className="px-4 py-3 text-[#6B7280] max-w-xs truncate">{lead.message ?? '—'}</td>
                    <td className="px-4 py-3">
                      <Badge variant={lead.status as LeadStatus}>{lead.status}</Badge>
                    </td>
                    <td className="px-4 py-3 text-[#9CA3AF] text-xs whitespace-nowrap">
                      {new Date(lead.created_at).toLocaleDateString('en-AE', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </td>
                  </tr>
                ))}
                {!leads?.length && (
                  <tr><td colSpan={6} className="px-4 py-12 text-center text-[#9CA3AF]">No leads found</td></tr>
                )}
              </tbody>
            </table>
          </div>

          {totalPages > 1 && (
            <div className="flex justify-center gap-2 p-4 border-t border-[#E5E7EB]">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
                <a
                  key={p}
                  href={`/admin/leads?${status ? `status=${status}&` : ''}page=${p}`}
                  className={['px-3 py-1.5 rounded text-sm border', p === page ? 'bg-[#4472C4] text-white border-[#4472C4]' : 'border-[#E5E7EB] text-[#6B7280]'].join(' ')}
                >
                  {p}
                </a>
              ))}
            </div>
          )}
        </Card>
      </div>
    </div>
  )
}
