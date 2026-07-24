'use client'

import { useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import toast from 'react-hot-toast'
import { AdminSectionCard } from '@/components/admin/ui/AdminSectionCard'
import { AdminInput, AdminTextarea, AdminSelect, AdminLabel } from '@/components/admin/ui/AdminField'
import { AdminButton } from '@/components/admin/ui/AdminButton'
import { RichTextEditor } from '@/components/admin/RichTextEditor'
import { COUNTRIES, STATES_BY_COUNTRY } from '@/lib/geo'
import { generateSlug } from '@/lib/page-engine/slugify'
import { TEMPLATES_REQUIRING_BRAND, TEMPLATES_REQUIRING_MODEL, type TemplateTypeValue } from '@/lib/schemas/seo-page'
import type { PageContent } from '@/types'

export interface SeoPageFormValues {
  country: string
  state: string
  template_type: TemplateTypeValue
  h1: string
  arabic_title: string
  slug: string
  meta_title: string
  meta_keyword: string
  meta_description: string
  brand_id: string
  model_id: string
  starting_price: string
  short_description: string
  complete_description: string
  status: string
  display_in_footer: boolean
  content_json: PageContent
}

export const EMPTY_SEO_PAGE: SeoPageFormValues = {
  country: 'AE', state: '', template_type: 'general_service', h1: '', arabic_title: '', slug: '',
  meta_title: '', meta_keyword: '', meta_description: '',
  brand_id: '', model_id: '', starting_price: '', short_description: '', complete_description: '',
  status: 'draft', display_in_footer: false,
  content_json: {},
}

interface Props {
  pageId?: string
  initial: SeoPageFormValues
  brands: Array<{ id: string; name: string }>
}

const TEMPLATES: Array<{ value: TemplateTypeValue; label: string }> = [
  { value: 'brand', label: 'Brand Template' },
  { value: 'brand_service', label: 'Brand Service Template' },
  { value: 'brand_model', label: 'Brand Model Template' },
  { value: 'brand_model_service', label: 'Brand Model Service Template' },
  { value: 'general_service', label: 'General Service Template' },
]

type SlugStatus = 'idle' | 'checking' | 'available' | 'taken'

export function SeoPageForm({ pageId, initial, brands }: Props) {
  const router = useRouter()
  const [v, setV] = useState<SeoPageFormValues>(initial)
  const [models, setModels] = useState<Array<{ id: string; name: string }>>([])
  const [saving, setSaving] = useState(false)
  const [slugStatus, setSlugStatus] = useState<SlugStatus>('idle')
  const [slugEdited, setSlugEdited] = useState(!!initial.slug)

  const set = <K extends keyof SeoPageFormValues>(key: K, value: SeoPageFormValues[K]) =>
    setV(prev => ({ ...prev, [key]: value }))

  const setContent = <K extends keyof PageContent>(key: K, value: PageContent[K]) =>
    setV(prev => ({ ...prev, content_json: { ...prev.content_json, [key]: value } }))

  const requiresBrand = TEMPLATES_REQUIRING_BRAND.includes(v.template_type)
  const requiresModel = TEMPLATES_REQUIRING_MODEL.includes(v.template_type)

  // Car Make → Model cascade
  useEffect(() => {
    let cancelled = false
    if (!v.brand_id) {
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

  // Auto-generate slug from state → car make → car model, unless the user
  // has hand-edited the slug field.
  useEffect(() => {
    if (slugEdited) return
    const stateSlug = v.state ? generateSlug(v.state) : ''
    const brandName = brands.find(b => b.id === v.brand_id)?.name
    const modelName = models.find(m => m.id === v.model_id)?.name
    const parts = [stateSlug]
    if (requiresBrand && brandName) parts.push(generateSlug(brandName))
    if (requiresModel && modelName) parts.push(generateSlug(modelName))
    set('slug', parts.filter(Boolean).join('/'))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [v.state, v.brand_id, v.model_id, requiresBrand, requiresModel, slugEdited])

  // Debounced slug-availability check.
  useEffect(() => {
    if (!v.slug) { setSlugStatus('idle'); return }
    setSlugStatus('checking')
    const t = setTimeout(() => {
      const qs = new URLSearchParams({ slug: v.slug, ...(pageId ? { excludeId: pageId } : {}) })
      fetch(`/api/admin/seo-pages/check-slug?${qs.toString()}`)
        .then(r => (r.ok ? r.json() : null))
        .then((d: { available?: boolean } | null) => {
          if (d) setSlugStatus(d.available ? 'available' : 'taken')
        })
        .catch(() => setSlugStatus('idle'))
    }, 400)
    return () => clearTimeout(t)
  }, [v.slug, pageId])

  const canSave = useMemo(() => {
    if (!v.h1 || !v.slug || !v.meta_title) return false
    if (requiresBrand && !v.brand_id) return false
    if (requiresModel && !v.model_id) return false
    if (slugStatus === 'taken') return false
    return true
  }, [v, requiresBrand, requiresModel, slugStatus])

  async function save(exitAfter: boolean) {
    if (!v.h1 || !v.slug || !v.meta_title) { toast.error('Title, slug and meta title are required'); return }
    if (requiresBrand && !v.brand_id) { toast.error('Car Make is required for this template'); return }
    if (requiresModel && !v.model_id) { toast.error('Car Model is required for this template'); return }
    if (slugStatus === 'taken') { toast.error('That slug is already in use'); return }

    setSaving(true)
    const payload = {
      country: v.country,
      state: v.state || null,
      template_type: v.template_type,
      h1: v.h1,
      arabic_title: v.arabic_title || null,
      slug: v.slug,
      meta_title: v.meta_title,
      meta_keyword: v.meta_keyword || null,
      meta_description: v.meta_description,
      brand_id: requiresBrand ? (v.brand_id || null) : null,
      model_id: requiresModel ? (v.model_id || null) : null,
      starting_price: v.starting_price || null,
      short_description: v.short_description || null,
      complete_description: v.complete_description || null,
      status: v.status,
      display_in_footer: v.display_in_footer,
      content_json: v.content_json,
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
  const previewHref = v.slug ? `/${v.slug}` : null

  return (
    <div className="max-w-4xl space-y-5">
      {/* Section 1: PAGE DETAILS */}
      <AdminSectionCard title="Page Details" headerColor="#22C55E">
        <div>
          <AdminLabel required>Template</AdminLabel>
          <div className="flex flex-wrap items-center gap-6">
            {TEMPLATES.map(t => (
              <label key={t.value} className="flex items-center gap-2 text-sm text-zinc-700 cursor-pointer">
                <input
                  type="radio"
                  name="template_type"
                  checked={v.template_type === t.value}
                  onChange={() => { set('template_type', t.value); set('brand_id', ''); set('model_id', '') }}
                  className="text-[#4472C4]"
                />
                {t.label}
              </label>
            ))}
            {previewHref && <a href={previewHref} target="_blank" rel="noopener noreferrer" className="text-sm text-blue-600 hover:underline">View Page</a>}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <AdminSelect label="Country" required value={v.country} onChange={e => set('country', e.target.value)} options={COUNTRIES.map(c => ({ value: c.code, label: c.name }))} />
          <AdminSelect label="State" required value={v.state} onChange={e => { set('state', e.target.value); setSlugEdited(false) }} options={[{ value: '', label: 'Select' }, ...(STATES_BY_COUNTRY[v.country] ?? []).map(s => ({ value: s, label: s }))]} />
        </div>

        {(requiresBrand || requiresModel) && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <AdminSelect
              label="Car Make" required={requiresBrand}
              value={v.brand_id}
              onChange={e => { set('brand_id', e.target.value); set('model_id', ''); setSlugEdited(false) }}
              options={[{ value: '', label: 'Choose Make' }, ...brands.map(b => ({ value: b.id, label: b.name }))]}
            />
            {requiresModel ? (
              <AdminSelect
                label="Car Model" required
                value={v.model_id}
                onChange={e => { set('model_id', e.target.value); setSlugEdited(false) }}
                options={[{ value: '', label: 'Choose Model' }, ...models.map(m => ({ value: m.id, label: m.name }))]}
              />
            ) : <div />}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <AdminInput label="Title (H1)" required value={v.h1} onChange={e => set('h1', e.target.value)} />
          <AdminInput label="Arabic Title" dir="rtl" value={v.arabic_title} onChange={e => set('arabic_title', e.target.value)} />
        </div>
        <AdminInput label="Starting Price" hint='Shown in the hero stat card, e.g. "From AED 149"' value={v.starting_price} onChange={e => set('starting_price', e.target.value)} maxCount={60} />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <AdminInput label="URL" required value={`${siteUrl}/`} disabled readOnly />
          <div>
            <AdminInput label="URL SLUG" required value={v.slug} onChange={e => { set('slug', e.target.value.toLowerCase()); setSlugEdited(true) }} />
            {slugStatus === 'checking' && <p className="mt-1 text-xs text-zinc-500">Checking availability…</p>}
            {slugStatus === 'available' && <p className="mt-1 text-xs text-[#22C55E]">Slug available</p>}
            {slugStatus === 'taken' && <p className="mt-1 text-xs text-[#EF4444]">Slug already in use</p>}
          </div>
        </div>
        <AdminInput label="Meta Title" required value={v.meta_title} onChange={e => set('meta_title', e.target.value)} maxCount={100} />
        <AdminInput label="Meta Keyword" value={v.meta_keyword} onChange={e => set('meta_keyword', e.target.value)} />
        <AdminTextarea label="Meta Description" value={v.meta_description} onChange={e => set('meta_description', e.target.value)} maxCount={300} rows={3} />
      </AdminSectionCard>

      {/* Section 2: CONTENT */}
      <AdminSectionCard title="Content" headerColor="#22C55E">
        <AdminTextarea label="Short Description" hint="Plain text — shown as the hero subtitle" value={v.short_description} onChange={e => set('short_description', e.target.value)} rows={3} maxCount={500} />
        <AdminInput
          label="Services Section Heading"
          hint='Defaults to "Our Services" if left blank'
          value={v.content_json.services_heading ?? ''}
          onChange={e => setContent('services_heading', e.target.value)}
        />
        <div>
          <AdminLabel>Long Description</AdminLabel>
          <RichTextEditor value={v.complete_description} onChange={html => set('complete_description', html)} minHeight={260} />
        </div>
      </AdminSectionCard>

      {/* Section 3: DISPLAY INFORMATION */}
      <AdminSectionCard title="Display Information" headerColor="#22C55E">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <AdminSelect label="Publish Status" required value={v.status} onChange={e => set('status', e.target.value)} options={[{ value: 'published', label: 'Active' }, { value: 'draft', label: 'Inactive' }, { value: 'archived', label: 'Archived' }]} />
          <AdminSelect label="Display In Footer?" required value={v.display_in_footer ? 'yes' : 'no'} onChange={e => set('display_in_footer', e.target.value === 'yes')} options={[{ value: 'yes', label: 'Yes' }, { value: 'no', label: 'No' }]} />
        </div>
      </AdminSectionCard>

      <div className="flex gap-3">
        <AdminButton variant="success" loading={saving} disabled={!canSave} onClick={() => void save(false)}>SAVE &amp; KEEP EDITING</AdminButton>
        <AdminButton variant="success" loading={saving} disabled={!canSave} onClick={() => void save(true)}>SAVE &amp; EXIT</AdminButton>
        <AdminButton variant="outline" onClick={() => router.push('/admin/seo-pages')}>Cancel</AdminButton>
      </div>
    </div>
  )
}
