'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ChevronRight, ExternalLink } from 'lucide-react'
import { AdminCard } from '@/components/admin/ui/AdminCard'
import { AdminButton, AdminLinkButton } from '@/components/admin/ui/AdminButton'
import { AdminInput, AdminTextarea, AdminSelect } from '@/components/admin/ui/AdminField'

type Status = 'draft' | 'published' | 'archived'

interface Crumb { label: string; href?: string }

interface EditorChromeProps {
  breadcrumb: Crumb[]
  title: string
  onDelete?: () => void
  onSaveDraft?: () => void
  onPublish?: () => void
  saving: boolean
  sidebar: React.ReactNode
  children: React.ReactNode
}

// Shared two-column editor shell: sticky top bar (breadcrumb + actions) and a
// 2/3 content + 1/3 sticky sidebar grid. Used by brand/service/location editors.
export function EditorChrome({ breadcrumb, title, onDelete, onSaveDraft, onPublish, saving, sidebar, children }: EditorChromeProps) {
  return (
    <div className="p-6 lg:p-8">
      <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
        <div className="min-w-0">
          <nav className="flex items-center gap-1 text-sm text-zinc-500" aria-label="Breadcrumb">
            {breadcrumb.map((c, i) => (
              <span key={i} className="flex items-center gap-1">
                {i > 0 && <ChevronRight size={14} className="text-zinc-300" />}
                {c.href ? <Link href={c.href} className="hover:text-[#4472C4]">{c.label}</Link> : <span className="text-zinc-700 font-medium truncate">{c.label}</span>}
              </span>
            ))}
          </nav>
          <h1 className="text-2xl font-bold text-zinc-900 mt-1 truncate">{title}</h1>
        </div>
        <div className="flex items-center gap-2">
          {onDelete && <AdminButton variant="ghost" onClick={onDelete}>Delete</AdminButton>}
          {onSaveDraft && <AdminButton variant="outline" loading={saving} onClick={onSaveDraft}>Save Draft</AdminButton>}
          {onPublish && <AdminButton variant="orange" loading={saving} onClick={onPublish}>Publish</AdminButton>}
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3 items-start">
        <div className="lg:col-span-2 min-w-0">{children}</div>
        <div className="space-y-5 lg:sticky lg:top-6">{sidebar}</div>
      </div>
    </div>
  )
}

export function StatusCard({ status, onChange, viewHref, savedLabel }: { status: Status; onChange: (s: Status) => void; viewHref: string; savedLabel?: string }) {
  return (
    <AdminCard title="Status">
      <div className="space-y-3">
        <AdminSelect
          value={status}
          onChange={e => onChange(e.target.value as Status)}
          options={[{ value: 'draft', label: '● Draft' }, { value: 'published', label: '● Published' }, { value: 'archived', label: '● Archived' }]}
        />
        <AdminLinkButton href={viewHref} target="_blank" rel="noopener noreferrer" variant="outline" className="w-full">
          View Page <ExternalLink size={14} />
        </AdminLinkButton>
        {savedLabel && <p className="text-xs text-zinc-400">{savedLabel}</p>}
      </div>
    </AdminCard>
  )
}

export function SeoCard({ slug, title, description, onTitle, onDescription }: { slug: string; title: string; description: string; onTitle: (v: string) => void; onDescription: (v: string) => void }) {
  const [open, setOpen] = useState(true)
  return (
    <AdminCard title="SEO Settings" actions={<button onClick={() => setOpen(o => !o)} className="text-xs text-[#4472C4] hover:underline">{open ? 'Hide' : 'Expand'}</button>}>
      {open && (
        <div className="space-y-4">
          <AdminInput label="Meta Title" value={title} maxCount={60} onChange={e => onTitle(e.target.value)} />
          <AdminTextarea label="Meta Description" value={description} rows={3} maxCount={160} onChange={e => onDescription(e.target.value)} />
          <div className="border border-zinc-200 rounded-lg p-3 bg-zinc-50">
            <p className="text-xs text-[#006621] truncate">🌐 carworkshop.ae › {slug.replace(/\//g, ' › ')}</p>
            <p className="text-[#1A0DAB] text-sm font-medium truncate mt-0.5">{title || 'Page title preview'}</p>
            <p className="text-zinc-600 text-xs line-clamp-2 mt-0.5">{description || 'Meta description preview shows here as you type.'}</p>
          </div>
        </div>
      )}
    </AdminCard>
  )
}

export function InfoCard({ rows }: { rows: Array<{ k: string; v: string; mono?: boolean }> }) {
  return (
    <AdminCard title="Page Info">
      <dl className="space-y-2 text-sm">
        {rows.map(r => (
          <div key={r.k} className="flex justify-between gap-2">
            <dt className="text-zinc-500">{r.k}</dt>
            <dd className={`text-zinc-900 text-right ${r.mono ? 'font-mono text-xs' : ''}`}>{r.v}</dd>
          </div>
        ))}
      </dl>
    </AdminCard>
  )
}
