'use client'

import { useState } from 'react'
import { Globe, Plus, Trash2, ChevronDown } from 'lucide-react'
import { MediaPicker } from '@/components/admin/MediaPicker'
import { AdminInput, AdminTextarea, AdminLabel } from '@/components/admin/ui/AdminField'
import { AdminSectionCard } from '@/components/admin/ui/AdminSectionCard'
import { inputCls } from '@/components/admin/ui/Repeater'
import { ROBOTS_OPTIONS, CHANGE_FREQ_OPTIONS, SCHEMA_TYPES, type SeoJson, type SeoSchemaEntryT } from '@/lib/schemas/seo'

interface SEOPanelProps {
  value: SeoJson
  onChange: (next: SeoJson) => void
  pageUrl?: string            // e.g. https://carworkshop.ae/brands/audi
  defaultTitle?: string
  defaultDescription?: string
  autoSchemas?: string[]      // labels of schemas the page already emits
}

const ROBOTS_LABELS: Record<string, string> = {
  'index,follow': 'Index, Follow (recommended)',
  'index,nofollow': 'Index, NoFollow',
  'noindex,follow': 'NoIndex, Follow',
  'noindex,nofollow': 'NoIndex, NoFollow',
}

function Counter({ len, max }: { len: number; max: number }) {
  const color = len === 0 ? 'text-zinc-400' : len <= max ? (len <= max * 0.66 ? 'text-green-600' : 'text-amber-600') : 'text-red-600'
  return <span className={`text-xs font-medium ${color}`}>{len}/{max}</span>
}

