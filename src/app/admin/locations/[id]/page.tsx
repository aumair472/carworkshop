'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter, useParams } from 'next/navigation'
import toast from 'react-hot-toast'
import { SlugField } from '@/components/admin/SlugField'
import { FAQRepeater } from '@/components/admin/FAQRepeater'
import { ConfirmModal } from '@/components/admin/ConfirmModal'
import { PageContentEditor } from '@/components/admin/PageContentEditor'
import { RichTextEditor } from '@/components/admin/RichTextEditor'
import { AdminCard } from '@/components/admin/ui/AdminCard'
import { AdminTabs } from '@/components/admin/ui/AdminTabs'
import { AdminInput, AdminSelect, AdminLabel } from '@/components/admin/ui/AdminField'
import { EditorChrome, StatusCard, SeoCard, InfoCard } from '@/components/admin/EditorChrome'
import { EntitySeoTab } from '@/components/admin/EntitySeoTab'
import { SeoEditorBanner, useActingRole } from '@/components/admin/seo-editor-ui'
import { EditorSkeleton } from '@/app/admin/brands/[id]/page'
import type { PageContent } from '@/types'
import type { SeoJson } from '@/lib/schemas/seo'

type Status = 'draft' | 'published' | 'archived'
type Emirate = 'Dubai' | 'Abu Dhabi' | 'Sharjah' | 'Ajman' | 'Ras Al Khaimah' | 'Umm Al Quwain' | 'Fujairah'
interface FAQItem { question: string; answer: string }
interface Location {
  id: string; name: string; slug: string; emirate: Emirate; address: string | null
  lat: number | null; lng: number | null; description: string | null; maps_embed_url: string | null
  faq_json: FAQItem[] | null; seo_title: string | null; seo_description: string | null
  status: Status; content_json: PageContent | null; seo_json: SeoJson | null
}

const EMIRATES = ['Dubai', 'Abu Dhabi', 'Sharjah', 'Ajman', 'Ras Al Khaimah', 'Umm Al Quwain', 'Fujairah'].map(e => ({ value: e, label: e }))
const ALL_TABS = [
  { id: 'info', label: 'Location Info' },
  { id: 'content', label: 'Page Content' },
  { id: 'seo', label: 'SEO' },
]

