'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import toast from 'react-hot-toast'
import { Search, Plus, Pencil, Copy, Trash2, ChevronUp, ChevronDown } from 'lucide-react'
import { PillToggle } from '@/components/admin/ui/PillToggle'
import { ConfirmModal } from '@/components/admin/ConfirmModal'
import { COUNTRIES, countryName, countryFlag } from '@/lib/geo'
import type { Faq } from '@/types'

interface Props { initialRows: Faq[] }

const FILTER_INPUT = 'h-9 rounded border border-[#D1D5DB] bg-white px-2.5 text-sm text-[#374151] focus:outline-none focus:ring-2 focus:ring-[#4472C4]'

export function FaqTable({ initialRows }: Props) {
  const router = useRouter()
  const [rows, setRows] = useState(initialRows)
  const [fCountry, setFCountry] = useState('')
  const [fName, setFName] = useState('')
  const [applied, setApplied] = useState({ country: '', name: '' })
  const [selected, setSelected] = useState<string[]>([])
  const [deleteTarget, setDeleteTarget] = useState<Faq | null>(null)
  const [deleting, setDeleting] = useState(false)

  const filtered = useMemo(() => rows.filter(r => {
    if (applied.country && r.country !== applied.country) return false
    if (applied.name && !r.name.toLowerCase().includes(applied.name.toLowerCase())) return false
    return true
  }), [rows, applied])

  const byCountry = useMemo(() => {
    const map = new Map<string, Faq[]>()
    for (const r of filtered) {
      const list = map.get(r.country) ?? []
      list.push(r)
      map.set(r.country, list)
    }
    return [...map.entries()]
  }, [filtered])

  async function togglePublish(row: Faq) {
    const next = !row.is_active
    const res = await fetch(`/api/admin/faqs/${row.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ is_active: next }),
    })
    if (res.ok) {
      setRows(rs => rs.map(r => r.id === row.id ? { ...r, is_active: next } : r))
    } else toast.error('Update failed')
  }

  async function reorder(row: Faq, direction: 'up' | 'down') {
    const res = await fetch('/api/admin/faqs/reorder', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: row.id, direction }),
    })
    if (res.ok) router.refresh()
    else toast.error('Reorder failed')
  }

  async function duplicate(row: Faq) {
    const res = await fetch('/api/admin/faqs', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        country: row.country,
        name: `${row.name} (copy)`,
        arabic_name: row.arabic_name,
        description_html: row.description_html,
        arabic_description_html: row.arabic_description_html,
        display_order: row.display_order + 1,
        is_active: false,
      }),
    })
    if (res.ok) { toast.success('Duplicated'); router.refresh() }
    else toast.error('Duplicate failed')
  }

  function toggleRow(id: string) {
    setSelected(s => s.includes(id) ? s.filter(x => x !== id) : [...s, id])
  }

  async function confirmDelete() {
    if (!deleteTarget) return
    setDeleting(true)
    const res = await fetch(`/api/admin/faqs/${deleteTarget.id}`, { method: 'DELETE' })
    setDeleting(false)
    if (res.ok) {
      setRows(rs => rs.filter(r => r.id !== deleteTarget.id))
      toast.success('Deleted')
    } else toast.error('Delete failed')
    setDeleteTarget(null)
  }

  return (
    <div className="space-y-4">
      <div className="bg-[#F3F4F6] border border-[#E5E7EB] rounded-lg p-3 flex flex-wrap items-center gap-2">
        <select value={fCountry} onChange={e => setFCountry(e.target.value)} className={FILTER_INPUT} aria-label="Country">
          <option value="">Country</option>
          {COUNTRIES.map(c => <option key={c.code} value={c.code}>{c.name}</option>)}
        </select>
        <input value={fName} onChange={e => setFName(e.target.value)} placeholder="Name" className={FILTER_INPUT} />
        <button type="button" onClick={() => setApplied({ country: fCountry, name: fName })} className="h-9 inline-flex items-center gap-1.5 rounded bg-[#22C55E] text-white text-sm font-semibold px-3 hover:bg-[#16A34A]">
          <Search size={15} /> Search
        </button>
        <button type="button" onClick={() => router.refresh()} className="h-9 rounded bg-[#22C55E] text-white text-sm font-semibold px-4 hover:bg-[#16A34A]">Refresh</button>
        <div className="flex-1" />
        <Link href="/admin/faqs/new" className="h-9 inline-flex items-center gap-1 rounded bg-[#E8601C] text-white text-sm font-bold px-3 hover:bg-[#D15518]">
          <Plus size={15} /> ADD NEW
        </Link>
      </div>

      <p className="text-xs text-[#6B7280]">{filtered.length} Total Results</p>

      <div className="bg-white border border-[#E5E7EB] rounded-lg overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr style={{ backgroundColor: '#1F2937' }}>
              <th className="w-10 px-4 py-3" />
              <th className="px-4 py-3 text-left font-semibold text-white">Country</th>
              <th className="px-4 py-3 text-left font-semibold text-white">Name</th>
              <th className="px-4 py-3 text-right font-semibold text-white">Name (AR)</th>
              <th className="px-4 py-3 text-left font-semibold text-white">Display Order</th>
              <th className="px-4 py-3 text-left font-semibold text-white">Publish</th>
              <th className="px-4 py-3 text-left font-semibold text-white">Edit</th>
            </tr>
          </thead>
          <tbody>
            {byCountry.map(([country, faqs]) => (
              [
                <tr key={`h-${country}`}>
                  <td colSpan={7} className="px-4 py-2 text-center text-xs font-bold text-white uppercase tracking-wider" style={{ backgroundColor: '#22C55E' }}>
                    {countryName(country)}
                  </td>
                </tr>,
                ...faqs.map(row => (
                  <tr key={row.id} className="border-b border-[#E5E7EB] bg-white hover:bg-[#F9FAFB]">
                    <td className="px-4 py-3">
                      <input type="checkbox" className="rounded border-[#D1D5DB]" checked={selected.includes(row.id)} onChange={() => toggleRow(row.id)} aria-label={`Select ${row.name}`} />
                    </td>
                    <td className="px-4 py-3 text-lg">{countryFlag(row.country)}</td>
                    <td className="px-4 py-3 font-semibold text-[#1F2937] text-xs">{row.name}</td>
                    <td className="px-4 py-3 text-right text-xs" dir="rtl">{row.arabic_name ?? '—'}</td>
                    <td className="px-4 py-3">
                      <span className="inline-flex items-center gap-2 text-xs font-bold">
                        {row.display_order}
                        <span className="inline-flex flex-col">
                          <button type="button" aria-label="Move up" onClick={() => void reorder(row, 'up')} className="text-[#6B7280] hover:text-[#1F2937]"><ChevronUp size={13} /></button>
                          <button type="button" aria-label="Move down" onClick={() => void reorder(row, 'down')} className="text-[#6B7280] hover:text-[#1F2937]"><ChevronDown size={13} /></button>
                        </span>
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <PillToggle value={row.is_active} onChange={() => void togglePublish(row)} />
                    </td>
                    <td className="px-4 py-3">
                      <span className="inline-flex gap-1">
                        <Link href={`/admin/faqs/${row.id}`} aria-label="Edit" className="h-7 w-7 inline-flex items-center justify-center rounded bg-[#22C55E] text-white hover:bg-[#16A34A]"><Pencil size={13} /></Link>
                        <button type="button" aria-label="Duplicate" onClick={() => void duplicate(row)} className="h-7 w-7 inline-flex items-center justify-center rounded bg-[#22C55E] text-white hover:bg-[#16A34A]"><Copy size={13} /></button>
                        <button type="button" aria-label={`Delete ${row.name}`} onClick={() => setDeleteTarget(row)} className="h-7 w-7 inline-flex items-center justify-center rounded bg-[#DC2626] text-white hover:bg-red-700"><Trash2 size={13} /></button>
                      </span>
                    </td>
                  </tr>
                )),
              ]
            ))}
            {filtered.length === 0 && (
              <tr><td colSpan={7} className="px-4 py-10 text-center text-[#9CA3AF]">No FAQs found</td></tr>
            )}
          </tbody>
        </table>
      </div>

      <ConfirmModal
        open={!!deleteTarget}
        title="Delete FAQ"
        message={`Delete "${deleteTarget?.name}"? This cannot be undone.`}
        confirmLabel="Delete"
        variant="danger"
        loading={deleting}
        onConfirm={() => void confirmDelete()}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  )
}
