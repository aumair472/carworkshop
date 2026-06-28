'use client'

import { useState, useEffect, useCallback } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { Input } from '@/components/ui/Input'
import { Textarea } from '@/components/ui/Textarea'
import { Button } from '@/components/ui/Button'
import { Alert } from '@/components/ui/Alert'
import { StatusToggle } from '@/components/admin/StatusToggle'
import { FAQRepeater } from '@/components/admin/FAQRepeater'
import type { ContentStatus, StaticSection, StaticSectionType } from '@/types'

interface NamedRow { id: string; name: string }

const SECTION_TYPES: Array<{ value: StaticSectionType; label: string }> = [
  { value: 'hero', label: 'Hero Section' },
  { value: 'text', label: 'Text Block' },
  { value: 'service_cards', label: 'Service Cards' },
  { value: 'brand_grid', label: 'Brand Grid' },
  { value: 'faq', label: 'FAQ Section' },
  { value: 'cta', label: 'CTA Banner' },
]

function newSection(type: StaticSectionType): StaticSection {
  const id = (typeof crypto !== 'undefined' && crypto.randomUUID) ? crypto.randomUUID() : String(Date.now() + Math.random())
  const defaults: Record<StaticSectionType, Record<string, unknown>> = {
    hero: { headline: '', subheadline: '', cta_text: 'Book Now', cta_link: '/contact', image_url: '' },
    text: { html: '' },
    service_cards: { service_ids: [] },
    brand_grid: { brand_ids: [] },
    faq: { faqs: [] },
    cta: { headline: '', button_text: 'Book Now', button_link: '/contact', bg_color: '#4472C4' },
  }
  return { id, type, data: defaults[type] }
}