export default function EditLocationPage() {
  const router = useRouter()
  const id = String(useParams().id)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState(false)
  const [loc, setLoc] = useState<Location | null>(null)
  const [tab, setTab] = useState('info')
  const { isSEOEditor } = useActingRole()
  const TABS = isSEOEditor ? ALL_TABS.filter(t => t.id === 'seo') : ALL_TABS
  const activeTab = isSEOEditor ? 'seo' : tab

  const load = useCallback(async () => {
    try {
      const res = await fetch(`/api/admin/locations/${id}`)
      if (!res.ok) { router.push('/admin/locations'); return }
      const data = await res.json() as { location: Location }
      setLoc(data.location)
    } finally { setLoading(false) }
  }, [id, router])

  useEffect(() => { void load() }, [load])

  const save = useCallback(async (nextStatus?: Status) => {
    if (!loc) return
    setSaving(true)
    const t = toast.loading('Saving…')
    try {
      const res = await fetch(`/api/admin/locations/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...loc, status: nextStatus ?? loc.status, faq_json: loc.faq_json ?? [], content_json: loc.content_json ?? {} }),
      })
      const data = await res.json() as { location?: Location; error?: string }
      if (!res.ok) { toast.error(data.error ?? 'Save failed', { id: t }); return }
      setLoc(data.location!)
      toast.success(nextStatus === 'published' ? 'Published! Changes are live.' : 'Location saved', { id: t })
    } catch { toast.error('Network error', { id: t }) } finally { setSaving(false) }
  }, [loc, id])

  async function handleDelete() {
    try { await fetch(`/api/admin/locations/${id}`, { method: 'DELETE' }); toast.success('Location deleted'); router.push('/admin/locations') }
    catch { toast.error('Delete failed') }
  }

  if (loading) return <EditorSkeleton />
  if (!loc) return null
  const set = (p: Partial<Location>) => setLoc(l => l ? { ...l, ...p } : l)

  return (
    <EditorChrome
      breadcrumb={[{ label: 'Locations', href: '/admin/locations' }, { label: loc.name }]}
      title={loc.name}
      onDelete={isSEOEditor ? undefined : () => setConfirmDelete(true)}
      onSaveDraft={isSEOEditor ? undefined : () => void save('draft')}
      onPublish={isSEOEditor ? undefined : () => void save('published')}
      saving={saving}
      sidebar={
        <>
          <StatusCard status={loc.status} onChange={s => set({ status: s })} viewHref={`/locations/${loc.slug}`} />
          <SeoCard slug={`locations/${loc.slug}`} title={loc.seo_title ?? ''} description={loc.seo_description ?? ''} onTitle={v => set({ seo_title: v })} onDescription={v => set({ seo_description: v })} />
          <InfoCard rows={[{ k: 'Type', v: 'Location' }, { k: 'Emirate', v: loc.emirate }, { k: 'URL', v: `/locations/${loc.slug}`, mono: true }]} />
        </>
      }
    >
      {isSEOEditor && <SeoEditorBanner />}
      <AdminTabs tabs={TABS} active={activeTab} onChange={setTab} />
      <div className="mt-5 space-y-5">
        {activeTab === 'seo' && (
          <EntitySeoTab
            endpoint={`/api/admin/locations/${id}/seo`}
            initial={loc.seo_json ?? {}}
            pageUrl={`https://carworkshop.ae/locations/${loc.slug}`}
            defaultTitle={`Car Service in ${loc.name} | CarWorkshop.ae`}
            autoSchemas={['LocalBusiness', 'FAQPage', 'BreadcrumbList']}
          />
        )}
        {activeTab === 'info' && (
          <AdminCard title="Location Details">
            <div className="space-y-4">
              <AdminInput label="Location Name" required value={loc.name} onChange={e => set({ name: e.target.value })} />
              <div>
                <AdminLabel>Slug</AdminLabel>
                <SlugField name="slug" value={loc.slug} sourceValue={loc.name} onChange={v => set({ slug: v })} />
                <p className="text-xs text-zinc-400 mt-1">carworkshop.ae/locations/{loc.slug}</p>
              </div>
              <AdminSelect label="Emirate" required value={loc.emirate} options={EMIRATES} onChange={e => set({ emirate: e.target.value as Emirate })} />
              <AdminInput label="Address" value={loc.address ?? ''} onChange={e => set({ address: e.target.value })} />
              <div className="grid grid-cols-2 gap-4">
                <AdminInput label="Latitude" type="number" hint="LocalBusiness schema" value={loc.lat ?? ''} onChange={e => set({ lat: e.target.value ? parseFloat(e.target.value) : null })} />
                <AdminInput label="Longitude" type="number" value={loc.lng ?? ''} onChange={e => set({ lng: e.target.value ? parseFloat(e.target.value) : null })} />
              </div>
              <div>
                <AdminLabel>Description</AdminLabel>
                <RichTextEditor value={loc.description ?? ''} onChange={v => set({ description: v })} placeholder="Car service and repair across all areas…" />
              </div>
              <AdminInput label="Google Maps Embed URL" value={loc.maps_embed_url ?? ''} placeholder="https://www.google.com/maps/embed?…" onChange={e => set({ maps_embed_url: e.target.value })} />
              {loc.maps_embed_url && loc.maps_embed_url.startsWith('https://') && (
                <div className="rounded-lg overflow-hidden border border-zinc-200 aspect-video">
                  <iframe src={loc.maps_embed_url} title="Map preview" className="w-full h-full" loading="lazy" referrerPolicy="no-referrer-when-downgrade" />
                </div>
              )}
            </div>
          </AdminCard>
        )}

        {tab === 'content' && (
          <AdminCard title="Public Page Content" description={`These sections appear on /locations/${loc.slug}`}>
            <PageContentEditor value={loc.content_json ?? {}} onChange={c => set({ content_json: c })} forceOpen />
            <div className="mt-6 pt-5 border-t border-zinc-200">
              <AdminLabel>FAQ Items</AdminLabel>
              <FAQRepeater items={loc.faq_json ?? []} onChange={items => set({ faq_json: items })} />
            </div>
          </AdminCard>
        )}
      </div>

      <ConfirmModal open={confirmDelete} title="Delete Location" message={`Delete "${loc.name}"?`} confirmLabel="Delete" variant="danger" onConfirm={handleDelete} onCancel={() => setConfirmDelete(false)} />
    </EditorChrome>
  )
}
