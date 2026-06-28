'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import Image from 'next/image'
import toast from 'react-hot-toast'
import { AdminTopbar } from '@/components/admin/AdminTopbar'
import { AdminButton } from '@/components/admin/ui/AdminButton'
import { EmptyState, SkeletonCards } from '@/components/admin/ui/AdminStates'
import { ConfirmModal } from '@/components/admin/ConfirmModal'
import { Upload, LayoutGrid, List, Copy, Trash2, X } from 'lucide-react'

interface MediaItem {
  id: string; filename: string; original_name: string; url: string; alt_text: string | null
  mime_type: string; size_bytes: number; width: number | null; height: number | null; folder: string; created_at: string
}

const FOLDERS = ['All', 'general', 'brands', 'services', 'blog', 'uploads']

function fmtSize(b: number) { return b < 1024 ? `${b} B` : b < 1048576 ? `${(b / 1024).toFixed(0)} KB` : `${(b / 1048576).toFixed(1)} MB` }

export default function MediaPage() {
  const [items, setItems] = useState<MediaItem[]>([])
  const [loaded, setLoaded] = useState(false)
  const [view, setView] = useState<'grid' | 'list'>('grid')
  const [folder, setFolder] = useState('All')
  const [search, setSearch] = useState('')
  const [uploads, setUploads] = useState<Record<string, number>>({})
  const [active, setActive] = useState<MediaItem | null>(null)
  const [toDelete, setToDelete] = useState<MediaItem | null>(null)
  const [dragOver, setDragOver] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)

  const load = useCallback(async () => {
    try {
      const res = await fetch('/api/admin/media')
      if (res.ok) { const d = await res.json() as { media: MediaItem[] }; setItems(d.media ?? []) }
    } catch { /* ignore */ }
  }, [])

  useEffect(() => {
    let cancelled = false
    void (async () => {
      try {
        const res = await fetch('/api/admin/media')
        if (cancelled) return
        if (res.ok) { const d = await res.json() as { media: MediaItem[] }; setItems(d.media ?? []) }
      } catch { /* ignore */ } finally { if (!cancelled) setLoaded(true) }
    })()
    return () => { cancelled = true }
  }, [])

  const uploadFiles = useCallback(async (files: FileList | File[]) => {
    const list = Array.from(files)
    for (const file of list) {
      const key = `${file.name}-${Date.now()}`
      setUploads(u => ({ ...u, [key]: 0 }))
      try {
        const fd = new FormData(); fd.append('file', file)
        // Fetch has no progress; show indeterminate then complete.
        setUploads(u => ({ ...u, [key]: 50 }))
        const res = await fetch('/api/admin/media', { method: 'POST', body: fd })
        if (!res.ok) { const d = await res.json() as { error?: string }; toast.error(d.error ?? `Failed: ${file.name}`) }
        else { setUploads(u => ({ ...u, [key]: 100 })); toast.success(`Uploaded ${file.name}`) }
      } catch { toast.error(`Failed: ${file.name}`) }
      finally { setTimeout(() => setUploads(u => { const n = { ...u }; delete n[key]; return n }), 800) }
    }
    void load()
  }, [load])

  function onDrop(e: React.DragEvent) { e.preventDefault(); setDragOver(false); if (e.dataTransfer.files.length) void uploadFiles(e.dataTransfer.files) }

  async function saveAlt(item: MediaItem, alt: string) {
    const t = toast.loading('Saving…')
    try {
      const res = await fetch(`/api/admin/media/${item.id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ alt_text: alt }) })
      if (!res.ok) throw new Error()
      setItems(its => its.map(x => x.id === item.id ? { ...x, alt_text: alt } : x))
      setActive(a => a ? { ...a, alt_text: alt } : a)
      toast.success('Alt text saved', { id: t })
    } catch { toast.error('Save failed', { id: t }) }
  }

  async function doDelete(item: MediaItem) {
    const t = toast.loading('Deleting…')
    try {
      const res = await fetch(`/api/admin/media/${item.id}`, { method: 'DELETE' })
      if (!res.ok) throw new Error()
      setItems(its => its.filter(x => x.id !== item.id)); setToDelete(null); setActive(null)
      toast.success('Deleted', { id: t })
    } catch { toast.error('Delete failed', { id: t }) }
  }

  function copyUrl(url: string) { void navigator.clipboard.writeText(url).then(() => toast.success('URL copied')) }

  const visible = items.filter(i =>
    (folder === 'All' || i.folder === folder) &&
    (!search || i.original_name.toLowerCase().includes(search.toLowerCase()) || i.filename.toLowerCase().includes(search.toLowerCase()))
  )
  const uploadEntries = Object.entries(uploads)

  return (
    <div className="flex flex-col flex-1">
      <AdminTopbar title={`Media Library (${items.length})`} actions={<AdminButton variant="primary" onClick={() => fileRef.current?.click()}><Upload size={15} /> Upload Files</AdminButton>} />
      <input ref={fileRef} type="file" accept="image/*" multiple className="hidden" onChange={e => { if (e.target.files) void uploadFiles(e.target.files); e.target.value = '' }} />

      <div className="p-6 lg:p-8 space-y-5">
        {/* Upload zone */}
        <div
          onDragOver={e => { e.preventDefault(); setDragOver(true) }}
          onDragLeave={() => setDragOver(false)}
          onDrop={onDrop}
          onClick={() => fileRef.current?.click()}
          className={['rounded-xl border-2 border-dashed p-8 text-center cursor-pointer transition-colors', dragOver ? 'border-[#4472C4] bg-[#EEF3FB]' : 'border-zinc-300 bg-zinc-50 hover:border-zinc-400'].join(' ')}
        >
          <Upload size={24} className="mx-auto text-zinc-400" />
          <p className="text-sm font-medium text-zinc-700 mt-2">Drop images here, or click to browse</p>
          <p className="text-xs text-zinc-400">JPEG, PNG, WebP, SVG — max 5MB each</p>
        </div>

        {uploadEntries.length > 0 && (
          <div className="space-y-2">
            {uploadEntries.map(([k, pct]) => (
              <div key={k} className="flex items-center gap-3 text-xs text-zinc-500">
                <span className="truncate flex-1">{k.split('-')[0]}</span>
                <div className="w-40 h-1.5 bg-zinc-100 rounded-full overflow-hidden"><div className="h-full bg-[#4472C4] transition-all" style={{ width: `${pct}%` }} /></div>
              </div>
            ))}
          </div>
        )}

        {/* Controls */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex flex-wrap gap-1.5">
            {FOLDERS.map(f => (
              <button key={f} onClick={() => setFolder(f)} className={['px-3 py-1.5 rounded-lg text-sm font-medium border transition-colors', folder === f ? 'bg-[#4472C4] text-white border-[#4472C4]' : 'border-zinc-200 text-zinc-600 hover:bg-zinc-50'].join(' ')}>{f}</button>
            ))}
          </div>
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search files…" className="ml-auto px-3 py-2 rounded-lg border border-zinc-300 text-sm focus:outline-none focus:ring-2 focus:ring-[#4472C4] w-56" />
          <div className="flex rounded-lg border border-zinc-200 overflow-hidden">
            <button onClick={() => setView('grid')} className={['p-2', view === 'grid' ? 'bg-[#4472C4] text-white' : 'text-zinc-500 hover:bg-zinc-50'].join(' ')} aria-label="Grid view"><LayoutGrid size={16} /></button>
            <button onClick={() => setView('list')} className={['p-2', view === 'list' ? 'bg-[#4472C4] text-white' : 'text-zinc-500 hover:bg-zinc-50'].join(' ')} aria-label="List view"><List size={16} /></button>
          </div>
        </div>

        {/* Content */}
        {!loaded ? <SkeletonCards count={8} />
          : visible.length === 0 ? (
            <div className="bg-white rounded-xl border border-zinc-200">
              <EmptyState icon={<Upload size={22} />} title="No media yet" description="Upload images to use across your website." action={<AdminButton variant="primary" onClick={() => fileRef.current?.click()}><Upload size={15} /> Upload Your First Image</AdminButton>} />
            </div>
          ) : view === 'grid' ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              {visible.map(item => (
                <div key={item.id} className="bg-white rounded-xl border border-zinc-200 overflow-hidden group">
                  <button onClick={() => setActive(item)} className="block relative aspect-square w-full bg-zinc-100">
                    <Image src={item.url} alt={item.alt_text ?? item.original_name} fill className="object-cover" sizes="200px" />
                  </button>
                  <div className="p-2.5">
                    <p className="text-xs font-medium text-zinc-800 truncate">{item.original_name}</p>
                    <p className="text-[11px] text-zinc-400">{fmtSize(item.size_bytes)}{item.width ? ` · ${item.width}×${item.height}` : ''}</p>
                    <div className="flex items-center gap-1 mt-2">
                      <button onClick={() => copyUrl(item.url)} className="flex-1 inline-flex items-center justify-center gap-1 text-xs text-[#4472C4] border border-zinc-200 rounded py-1 hover:bg-[#EEF3FB]"><Copy size={12} /> URL</button>
                      <button onClick={() => setToDelete(item)} className="px-2 py-1 text-zinc-400 hover:text-red-500" aria-label="Delete"><Trash2 size={14} /></button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-white rounded-xl border border-zinc-200 overflow-hidden overflow-x-auto">
              <table className="w-full text-sm">
                <thead><tr className="bg-zinc-50 border-b border-zinc-200 text-left text-xs font-semibold text-zinc-500 uppercase tracking-wider">
                  <th className="px-4 py-3">Preview</th><th className="px-4 py-3">Filename</th><th className="px-4 py-3">Size</th><th className="px-4 py-3">Folder</th><th className="px-4 py-3 text-right">Actions</th>
                </tr></thead>
                <tbody className="divide-y divide-zinc-100">
                  {visible.map(item => (
                    <tr key={item.id} className="hover:bg-zinc-50">
                      <td className="px-4 py-2"><button onClick={() => setActive(item)} className="relative h-10 w-10 rounded bg-zinc-100 overflow-hidden block"><Image src={item.url} alt={item.alt_text ?? item.original_name} fill className="object-cover" sizes="40px" /></button></td>
                      <td className="px-4 py-2 font-medium text-zinc-800">{item.original_name}</td>
                      <td className="px-4 py-2 text-zinc-500">{fmtSize(item.size_bytes)}</td>
                      <td className="px-4 py-2 text-zinc-500">{item.folder}</td>
                      <td className="px-4 py-2"><div className="flex items-center justify-end gap-3"><button onClick={() => copyUrl(item.url)} className="text-[#4472C4] hover:underline text-xs">Copy URL</button><button onClick={() => setActive(item)} className="text-zinc-500 hover:underline text-xs">Edit Alt</button><button onClick={() => setToDelete(item)} className="text-red-500 hover:underline text-xs">Delete</button></div></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
      </div>

      {active && <MediaModal item={active} onClose={() => setActive(null)} onSaveAlt={saveAlt} onDelete={() => setToDelete(active)} onCopy={copyUrl} />}
      <ConfirmModal open={!!toDelete} title="Delete image" message={`Delete "${toDelete?.original_name}"? This cannot be undone.`} confirmLabel="Delete" variant="danger" onConfirm={() => toDelete && void doDelete(toDelete)} onCancel={() => setToDelete(null)} />
    </div>
  )
}

function MediaModal({ item, onClose, onSaveAlt, onDelete, onCopy }: { item: MediaItem; onClose: () => void; onSaveAlt: (i: MediaItem, alt: string) => void; onDelete: () => void; onCopy: (url: string) => void }) {
  const [alt, setAlt] = useState(item.alt_text ?? '')
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative bg-white rounded-xl shadow-xl max-w-3xl w-full grid sm:grid-cols-2 overflow-hidden">
        <div className="relative bg-zinc-100 aspect-square sm:aspect-auto min-h-[280px]"><Image src={item.url} alt={item.alt_text ?? item.original_name} fill className="object-contain" sizes="400px" /></div>
        <div className="p-5 space-y-3">
          <div className="flex items-start justify-between">
            <div><p className="font-semibold text-zinc-900 break-all">{item.original_name}</p><p className="text-xs text-zinc-400">{fmtSize(item.size_bytes)}{item.width ? ` · ${item.width}×${item.height}px` : ''} · {new Date(item.created_at).toLocaleDateString('en-AE')}</p></div>
            <button onClick={onClose} className="text-zinc-400 hover:text-zinc-700"><X size={18} /></button>
          </div>
          <div>
            <label className="text-sm font-medium text-zinc-700">Alt Text</label>
            <input value={alt} onChange={e => setAlt(e.target.value)} className="mt-1 w-full border border-zinc-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#4472C4]" placeholder="Describe the image" />
            <div className="mt-2"><AdminButton variant="primary" onClick={() => onSaveAlt(item, alt)}>Save Alt Text</AdminButton></div>
          </div>
          <div>
            <label className="text-sm font-medium text-zinc-700">URL</label>
            <div className="flex gap-2 mt-1">
              <input readOnly value={item.url} className="flex-1 border border-zinc-300 rounded-lg px-3 py-2 text-xs font-mono bg-zinc-50" />
              <AdminButton variant="outline" onClick={() => onCopy(item.url)}><Copy size={14} /></AdminButton>
            </div>
          </div>
          <button onClick={onDelete} className="inline-flex items-center gap-1.5 text-sm text-red-500 hover:text-red-600 pt-2"><Trash2 size={15} /> Delete Image</button>
        </div>
      </div>
    </div>
  )
}
