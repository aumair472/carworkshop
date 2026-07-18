'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import toast from 'react-hot-toast'
import { AdminSectionCard } from '@/components/admin/ui/AdminSectionCard'
import { AdminInput, AdminTextarea, AdminSelect, AdminLabel } from '@/components/admin/ui/AdminField'
import { AdminButton } from '@/components/admin/ui/AdminButton'
import { Repeater } from '@/components/admin/ui/Repeater'
import { RichTextEditor } from '@/components/admin/RichTextEditor'
import { COUNTRIES, STATES_BY_COUNTRY } from '@/lib/geo'
import type { PageContent } from '@/types'

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
  // SMC-style extended fields
  highlight_text: string
  mid_category_title: string
  key_points: string
  icon_image_png_url: string
  icon_image_webp_url: string
  icon_image_title: string
  icon_image_alt: string
  image_bottom_png_url: string
  image_bottom_webp_url: string
  image_bottom_title: string
  image_bottom_alt: string
  image_large_url: string
  image_mobile_url: string
  content_json: PageContent
}

const EMPTY_CONTENT_JSON: PageContent = {
  service_section: { title: '', description: '' },
  service_packages: [],
  warranty_policy: {
    service: { months: 0, km: 0, items: [] },
    electrical: { months: 0, km: 0, items: [] },
    ac: { months: 0, km: 0, items: [] },
    batteries: { months: 0, km: 0, items: [] },
  },
  quick_service_links: [],
  how_it_works: {
    step1_title: '', step1_desc: '',
    step2_title: '', step2_desc: '',
    step3_title: '', step3_desc: '',
    step4_title: '', step4_desc: '',
  },
  price_guarantee_text: '',
  cost_description: '',
  why_important: '',
  why_choose_us_brand: '',
}

export const EMPTY_SEO_PAGE: SeoPageFormValues = {
  country: 'AE', state: '', template: 'template_1', h1: '', arabic_title: '', slug: '',
  meta_title: '', meta_keyword: '', meta_description: '', schema_headline: '', schema_description: '',
  brand_id: '', model_id: '', image_png_url: '', image_webp_url: '', image_title: '', image_alt: '',
  use_dynamic_content: true, short_description: '', complete_description: '',
  status: 'draft', is_expensive_car: false, display_in_footer: false,
  highlight_text: '', mid_category_title: '', key_points: '',
  icon_image_png_url: '', icon_image_webp_url: '', icon_image_title: '', icon_image_alt: '',
  image_bottom_png_url: '', image_bottom_webp_url: '', image_bottom_title: '', image_bottom_alt: '',
  image_large_url: '', image_mobile_url: '',
  content_json: EMPTY_CONTENT_JSON,
}

interface Props {
  pageId?: string
  initial: SeoPageFormValues
  brands: Array<{ id: string; name: string }>
}

const TEMPLATES = [
  { value: 'template_1', label: 'Template 1 — Service Page' },
  { value: 'template_2', label: 'Template 2 — Brand Page' },
]

type ImageKey = 'image_png_url' | 'image_webp_url' | 'icon_image_png_url' | 'icon_image_webp_url'
  | 'image_bottom_png_url' | 'image_bottom_webp_url' | 'image_large_url' | 'image_mobile_url'

