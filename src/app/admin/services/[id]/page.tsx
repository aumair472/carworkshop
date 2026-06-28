'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter, useParams } from 'next/navigation'
import toast from 'react-hot-toast'
import { SlugField } from '@/components/admin/SlugField'
import { MediaPicker } from '@/components/admin/MediaPicker'
import { FAQRepeater } from '@/components/admin/FAQRepeater'
import { ConfirmModal } from '@/components/admin/ConfirmModal'
import { PageContentEditor } from '@/components/admin/PageContentEditor'
import { RichTextEditor } from '@/components/admin/RichTextEditor'
import { AdminCard } from '@/components/admin/ui/AdminCard'
import { AdminTabs } from '@/components/admin/ui/AdminTabs'
import { AdminInput, AdminTextarea, AdminLabel } from '@/components/admin/ui/AdminField'
import { ListRepeater } from '@/components/admin/ui/ListRepeater'
import { EditorChrome, StatusCard, SeoCard, InfoCard } from '@/components/admin/EditorChrome'
import { EntitySeoTab } from '@/components/admin/EntitySeoTab'
import { SeoEditorBanner, useActingRole } from '@/components/admin/seo-editor-ui'
import { EditorSkeleton } from '@/app/admin/brands/[id]/page'
import type { PageContent } from '@/types'
import type { SeoJson } from '@/lib/schemas/seo'

type Status = 'draft' | 'published' | 'archived'
interface FAQItem { question: string; answer: string }
interface Service {
  id: string; name: string; slug: string; short_description: string | null; content: string | null
  starting_price: number | null; icon_url: string | null; image_url: string | null
  includes_json: string[] | null; faq_json: FAQItem[] | null
  seo_title: string | null; seo_description: string | null; status: Status; content_json: PageContent | null; seo_json: SeoJson | null
}

const ALL_TABS = [
  { id: 'info', label: 'Service Info' },
  { id: 'content', label: 'Page Content' },
  { id: 'pricing', label: 'Pricing & Includes' },
  { id: 'seo', label: 'SEO' },
]

