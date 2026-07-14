'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import toast from 'react-hot-toast'
import { AdminSectionCard } from '@/components/admin/ui/AdminSectionCard'
import { AdminInput, AdminTextarea, AdminSelect, AdminLabel } from '@/components/admin/ui/AdminField'
import { AdminButton } from '@/components/admin/ui/AdminButton'
import { RichTextEditor } from '@/components/admin/RichTextEditor'
import { COUNTRIES, STATES_BY_COUNTRY } from '@/lib/geo'

export interface SeoPageFormValues {
  country: string
  state: string
  template: string
  h1: string
  arabic_title: string
  slug: string
  meta_title: string
  meta_keyword: string
  meta_description: string
  schema_headline: string
  schema_description: string
  brand_id: string
  model_id: string
  image_png_url: string
  image_webp_url: string
  image_title: string
  image_alt: string
  use_dynamic_content: boolean
  short_description: string
  complete_description: string
  status: string
  is_expensive_car: boolean
  display_in_footer: boolean
}

export const EMPTY_SEO_PAGE: SeoPageFormValues = {
  country: 'AE', state: '', template: 'standard', h1: '', arabic_title: '', slug: '',
  meta_title: '', meta_keyword: '', meta_description: '', schema_headline: '', schema_description: '',
  brand_id: '', model_id: '', image_png_url: '', image_webp_url: '', image_title: '', image_alt: '',
  use_dynamic_content: true, short_description: '', complete_description: '',
  status: 'draft', is_expensive_car: false, display_in_footer: false,
}

interface Props {
  pageId?: string
  initial: SeoPageFormValues
  brands: Array<{ id: string; name: string }>
}

const TEMPLATES = [
  { value: 'standard', label: 'Standard Template' },
  { value: 'repair', label: 'Repair Template' },
  { value: 'service', label: 'Service Template' },
]

