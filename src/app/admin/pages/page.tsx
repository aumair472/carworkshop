'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import Link from 'next/link'
import { Badge } from '@/components/ui/Badge'
import { Pagination } from '@/components/ui/Pagination'
import { ConfirmModal } from '@/components/admin/ConfirmModal'
import type { ContentStatus } from '@/types'

interface PageRow {
  id: string
  slug: string
  h1: string
  page_type: string
  status: ContentStatus
  brand_id: string | null
  updated_at: string
}
interface BrandOpt { id: string; name: string }

const TYPE_OPTIONS: Array<{ value: string; label: string }> = [
  { value: '', label: 'All Types' },
  { value: 'brand', label: 'Brand' },
  { value: 'brand_service', label: 'Brand + Service' },
  { value: 'model', label: 'Model' },
  { value: 'model_service', label: 'Model + Service' },
  { value: 'model_service_location', label: '4D Page' },
]

const TYPE_LABEL: Record<string, string> = {
  brand: 'Brand', brand_service: 'B+Service', model: 'Model',
  model_service: 'M+Service', model_service_location: '4D Page',
  brand_service_location: 'B+Svc+Loc', service: 'Service', location: 'Location',
}

const TYPE_BADGE: Record<string, string> = {
  brand_service: 'bg-blue-50 text-blue-700 border-blue-200',
  brand_service_location: 'bg-purple-50 text-purple-700 border-purple-200',
  model_service: 'bg-green-50 text-green-700 border-green-200',
  model_service_location: 'bg-orange-50 text-orange-700 border-orange-200',
}
const typeBadgeClass = (t: string) => TYPE_BADGE[t] ?? 'bg-zinc-100 text-zinc-600 border-zinc-200'

// Tabs filter the table by page_type ('' = all). Maps onto the same `type` filter.
const TYPE_TABS: Array<{ value: string; label: string }> = [
  { value: '', label: 'All Pages' },
  { value: 'brand_service', label: 'Brand + Service' },
  { value: 'model_service', label: 'Model + Service' },
  { value: 'model_service_location', label: '4D Pages' },
  { value: 'model', label: 'Models' },
  { value: 'brand', label: 'Brands' },
]

const QUICK_LINKS: Array<{ href: string; icon: string; label: string }> = [
  { href: '/admin/pages/static/home', icon: '🏠', label: 'Edit Home Page' },
  { href: '/admin/pages/static/about', icon: 'ℹ️', label: 'Edit About Page' },
  { href: '/admin/pages/static/contact', icon: '📞', label: 'Edit Contact Page' },
  { href: '/admin/pages/static/faq', icon: '❓', label: 'Edit FAQ Page' },
  { href: '/admin/pages/models', icon: '🚘', label: 'Edit Model Pages' },
]

