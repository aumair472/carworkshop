'use client'

import { useState } from 'react'
import { Input } from '@/components/ui/Input'
import { MediaPicker } from '@/components/admin/MediaPicker'
import { FAQRepeater } from '@/components/admin/FAQRepeater'
import { RichTextEditor } from '@/components/admin/RichTextEditor'
import type { PageContent } from '@/types'

interface PageContentEditorProps {
  value: PageContent
  onChange: (next: PageContent) => void
  // When true, render expanded with no collapse header (for use inside a card).
  forceOpen?: boolean
}

// Reusable section-card editor for the content_json overlay on hub pages
// (brands, services, locations). Edits hero, body, FAQs and CTA. Empty fields
// fall back to auto-generated values on the public page.
export function PageContentEditor({ value, onChange, forceOpen = false }: PageContentEditorProps) {
  const [openState, setOpen] = useState(false)
  const open = forceOpen || openState

  const hero = value.hero ?? {}
  const cta = value.cta ?? {}
  const wcu = value.why_choose_us ?? {}
  const wcuItems = wcu.items ?? []
  const faqs = (value.faqs ?? []).map(f => ({ question: f.q, answer: f.a }))

  const patch = (p: Partial<PageContent>) => onChange({ ...value, ...p })
  const setWcuItems = (items: NonNullable<PageContent['why_choose_us']>['items']) => patch({ why_choose_us: { ...wcu, items } })

  const body = (
    <div className="space-y-6">
      <p className="text-xs text-[#9CA3AF]">Anything left blank uses the auto-generated default on the public page.</p>

      <Section title="Hero">
        <Input label="H1 Heading" value={hero.h1 ?? ''} placeholder="Audi Service & Repair in UAE" onChange={e => patch({ hero: { ...hero, h1: e.target.value } })} />
        <Input label="Subheadline" value={hero.subheadline ?? ''} placeholder="Free pickup & delivery. 12-month warranty." onChange={e => patch({ hero: { ...hero, subheadline: e.target.value } })} />
        <MediaPicker label="Hero Image" value={hero.image_url ?? null} onChange={v => patch({ hero: { ...hero, image_url: v } })} />
      </Section>

      <Section title="Main Content">
        <RichTextEditor value={value.main_content ?? ''} onChange={v => patch({ main_content: v })} placeholder="Write the page body…" />
      </Section>

      <Section title="Why Choose Us">
        <Input label="Section Heading" value={wcu.heading ?? ''} placeholder="Why Choose CarWorkshop.ae?" onChange={e => patch({ why_choose_us: { ...wcu, heading: e.target.value } })} />
        <div className="space-y-2">
          {wcuItems.map((it, i) => (
            <div key={i} className="flex items-start gap-2">
              <input value={it.icon ?? ''} placeholder="✅" onChange={e => setWcuItems(wcuItems.map((x, j) => j === i ? { ...x, icon: e.target.value } : x))} className="w-12 border border-[#E5E7EB] rounded-md px-2 py-2 text-sm text-center" />
              <div className="flex-1 space-y-2">
                <input value={it.title ?? ''} placeholder="Title" onChange={e => setWcuItems(wcuItems.map((x, j) => j === i ? { ...x, title: e.target.value } : x))} className="w-full border border-[#E5E7EB] rounded-md px-3 py-2 text-sm" />
                <input value={it.description ?? ''} placeholder="Description" onChange={e => setWcuItems(wcuItems.map((x, j) => j === i ? { ...x, description: e.target.value } : x))} className="w-full border border-[#E5E7EB] rounded-md px-3 py-2 text-sm" />
              </div>
              <button type="button" onClick={() => setWcuItems(wcuItems.filter((_, j) => j !== i))} className="h-9 w-9 shrink-0 rounded-md text-[#9CA3AF] hover:bg-red-50 hover:text-red-500" aria-label="Remove">×</button>
            </div>
          ))}
          {wcuItems.length < 12 && (
            <button type="button" onClick={() => setWcuItems([...wcuItems, { icon: '✅', title: '', description: '' }])} className="w-full text-sm text-[#6B7280] border border-dashed border-[#E5E7EB] rounded-lg py-2 hover:border-[#4472C4] hover:text-[#4472C4]">+ Add reason</button>
          )}
        </div>
      </Section>

      <Section title="FAQs">
        <FAQRepeater items={faqs} onChange={v => patch({ faqs: v.map(f => ({ q: f.question, a: f.answer })) })} />
      </Section>

      <Section title="CTA Banner">
        <Input label="Headline" value={cta.headline ?? ''} onChange={e => patch({ cta: { ...cta, headline: e.target.value } })} />
        <Input label="Button Text" value={cta.button_text ?? ''} placeholder="Book Now" onChange={e => patch({ cta: { ...cta, button_text: e.target.value } })} />
        <Input label="Button Link" value={cta.button_link ?? ''} placeholder="/contact" onChange={e => patch({ cta: { ...cta, button_link: e.target.value } })} />
      </Section>
    </div>
  )

  if (forceOpen) return body

  return (
    <div className="bg-white rounded-lg shadow-card border border-[#E5E7EB]">
      <button
        type="button"
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center justify-between px-6 py-4 text-left"
        aria-expanded={open}
      >
        <span className="text-sm font-semibold text-[#1F2937]">Public Page Content (overlay)</span>
        <svg className={['w-4 h-4 text-[#6B7280] transition-transform', open ? 'rotate-180' : ''].join(' ')} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
      </button>
      {open && <div className="px-6 pb-6 border-t border-[#E5E7EB] pt-5">{body}</div>}
    </div>
  )
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="space-y-3">
      <h4 className="text-xs font-semibold uppercase tracking-wide text-[#6B7280]">{title}</h4>
      {children}
    </div>
  )
}
