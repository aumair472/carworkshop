import { createServerSupabase } from '@/lib/supabase/server'
import { AdminTopbar } from '@/components/admin/AdminTopbar'
import { AdminBadge } from '@/components/admin/ui/AdminBadge'
import { AdminLinkButton } from '@/components/admin/ui/AdminButton'
import { EmptyState } from '@/components/admin/ui/AdminStates'
import { Wrench, Plus, ExternalLink } from 'lucide-react'
import Link from 'next/link'
import type { ContentStatus } from '@/types'

export const metadata = { title: 'Services' }

export default async function ServicesAdminPage() {
  const supabase = await createServerSupabase()
  const { data: services, count } = await supabase
    .from('services')
    .select('id, name, slug, starting_price, status', { count: 'exact' })
    .order('sort_order')

  return (
    <div className="flex flex-col flex-1">
      <AdminTopbar title={`Services (${count ?? 0})`} actions={<AdminLinkButton href="/admin/services/new" variant="primary"><Plus size={15} /> New Service</AdminLinkButton>} />

      <div className="p-6 lg:p-8">
        <div className="bg-white rounded-xl border border-zinc-200 shadow-sm overflow-hidden">
          {!services?.length ? (
            <EmptyState icon={<Wrench size={22} />} title="No services yet" description="Add services that brands and locations will offer." action={<AdminLinkButton href="/admin/services/new" variant="primary"><Plus size={15} /> Add Service</AdminLinkButton>} />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-zinc-50 border-b border-zinc-200 text-left text-xs font-semibold text-zinc-500 uppercase tracking-wider">
                    <th className="px-5 py-3">Name</th><th className="px-5 py-3">Slug</th><th className="px-5 py-3">Starting Price</th><th className="px-5 py-3">Status</th><th className="px-5 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-100">
                  {services.map(s => (
                    <tr key={s.id} className="hover:bg-zinc-50">
                      <td className="px-5 py-3 font-medium text-zinc-900">{s.name}</td>
                      <td className="px-5 py-3 text-zinc-400 font-mono text-xs">/{s.slug}</td>
                      <td className="px-5 py-3 text-[#E8601C] font-semibold">{s.starting_price ? `AED ${s.starting_price}` : '—'}</td>
                      <td className="px-5 py-3"><AdminBadge kind={s.status as ContentStatus} /></td>
                      <td className="px-5 py-3">
                        <div className="flex items-center justify-end gap-3 text-xs font-medium">
                          <Link href={`/admin/services/${s.id}`} className="text-[#4472C4] hover:underline">Edit</Link>
                          <a href={`/services/${s.slug}`} target="_blank" rel="noopener noreferrer" className="text-zinc-400 hover:text-zinc-600"><ExternalLink size={14} /></a>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
