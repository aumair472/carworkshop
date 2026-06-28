'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter, useParams } from 'next/navigation'
import toast from 'react-hot-toast'
import { SlugField } from '@/components/admin/SlugField'
import { MediaPicker } from '@/components/admin/MediaPicker'
import { ConfirmModal } from '@/components/admin/ConfirmModal'
import { PageContentEditor } from '@/components/admin/PageContentEditor'
import { RichTextEditor } from '@/components/admin/RichTextEditor'
import { AdminCard } from '@/components/admin/ui/AdminCard'
import { AdminButton } from '@/components/admin/ui/AdminButton'
import { AdminTabs } from '@/components/admin/ui/AdminTabs'
import { AdminInput, AdminLabel } from '@/components/admin/ui/AdminField'
import { EditorChrome, StatusCard, SeoCard, InfoCard } from '@/components/admin/EditorChrome'
import { EntitySeoTab } from '@/components/admin/EntitySeoTab'
import { SeoEditorBanner, useActingRole } from '@/components/admin/seo-editor-ui'
import type { PageContent } from '@/types'
import type { SeoJson } from '@/lib/schemas/seo'

type Status = 'draft' | 'published' | 'archived'
interface Brand {
  id: string; name: string; slug: string; description: string | null; common_issues: string | null
  logo_url: string | null; hero_image_url: string | null; seo_title: string | null; seo_description: string | null
  status: Status; content_json: PageContent | null; seo_json: SeoJson | null
}
interface Model { id: string; name: string; slug: string; status: Status }
interface NamedRow { id: string; name: string }

const ALL_TABS = [
  { id: 'info', label: 'Brand Info' },
  { id: 'content', label: 'Page Content' },
  { id: 'models', label: 'Models' },
  { id: 'services', label: 'Services' },
  { id: 'locations', label: 'Locations' },
  { id: 'seo', label: 'SEO' },
]

