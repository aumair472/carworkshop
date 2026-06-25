import { createServerSupabase } from '@/lib/supabase/server'
import { AdminTopbar } from '@/components/admin/AdminTopbar'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import Link from 'next/link'
import type { ContentStatus } from '@/types'

export const metadata = { title: 'Services' }

export default async function ServicesAdminPage() {
  const supabase = await createServerSupabase()
  const { data: services, count } = await supabase
    .from('services')
    .select('*', { count: 'exact' })
    .order('sort_order')

  return (
    <div className="flex flex-col flex-1">
      <AdminTopbar
        title={`Services (${count ?? 0})`}
        actions={
          <Link href="/admin/services/new" className="px-4 py-2 rounded-md bg-[#4472C4] text-white text-sm font-semibold hover:bg-[#3563B0] transition-colors">
            + New Service
          </Link>
        }
      />

      <div className="p-6">
        <Card padding="none">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-[#F9FAFB] border-b border-[#E5E7EB]">
                  {['Name', 'Slug', 'Starting Price', 'Status', 'Actions'].map(h => (
                    <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-[#6B7280]">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F3F4F6]">
                {(services ?? []).map(service => (
                  <tr key={service.id} className="hover:bg-[#F9FAFB]">
                    <td className="px-4 py-3 font-medium text-[#1F2937]">{service.name}</td>
                    <td className="px-4 py-3 text-[#6B7280] font-mono text-xs">{service.slug}</td>
                    <td className="px-4 py-3 text-[#E8601C] font-semibold">
                      {service.starting_price ? `AED ${service.starting_price}` : '—'}
                    </td>
                    <td className="px-4 py-3">
                      <Badge variant={service.status as ContentStatus}>{service.status}</Badge>
                    </td>
                    <td className="px-4 py-3">
                      <Link href={`/admin/services/${service.id}`} className="text-[#4472C4] hover:underline text-xs font-medium">Edit</Link>
                    </td>
                  </tr>
                ))}
                {!services?.length && (
                  <tr><td colSpan={5} className="px-4 py-12 text-center text-[#9CA3AF]">No services yet</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </div>
  )
}