export default function PagesAdminPage({ initialType = '' }: { initialType?: string } = {}) {
  const [rows, setRows] = useState<PageRow[]>([])
  const [brands, setBrands] = useState<BrandOpt[]>([])
  const [total, setTotal] = useState(0)
  const [totalPages, setTotalPages] = useState(1)
  const [page, setPage] = useState(1)
  const [loading, setLoading] = useState(true)

  const [search, setSearch] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const [type, setType] = useState(initialType)
  const [brand, setBrand] = useState('')
  const [status, setStatus] = useState('')

  const [selected, setSelected] = useState<Set<string>>(new Set())
  const [confirmDelete, setConfirmDelete] = useState(false)
  const [working, setWorking] = useState(false)
  const [stats, setStats] = useState({ total: 0, published: 0, draft: 0 })

  // Load brands once for the filter dropdown.
  useEffect(() => {
    void (async () => {
      try {
        const res = await fetch('/api/admin/brands')
        if (res.ok) { const d = await res.json() as { brands: BrandOpt[] }; setBrands(d.brands ?? []) }
      } catch { /* ignore */ }
    })()
  }, [])

  // Debounce the search box (300ms).
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => { setDebouncedSearch(search); setPage(1) }, 300)
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current) }
  }, [search])

  const [reload, setReload] = useState(0)
  const refresh = useCallback(() => setReload(n => n + 1), [])

  // Stat row counts (independent of the active filter).
  useEffect(() => {
    void (async () => {
      try {
        const [a, b, c] = await Promise.all([
          fetch('/api/admin/pages?limit=1').then(r => r.json() as Promise<{ total: number }>),
          fetch('/api/admin/pages?status=published&limit=1').then(r => r.json() as Promise<{ total: number }>),
          fetch('/api/admin/pages?status=draft&limit=1').then(r => r.json() as Promise<{ total: number }>),
        ])
        setStats({ total: a.total ?? 0, published: b.total ?? 0, draft: c.total ?? 0 })
      } catch { /* ignore */ }
    })()
  }, [reload])

  // Fetch rows whenever filters, page or a manual reload changes.
  useEffect(() => {
    void (async () => {
      setLoading(true)
      try {
        const qs = new URLSearchParams({ page: String(page), limit: '20' })
        if (debouncedSearch) qs.set('search', debouncedSearch)
        if (type) qs.set('type', type)
        if (brand) qs.set('brand', brand)
        if (status) qs.set('status', status)
        const res = await fetch(`/api/admin/pages?${qs.toString()}`)
        if (!res.ok) return
        const d = await res.json() as { pages: PageRow[]; total: number; totalPages: number }
        setRows(d.pages); setTotal(d.total); setTotalPages(d.totalPages); setSelected(new Set())
      } catch { /* ignore */ } finally { setLoading(false) }
    })()
  }, [page, debouncedSearch, type, brand, status, reload])

  function toggleRow(id: string) {
    setSelected(prev => { const n = new Set(prev); if (n.has(id)) n.delete(id); else n.add(id); return n })
  }
  function toggleAll() {
    setSelected(prev => prev.size === rows.length ? new Set() : new Set(rows.map(r => r.id)))
  }

  async function bulkStatus(action: 'bulk-publish' | 'bulk-unpublish') {
    if (selected.size === 0) return
    setWorking(true)
    try {
      const ids = Array.from(selected)
      for (let i = 0; i < ids.length; i += 200) {
        await fetch(`/api/admin/pages/${action}`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ids: ids.slice(i, i + 200) }) })
      }
      refresh()
    } finally { setWorking(false) }
  }

  async function bulkDelete() {
    setWorking(true)
    try {
      for (const id of Array.from(selected)) {
        await fetch(`/api/admin/pages/${id}`, { method: 'DELETE' })
      }
      setConfirmDelete(false)
      refresh()
    } finally { setWorking(false) }
  }

  async function togglePublish(row: PageRow) {
    const action = row.status === 'published' ? 'bulk-unpublish' : 'bulk-publish'
    await fetch(`/api/admin/pages/${action}`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ids: [row.id] }) })
    refresh()
  }

  return (
    <div className="p-6 lg:p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-[#1F2937]">All Pages</h1>
          <p className="text-sm text-[#6B7280] mt-1">{total.toLocaleString('en-AE')} pages match — search, edit and manage them.</p>
        </div>
        <div className="flex gap-2">
          <Link href="/admin/pages/static" className="px-4 py-2 rounded-md border border-[#4472C4] text-[#4472C4] text-sm font-semibold hover:bg-[#EEF3FB] transition-colors">Static Pages</Link>
          <Link href="/admin/pages/generate" className="px-4 py-2 rounded-md bg-[#E8601C] text-white text-sm font-semibold hover:bg-[#D15518] transition-colors">⚡ Generate Pages</Link>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
        {[
          { label: 'Total Pages', value: stats.total },
          { label: 'Published', value: stats.published },
          { label: 'Draft', value: stats.draft },
          { label: 'Static', value: 6 },
        ].map(s => (
          <div key={s.label} className="bg-white rounded-xl border border-zinc-200 shadow-sm p-4">
            <p className="text-2xl font-extrabold text-zinc-900">{s.value.toLocaleString('en-AE')}</p>
            <p className="text-xs text-zinc-500 mt-0.5">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Quick access to static page editors */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
        {QUICK_LINKS.map(q => (
          <Link key={q.href} href={q.href} className="flex items-center gap-3 bg-white rounded-lg shadow-card border border-[#E5E7EB] p-4 hover:border-[#4472C4] hover:shadow-md transition-all">
            <span className="text-2xl" aria-hidden="true">{q.icon}</span>
            <span className="text-sm font-semibold text-[#1F2937]">{q.label}</span>
          </Link>
        ))}
      </div>

      {/* Type tabs */}
      <div className="flex flex-wrap gap-1 mb-4 border-b border-[#E5E7EB]">
        {TYPE_TABS.map(t => (
          <button
            key={t.value}
            onClick={() => { setType(t.value); setPage(1) }}
            className={['px-4 py-2 text-sm font-medium -mb-px border-b-2 transition-colors', type === t.value ? 'border-[#4472C4] text-[#4472C4]' : 'border-transparent text-[#6B7280] hover:text-[#1F2937]'].join(' ')}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-card border border-[#E5E7EB] p-4 mb-4 grid gap-3 md:grid-cols-4">
        <input
          type="search"
          placeholder="Search by title or slug…"
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="md:col-span-2 px-3 py-2 rounded-md border border-[#E5E7EB] text-sm focus:outline-none focus:ring-2 focus:ring-[#4472C4]"
        />
        <select value={type} onChange={e => { setType(e.target.value); setPage(1) }} className="px-3 py-2 rounded-md border border-[#E5E7EB] text-sm bg-white">
          {TYPE_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>
        <select value={brand} onChange={e => { setBrand(e.target.value); setPage(1) }} className="px-3 py-2 rounded-md border border-[#E5E7EB] text-sm bg-white">
          <option value="">All Brands</option>
          {brands.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
        </select>
        <select value={status} onChange={e => { setStatus(e.target.value); setPage(1) }} className="px-3 py-2 rounded-md border border-[#E5E7EB] text-sm bg-white">
          <option value="">All Status</option>
          <option value="published">Published</option>
          <option value="draft">Draft</option>
        </select>
      </div>

      {/* Bulk actions */}
      {selected.size > 0 && (
        <div className="flex items-center gap-3 bg-[#EEF3FB] border border-[#C7D9F5] rounded-md px-4 py-2 mb-3 text-sm">
          <span className="font-medium text-[#274E96]">{selected.size} selected</span>
          <button disabled={working} onClick={() => void bulkStatus('bulk-publish')} className="text-[#059669] font-medium hover:underline disabled:opacity-50">Publish</button>
          <button disabled={working} onClick={() => void bulkStatus('bulk-unpublish')} className="text-[#D97706] font-medium hover:underline disabled:opacity-50">Unpublish</button>
          <button disabled={working} onClick={() => setConfirmDelete(true)} className="text-[#DC2626] font-medium hover:underline disabled:opacity-50">Delete</button>
        </div>
      )}

      {/* Table */}
      <div className="bg-white rounded-lg shadow-card border border-[#E5E7EB] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-[#F9FAFB] border-b border-[#E5E7EB] text-left text-xs font-semibold text-[#6B7280] uppercase tracking-wider">
                <th className="px-4 py-3 w-10"><input type="checkbox" checked={rows.length > 0 && selected.size === rows.length} onChange={toggleAll} aria-label="Select all" /></th>
                <th className="px-4 py-3">Page Title</th>
                <th className="px-4 py-3">URL</th>
                <th className="px-4 py-3">Type</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Updated</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F3F4F6]">
              {loading && <tr><td colSpan={7} className="px-4 py-12 text-center text-[#9CA3AF]">Loading…</td></tr>}
              {!loading && rows.length === 0 && <tr><td colSpan={7} className="px-4 py-12 text-center text-[#9CA3AF]">No pages match your filters.</td></tr>}
              {!loading && rows.map(row => (
                <tr key={row.id} className="hover:bg-[#F9FAFB]">
                  <td className="px-4 py-3"><input type="checkbox" checked={selected.has(row.id)} onChange={() => toggleRow(row.id)} aria-label={`Select ${row.h1}`} /></td>
                  <td className="px-4 py-3 font-medium text-[#1F2937] max-w-xs truncate">{row.h1}</td>
                  <td className="px-4 py-3 font-mono text-xs text-[#6B7280] max-w-xs truncate">/brands/{row.slug}</td>
                  <td className="px-4 py-3"><span className={`text-xs px-2 py-0.5 rounded-full border font-medium ${typeBadgeClass(row.page_type)}`}>{TYPE_LABEL[row.page_type] ?? row.page_type}</span></td>
                  <td className="px-4 py-3"><Badge variant={row.status}>{row.status}</Badge></td>
                  <td className="px-4 py-3 text-[#9CA3AF] text-xs">{new Date(row.updated_at).toLocaleDateString('en-AE')}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-3 text-xs font-medium">
                      <Link href={`/admin/pages/${row.id}/edit`} className="text-[#4472C4] hover:underline">Edit</Link>
                      <a href={`/brands/${row.slug}`} target="_blank" rel="noopener noreferrer" className="text-[#6B7280] hover:underline">Preview</a>
                      <button onClick={() => void togglePublish(row)} className={row.status === 'published' ? 'text-[#D97706] hover:underline' : 'text-[#059669] hover:underline'}>
                        {row.status === 'published' ? 'Unpublish' : 'Publish'}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="mt-4 flex justify-center">
        <Pagination currentPage={page} totalPages={totalPages} onPageChange={setPage} />
      </div>

      <ConfirmModal open={confirmDelete} title="Delete pages" message={`Delete ${selected.size} selected page(s)? This cannot be undone.`} confirmLabel="Delete" variant="danger" loading={working} onConfirm={() => void bulkDelete()} onCancel={() => setConfirmDelete(false)} />
    </div>
  )
}