export default function EditBrandPage() {
  const router = useRouter()
  const id = String(useParams().id)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState(false)
  const [brand, setBrand] = useState<Brand | null>(null)
  const [tab, setTab] = useState('info')
  const { isSEOEditor } = useActingRole()
  const TABS = isSEOEditor ? ALL_TABS.filter(t => t.id === 'seo') : ALL_TABS
  const activeTab = isSEOEditor ? 'seo' : tab

  const load = useCallback(async () => {
    try {
      const res = await fetch(`/api/admin/brands/${id}`)
      if (!res.ok) { router.push('/admin/brands'); return }
      const data = await res.json() as { brand: Brand }
      setBrand(data.brand)
    } finally { setLoading(false) }
  }, [id, router])

  useEffect(() => { void load() }, [load])

  const save = useCallback(async (nextStatus?: Status) => {
    if (!brand) return
    setSaving(true)
    const t = toast.loading('Saving…')
    try {
      const res = await fetch(`/api/admin/brands/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...brand, status: nextStatus ?? brand.status, content_json: brand.content_json ?? {} }),
      })
      const data = await res.json() as { brand?: Brand; error?: string }
      if (!res.ok) { toast.error(data.error ?? 'Save failed', { id: t }); return }
      setBrand(data.brand!)
      toast.success(nextStatus === 'published' ? 'Published! Changes are live.' : 'Brand saved', { id: t })
    } catch { toast.error('Network error', { id: t }) } finally { setSaving(false) }
  }, [brand, id])

  async function handleDelete() {
    try { await fetch(`/api/admin/brands/${id}`, { method: 'DELETE' }); toast.success('Brand deleted'); router.push('/admin/brands') }
    catch { toast.error('Delete failed') }
  }

  if (loading) return <EditorSkeleton />
  if (!brand) return null
  const set = (p: Partial<Brand>) => setBrand(b => b ? { ...b, ...p } : b)

  return (
    <EditorChrome
      breadcrumb={[{ label: 'Brands', href: '/admin/brands' }, { label: brand.name }]}
      title={brand.name}
      onDelete={isSEOEditor ? undefined : () => setConfirmDelete(true)}
      onSaveDraft={isSEOEditor ? undefined : () => void save('draft')}
      onPublish={isSEOEditor ? undefined : () => void save('published')}
      saving={saving}
      sidebar={
        <>
          <StatusCard status={brand.status} onChange={s => set({ status: s })} viewHref={`/brands/${brand.slug}`} />
          <SeoCard
            slug={`brands/${brand.slug}`}
            title={brand.seo_title ?? ''} description={brand.seo_description ?? ''}
            onTitle={v => set({ seo_title: v })} onDescription={v => set({ seo_description: v })}
          />
          <InfoCard rows={[{ k: 'Type', v: 'Brand Hub' }, { k: 'URL', v: `/brands/${brand.slug}`, mono: true }]} />
        </>
      }
    >
      {isSEOEditor && <SeoEditorBanner />}
      <AdminTabs tabs={TABS} active={activeTab} onChange={setTab} />

      <div className="mt-5 space-y-5">
        {activeTab === 'seo' && (
          <EntitySeoTab
            endpoint={`/api/admin/brands/${id}/seo`}
            initial={brand.seo_json ?? {}}
            pageUrl={`https://carworkshop.ae/brands/${brand.slug}`}
            defaultTitle={`${brand.name} Service & Repair in UAE | CarWorkshop.ae`}
            autoSchemas={['LocalBusiness', 'FAQPage', 'BreadcrumbList']}
          />
        )}
        {activeTab === 'info' && (
          <>
            <AdminCard title="Brand Details">
              <div className="space-y-4">
                <AdminInput label="Brand Name" required value={brand.name} onChange={e => set({ name: e.target.value })} />
                <div>
                  <AdminLabel>Slug</AdminLabel>
                  <SlugField name="slug" value={brand.slug} sourceValue={brand.name} onChange={s => set({ slug: s })} />
                  <p className="text-xs text-zinc-400 mt-1">carworkshop.ae/brands/{brand.slug}</p>
                </div>
                <div>
                  <AdminLabel>Description</AdminLabel>
                  <RichTextEditor value={brand.description ?? ''} onChange={v => set({ description: v })} placeholder="Expert Audi service and repair in UAE…" />
                </div>
                <div>
                  <AdminLabel>Common Issues</AdminLabel>
                  <RichTextEditor value={brand.common_issues ?? ''} onChange={v => set({ common_issues: v })} placeholder="DSG transmission failure, coolant leaks…" />
                </div>
              </div>
            </AdminCard>
            <AdminCard title="Brand Images">
              <div className="grid sm:grid-cols-2 gap-5">
                <MediaPicker label="Logo" value={brand.logo_url} onChange={url => set({ logo_url: url })} />
                <MediaPicker label="Hero Image" value={brand.hero_image_url} onChange={url => set({ hero_image_url: url })} />
              </div>
            </AdminCard>
          </>
        )}

        {tab === 'content' && (
          <AdminCard title="Public Page Content" description={`These sections appear on /brands/${brand.slug}`}>
            <PageContentEditor value={brand.content_json ?? {}} onChange={c => set({ content_json: c })} forceOpen />
          </AdminCard>
        )}

        {tab === 'models' && <ModelsPanel brandId={id} />}
        {tab === 'services' && <AssignmentPanel kind="services" title="Assigned Services" listUrl="/api/admin/services" itemsKey="services" assignUrl={`/api/admin/brands/${id}/services`} idsKey="service_ids" />}
        {tab === 'locations' && <AssignmentPanel kind="locations" title="Active Locations" listUrl="/api/admin/locations" itemsKey="locations" assignUrl={`/api/admin/brands/${id}/locations`} idsKey="location_ids" />}
      </div>

      <ConfirmModal open={confirmDelete} title="Delete Brand" message={`Delete "${brand.name}"? This cannot be undone.`} confirmLabel="Delete" variant="danger" onConfirm={handleDelete} onCancel={() => setConfirmDelete(false)} />
    </EditorChrome>
  )
}

export function EditorSkeleton() {
  return (
    <div className="animate-pulse space-y-4 p-6 lg:p-8">
      <div className="h-8 w-48 bg-zinc-200 rounded" />
      <div className="h-10 bg-zinc-100 rounded" />
      <div className="h-64 bg-zinc-100 rounded-xl" />
    </div>
  )
}

function ModelsPanel({ brandId }: { brandId: string }) {
  const [models, setModels] = useState<Model[]>([])
  const [bulk, setBulk] = useState('')
  const [busy, setBusy] = useState(false)
  const [tick, setTick] = useState(0)

  useEffect(() => {
    void (async () => {
      try {
        const res = await fetch(`/api/admin/brands/${brandId}/models`)
        if (!res.ok) return
        const d = await res.json() as { models: Model[] }
        setModels(d.models)
      } catch { /* ignore */ }
    })()
  }, [brandId, tick])

  async function addModels() {
    const names = bulk.split(',').map(s => s.trim()).filter(Boolean)
    if (names.length === 0) return
    setBusy(true)
    const t = toast.loading('Adding models…')
    try {
      const res = await fetch(`/api/admin/brands/${brandId}/models`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ names, status: 'published' }) })
      const d = await res.json() as { models?: Model[]; skipped?: number; error?: string }
      if (!res.ok) { toast.error(d.error ?? 'Failed', { id: t }); return }
      setBulk(''); setTick(x => x + 1)
      toast.success(`Added ${d.models?.length ?? 0}${d.skipped ? `, skipped ${d.skipped} dup` : ''}`, { id: t })
    } finally { setBusy(false) }
  }

  async function removeModel(modelId: string) {
    await fetch(`/api/admin/brands/${brandId}/models?modelId=${modelId}`, { method: 'DELETE' })
    setTick(x => x + 1); toast.success('Model removed')
  }

  return (
    <AdminCard title={`Models (${models.length})`}>
      <div className="flex flex-wrap gap-2 mb-4">
        {models.map(m => (
          <span key={m.id} className="inline-flex items-center gap-1.5 bg-zinc-100 text-zinc-700 text-sm px-2.5 py-1 rounded-md">
            {m.name}
            <button type="button" onClick={() => void removeModel(m.id)} className="text-zinc-400 hover:text-red-500" aria-label={`Remove ${m.name}`}>×</button>
          </span>
        ))}
        {models.length === 0 && <span className="text-sm text-zinc-400">No models yet.</span>}
      </div>
      <AdminLabel>Add models (comma separated)</AdminLabel>
      <textarea value={bulk} onChange={e => setBulk(e.target.value)} rows={2} placeholder="A1, A3, A4, Q5" className="w-full border border-zinc-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#4472C4]" />
      <div className="mt-3"><AdminButton variant="outline" loading={busy} onClick={() => void addModels()}>+ Add Models</AdminButton></div>
    </AdminCard>
  )
}

