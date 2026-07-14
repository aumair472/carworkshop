'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import toast from 'react-hot-toast'
import { Plus, Pencil, Trash2, X } from 'lucide-react'
import { PillToggle } from '@/components/admin/ui/PillToggle'
import { AdminInput, AdminTextarea } from '@/components/admin/ui/AdminField'
import type { SearchContent } from '@/types'

interface Props { initialRows: SearchContent[] }

export function SearchContentManager({ initialRows }: Props) {
  const router = useRouter()
  const [rows, setRows] = useState(initialRows)
  const [editing, setEditing] = useState<SearchContent | null>(null)
  const [creating, setCreating] = useState(false)

  async function toggleActive(row: SearchContent) {
    const next = !row.is_active
    const res = await fetch(`/api/admin/search-content/${row.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ is_active: next }),
    })
    if (res.ok) setRows(rs => rs.map(r => r.id === row.id ? { ...r, is_active: next } : r))
    else toast.error('Update failed')
  }

  async function remove(row: SearchContent) {
    if (!window.confirm(`Delete "${row.title}"?`)) return
    const res = await fetch(`/api/admin/search-content/${row.id}`, { method: 'DELETE' })
    if (res.ok) { setRows(rs => rs.filter(r => r.id !== row.id)); toast.success('Deleted') }
    else toast.error('Delete failed')
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <button type="button" onClick={() => setCreating(true)} className="h-9 inline-flex items-center gap-1 rounded bg-[#E8601C] text-white text-sm font-bold px-3 hover:bg-[#D15518]">
          <Plus size={15} /> ADD NEW
        </button>
      </div>

      <div className="bg-white border border-[#E5E7EB] rounded-lg overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr style={{ backgroundColor: '#1F2937' }}>
              <th className="px-4 py-3 text-left font-semibold text-white">Title</th>
              <th className="px-4 py-3 text-left font-semibold text-white">URL</th>
              <th className="px-4 py-3 text-left font-semibold text-white">Content Preview</th>
              <th className="px-4 py-3 text-left font-semibold text-white">Status</th>
              <th className="px-4 py-3 text-left font-semibold text-white">Edit</th>
            </tr>
          </thead>
          <tbody>
            {rows.map(row => (
              <tr key={row.id} className="border-b border-[#E5E7EB] bg-white hover:bg-[#F9FAFB]">
                <td className="px-4 py-3 font-semibold text-[#1F2937] text-xs">{row.title}</td>
                <td className="px-4 py-3 text-xs text-[#4472C4]">{row.url}</td>
                <td className="px-4 py-3 text-xs max-w-[300px] truncate">{row.description ?? row.keywords.join(', ')}</td>
                <td className="px-4 py-3"><PillToggle value={row.is_active} onChange={() => void toggleActive(row)} /></td>
                <td className="px-4 py-3">
                  <span className="inline-flex gap-1">
                    <button type="button" aria-label="Edit" onClick={() => setEditing(row)} className="h-7 w-7 inline-flex items-center justify-center rounded bg-[#22C55E] text-white hover:bg-[#16A34A]"><Pencil size={13} /></button>
                    <button type="button" aria-label="Delete" onClick={() => void remove(row)} className="h-7 w-7 inline-flex items-center justify-center rounded bg-[#EF4444] text-white hover:bg-[#DC2626]"><Trash2 size={13} /></button>
                  </span>
                </td>
              </tr>
            ))}
            {rows.length === 0 && (
              <tr><td colSpan={5} className="px-4 py-10 text-center text-[#9CA3AF]">No search content yet</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {(editing || creating) && (
        <SearchContentModal
          row={editing}
          onClose={() => { setEditing(null); setCreating(false) }}
          onSaved={() => { setEditing(null); setCreating(false); router.refresh() }}
        />
      )}
    </div>
  )
}

function SearchContentModal({ row, onClose, onSaved }: { row: SearchContent | null; onClose: () => void; onSaved: () => void }) {
  const [title, setTitle] = useState(row?.title ?? '')
  const [url, setUrl] = useState(row?.url ?? '')
  const [keywords, setKeywords] = useState(row?.keywords.join('; ') ?? '')
  const [description, setDescription] = useState(row?.description ?? '')
  const [saving, setSaving] = useState(false)

  async function save() {
    if (!title || !url) { toast.error('Title and URL are required'); return }
    setSaving(true)
    const payload = {
      title,
      url,
      keywords: keywords.split(';').map(k => k.trim()).filter(Boolean),
      description: description || null,
    }
    const res = await fetch(row ? `/api/admin/search-content/${row.id}` : '/api/admin/search-content', {
      method: row ? 'PATCH' : 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
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
          <h3 className="text-sm font-bold uppercase text-[#1F2937]">{row ? 'EDIT SEARCH CONTENT' : 'ADD SEARCH CONTENT'}</h3>
          <button type="button" aria-label="Close" onClick={onClose} className="text-[#6B7280] hover:text-[#1F2937]"><X size={18} /></button>
        </div>
        <div className="p-5 space-y-3">
          <AdminInput label="Title" required value={title} onChange={e => setTitle(e.target.value)} />
          <AdminInput label="URL" required value={url} onChange={e => setUrl(e.target.value)} placeholder="/services/oil-change" />
          <AdminInput label="Keywords (separate with semicolon ;)" value={keywords} onChange={e => setKeywords(e.target.value)} />
          <AdminTextarea label="Content Preview / Description" value={description} onChange={e => setDescription(e.target.value)} rows={3} />
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
