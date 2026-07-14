'use client'

import { useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import toast from 'react-hot-toast'
import { Search, RotateCcw, Plus, Pencil, X, FileText } from 'lucide-react'
import { PillToggle } from '@/components/admin/ui/PillToggle'
import { AdminInput, AdminTextarea } from '@/components/admin/ui/AdminField'
import type { LanguageKey } from '@/types'

interface Props { initialRows: LanguageKey[] }

const FILTER_INPUT = 'h-9 rounded border border-[#D1D5DB] bg-white px-2.5 text-sm text-[#374151] focus:outline-none focus:ring-2 focus:ring-[#4472C4]'

export function LanguageKeyManager({ initialRows }: Props) {
  const router = useRouter()
  const [rows, setRows] = useState(initialRows)
  const [fName, setFName] = useState('')
  const [applied, setApplied] = useState('')
  const [editing, setEditing] = useState<LanguageKey | null>(null)
  const [creating, setCreating] = useState(false)
  const [busy, setBusy] = useState(false)
  const [page, setPage] = useState(1)
  const pageSize = 10

  const filtered = useMemo(() => rows.filter(r =>
    !applied || r.key_name.toLowerCase().includes(applied.toLowerCase()) || r.slug.includes(applied.toLowerCase())
  ), [rows, applied])

  const pageCount = Math.max(1, Math.ceil(filtered.length / pageSize))
  const pageRows = filtered.slice((page - 1) * pageSize, page * pageSize)

  async function togglePublish(row: LanguageKey) {
    const next = !row.is_published
    const res = await fetch(`/api/admin/language-keys/${row.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ is_published: next }),
    })
    if (res.ok) setRows(rs => rs.map(r => r.id === row.id ? { ...r, is_published: next } : r))
    else toast.error('Update failed')
  }

  async function generateFile() {
    setBusy(true)
    const res = await fetch('/api/admin/language-keys/generate-file', { method: 'POST' })
    setBusy(false)
    if (!res.ok) { toast.error('Generate failed'); return }
    const d = await res.json() as { count: number; en: Record<string, string>; ar: Record<string, string> }
    // Offer the generated bundles as a download.
    const blob = new Blob([JSON.stringify({ en: d.en, ar: d.ar }, null, 2)], { type: 'application/json' })
    const a = document.createElement('a')
    a.href = URL.createObjectURL(blob)
    a.download = 'language-keys.json'
    a.click()
    URL.revokeObjectURL(a.href)
    toast.success(`Generated ${d.count} keys`)
  }

  return (
    <div className="space-y-4">
      <div className="bg-[#F3F4F6] border border-[#E5E7EB] rounded-lg p-3 flex flex-wrap items-center gap-2">
        <input value={fName} onChange={e => setFName(e.target.value)} placeholder="Name" className={FILTER_INPUT} />
        <button type="button" onClick={() => { setApplied(fName); setPage(1) }} className="h-9 inline-flex items-center gap-1.5 rounded bg-[#22C55E] text-white text-sm font-semibold px-3 hover:bg-[#16A34A]">
          <Search size={15} /> Search
        </button>
        <button type="button" onClick={() => { setFName(''); setApplied(''); setPage(1) }} aria-label="Reset" className="h-9 w-9 inline-flex items-center justify-center rounded bg-[#22C55E] text-white hover:bg-[#16A34A]">
          <RotateCcw size={15} />
        </button>
        <div className="flex-1" />
        <button type="button" disabled={busy} onClick={() => void generateFile()} className="h-9 inline-flex items-center gap-1.5 rounded bg-[#22C55E] text-white text-sm font-semibold px-3 hover:bg-[#16A34A] disabled:opacity-50">
          <FileText size={14} /> GENERATE FILE
        </button>
        <button type="button" onClick={() => setCreating(true)} className="h-9 inline-flex items-center gap-1 rounded bg-[#E8601C] text-white text-sm font-bold px-3 hover:bg-[#D15518]">
          <Plus size={15} /> ADD NEW
        </button>
      </div>

      <p className="text-xs text-[#6B7280]">{filtered.length} Total Results</p>

      <div className="bg-white border border-[#E5E7EB] rounded-lg overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr style={{ backgroundColor: '#1F2937' }}>
              <th className="px-4 py-3 text-left font-semibold text-white">Key Name</th>
              <th className="px-4 py-3 text-left font-semibold text-white">English Value</th>
              <th className="px-4 py-3 text-left font-semibold text-white">Arabic Value</th>
              <th className="px-4 py-3 text-left font-semibold text-white">Publish</th>
              <th className="px-4 py-3 text-left font-semibold text-white">Edit</th>
            </tr>
          </thead>
          <tbody>
            {pageRows.map(row => (
              <tr key={row.id} className="border-b border-[#E5E7EB] bg-white hover:bg-[#F9FAFB]">
                <td className="px-4 py-3 min-w-[200px]">
                  <span className="block font-semibold text-[#1F2937] text-xs">{row.key_name}</span>
                  <span className="block text-[10px] text-[#9CA3AF]">[{row.slug}]</span>
                </td>
                <td className="px-4 py-3 text-xs min-w-[180px]">{row.value_en}</td>
                <td className="px-4 py-3 text-xs min-w-[180px]" dir="rtl">{row.value_ar}</td>
                <td className="px-4 py-3"><PillToggle value={row.is_published} onChange={() => void togglePublish(row)} /></td>
                <td className="px-4 py-3">
                  <button type="button" aria-label="Edit" onClick={() => setEditing(row)} className="h-7 w-7 inline-flex items-center justify-center rounded bg-[#22C55E] text-white hover:bg-[#16A34A]"><Pencil size={13} /></button>
                </td>
              </tr>
            ))}
            {pageRows.length === 0 && (
              <tr><td colSpan={5} className="px-4 py-10 text-center text-[#9CA3AF]">No language keys found</td></tr>
            )}
          </tbody>
        </table>
        {pageCount > 1 && (
          <div className="flex items-center justify-end gap-2 px-4 py-3 border-t border-[#E5E7EB]">
            <span className="text-xs text-[#6B7280]">Page {page} of {pageCount}</span>
            <button type="button" disabled={page <= 1} onClick={() => setPage(p => p - 1)} className="h-[30px] px-3 text-xs font-bold rounded bg-white border border-[#E5E7EB] disabled:opacity-40">PREV</button>
            <button type="button" disabled={page >= pageCount} onClick={() => setPage(p => p + 1)} className="h-[30px] px-3 text-xs font-bold rounded bg-[#1F2937] text-white disabled:opacity-40">NEXT ▸</button>
          </div>
        )}
      </div>

      {(editing || creating) && (
        <LanguageKeyModal
          row={editing}
          onClose={() => { setEditing(null); setCreating(false) }}
          onSaved={() => { setEditing(null); setCreating(false); router.refresh() }}
        />
      )}
    </div>
  )
}

function LanguageKeyModal({ row, onClose, onSaved }: { row: LanguageKey | null; onClose: () => void; onSaved: () => void }) {
  const [keyName, setKeyName] = useState(row?.key_name ?? '')
  const [slug, setSlug] = useState(row?.slug ?? '')
  const [en, setEn] = useState(row?.value_en ?? '')
  const [ar, setAr] = useState(row?.value_ar ?? '')
  const [comment, setComment] = useState(row?.comment ?? '')
  const [saving, setSaving] = useState(false)

  async function save() {
    if (!row && (!keyName || !slug)) { toast.error('Key name and slug are required'); return }
    setSaving(true)
    const res = await fetch(row ? `/api/admin/language-keys/${row.id}` : '/api/admin/language-keys', {
      method: row ? 'PUT' : 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ key_name: keyName, slug, value_en: en, value_ar: ar, comment: comment || null }),
    })
    setSaving(false)
    if (!res.ok) {
      const d = await res.json().catch(() => null) as { error?: string } | null
      toast.error(d?.error ?? 'Save failed')
      return
    }
    toast.success('Saved')
    onSaved()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" role="dialog" aria-modal="true">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-lg">
        <div className="flex items-center justify-between px-5 py-3 border-b border-[#E5E7EB]">
          <h3 className="text-sm font-bold uppercase text-[#1F2937]">{row ? 'EDIT LANGUAGE KEYS' : 'ADD LANGUAGE KEY'}</h3>
          <button type="button" aria-label="Close" onClick={onClose} className="text-[#6B7280] hover:text-[#1F2937]"><X size={18} /></button>
        </div>
        <div className="p-5 space-y-3 max-h-[70vh] overflow-y-auto">
          <AdminInput label="Full text" value={keyName} onChange={e => setKeyName(e.target.value)} readOnly={!!row} disabled={!!row} />
          <AdminInput label="key_slug" value={slug} onChange={e => setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, '_'))} readOnly={!!row} disabled={!!row} />
          <AdminTextarea label="Arabic" dir="rtl" value={ar} onChange={e => setAr(e.target.value)} rows={3} />
          <AdminTextarea label="English" value={en} onChange={e => setEn(e.target.value)} rows={3} />
          <AdminTextarea label="Comment" value={comment} onChange={e => setComment(e.target.value)} rows={2} />
        </div>
        <div className="flex justify-end gap-2 px-5 py-3 border-t border-[#E5E7EB]">
          <button type="button" disabled={saving} onClick={() => void save()} className="h-9 rounded bg-[#22C55E] text-white text-sm font-semibold px-5 hover:bg-[#16A34A] disabled:opacity-50">
            {row ? 'UPDATE' : 'CREATE'}
          </button>
          <button type="button" onClick={onClose} className="h-9 rounded bg-[#EF4444] text-white text-sm font-semibold px-5 hover:bg-[#DC2626]">Close</button>
        </div>
      </div>
    </div>
  )
}