export default function EditServicePage() {
  const router = useRouter()
  const id = String(useParams().id)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState(false)
  const [svc, setSvc] = useState<Service | null>(null)
  const [tab, setTab] = useState('info')
  const { isSEOEditor } = useActingRole()
  const TABS = isSEOEditor ? ALL_TABS.filter(t => t.id === 'seo') : ALL_TABS
  const activeTab = isSEOEditor ? 'seo' : tab

  const load = useCallback(async () => {
    try {
      const res = await fetch(`/api/admin/services/${id}`)
      if (!res.ok) { router.push('/admin/services'); return }
      const data = await res.json() as { service: Service }
      setSvc(data.service)
    } finally { setLoading(false) }
  }, [id, router])

  useEffect(() => { void load() }, [load])

  const save = useCallback(async (nextStatus?: Status) => {
    if (!svc) return
    setSaving(true)
    const t = toast.loading('Saving…')
    try {
      const res = await fetch(`/api/admin/services/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...svc, status: nextStatus ?? svc.status, faq_json: svc.faq_json ?? [], includes_json: svc.includes_json ?? [], content_json: svc.content_json ?? {} }),
      })
      const data = await res.json() as { service?: Service; error?: string }
      if (!res.ok) { toast.error(data.error ?? 'Save failed', { id: t }); return }
      setSvc(data.service!)
      toast.success(nextStatus === 'published' ? 'Published! Changes are live.' : 'Service saved', { id: t })
    } catch { toast.error('Network error', { id: t }) } finally { setSaving(false) }
  }, [svc, id])

  async function handleDelete() {
    try { await fetch(`/api/admin/services/${id}`, { method: 'DELETE' }); toast.success('Service deleted'); router.push('/admin/services') }
    catch { toast.error('Delete failed') }
  }

  if (loading) return <EditorSkeleton />
  if (!svc) return null
  const set = (p: Partial<Service>) => setSvc(s => s ? { ...s, ...p } : s)

  return (
    <EditorChrome
      breadcrumb={[{ label: 'Services', href: '/admin/services' }, { label: svc.name }]}
      title={svc.name}
      onDelete={isSEOEditor ? undefined : () => setConfirmDelete(true)}
      onSaveDraft={isSEOEditor ? undefined : () => void save('draft')}
      onPublish={isSEOEditor ? undefined : () => void save('published')}
      saving={saving}
      sidebar={
        <>
          <StatusCard status={svc.status} onChange={s => set({ status: s })} viewHref={`/services/${svc.slug}`} />
          <SeoCard slug={`services/${svc.slug}`} title={svc.seo_title ?? ''} description={svc.seo_description ?? ''} onTitle={v => set({ seo_title: v })} onDescription={v => set({ seo_description: v })} />
          <InfoCard rows={[{ k: 'Type', v: 'Service' }, { k: 'URL', v: `/services/${svc.slug}`, mono: true }, { k: 'From', v: svc.starting_price != null ? `AED ${svc.starting_price}` : '—' }]} />
        </>
      }
    >
      {isSEOEditor && <SeoEditorBanner />}
      <AdminTabs tabs={TABS} active={activeTab} onChange={setTab} />
      <div className="mt-5 space-y-5">
        {activeTab === 'seo' && (
          <EntitySeoTab
            endpoint={`/api/admin/services/${id}/seo`}
            initial={svc.seo_json ?? {}}
            pageUrl={`https://carworkshop.ae/services/${svc.slug}`}
            defaultTitle={`${svc.name} in UAE | CarWorkshop.ae`}
            autoSchemas={['Service', 'FAQPage', 'BreadcrumbList']}
          />
        )}
        {activeTab === 'info' && (
          <AdminCard title="Service Details">
            <div className="space-y-4">
              <AdminInput label="Service Name" required value={svc.name} onChange={e => set({ name: e.target.value })} />
              <div>
                <AdminLabel>Slug</AdminLabel>
                <SlugField name="slug" value={svc.slug} sourceValue={svc.name} onChange={v => set({ slug: v })} />
                <p className="text-xs text-zinc-400 mt-1">carworkshop.ae/services/{svc.slug}</p>
              </div>
              <AdminTextarea label="Short Description" hint="shown on cards" value={svc.short_description ?? ''} maxCount={160} rows={2} onChange={e => set({ short_description: e.target.value })} />
              <div>
                <AdminLabel>Full Content</AdminLabel>
                <RichTextEditor value={svc.content ?? ''} onChange={v => set({ content: v })} placeholder="Describe the service in detail…" />
              </div>
              <div className="grid sm:grid-cols-2 gap-5">
                <MediaPicker label="Service Icon" value={svc.icon_url} onChange={url => set({ icon_url: url })} />
                <MediaPicker label="Service Image" value={svc.image_url} onChange={url => set({ image_url: url })} />
              </div>
            </div>
          </AdminCard>
        )}

        {tab === 'content' && (
          <AdminCard title="Public Page Content" description={`These sections appear on /services/${svc.slug}`}>
            <PageContentEditor value={svc.content_json ?? {}} onChange={c => set({ content_json: c })} forceOpen />
          </AdminCard>
        )}

        {tab === 'pricing' && (
          <>
            <AdminCard title="Pricing">
              <AdminInput label="Starting Price (AED)" type="number" hint='shown as "From AED …"' value={svc.starting_price ?? ''} onChange={e => set({ starting_price: e.target.value ? parseFloat(e.target.value) : null })} />
              <div className="mt-4">
                <AdminLabel>What&apos;s Included</AdminLabel>
                <ListRepeater items={svc.includes_json ?? []} onChange={v => set({ includes_json: v })} placeholder="Full synthetic oil (5L)" addLabel="+ Add include item" />
              </div>
            </AdminCard>
            <AdminCard title="FAQ Items">
              <FAQRepeater items={svc.faq_json ?? []} onChange={items => set({ faq_json: items })} />
            </AdminCard>
          </>
        )}
      </div>

      <ConfirmModal open={confirmDelete} title="Delete Service" message={`Delete "${svc.name}"?`} confirmLabel="Delete" variant="danger" onConfirm={handleDelete} onCancel={() => setConfirmDelete(false)} />
    </EditorChrome>
  )
}
