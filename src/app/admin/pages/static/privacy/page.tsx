'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import toast from 'react-hot-toast'
import { RichTextEditor } from '@/components/admin/RichTextEditor'
import { AdminCard } from '@/components/admin/ui/AdminCard'
import { AdminInput } from '@/components/admin/ui/AdminField'
import { AdminButton } from '@/components/admin/ui/AdminButton'
import { AdminTabs } from '@/components/admin/ui/AdminTabs'
import { EntitySeoTab } from '@/components/admin/EntitySeoTab'
import { EditorSkeleton } from '@/app/admin/brands/[id]/page'
import type { SeoJson } from '@/lib/schemas/seo'

export default function PrivacyTermsEditor() {
  const [tab, setTab] = useState<'privacy' | 'terms'>('privacy')
  return (
    <div className="p-6 lg:p-8">
      <div className="mb-6">
        <nav className="flex items-center gap-1 text-sm text-zinc-500">
          <Link href="/admin/pages" className="hover:text-[#4472C4]">Pages</Link>
          <span className="text-zinc-300">/</span>
          <span className="text-zinc-700 font-medium">Privacy &amp; Terms</span>
        </nav>
        <h1 className="text-2xl font-bold text-zinc-900 mt-1">Privacy &amp; Terms</h1>
      </div>

      <AdminTabs
        tabs={[{ id: 'privacy', label: 'Privacy Policy' }, { id: 'terms', label: 'Terms & Conditions' }]}
        active={tab} onChange={id => setTab(id as 'privacy' | 'terms')}
      />

      <div className="mt-5">
        {/* Both mounted but hidden to preserve unsaved edits when switching tabs */}
        <div className={tab === 'privacy' ? '' : 'hidden'}><PolicyTab slug="privacy" title="Privacy Policy" viewHref="/privacy" /></div>
        <div className={tab === 'terms' ? '' : 'hidden'}><PolicyTab slug="terms" title="Terms & Conditions" viewHref="/terms" /></div>
      </div>
    </div>
  )
}

type Status = 'draft' | 'published' | 'archived'
interface PolicyContent { h1: string; last_updated: string; content: string }

function PolicyTab({ slug, title, viewHref }: { slug: string; title: string; viewHref: string }) {
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [c, setC] = useState<PolicyContent>({ h1: title, last_updated: '', content: '' })
  const [status, setStatus] = useState<Status>('draft')
  const [seoJson, setSeoJson] = useState<SeoJson>({})

  useEffect(() => {
    let cancelled = false
    void (async () => {
      try {
        const res = await fetch(`/api/admin/pages/static/${slug}`)
        if (cancelled || !res.ok) return
        const d = await res.json() as { page: { content_json: Partial<PolicyContent> | null; status: Status; seo_json?: SeoJson | null } }
        if (cancelled) return
        const cj = d.page.content_json ?? {}
        setC({ h1: cj.h1 ?? title, last_updated: cj.last_updated ?? '', content: cj.content ?? '' })
        setStatus(d.page.status)
        setSeoJson(d.page.seo_json ?? {})
      } catch { /* ignore */ } finally { if (!cancelled) setLoading(false) }
    })()
    return () => { cancelled = true }
  }, [slug, title])

  const save = useCallback(async (nextStatus?: Status) => {
    setSaving(true)
    const t = toast.loading('Saving…')
    try {
      const res = await fetch(`/api/admin/pages/static/${slug}`, {
        method: 'PUT', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, content_json: c, status: nextStatus ?? status }),
      })
      const d = await res.json() as { error?: string }
      if (!res.ok) { toast.error(d.error ?? 'Save failed', { id: t }); return }
      if (nextStatus) setStatus(nextStatus)
      toast.success(nextStatus === 'published' ? `${title} published` : `${title} saved`, { id: t })
    } catch { toast.error('Network error', { id: t }) } finally { setSaving(false) }
  }, [slug, title, c, status])

  if (loading) return <EditorSkeleton />

  return (
    <AdminCard
      title={title}
      actions={<>
        <a href={viewHref} target="_blank" rel="noopener noreferrer" className="text-xs text-[#4472C4] hover:underline mr-2">View ↗</a>
        <AdminButton variant="outline" loading={saving} onClick={() => void save('draft')}>Save Draft</AdminButton>
        <AdminButton variant="orange" loading={saving} onClick={() => void save('published')}>Publish</AdminButton>
      </>}
    >
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <AdminInput label="H1 Heading" value={c.h1} onChange={e => setC(p => ({ ...p, h1: e.target.value }))} />
          <AdminInput label="Last Updated" type="date" value={c.last_updated} onChange={e => setC(p => ({ ...p, last_updated: e.target.value }))} />
        </div>
        <RichTextEditor value={c.content} onChange={v => setC(p => ({ ...p, content: v }))} placeholder={`Write the ${title.toLowerCase()}…`} minHeight={500} />
        <p className="text-xs text-zinc-400">Status: <span className="font-medium">{status}</span></p>

        <details className="rounded-lg border border-zinc-200">
          <summary className="cursor-pointer px-4 py-2.5 text-sm font-semibold text-zinc-800">SEO (Advanced)</summary>
          <div className="px-4 pb-4 pt-2 border-t border-zinc-100">
            <EntitySeoTab endpoint={`/api/admin/pages/static/${slug}/seo`} initial={seoJson}
              pageUrl={`https://carworkshop.ae${viewHref}`} defaultTitle={c.h1} autoSchemas={['BreadcrumbList']} />
          </div>
        </details>
      </div>
    </AdminCard>
  )
}
