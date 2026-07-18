import Link from 'next/link'
import Image from 'next/image'
import { Pencil, ImageOff } from 'lucide-react'
import { AdminTopbar } from '@/components/admin/AdminTopbar'
import { createServiceClient } from '@/lib/supabase/service'
import { STATIC_PAGE_PATHS } from '@/app/api/admin/pages/static/route'
import { StaticPageSeoFilters } from './StaticPageSeoFilters'

export const metadata = { title: 'Static Page SEO' }
export const dynamic = 'force-dynamic'

function truncate(s: string | null | undefined, max: number): string {
  if (!s) return '—'
  return s.length > max ? `${s.slice(0, max)}…` : s
}

interface SearchParams {
  title?: string
  keyword?: string
  url?: string
}

// SEO overview of static pages (Home, About, Contact, FAQ, Privacy, listings).
// Editing reuses the dedicated static page editors.
export default async function StaticPageSeoPage({ searchParams }: { searchParams: Promise<SearchParams> }) {
  const { title: titleFilter, keyword: keywordFilter, url: urlFilter } = await searchParams

  const service = createServiceClient()
  let query = service
    .from('static_pages')
    .select('id, title, slug, seo_title, seo_description, meta_keyword, seo_json, status')
    .order('title')

  if (titleFilter) query = query.ilike('title', `%${titleFilter}%`)
  if (keywordFilter) query = query.ilike('meta_keyword', `%${keywordFilter}%`)

  const { data: allPages } = await query
  const pages = (allPages ?? []).filter(p => {
    if (!urlFilter) return true
    const path = STATIC_PAGE_PATHS[p.slug] ?? `/${p.slug}`
    return path.toLowerCase().includes(urlFilter.toLowerCase())
  })

  return (
    <>
      <AdminTopbar title="Manage STATIC PAGE SEO" />
      <div className="p-6 space-y-4">
        <StaticPageSeoFilters />

        <div className="bg-white border border-[#E5E7EB] rounded-lg overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr style={{ backgroundColor: '#1F2937' }}>
                <th className="px-4 py-3 text-left font-semibold text-white">Page URL</th>
                <th className="px-4 py-3 text-left font-semibold text-white">Title</th>
                <th className="px-4 py-3 text-left font-semibold text-white">Meta Title</th>
                <th className="px-4 py-3 text-left font-semibold text-white">Meta Keywords</th>
                <th className="px-4 py-3 text-left font-semibold text-white">Description</th>
                <th className="px-4 py-3 text-left font-semibold text-white">Image</th>
                <th className="px-4 py-3 text-left font-semibold text-white">Publish</th>
                <th className="px-4 py-3 text-left font-semibold text-white">Action</th>
              </tr>
            </thead>
            <tbody>
              {pages.map(p => {
                const seo = (p.seo_json ?? {}) as { og_image?: string | null }
                const path = STATIC_PAGE_PATHS[p.slug] ?? `/${p.slug}`
                return (
                  <tr key={p.id} className="border-b border-[#E5E7EB] bg-white hover:bg-[#EEF3FB]">
                    <td className="px-4 py-3 font-mono text-xs text-[#6B7280]">{path}</td>
                    <td className="px-4 py-3 font-semibold text-[#1F2937] text-xs">{p.title}</td>
                    <td className="px-4 py-3 text-xs" title={p.seo_title ?? ''}>{truncate(p.seo_title, 50)}</td>
                    <td className="px-4 py-3 text-xs" title={p.meta_keyword ?? ''}>{truncate(p.meta_keyword, 60)}</td>
                    <td className="px-4 py-3 text-xs" title={p.seo_description ?? ''}>{truncate(p.seo_description, 80)}</td>
                    <td className="px-4 py-3">
                      {seo.og_image ? (
                        <div className="relative w-10 h-10 rounded overflow-hidden border border-[#E5E7EB]">
                          <Image src={seo.og_image} alt="" fill className="object-cover" />
                        </div>
                      ) : (
                        <ImageOff size={16} className="text-[#D1D5DB]" />
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`text-xs font-medium ${p.status === 'published' ? 'text-[#22C55E]' : 'text-[#9CA3AF]'}`}>
                        {p.status === 'published' ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <Link href={`/admin/pages/static/${p.slug}`} aria-label={`Edit ${p.title}`} className="h-7 w-7 inline-flex items-center justify-center rounded bg-[#4472C4] text-white hover:bg-blue-700">
                        <Pencil size={13} />
                      </Link>
                    </td>
                  </tr>
                )
              })}
              {!pages.length && (
                <tr><td colSpan={8} className="px-4 py-10 text-center text-[#9CA3AF]">No static pages found</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </>
  )
}
