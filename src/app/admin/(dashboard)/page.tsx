import Link from 'next/link'
import { createServerSupabase } from '@/lib/supabase/server'
import { AdminCard } from '@/components/admin/ui/AdminCard'
import { AdminBadge } from '@/components/admin/ui/AdminBadge'
import { AdminLinkButton } from '@/components/admin/ui/AdminButton'
import { FileStack, CheckCircle2, FilePen, Inbox, Car, Wrench, MapPin, Plus, Zap } from 'lucide-react'
import type { LeadStatus } from '@/types'

export const metadata = { title: 'Dashboard' }

async function getStats() {
  const supabase = await createServerSupabase()
  const startOfDay = new Date(); startOfDay.setHours(0, 0, 0, 0)

  const [
    { count: pagesTotal }, { count: pagesPublished }, { count: pagesDraft },
    { count: leadsToday }, { count: brandsTotal }, { count: servicesTotal }, { count: locationsTotal },
    { data: recentLeads },
  ] = await Promise.all([
    supabase.from('generated_pages').select('*', { count: 'exact', head: true }),
    supabase.from('generated_pages').select('*', { count: 'exact', head: true }).eq('status', 'published'),
    supabase.from('generated_pages').select('*', { count: 'exact', head: true }).eq('status', 'draft'),
    supabase.from('form_submissions').select('*', { count: 'exact', head: true }).gte('created_at', startOfDay.toISOString()),
    supabase.from('brands').select('*', { count: 'exact', head: true }).eq('status', 'published'),
    supabase.from('services').select('*', { count: 'exact', head: true }).eq('status', 'published'),
    supabase.from('locations').select('*', { count: 'exact', head: true }).eq('status', 'published'),
    supabase.from('form_submissions').select('id, name, phone, status, created_at').order('created_at', { ascending: false }).limit(8),
  ])

  return { pagesTotal, pagesPublished, pagesDraft, leadsToday, brandsTotal, servicesTotal, locationsTotal, recentLeads }
}

export default async function AdminDashboardPage() {
  const s = await getStats()

  const primary = [
    { label: 'Total Pages', value: s.pagesTotal ?? 0, href: '/admin/pages', icon: FileStack, color: 'text-[#4472C4] bg-[#EEF3FB]' },
    { label: 'Published', value: s.pagesPublished ?? 0, href: '/admin/pages?status=published', icon: CheckCircle2, color: 'text-green-600 bg-green-50' },
    { label: 'Draft Pages', value: s.pagesDraft ?? 0, href: '/admin/pages?status=draft', icon: FilePen, color: 'text-amber-600 bg-amber-50' },
    { label: 'New Leads Today', value: s.leadsToday ?? 0, href: '/admin/leads', icon: Inbox, color: 'text-[#E8601C] bg-orange-50' },
  ]
  const secondary = [
    { label: 'Brands', value: s.brandsTotal ?? 0, href: '/admin/brands', icon: Car },
    { label: 'Services', value: s.servicesTotal ?? 0, href: '/admin/services', icon: Wrench },
    { label: 'Locations', value: s.locationsTotal ?? 0, href: '/admin/locations', icon: MapPin },
  ]

  return (
    <div className="p-6 lg:p-8 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-zinc-900">Welcome back 👋</h1>
        <p className="text-sm text-zinc-500 mt-1">Here&apos;s what&apos;s happening on CarWorkshop.ae</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {primary.map(c => {
          const Icon = c.icon
          return (
            <Link key={c.label} href={c.href} className="bg-white rounded-xl border border-zinc-200 shadow-sm p-5 hover:shadow-md hover:border-zinc-300 transition-all">
              <span className={`inline-flex h-9 w-9 items-center justify-center rounded-lg ${c.color}`}><Icon size={18} /></span>
              <p className="text-3xl font-extrabold text-zinc-900 mt-3">{c.value.toLocaleString('en-AE')}</p>
              <p className="text-xs text-zinc-500 mt-0.5 font-medium">{c.label}</p>
            </Link>
          )
        })}
      </div>

      <div className="grid grid-cols-3 gap-4">
        {secondary.map(c => {
          const Icon = c.icon
          return (
            <Link key={c.label} href={c.href} className="bg-white rounded-xl border border-zinc-200 shadow-sm p-4 flex items-center gap-3 hover:shadow-md hover:border-zinc-300 transition-all">
              <span className="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-zinc-100 text-zinc-600"><Icon size={18} /></span>
              <div>
                <p className="text-xl font-bold text-zinc-900 leading-none">{c.value}</p>
                <p className="text-xs text-zinc-500 mt-1">{c.label}</p>
              </div>
            </Link>
          )
        })}
      </div>

      <AdminCard title="Quick Actions">
        <div className="flex flex-wrap gap-3">
          <AdminLinkButton href="/admin/brands/new" variant="outline"><Plus size={15} /> Add Brand</AdminLinkButton>
          <AdminLinkButton href="/admin/services/new" variant="outline"><Plus size={15} /> Add Service</AdminLinkButton>
          <AdminLinkButton href="/admin/blog/new" variant="outline"><Plus size={15} /> New Blog Post</AdminLinkButton>
          <AdminLinkButton href="/admin/pages/generate" variant="orange"><Zap size={15} /> Generate Pages</AdminLinkButton>
          <AdminLinkButton href="/admin/leads" variant="outline">View Leads</AdminLinkButton>
        </div>
      </AdminCard>

      <AdminCard title="Recent Leads" actions={<Link href="/admin/leads" className="text-xs text-[#4472C4] hover:underline">View all →</Link>} bodyClassName="!p-0">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-zinc-50 border-b border-zinc-200 text-left text-xs font-semibold text-zinc-500 uppercase tracking-wider">
                <th className="px-5 py-3">Name</th>
                <th className="px-5 py-3">Phone</th>
                <th className="px-5 py-3">Status</th>
                <th className="px-5 py-3">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100">
              {(s.recentLeads ?? []).map(lead => (
                <tr key={lead.id} className="hover:bg-zinc-50">
                  <td className="px-5 py-3 font-medium text-zinc-900">{lead.name}</td>
                  <td className="px-5 py-3 text-zinc-500">{lead.phone}</td>
                  <td className="px-5 py-3"><AdminBadge kind={lead.status as LeadStatus} /></td>
                  <td className="px-5 py-3 text-zinc-400 text-xs">{new Date(lead.created_at).toLocaleDateString('en-AE', { day: 'numeric', month: 'short' })}</td>
                </tr>
              ))}
              {!s.recentLeads?.length && (
                <tr><td colSpan={4} className="px-5 py-10 text-center text-zinc-400">No leads yet</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </AdminCard>
    </div>
  )
}