export function SEOPanel({ value, onChange, pageUrl, defaultTitle = '', defaultDescription = '', autoSchemas = [] }: SEOPanelProps) {
  const v = value ?? {}
  const set = <K extends keyof SeoJson>(k: K, val: SeoJson[K]) => onChange({ ...v, [k]: val })
  const title = v.meta_title ?? ''
  const desc = v.meta_description ?? ''
  const robots = v.robots ?? 'index,follow'
  const crumb = (pageUrl ?? 'https://carworkshop.ae').replace(/^https?:\/\//, '').replace(/\//g, ' › ')

  const schemas = v.schemas ?? []
  const setSchemas = (s: SeoSchemaEntryT[]) => set('schemas', s)
  const hreflang = v.hreflang ?? []
  const setHreflang = (h: NonNullable<SeoJson['hreflang']>) => set('hreflang', h)

  return (
    <div className="space-y-4">
      {/* SECTION 1 — Basic SEO */}
      <AdminSectionCard title="Basic SEO">
        <div>
          <div className="flex items-center justify-between mb-1.5"><AdminLabel>Meta Title</AdminLabel><Counter len={title.length} max={60} /></div>
          <input value={title} onChange={e => set('meta_title', e.target.value)} className={inputCls} placeholder={defaultTitle || 'Audi A4 Oil Change in UAE | CarWorkshop.ae'} />
        </div>
        <div>
          <div className="flex items-center justify-between mb-1.5"><AdminLabel>Meta Description</AdminLabel><Counter len={desc.length} max={160} /></div>
          <textarea value={desc} onChange={e => set('meta_description', e.target.value)} rows={3} className={inputCls} placeholder={defaultDescription || 'Expert Audi A4 oil change from AED 149…'} />
        </div>

        {/* Live SERP preview */}
        <div className="rounded-lg border border-zinc-200 bg-white p-3">
          <p className="text-xs text-[#006621] truncate flex items-center gap-1"><Globe size={12} /> {crumb}</p>
          <p className="text-[#1A0DAB] text-base font-medium truncate mt-0.5">{title || defaultTitle || 'Page title preview'}</p>
          <p className="text-sm text-[#4D5156] line-clamp-2 mt-0.5">{desc || defaultDescription || 'Meta description preview shows here as you type.'}</p>
        </div>

        <AdminInput label="Canonical URL" value={v.canonical ?? ''} placeholder={pageUrl} hint="Leave blank to use page URL automatically" onChange={e => set('canonical', e.target.value)} />

        <div>
          <AdminLabel>Robots / Indexing</AdminLabel>
          <div className="space-y-1.5 mt-1">
            {ROBOTS_OPTIONS.map(opt => (
              <label key={opt} className="flex items-center gap-2 text-sm text-zinc-700 cursor-pointer">
                <input type="radio" name="robots" checked={robots === opt} onChange={() => set('robots', opt)} className="text-[#4472C4]" />
                {ROBOTS_LABELS[opt]}
              </label>
            ))}
          </div>
          {robots.includes('noindex') && <p className="text-xs text-amber-600 mt-1">⚠️ This page will NOT appear in Google search results.</p>}
        </div>
      </AdminSectionCard>

      {/* SECTION 2 — Open Graph */}
      <AdminSectionCard title="Open Graph / Social" defaultOpen={false}>
        <AdminInput label="OG Title" value={v.og_title ?? ''} placeholder="Defaults to meta title" onChange={e => set('og_title', e.target.value)} />
        <AdminTextarea label="OG Description" value={v.og_description ?? ''} placeholder="Defaults to meta description" rows={2} onChange={e => set('og_description', e.target.value)} />
        <MediaPicker label="OG Image (1200×630px recommended)" value={v.og_image ?? null} onChange={url => set('og_image', url)} />
        {/* Social preview */}
        <div className="rounded-lg border border-zinc-200 overflow-hidden bg-white">
          {v.og_image
            // eslint-disable-next-line @next/next/no-img-element -- arbitrary OG URLs (preview only)
            ? <img src={v.og_image} alt="" className="w-full h-40 object-cover bg-zinc-100" />
            : <div className="w-full h-40 bg-zinc-100 flex items-center justify-center text-xs text-zinc-400">OG image preview</div>}
          <div className="p-3">
            <p className="text-[11px] uppercase text-zinc-400">carworkshop.ae</p>
            <p className="text-sm font-semibold text-zinc-800 truncate">{v.og_title || title || defaultTitle || 'Title'}</p>
            <p className="text-xs text-zinc-500 line-clamp-2">{v.og_description || desc || defaultDescription || 'Description'}</p>
          </div>
        </div>
      </AdminSectionCard>

      {/* SECTION 3 — JSON-LD Schema */}
      <AdminSectionCard title="Structured Data / Schema" defaultOpen={false}>
        {autoSchemas.length > 0 && (
          <div className="text-xs text-zinc-500">
            <p className="font-medium text-zinc-600 mb-1">Auto-generated on this page:</p>
            <ul className="space-y-0.5">{autoSchemas.map(s => <li key={s}>✅ {s}</li>)}</ul>
          </div>
        )}
        <div className="space-y-3">
          {schemas.map((entry, i) => (
            <SchemaBlock key={i} entry={entry} onChange={e => setSchemas(schemas.map((x, j) => j === i ? e : x))} onRemove={() => setSchemas(schemas.filter((_, j) => j !== i))} />
          ))}
          <button type="button" onClick={() => setSchemas([...schemas, { type: 'FAQPage', auto: true }])} className="inline-flex items-center gap-1 text-sm text-[#4472C4] hover:underline"><Plus size={14} /> Add Schema</button>
        </div>
      </AdminSectionCard>

      {/* SECTION 4 — Advanced */}
      <AdminSectionCard title="Advanced" defaultOpen={false}>
        <AdminInput label="Focus Keyword" value={v.focus_keyword ?? ''} hint="Main keyword this page targets" onChange={e => set('focus_keyword', e.target.value)} />

        <div>
          <AdminLabel>Alternate Languages (hreflang)</AdminLabel>
          <div className="space-y-2 mt-1">
            {hreflang.map((h, i) => (
              <div key={i} className="flex items-center gap-2">
                <input value={h.lang} onChange={e => setHreflang(hreflang.map((x, j) => j === i ? { ...x, lang: e.target.value } : x))} className={`${inputCls} w-24`} placeholder="en-AE" />
                <input value={h.url} onChange={e => setHreflang(hreflang.map((x, j) => j === i ? { ...x, url: e.target.value } : x))} className={`${inputCls} flex-1`} placeholder="https://…" />
                <button type="button" onClick={() => setHreflang(hreflang.filter((_, j) => j !== i))} className="text-zinc-400 hover:text-red-500" aria-label="Remove"><Trash2 size={14} /></button>
              </div>
            ))}
            <button type="button" onClick={() => setHreflang([...hreflang, { lang: '', url: '' }])} className="inline-flex items-center gap-1 text-sm text-[#4472C4] hover:underline"><Plus size={14} /> Add Language</button>
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between"><AdminLabel>Sitemap Priority</AdminLabel><span className="text-sm font-medium text-zinc-700">{(v.sitemap_priority ?? 0.7).toFixed(1)}</span></div>
          <input type="range" min={0.1} max={1} step={0.1} value={v.sitemap_priority ?? 0.7} onChange={e => set('sitemap_priority', Number(e.target.value))} className="w-full accent-[#4472C4]" />
        </div>

        <div>
          <AdminLabel>Change Frequency</AdminLabel>
          <select value={v.change_freq ?? 'weekly'} onChange={e => set('change_freq', e.target.value as SeoJson['change_freq'])} className={inputCls}>
            {CHANGE_FREQ_OPTIONS.map(o => <option key={o} value={o}>{o}</option>)}
          </select>
        </div>
      </AdminSectionCard>
    </div>
  )
}

function SchemaBlock({ entry, onChange, onRemove }: { entry: SeoSchemaEntryT; onChange: (e: SeoSchemaEntryT) => void; onRemove: () => void }) {
  const [open, setOpen] = useState(true)
  const setData = (k: string, val: string) => onChange({ ...entry, data: { ...(entry.data ?? {}), [k]: val } })
  const d = (entry.data ?? {}) as Record<string, string>

  return (
    <div className="rounded-lg border border-zinc-200 bg-zinc-50/50">
      <div className="flex items-center gap-2 px-3 py-2">
        <button type="button" onClick={() => setOpen(o => !o)} className="text-zinc-400"><ChevronDown size={15} className={open ? '' : '-rotate-90'} /></button>
        <select value={entry.type} onChange={e => onChange({ type: e.target.value as SeoSchemaEntryT['type'], auto: e.target.value === 'FAQPage' ? true : undefined })} className={`${inputCls} flex-1 py-1`}>
          {SCHEMA_TYPES.map(t => <option key={t} value={t}>{t === 'custom' ? 'Custom JSON' : t}</option>)}
        </select>
        <button type="button" onClick={onRemove} className="text-zinc-400 hover:text-red-500" aria-label="Remove schema"><Trash2 size={14} /></button>
      </div>
      {open && (
        <div className="px-3 pb-3 space-y-2">
          {entry.type === 'FAQPage' && (
            <label className="flex items-center gap-2 text-sm text-zinc-700">
              <input type="checkbox" checked={entry.auto ?? false} onChange={e => onChange({ ...entry, auto: e.target.checked })} className="text-[#4472C4]" />
              Auto-generate from this page&apos;s FAQs
            </label>
          )}
          {entry.type === 'LocalBusiness' && (
            <div className="grid grid-cols-2 gap-2">
              {[['name', 'Name'], ['telephone', 'Phone'], ['address', 'Address'], ['priceRange', 'Price Range (AED $$)'], ['openingHours', 'Opens (08:00-21:00)'], ['url', 'URL']].map(([k, label]) => (
                <input key={k} value={d[k] ?? ''} onChange={e => setData(k, e.target.value)} className={`${inputCls} py-1.5`} placeholder={label} />
              ))}
            </div>
          )}
          {entry.type === 'Service' && (
            <div className="grid grid-cols-2 gap-2">
              {[['name', 'Service name'], ['description', 'Description'], ['price', 'Price (149)'], ['provider', 'Provider']].map(([k, label]) => (
                <input key={k} value={d[k] ?? ''} onChange={e => setData(k, e.target.value)} className={`${inputCls} py-1.5`} placeholder={label} />
              ))}
            </div>
          )}
          {entry.type === 'HowTo' && (
            <div className="space-y-2">
              <input value={d.name ?? ''} onChange={e => setData('name', e.target.value)} className={`${inputCls} py-1.5`} placeholder="How-to name" />
              <textarea value={d.steps ?? ''} onChange={e => setData('steps', e.target.value)} rows={3} className={`${inputCls}`} placeholder="One step per line: Name | Description" />
            </div>
          )}
          {entry.type === 'custom' && (
            <CustomJson value={entry.json ?? ''} onChange={json => onChange({ ...entry, json })} />
          )}
          {!['FAQPage', 'LocalBusiness', 'Service', 'HowTo', 'custom'].includes(entry.type) && (
            <CustomJson value={entry.json ?? ''} onChange={json => onChange({ ...entry, json })} hint={`Paste a full ${entry.type} JSON-LD object.`} />
          )}
        </div>
      )}
    </div>
  )
}

function CustomJson({ value, onChange, hint }: { value: string; onChange: (v: string) => void; hint?: string }) {
  const [err, setErr] = useState('')
  return (
    <div>
      <textarea
        value={value}
        onChange={e => onChange(e.target.value)}
        onBlur={() => { if (value.trim()) { try { JSON.parse(value); setErr('') } catch { setErr('Invalid JSON') } } else setErr('') }}
        rows={5} className={`${inputCls} font-mono text-xs`} placeholder='{"@context":"https://schema.org","@type":"Product",...}'
      />
      {hint && !err && <p className="text-xs text-zinc-400 mt-1">{hint}</p>}
      {err && <p className="text-xs text-red-600 mt-1">{err}</p>}
    </div>
  )
}
