import Link from 'next/link'
import { createServerSupabase } from '@/lib/supabase/server'
import { AdminTopbar } from '@/components/admin/AdminTopbar'
import { AdminCard } from '@/components/admin/ui/AdminCard'
import { ApprovalBadge } from '@/components/admin/ui/ApprovalBadge'
import { FileStack, CheckCircle2, Clock, Inbox } from 'lucide-react'
import type { ApprovalStatus } from '@/types'

export const metadata = { title: 'Dashboard' }

async function getStats() {
  const supabase = await createServerSupabase()

  const [
    { count: pagesTotal }, { count: pagesPublished }, { count: pagesPending },
    { count: leadsTotal },
    { data: recentPages },
  ] = await Promise.all([
    supabase.from('generated_pages').select('*', { count: 'exact', head: true }),
    supabase.from('generated_pages').select('*', { count: 'exact', head: true }).eq('status', 'published'),
    supabase.from('generated_pages').select('*', { count: 'exact', head: true }).eq('approval_status', 'pending'),
    supabase.from('form_submissions').select('*', { count: 'exact', head: true }),
    supabase.from('generated_pages').select('id, h1, slug, status, approval_status, updated_at').order('updated_at', { ascending: false }).limit(8),
  ])

  return { pagesTotal, pagesPublished, pagesPending, leadsTotal, recentPages }
}

export default async function AdminDashboardPage() {
  const s = await getStats()

  const stats = [
    { label: 'Total SEO Pages', value: s.pagesTotal ?? 0, href: '/admin/seo-pages', icon: FileStack, color: 'text-[#4472C4] bg-[#EEF3FB]' },
    { label: 'Published', value: s.pagesPublished ?? 0, href: '/admin/seo-pages?status=published', icon: CheckCircle2, color: 'text-green-600 bg-green-50' },
    { label: 'Pending Approval', value: s.pagesPending ?? 0, href: '/admin/seo-pages?approval=pending', icon: Clock, color: 'text-[#E8601C] bg-orange-50' },
    { label: 'Total Leads', value: s.leadsTotal ?? 0, href: '/admin/leads', icon: Inbox, color: 'text-[#EF4444] bg-red-50' },
  ]

  return (
    <>
      <AdminTopbar title="Dashboard" />
      <div className="p-6 lg:p-8 space-y-6">
        {/* Brand card — ServiceMyCar-style centered logo panel */}
        <div className="flex">
          <div className="rounded-xl bg-[#F3F4F6] border border-[#E5E7EB] shadow-sm px-10 py-8">
            <p className="text-3xl font-extrabold leading-tight whitespace-nowrap">
              <span className="text-[#4472C4]">CAR</span><span className="text-[#E8601C]">WORKSHOP</span><span className="text-[#1F2937]">.AE</span>
            </p>
            <p className="text-[11px] tracking-wide text-[#6B7280] font-bold mt-1">
              WE COLLECT&nbsp;&nbsp;|&nbsp;&nbsp;WE SERVICE&nbsp;&nbsp;|&nbsp;&nbsp;WE DELIVER
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map(c => {
            const Icon = c.icon
            return (
              <Link key={c.label} href={c.href} className="bg-white rounded-xl border border-[#E5E7EB] shadow-sm p-5 hover:shadow-md transition-all">
                <span className={`inline-flex h-9 w-9 items-center justify-center rounded-lg ${c.color}`}><Icon size={18} /></span>
                <p className="text-3xl font-extrabold text-[#1F2937] mt-3">{c.value.toLocaleString('en-AE')}</p>
                <p className="text-xs text-[#6B7280] mt-0.5 font-medium">{c.label}</p>
              </Link>
            )
          })}
        </div>

        <AdminCard title="Recent Activity" actions={<Link href="/admin/seo-pages" className="text-xs text-[#4472C4] hover:underline">View all →</Link>} bodyClassName="!p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-xs font-semibold text-white uppercase tracking-wider" style={{ backgroundColor: '#1F2937' }}>
                  <th className="px-5 py-3">Page</th>
                  <th className="px-5 py-3">Slug</th>
                  <th className="px-5 py-3">Status</th>
                  <th className="px-5 py-3">Approval</th>
                  <th className="px-5 py-3">Modified</th>
                </tr>
              </thead>
              <tbody>
                {(s.recentPages ?? []).map(page => (
                  <tr key={page.id} className="border-b border-[#E5E7EB] bg-white hover:bg-[#F9FAFB]">
                    <td className="px-5 py-3 font-medium text-[#1F2937]">
                      <Link href={`/admin/seo-pages/${page.id}`} className="hover:text-[#4472C4]">{page.h1}</Link>
                    </td>
                    <td className="px-5 py-3 text-[#6B7280] text-xs">{page.slug}</td>
                    <td className="px-5 py-3">
                      <span className={`text-xs font-semibold ${page.status === 'published' ? 'text-[#22C55E]' : 'text-[#9CA3AF]'}`}>
                        {page.status === 'published' ? 'Published' : page.status === 'draft' ? 'Draft' : 'Archived'}
                      </span>
                    </td>
                    <td className="px-5 py-3"><ApprovalBadge status={page.approval_status as ApprovalStatus} /></td>
                    <td className="px-5 py-3 text-[#9CA3AF] text-xs">{new Date(page.updated_at).toLocaleDateString('en-AE', { day: 'numeric', month: 'short' })}</td>
                  </tr>
                ))}
                {!s.recentPages?.length && (
                  <tr><td colSpan={5} className="px-5 py-10 text-center text-[#9CA3AF]">No pages yet</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </AdminCard>
      </div>
    </>
  )
}