export function SeoPageForm({ pageId, initial, brands }: Props) {
  const router = useRouter()
  const [v, setV] = useState<SeoPageFormValues>(initial)
  const [models, setModels] = useState<Array<{ id: string; name: string }>>([])
  const [saving, setSaving] = useState(false)

  const set = <K extends keyof SeoPageFormValues>(key: K, value: SeoPageFormValues[K]) =>
    setV(prev => ({ ...prev, [key]: value }))

  const setContent = <K extends keyof PageContent>(key: K, value: PageContent[K]) =>
    setV(prev => ({ ...prev, content_json: { ...prev.content_json, [key]: value } }))

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

  async function uploadImage(file: File, key: ImageKey) {
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
      highlight_text: v.highlight_text || null,
      mid_category_title: v.mid_category_title || null,
      key_points: v.key_points || null,
      icon_image_png_url: v.icon_image_png_url || null,
      icon_image_webp_url: v.icon_image_webp_url || null,
      icon_image_title: v.icon_image_title || null,
      icon_image_alt: v.icon_image_alt || null,
      image_bottom_png_url: v.image_bottom_png_url || null,
      image_bottom_webp_url: v.image_bottom_webp_url || null,
      image_bottom_title: v.image_bottom_title || null,
      image_bottom_alt: v.image_bottom_alt || null,
      image_large_url: v.image_large_url || null,
      image_mobile_url: v.image_mobile_url || null,
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
  // All generated pages are served under /brands/{slug} regardless of template
  // (there is no /services/{slug} route for generated_pages — that path is a
  // different, single-segment catalog entity). Only show the link once slug exists.
  const previewHref = v.slug ? `/brands/${v.slug}` : null

  const warranty = v.content_json.warranty_policy ?? EMPTY_CONTENT_JSON.warranty_policy!
  const howItWorks = v.content_json.how_it_works ?? EMPTY_CONTENT_JSON.how_it_works!
  const serviceSection = v.content_json.service_section ?? { title: '', description: '' }

  return (
    <div className="max-w-4xl space-y-5">
      {/* Section 1: PAGE DETAILS */}
      <AdminSectionCard title="Page Details" headerColor="#22C55E">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <AdminSelect label="Country" required value={v.country} onChange={e => set('country', e.target.value)} options={COUNTRIES.map(c => ({ value: c.code, label: c.name }))} />
          <AdminSelect label="State" required value={v.state} onChange={e => set('state', e.target.value)} options={[{ value: '', label: 'Select' }, ...(STATES_BY_COUNTRY[v.country] ?? []).map(s => ({ value: s, label: s }))]} />
        </div>

        <div>
          <AdminLabel required>Template</AdminLabel>
          <div className="flex flex-wrap items-center gap-6">
            {TEMPLATES.map(t => (
              <label key={t.value} className="flex items-center gap-2 text-sm text-zinc-700 cursor-pointer">
                <input type="radio" name="template" checked={v.template === t.value} onChange={() => set('template', t.value)} className="text-[#4472C4]" />
                {t.label}
              </label>
            ))}
            {previewHref && <a href={previewHref} target="_blank" rel="noopener noreferrer" className="text-sm text-blue-600 hover:underline">View Template</a>}
          </div>
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
        <AdminInput label="Highlight Text" value={v.highlight_text} onChange={e => set('highlight_text', e.target.value)} />
        <AdminInput label="Mid Category Title" value={v.mid_category_title} onChange={e => set('mid_category_title', e.target.value)} />
        <AdminInput label="Key Points" hint="Separate each point with semicolon (;)" value={v.key_points} onChange={e => set('key_points', e.target.value)} />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <ImageUpload label="Master Image (png)" required url={v.image_png_url} accept="image/png" onFile={f => void uploadImage(f, 'image_png_url')} />
          <ImageUpload label="Master Image (webp)" required url={v.image_webp_url} accept="image/webp" onFile={f => void uploadImage(f, 'image_webp_url')} />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <AdminInput label="Image Title" value={v.image_title} onChange={e => set('image_title', e.target.value)} />
          <AdminInput label="Image Alt Tag" value={v.image_alt} onChange={e => set('image_alt', e.target.value)} />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <ImageUpload label="Icon Image (png)" url={v.icon_image_png_url} accept="image/png" onFile={f => void uploadImage(f, 'icon_image_png_url')} />
          <ImageUpload label="Icon Image (webp)" url={v.icon_image_webp_url} accept="image/webp" onFile={f => void uploadImage(f, 'icon_image_webp_url')} />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <AdminInput label="Icon Image Title" value={v.icon_image_title} onChange={e => set('icon_image_title', e.target.value)} />
          <AdminInput label="Icon Image Alt Tag" value={v.icon_image_alt} onChange={e => set('icon_image_alt', e.target.value)} />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <ImageUpload label="Image Bottom (png)" url={v.image_bottom_png_url} accept="image/png" onFile={f => void uploadImage(f, 'image_bottom_png_url')} />
          <ImageUpload label="Image Bottom (webp)" url={v.image_bottom_webp_url} accept="image/webp" onFile={f => void uploadImage(f, 'image_bottom_webp_url')} />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <AdminInput label="Image Bottom Title" value={v.image_bottom_title} onChange={e => set('image_bottom_title', e.target.value)} />
          <AdminInput label="Image Bottom Alt Tag" value={v.image_bottom_alt} onChange={e => set('image_bottom_alt', e.target.value)} />
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
        <div>
          <AdminLabel>Cost Description</AdminLabel>
          <RichTextEditor value={v.content_json.cost_description ?? ''} onChange={html => setContent('cost_description', html)} minHeight={160} />
        </div>
        <div>
          <AdminLabel>Why Important</AdminLabel>
          <RichTextEditor value={v.content_json.why_important ?? ''} onChange={html => setContent('why_important', html)} minHeight={160} />
        </div>
        <div>
          <AdminLabel>Why Choose Us (Brand)</AdminLabel>
          <RichTextEditor value={v.content_json.why_choose_us_brand ?? ''} onChange={html => setContent('why_choose_us_brand', html)} minHeight={160} />
        </div>
      </AdminSectionCard>

      {/* Template 1: Service Section With Image */}
      {v.template === 'template_1' && (
        <AdminSectionCard title="Service Section With Image" headerColor="#22C55E">
          <AdminInput label="Title" value={serviceSection.title ?? ''} onChange={e => setContent('service_section', { ...serviceSection, title: e.target.value })} />
          <div>
            <AdminLabel>Description</AdminLabel>
            <RichTextEditor value={serviceSection.description ?? ''} onChange={html => setContent('service_section', { ...serviceSection, description: html })} minHeight={180} />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <ImageUpload label="Image (Large)" url={v.image_large_url} accept="image/*" onFile={f => void uploadImage(f, 'image_large_url')} />
            <ImageUpload label="Image (Mobile)" url={v.image_mobile_url} accept="image/*" onFile={f => void uploadImage(f, 'image_mobile_url')} />
          </div>
        </AdminSectionCard>
      )}

      {/* Template 2: Service Packages & Warranty */}
      {v.template === 'template_2' && (
        <AdminSectionCard title="Service Packages & Warranty" headerColor="#22C55E">
          <div>
            <h4 className="text-sm font-semibold text-zinc-700 mb-2">Warranty Policy</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {(['service', 'electrical', 'ac', 'batteries'] as const).map(key => {
                const w = warranty[key] ?? { months: 0, km: 0, items: [] }
                const label = key === 'ac' ? 'A/C' : key.charAt(0).toUpperCase() + key.slice(1)
                return (
                  <div key={key} className="border border-zinc-200 rounded-lg p-3 space-y-2">
                    <span className="text-sm font-medium text-zinc-700">{label}</span>
                    <div className="grid grid-cols-2 gap-2">
                      <AdminInput label="Months" type="number" value={w.months} onChange={e => setContent('warranty_policy', { ...warranty, [key]: { ...w, months: Number(e.target.value) } })} />
                      <AdminInput label="KM" type="number" value={w.km} onChange={e => setContent('warranty_policy', { ...warranty, [key]: { ...w, km: Number(e.target.value) } })} />
                    </div>
                    <AdminTextarea label="Items" hint="One per line" rows={3} value={w.items.join('\n')} onChange={e => setContent('warranty_policy', { ...warranty, [key]: { ...w, items: e.target.value.split('\n').map(s => s.trim()).filter(Boolean) } })} />
                  </div>
                )
              })}
            </div>
          </div>

          <div>
            <h4 className="text-sm font-semibold text-zinc-700 mb-2">Service Packages</h4>
            <Repeater
              items={v.content_json.service_packages ?? []}
              max={30}
              addLabel="+ Add Package"
              blank={{ name: '', price: '', image: '', link: '' }}
              onChange={items => setContent('service_packages', items)}
              render={(item, update) => (
                <div className="grid grid-cols-1 md:grid-cols-4 gap-2 flex-1">
                  <AdminInput placeholder="Name" value={item.name} onChange={e => update({ name: e.target.value })} />
                  <AdminInput placeholder="Price AED" value={item.price} onChange={e => update({ price: e.target.value })} />
                  <AdminInput placeholder="Image URL" value={item.image ?? ''} onChange={e => update({ image: e.target.value })} />
                  <AdminInput placeholder="Link" value={item.link ?? ''} onChange={e => update({ link: e.target.value })} />
                </div>
              )}
            />
          </div>

          <div>
            <h4 className="text-sm font-semibold text-zinc-700 mb-2">Quick Service Links</h4>
            <Repeater
              items={v.content_json.quick_service_links ?? []}
              max={30}
              addLabel="+ Add Link"
              blank={{ icon: '', label: '', href: '' }}
              onChange={items => setContent('quick_service_links', items)}
              render={(item, update) => (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-2 flex-1">
                  <AdminInput placeholder="Icon" value={item.icon ?? ''} onChange={e => update({ icon: e.target.value })} />
                  <AdminInput placeholder="Label" value={item.label} onChange={e => update({ label: e.target.value })} />
                  <AdminInput placeholder="Href" value={item.href} onChange={e => update({ href: e.target.value })} />
                </div>
              )}
            />
          </div>

          <div>
            <h4 className="text-sm font-semibold text-zinc-700 mb-2">How It Works</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {([1, 2, 3, 4] as const).map(n => (
                <div key={n} className="border border-zinc-200 rounded-lg p-3 space-y-2">
                  <span className="text-sm font-medium text-zinc-700">Step {n}</span>
                  <AdminInput label="Title" value={howItWorks[`step${n}_title` as keyof typeof howItWorks] ?? ''} onChange={e => setContent('how_it_works', { ...howItWorks, [`step${n}_title`]: e.target.value })} />
                  <AdminTextarea label="Description" rows={2} value={howItWorks[`step${n}_desc` as keyof typeof howItWorks] ?? ''} onChange={e => setContent('how_it_works', { ...howItWorks, [`step${n}_desc`]: e.target.value })} />
                </div>
              ))}
            </div>
          </div>

          <AdminTextarea label="Price Guarantee Text" rows={3} value={v.content_json.price_guarantee_text ?? ''} onChange={e => setContent('price_guarantee_text', e.target.value)} />
        </AdminSectionCard>
      )}

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