function AssignmentPanel({ title, listUrl, itemsKey, assignUrl, idsKey }: { kind: string; title: string; listUrl: string; itemsKey: string; assignUrl: string; idsKey: string }) {
  const [all, setAll] = useState<NamedRow[]>([])
  const [selected, setSelected] = useState<Set<string>>(new Set())
  const [busy, setBusy] = useState(false)

  useEffect(() => {
    void (async () => {
      try {
        const [listRes, curRes] = await Promise.all([fetch(listUrl), fetch(assignUrl)])
        if (listRes.ok) { const d = await listRes.json() as Record<string, NamedRow[]>; setAll(d[itemsKey] ?? []) }
        if (curRes.ok) { const d = await curRes.json() as Record<string, string[]>; setSelected(new Set(d[idsKey] ?? [])) }
      } catch { /* ignore */ }
    })()
  }, [listUrl, assignUrl, itemsKey, idsKey])

  function toggle(itemId: string) {
    setSelected(prev => { const n = new Set(prev); if (n.has(itemId)) n.delete(itemId); else n.add(itemId); return n })
  }

  async function saveAssign() {
    setBusy(true)
    const t = toast.loading('Saving…')
    try {
      const res = await fetch(assignUrl, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ [idsKey]: Array.from(selected) }) })
      const d = await res.json() as { count?: number; error?: string }
      if (!res.ok) toast.error(d.error ?? 'Failed', { id: t }); else toast.success(`Saved ${d.count ?? selected.size}`, { id: t })
    } finally { setBusy(false) }
  }

  return (
    <AdminCard title={`${title} (${selected.size}/${all.length})`} actions={<div className="flex gap-2 text-xs"><button onClick={() => setSelected(new Set(all.map(a => a.id)))} className="text-[#4472C4] hover:underline">Select all</button><button onClick={() => setSelected(new Set())} className="text-zinc-400 hover:underline">Clear</button></div>}>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mb-4">
        {all.map(item => {
          const on = selected.has(item.id)
          return (
            <button key={item.id} type="button" onClick={() => toggle(item.id)} className={['flex items-center gap-2 text-sm px-3 py-2 rounded-lg border text-left transition-colors', on ? 'border-[#4472C4] bg-[#EEF3FB] text-[#274E96]' : 'border-zinc-200 text-zinc-600 hover:bg-zinc-50'].join(' ')}>
              <span className={['h-4 w-4 rounded flex items-center justify-center text-[10px] text-white shrink-0', on ? 'bg-[#4472C4]' : 'bg-zinc-300'].join(' ')}>{on ? '✓' : ''}</span>
              {item.name}
            </button>
          )
        })}
        {all.length === 0 && <span className="text-sm text-zinc-400">None available.</span>}
      </div>
      <AdminButton variant="outline" loading={busy} onClick={() => void saveAssign()}>Save {title}</AdminButton>
    </AdminCard>
  )
}