export default function StaticEditor() {
  const params = useParams()
  const slug = String(params.slug)

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [savingLabel, setSavingLabel] = useState('')
  const [title, setTitle] = useState('')
  const [status, setStatus] = useState<ContentStatus>('draft')
  const [seoTitle, setSeoTitle] = useState('')
  const [seoDesc, setSeoDesc] = useState('')
  const [sections, setSections] = useState<StaticSection[]>([])
  const [addType, setAddType] = useState<StaticSectionType>('hero')
  const [services, setServices] = useState<NamedRow[]>([])
  const [brands, setBrands] = useState<NamedRow[]>([])

  useEffect(() => {
    void (async () => {
      try {
        const [pageRes, svcRes, brRes] = await Promise.all([
          fetch(`/api/admin/pages/static/${slug}`),
          fetch('/api/admin/services'),
          fetch('/api/admin/brands'),
        ])
        if (!pageRes.ok) { setError('Page not found'); return }
        const d = await pageRes.json() as { page: { title: string; status: ContentStatus; seo_title: string | null; seo_description: string | null; sections_json: StaticSection[] } }
        setTitle(d.page.title); setStatus(d.page.status)
        setSeoTitle(d.page.seo_title ?? ''); setSeoDesc(d.page.seo_description ?? '')
        setSections(Array.isArray(d.page.sections_json) ? d.page.sections_json : [])
        if (svcRes.ok) { const s = await svcRes.json() as { services: NamedRow[] }; setServices(s.services ?? []) }
        if (brRes.ok) { const b = await brRes.json() as { brands: NamedRow[] }; setBrands(b.brands ?? []) }
      } catch { setError('Failed to load') } finally { setLoading(false) }
    })()
  }, [slug])

  function updateSection(id: string, data: Record<string, unknown>) {
    setSections(prev => prev.map(s => s.id === id ? { ...s, data } : s))
  }
  function move(id: string, dir: -1 | 1) {
    setSections(prev => {
      const i = prev.findIndex(s => s.id === id)
      const j = i + dir
      if (i < 0 || j < 0 || j >= prev.length) return prev
      const next = [...prev]
      ;[next[i], next[j]] = [next[j], next[i]]
      return next
    })
  }
  function remove(id: string) { setSections(prev => prev.filter(s => s.id !== id)) }
  function add() { setSections(prev => [...prev, newSection(addType)]) }

  const save = useCallback(async (nextStatus?: ContentStatus) => {
    setSavingLabel('Saving…'); setError('')
    try {
      const res = await fetch(`/api/admin/pages/static/${slug}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, sections_json: sections, seo_title: seoTitle || null, seo_description: seoDesc || null, status: nextStatus ?? status }),
      })
      const d = await res.json() as { error?: string }
      if (!res.ok) { setError(d.error ?? 'Save failed'); setSavingLabel(''); return }
      if (nextStatus) setStatus(nextStatus)
      setSavingLabel(`Saved ${new Date().toLocaleTimeString('en-AE')}`)
    } catch { setError('Network error'); setSavingLabel('') }
  }, [slug, title, sections, seoTitle, seoDesc, status])

  if (loading) return <div className="p-8 text-[#9CA3AF]">Loading…</div>

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <Link href="/admin/pages/static" className="text-sm text-[#4472C4] hover:underline">← Static Pages</Link>
          <h1 className="text-2xl font-bold text-[#1F2937] mt-1">{title}</h1>
        </div>
        <div className="flex items-center gap-3">
          {savingLabel && <span className="text-xs text-[#6B7280]">{savingLabel}</span>}
          <Button variant="secondary" size="sm" onClick={() => void save()}>Save Draft</Button>
          <Button variant="primary" size="sm" onClick={() => void save('published')}>Publish</Button>
        </div>
      </div>

      {error && <Alert variant="danger" className="mb-4">{error}</Alert>}

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-4">
          {sections.length === 0 && <p className="text-sm text-[#9CA3AF] bg-white border border-dashed border-[#E5E7EB] rounded-lg p-8 text-center">No sections yet. Add one below.</p>}
          {sections.map((s, idx) => (
            <div key={s.id} className="bg-white rounded-lg shadow-card border border-[#E5E7EB] p-5">
              <div className="flex items-center justify-between border-b border-[#E5E7EB] pb-3 mb-4">
                <span className="text-sm font-semibold text-[#1F2937]">{SECTION_TYPES.find(t => t.value === s.type)?.label}</span>
                <div className="flex items-center gap-2 text-[#6B7280]">
                  <button type="button" onClick={() => move(s.id, -1)} disabled={idx === 0} className="px-1 disabled:opacity-30" aria-label="Move up">↑</button>
                  <button type="button" onClick={() => move(s.id, 1)} disabled={idx === sections.length - 1} className="px-1 disabled:opacity-30" aria-label="Move down">↓</button>
                  <button type="button" onClick={() => remove(s.id)} className="px-1 text-[#DC2626]" aria-label="Delete section">×</button>
                </div>
              </div>
              <SectionFields section={s} services={services} brands={brands} onChange={data => updateSection(s.id, data)} />
            </div>
          ))}

          <div className="flex items-center gap-3 bg-white rounded-lg border border-[#E5E7EB] p-4">
            <select value={addType} onChange={e => setAddType(e.target.value as StaticSectionType)} className="px-3 py-2 rounded-md border border-[#E5E7EB] text-sm bg-white">
              {SECTION_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
            </select>
            <Button type="button" variant="secondary" size="sm" onClick={add}>+ Add Section</Button>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-white rounded-lg shadow-card border border-[#E5E7EB] p-6 space-y-4">
            <h3 className="text-sm font-semibold text-[#1F2937] border-b border-[#E5E7EB] pb-3">Status</h3>
            <StatusToggle value={status} onChange={setStatus} />
            <p className="text-xs text-[#9CA3AF]">Public rendering uses these sections when the page is published and wired to the section renderer.</p>
          </div>
          <div className="bg-white rounded-lg shadow-card border border-[#E5E7EB] p-6 space-y-4">
            <h3 className="text-sm font-semibold text-[#1F2937] border-b border-[#E5E7EB] pb-3">SEO</h3>
            <Input label="SEO Title" value={seoTitle} onChange={e => setSeoTitle(e.target.value)} />
            <Textarea label="Meta Description" rows={3} value={seoDesc} onChange={e => setSeoDesc(e.target.value)} />
          </div>
        </div>
      </div>
    </div>
  )
}

function str(data: Record<string, unknown>, key: string): string {
  const v = data[key]
  return typeof v === 'string' ? v : ''
}
function strArr(data: Record<string, unknown>, key: string): string[] {
  const v = data[key]
  return Array.isArray(v) ? v.filter((x): x is string => typeof x === 'string') : []
}

function SectionFields({ section, services, brands, onChange }: { section: StaticSection; services: NamedRow[]; brands: NamedRow[]; onChange: (data: Record<string, unknown>) => void }) {
  const d = section.data
  const set = (k: string, v: unknown) => onChange({ ...d, [k]: v })

  switch (section.type) {
    case 'hero':
      return (
        <div className="space-y-3">
          <Input label="Headline" value={str(d, 'headline')} onChange={e => set('headline', e.target.value)} />
          <Input label="Subheadline" value={str(d, 'subheadline')} onChange={e => set('subheadline', e.target.value)} />
          <Input label="CTA Text" value={str(d, 'cta_text')} onChange={e => set('cta_text', e.target.value)} />
          <Input label="CTA Link" value={str(d, 'cta_link')} onChange={e => set('cta_link', e.target.value)} />
          <Input label="Image URL" value={str(d, 'image_url')} onChange={e => set('image_url', e.target.value)} />
        </div>
      )
    case 'text':
      return <Textarea label="Rich Text (HTML)" rows={8} value={str(d, 'html')} onChange={e => set('html', e.target.value)} />
    case 'service_cards':
      return <MultiSelect label="Services to show" options={services} selected={strArr(d, 'service_ids')} onChange={v => set('service_ids', v)} />
    case 'brand_grid':
      return <MultiSelect label="Brands to show" options={brands} selected={strArr(d, 'brand_ids')} onChange={v => set('brand_ids', v)} />
    case 'faq': {
      const faqs = (Array.isArray(d.faqs) ? d.faqs : []) as Array<{ q?: string; a?: string }>
      const items = faqs.map(f => ({ question: f.q ?? '', answer: f.a ?? '' }))
      return <FAQRepeater items={items} onChange={v => set('faqs', v.map(i => ({ q: i.question, a: i.answer })))} />
    }
    case 'cta':
      return (
        <div className="space-y-3">
          <Input label="Headline" value={str(d, 'headline')} onChange={e => set('headline', e.target.value)} />
          <Input label="Button Text" value={str(d, 'button_text')} onChange={e => set('button_text', e.target.value)} />
          <Input label="Button Link" value={str(d, 'button_link')} onChange={e => set('button_link', e.target.value)} />
          <Input label="Background Color (hex)" value={str(d, 'bg_color')} onChange={e => set('bg_color', e.target.value)} />
        </div>
      )
    default:
      return null
  }
}

function MultiSelect({ label, options, selected, onChange }: { label: string; options: NamedRow[]; selected: string[]; onChange: (v: string[]) => void }) {
  function toggle(id: string) {
    onChange(selected.includes(id) ? selected.filter(s => s !== id) : [...selected, id])
  }
  return (
    <div>
      <label className="text-sm font-semibold text-[#1F2937]">{label} ({selected.length})</label>
      <div className="grid grid-cols-2 gap-2 mt-2">
        {options.map(o => (
          <label key={o.id} className="flex items-center gap-2 text-sm text-[#374151]">
            <input type="checkbox" checked={selected.includes(o.id)} onChange={() => toggle(o.id)} />
            {o.name}
          </label>
        ))}
        {options.length === 0 && <span className="text-sm text-[#9CA3AF]">None available.</span>}
      </div>
    </div>
  )
}
