import { createServerSupabase } from '@/lib/supabase/server'
import { AdminTopbar } from '@/components/admin/AdminTopbar'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import Link from 'next/link'
import type { LeadStatus } from '@/types'

export const metadata = { title: 'Dashboard' }

async function getStats() {
  const supabase = await createServerSupabase()

  const [
    { count: leadsTotal },
    { count: leadsNew },
    { count: brandsTotal },
    { count: servicesTotal },
    { count: pagesTotal },
    { count: postsTotal },
    { data: recentLeads },
  ] = await Promise.all([
    supabase.from('form_submissions').select('*', { count: 'exact', head: true }),
    supabase.from('form_submissions').select('*', { count: 'exact', head: true }).eq('status', 'new'),
    supabase.from('brands').select('*', { count: 'exact', head: true }).eq('status', 'published'),
    supabase.from('services').select('*', { count: 'exact', head: true }).eq('status', 'published'),
    supabase.from('generated_pages').select('*', { count: 'exact', head: true }).eq('status', 'published'),
    supabase.from('blog_posts').select('*', { count: 'exact', head: true }).eq('status', 'published'),
    supabase.from('form_submissions').select('id, name, phone, service_id, status, created_at').order('created_at', { ascending: false }).limit(5),
  ])

  return { leadsTotal, leadsNew, brandsTotal, servicesTotal, pagesTotal, postsTotal, recentLeads }
}

const STAT_CARDS = [
  { label: 'Total Leads', key: 'leadsTotal', href: '/admin/leads', color: 'text-[#4472C4]' },
  { label: 'New Leads', key: 'leadsNew', href: '/admin/leads?status=new', color: 'text-[#E8601C]' },
  { label: 'Published Brands', key: 'brandsTotal', href: '/admin/brands', color: 'text-[#059669]' },
  { label: 'Published Services', key: 'servicesTotal', href: '/admin/services', color: 'text-[#7C3AED]' },
  { label: 'Generated Pages', key: 'pagesTotal', href: '/admin/pages', color: 'text-[#D97706]' },
  { label: 'Blog Posts', key: 'postsTotal', href: '/admin/blog', color: 'text-[#DB2777]' },
] as const

export default async function AdminDashboardPage() {
  const stats = await getStats()

  return (
    <div className="flex flex-col flex-1">
      <AdminTopbar title="Dashboard" />

      <div className="p-6 space-y-6">
        {/* Stats grid */}
        <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
          {STAT_CARDS.map(card => (
            <Link key={card.key} href={card.href}>
              <Card padding="md" hover className="text-center">
                <p className={`text-2xl font-extrabold ${card.color}`}>
                  {stats[card.key] ?? 0}
                </p>
                <p className="text-xs text-[#6B7280] mt-1 font-medium">{card.label}</p>
              </Card>
            </Link>
          ))}
        </div>

        {/* Recent leads */}
        <Card padding="none">
          <div className="px-5 py-4 border-b border-[#E5E7EB] flex items-center justify-between">
            <h2 className="font-bold text-[#1F2937] text-sm">Recent Leads</h2>
            <Link href="/admin/leads" className="text-xs text-[#4472C4] hover:underline">View all →</Link>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-[#F9FAFB] border-b border-[#E5E7EB]">
                  <th className="px-4 py-3 text-left text-xs font-semibold text-[#6B7280]">Name</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-[#6B7280]">Phone</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-[#6B7280]">Status</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-[#6B7280]">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F3F4F6]">
                {(stats.recentLeads ?? []).map(lead => (
                  <tr key={lead.id} className="hover:bg-[#F9FAFB]">
                    <td className="px-4 py-3 font-medium text-[#1F2937]">{lead.name}</td>
                    <td className="px-4 py-3 text-[#6B7280]">{lead.phone}</td>
                    <td className="px-4 py-3">
                      <Badge variant={lead.status as LeadStatus}>{lead.status}</Badge>
                    </td>
                    <td className="px-4 py-3 text-[#9CA3AF] text-xs">
                      {new Date(lead.created_at).toLocaleDateString('en-AE', { day: 'numeric', month: 'short' })}
                    </td>
                  </tr>
                ))}
                {!stats.recentLeads?.length && (
                  <tr>
                    <td colSpan={4} className="px-4 py-8 text-center text-[#9CA3AF]">No leads yet</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </Card>

        {/* Quick links */}
        <div>
          <h2 className="text-sm font-bold text-[#6B7280] uppercase tracking-wide mb-3">Quick Actions</h2>
          <div className="flex flex-wrap gap-3">
            {[
              { label: '+ New Blog Post', href: '/admin/blog/new' },
              { label: '+ New Brand', href: '/admin/brands/new' },
              { label: '+ New Service', href: '/admin/services/new' },
              { label: '⚡ Generate Pages', href: '/admin/pages/generate' },
            ].map(action => (
              <Link
                key={action.href}
                href={action.href}
                className="px-4 py-2 rounded-md border border-[#E5E7EB] text-sm font-medium text-[#374151] hover:border-[#4472C4] hover:text-[#4472C4] hover:bg-[#EEF3FB] transition-all"
              >
                {action.label}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
