import Link from 'next/link'
import { Pencil } from 'lucide-react'
import { AdminTopbar } from '@/components/admin/AdminTopbar'
import { createServiceClient } from '@/lib/supabase/service'

export const metadata = { title: 'Static Page SEO' }
export const dynamic = 'force-dynamic'

// SEO overview of static pages (Home, About, Contact, FAQ, Privacy, listings).
// Editing reuses the dedicated static page editors.
export default async function StaticPageSeoPage() {
  const service = createServiceClient()
  const { data: pages } = await service
    .from('static_pages')
    .select('id, title, slug, seo_title, seo_description, seo_json, status')
    .order('title')

  return (
    <>
      <AdminTopbar title="Manage STATIC PAGE SEO" />
      <div className="p-6">
        <div className="bg-white border border-[#E5E7EB] rounded-lg overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr style={{ backgroundColor: '#1F2937' }}>
                <th className="px-4 py-3 text-left font-semibold text-white">Page Name</th>
                <th className="px-4 py-3 text-left font-semibold text-white">Meta Title</th>
                <th className="px-4 py-3 text-left font-semibold text-white">Meta Description</th>
                <th className="px-4 py-3 text-left font-semibold text-white">Meta Keywords</th>
                <th className="px-4 py-3 text-left font-semibold text-white">Status</th>
                <th className="px-4 py-3 text-left font-semibold text-white">Edit</th>
              </tr>
            </thead>
            <tbody>
              {(pages ?? []).map(p => {
                const seo = (p.seo_json ?? {}) as { meta_keywords?: string }
                return (
                  <tr key={p.id} className="border-b border-[#E5E7EB] bg-white hover:bg-[#F9FAFB]">
                    <td className="px-4 py-3 font-semibold text-[#1F2937] text-xs">{p.title}</td>
                    <td className="px-4 py-3 text-xs">{p.seo_title ?? '—'}</td>
                    <td className="px-4 py-3 text-xs max-w-[300px] truncate">{p.seo_description ?? '—'}</td>
                    <td className="px-4 py-3 text-xs max-w-[200px] truncate">{seo.meta_keywords ?? '—'}</td>
                    <td className="px-4 py-3">
                      <span className={`text-xs font-semibold ${p.status === 'published' ? 'text-[#22C55E]' : 'text-[#9CA3AF]'}`}>
                        {p.status === 'published' ? 'Published' : 'Draft'}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <Link href={`/admin/pages/static/${p.slug}`} aria-label={`Edit ${p.title}`} className="h-7 w-7 inline-flex items-center justify-center rounded bg-[#22C55E] text-white hover:bg-[#16A34A]">
                        <Pencil size={13} />
                      </Link>
                    </td>
                  </tr>
                )
              })}
              {!pages?.length && (
                <tr><td colSpan={6} className="px-4 py-10 text-center text-[#9CA3AF]">No static pages found</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </>
  )
}