export function SeoPageForm({ pageId, initial, brands }: Props) {
  const router = useRouter()
  const [v, setV] = useState<SeoPageFormValues>(initial)
  const [models, setModels] = useState<Array<{ id: string; name: string }>>([])
  const [saving, setSaving] = useState(false)

  const set = <K extends keyof SeoPageFormValues>(key: K, value: SeoPageFormValues[K]) =>
    setV(prev => ({ ...prev, [key]: value }))

  // Car Make → Model cascade
  useEffect(() => {
    let cancelled = false
    if (!v.brand_id) {
      // Clear async to avoid a synchronous setState inside the effect body.
      queueMicrotask(() => { if (!cancelled) setModels([]) })
      return () => { cancelled = true }
    }
    fetch(`/api/admin/brands/${v.brand_id}/models`)
      .then(r => (r.ok ? r.json() : null))
      .then((d: { models?: Array<{ id: string; name: string }> } | null) => {
        if (!cancelled && d?.models) setModels(d.models)
      })
      .catch(() => {})
    return () => { cancelled = true }
  }, [v.brand_id])

  async function uploadImage(file: File, key: 'image_png_url' | 'image_webp_url') {
    const t = toast.loading('Uploading…')
    try {
      const form = new FormData()
      form.append('file', file)
      const res = await fetch('/api/admin/media', { method: 'POST', body: form })
      const d = await res.json() as { media?: { url: string }; error?: string }
      if (!res.ok || !d.media) { toast.error(d.error ?? 'Upload failed', { id: t }); return }
      set(key, d.media.url)
      toast.success('Uploaded', { id: t })
    } catch { toast.error('Network error', { id: t }) }
  }

  async function save(exitAfter: boolean) {
    if (!v.h1 || !v.slug || !v.meta_title) { toast.error('Title, slug and meta title are required'); return }
    setSaving(true)
    const payload = {
      country: v.country,
      state: v.state || null,
      template: v.template,
      h1: v.h1,
      arabic_title: v.arabic_title || null,
      slug: v.slug,
      meta_title: v.meta_title,
      meta_keyword: v.meta_keyword || null,
      meta_description: v.meta_description,
      schema_headline: v.schema_headline || null,
      schema_description: v.schema_description || null,
      brand_id: v.brand_id || null,
      model_id: v.model_id || null,
      image_png_url: v.image_png_url || null,
      image_webp_url: v.image_webp_url || null,
      image_title: v.image_title || null,
      image_alt: v.image_alt || null,
      use_dynamic_content: v.use_dynamic_content,
      short_description: v.short_description || null,
      complete_description: v.complete_description || null,
      status: v.status,
      is_expensive_car: v.is_expensive_car,
      display_in_footer: v.display_in_footer,
    }
    if (!pageId && !payload.meta_description) payload.meta_description = v.h1

    const res = await fetch(pageId ? `/api/admin/seo-pages/${pageId}` : '/api/admin/seo-pages', {
      method: pageId ? 'PATCH' : 'POST',
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
    if (exitAfter) router.push('/admin/seo-pages')
    else if (!pageId) {
      const d = await res.json() as { id?: string }
      if (d.id) router.replace(`/admin/seo-pages/${d.id}`)
    }
    router.refresh()
  }

  const siteUrl = typeof window !== 'undefined' ? window.location.origin : 'https://carworkshop.ae'

  return (
    <div className="max-w-4xl space-y-5">
      {/* Section 1: PAGE DETAILS */}
      <AdminSectionCard title="Page Details" headerColor="#22C55E">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <AdminSelect label="Country" required value={v.country} onChange={e => set('country', e.target.value)} options={COUNTRIES.map(c => ({ value: c.code, label: c.name }))} />
          <AdminSelect label="State" required value={v.state} onChange={e => set('state', e.target.value)} options={[{ value: '', label: 'Select' }, ...(STATES_BY_COUNTRY[v.country] ?? []).map(s => ({ value: s, label: s }))]} />
          <AdminSelect label="Template" required value={v.template} onChange={e => set('template', e.target.value)} options={TEMPLATES} />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <AdminInput label="Title" required value={v.h1} onChange={e => set('h1', e.target.value)} />
          <AdminInput label="Arabic Title" dir="rtl" value={v.arabic_title} onChange={e => set('arabic_title', e.target.value)} />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <AdminInput label="URL" required value={`${siteUrl}/brands/`} disabled readOnly />
          <AdminInput label="URL SLUG" required value={v.slug} onChange={e => set('slug', e.target.value.toLowerCase())} />
        </div>
        <AdminInput label="Meta Title" required value={v.meta_title} onChange={e => set('meta_title', e.target.value)} maxCount={100} />
        <AdminInput label="Meta Keyword" required value={v.meta_keyword} onChange={e => set('meta_keyword', e.target.value)} />
        <AdminTextarea label="Meta Description" value={v.meta_description} onChange={e => set('meta_description', e.target.value)} maxCount={300} rows={3} />
        <AdminInput label="Schema Headline" value={v.schema_headline} onChange={e => set('schema_headline', e.target.value)} />
        <AdminTextarea label="Schema Description" value={v.schema_description} onChange={e => set('schema_description', e.target.value)} rows={3} />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <AdminSelect label="Car Make" required value={v.brand_id} onChange={e => { set('brand_id', e.target.value); set('model_id', '') }} options={[{ value: '', label: 'Choose Make' }, ...brands.map(b => ({ value: b.id, label: b.name }))]} />
          <AdminSelect label="Car Model" value={v.model_id} onChange={e => set('model_id', e.target.value)} options={[{ value: '', label: 'Choose Model' }, ...models.map(m => ({ value: m.id, label: m.name }))]} />
        </div>
        <AdminTextarea label="H1 Text" value={v.h1} onChange={e => set('h1', e.target.value)} rows={2} />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <ImageUpload label="Master Image (png)" required url={v.image_png_url} accept="image/png" onFile={f => void uploadImage(f, 'image_png_url')} />
          <ImageUpload label="Master Image (webp)" required url={v.image_webp_url} accept="image/webp" onFile={f => void uploadImage(f, 'image_webp_url')} />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <AdminInput label="Image Title" value={v.image_title} onChange={e => set('image_title', e.target.value)} />
          <AdminInput label="Image Alt Tag" value={v.image_alt} onChange={e => set('image_alt', e.target.value)} />
        </div>
        <label className="flex items-center gap-2 text-sm font-medium text-zinc-700 cursor-pointer">
          <input type="checkbox" checked={v.use_dynamic_content} onChange={e => set('use_dynamic_content', e.target.checked)} className="rounded border-[#D1D5DB]" />
          Use the Dynamic Content Provided on Front Page
        </label>
      </AdminSectionCard>

      {/* Section 2: CONTENT */}
      <AdminSectionCard title="Content" headerColor="#22C55E">
        <div>
          <AdminLabel>Short Description</AdminLabel>
          <RichTextEditor value={v.short_description} onChange={html => set('short_description', html)} minHeight={180} />
        </div>
        <div>
          <AdminLabel>Complete Description</AdminLabel>
          <RichTextEditor value={v.complete_description} onChange={html => set('complete_description', html)} minHeight={260} />
        </div>
      </AdminSectionCard>

      {/* Section 3: DISPLAY INFORMATION */}
      <AdminSectionCard title="Display Information" headerColor="#22C55E">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <AdminSelect label="Publish Status" required value={v.status} onChange={e => set('status', e.target.value)} options={[{ value: 'published', label: 'Active' }, { value: 'draft', label: 'Inactive' }, { value: 'archived', label: 'Archived' }]} />
          <AdminSelect label="Is Expensive Car?" required value={v.is_expensive_car ? 'yes' : 'no'} onChange={e => set('is_expensive_car', e.target.value === 'yes')} options={[{ value: 'yes', label: 'Yes' }, { value: 'no', label: 'No' }]} />
          <AdminSelect label="Display In Footer?" required value={v.display_in_footer ? 'yes' : 'no'} onChange={e => set('display_in_footer', e.target.value === 'yes')} options={[{ value: 'yes', label: 'Yes' }, { value: 'no', label: 'No' }]} />
        </div>
      </AdminSectionCard>

      <div className="flex gap-3">
        <AdminButton variant="success" loading={saving} onClick={() => void save(false)}>SAVE &amp; KEEP EDITING</AdminButton>
        <AdminButton variant="success" loading={saving} onClick={() => void save(true)}>SAVE &amp; EXIT</AdminButton>
        <AdminButton variant="outline" onClick={() => router.push('/admin/seo-pages')}>Cancel</AdminButton>
      </div>
    </div>
  )
}

function ImageUpload({ label, required, url, accept, onFile }: { label: string; required?: boolean; url: string; accept: string; onFile: (f: File) => void }) {
  return (
    <div>
      <AdminLabel required={required}>{label}</AdminLabel>
      <input
        type="file"
        accept={accept}
        onChange={e => { const f = e.target.files?.[0]; if (f) onFile(f); e.target.value = '' }}
        className="block w-full text-sm text-zinc-600 file:mr-3 file:rounded file:border file:border-zinc-300 file:bg-white file:px-3 file:py-1.5 file:text-sm file:text-zinc-700"
      />
      {url && (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={url} alt="" className="mt-2 h-20 rounded border border-[#E5E7EB] object-contain" />
      )}
    </div>
  )
}
