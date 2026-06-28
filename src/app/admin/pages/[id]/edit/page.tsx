'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { Input } from '@/components/ui/Input'
import { Textarea } from '@/components/ui/Textarea'
import { Button } from '@/components/ui/Button'
import { Alert } from '@/components/ui/Alert'
import { StatusToggle } from '@/components/admin/StatusToggle'
import { MediaPicker } from '@/components/admin/MediaPicker'
import { RichTextEditor } from '@/components/admin/RichTextEditor'
import { EditorChrome } from '@/components/admin/EditorChrome'
import { FAQRepeater } from '@/components/admin/FAQRepeater'
import { SEOPanel } from '@/components/admin/SEOPanel'
import { SeoEditorBanner, useActingRole } from '@/components/admin/seo-editor-ui'
import type { SeoJson } from '@/lib/schemas/seo'
import type { ContentStatus, GeneratedPage, PageContent } from '@/types'

interface Related {
  brand: { name: string; slug: string } | null
  model: { name: string; slug: string } | null
  service: { name: string; slug: string; starting_price?: number | null } | null
  location: { name: string; slug: string } | null
}

const AUTOSAVE_MS = 30000

export default function PageEditor() {
  const params = useParams()
  const id = String(params.id)

  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState<GeneratedPage | null>(null)
  const [related, setRelated] = useState<Related | null>(null)
  const [error, setError] = useState('')
  const [savingLabel, setSavingLabel] = useState('')
  const [saving, setSaving] = useState(false)

  // Editable fields
  const [h1, setH1] = useState('')
  const [subheadline, setSubheadline] = useState('')
  const [heroImage, setHeroImage] = useState<string | null>(null)
  const [mainContent, setMainContent] = useState('')
  const [price, setPrice] = useState<string>('')
  const [includes, setIncludes] = useState<string[]>([])
  const [faqs, setFaqs] = useState<Array<{ question: string; answer: string }>>([])
  const [ctaHeadline, setCtaHeadline] = useState('')
  const [ctaButton, setCtaButton] = useState('')
  const [ctaLink, setCtaLink] = useState('')
  const [metaTitle, setMetaTitle] = useState('')
  const [metaDesc, setMetaDesc] = useState('')
  const [canonical, setCanonical] = useState('')
  const [ogImage, setOgImage] = useState<string | null>(null)
  const [status, setStatus] = useState<ContentStatus>('draft')
  const [seoJson, setSeoJson] = useState<SeoJson>({})
  const { isSEOEditor } = useActingRole()

  const dirty = useRef(false)
  const markDirty = () => { dirty.current = true }

  useEffect(() => {
    void (async () => {
      try {
        const res = await fetch(`/api/admin/pages/${id}`)
        if (!res.ok) { setError('Page not found'); return }
        const d = await res.json() as { page: GeneratedPage; related: Related }
        const c = (d.page.content_json ?? {}) as PageContent
        setPage(d.page); setRelated(d.related)
        setH1(c.hero?.h1 ?? d.page.h1 ?? '')
        setSubheadline(c.hero?.subheadline ?? '')
        setHeroImage(c.hero?.image_url ?? null)
        setMainContent(c.main_content ?? '')
        setPrice(c.service_details?.price != null ? String(c.service_details.price) : (d.related.service?.starting_price != null ? String(d.related.service.starting_price) : ''))
        setIncludes(c.service_details?.includes ?? [])
        setFaqs((c.faqs ?? []).map(f => ({ question: f.q, answer: f.a })))
        setCtaHeadline(c.cta?.headline ?? '')
        setCtaButton(c.cta?.button_text ?? 'Book Now')
        setCtaLink(c.cta?.button_link ?? '/contact')
        setMetaTitle(d.page.meta_title ?? '')
        setMetaDesc(d.page.meta_description ?? '')
        setCanonical(`https://carworkshop.ae/brands/${d.page.slug}`)
        setOgImage(d.page.og_image_url ?? null)
        setStatus(d.page.status as ContentStatus)
        setSeoJson((d.page.seo_json ?? {}) as SeoJson)
      } catch { setError('Failed to load page') } finally { setLoading(false) }
    })()
  }, [id])

  const buildContent = useCallback((): PageContent => ({
    hero: { h1, subheadline, image_url: heroImage },
    main_content: mainContent || null,
    service_details: { price: price === '' ? null : Number(price), includes },
    faqs: faqs.filter(f => f.question.trim()).map(f => ({ q: f.question, a: f.answer })),
    cta: { headline: ctaHeadline, button_text: ctaButton, button_link: ctaLink },
  }), [h1, subheadline, heroImage, mainContent, price, includes, faqs, ctaHeadline, ctaButton, ctaLink])

  const save = useCallback(async (nextStatus?: ContentStatus) => {
    setSaving(true); setSavingLabel('Saving…'); setError('')
    try {
      const res = await fetch(`/api/admin/pages/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          h1,
          meta_title: metaTitle || undefined,
          meta_description: metaDesc || undefined,
          og_image_url: ogImage,
          status: nextStatus ?? status,
          content_json: buildContent(),
        }),
      })
      const d = await res.json() as { error?: string; status?: ContentStatus }
      if (!res.ok) { setError(d.error ?? 'Save failed'); setSavingLabel(''); return }
      if (nextStatus) setStatus(nextStatus)
      dirty.current = false
      setSavingLabel(`Saved ${new Date().toLocaleTimeString('en-AE')}`)
    } catch { setError('Network error'); setSavingLabel('') } finally { setSaving(false) }
  }, [id, h1, metaTitle, metaDesc, ogImage, status, buildContent])

  const saveSeo = useCallback(async () => {
    setSavingLabel('Saving SEO…'); setError('')
    try {
      const res = await fetch(`/api/admin/pages/${id}/seo`, {
        method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ seo_json: seoJson }),
      })
      const d = await res.json() as { error?: string }
      if (!res.ok) { setError(d.error ?? 'SEO save failed'); setSavingLabel(''); return }
      setSavingLabel(`SEO saved ${new Date().toLocaleTimeString('en-AE')}`)
    } catch { setError('Network error'); setSavingLabel('') }
  }, [id, seoJson])

  // Auto-save every 30s when there are unsaved changes.
  useEffect(() => {
    const t = setInterval(() => { if (dirty.current) void save() }, AUTOSAVE_MS)
    return () => clearInterval(t)
  }, [save])

  function metaColor(len: number, max: number) {
    const pct = len / max
    if (pct > 1) return 'text-[#DC2626]'
    if (pct > 0.85) return 'text-[#D97706]'
    return 'text-[#059669]'
  }

  if (loading) return <div className="p-8 text-[#9CA3AF]">Loading…</div>
  if (!page) return <div className="p-8"><Alert variant="danger">{error || 'Not found'}</Alert></div>

  // SEO editors get a focused, SEO-only view (no content/status/publish).
  if (isSEOEditor) {
    return (
      <div className="p-6 lg:p-8 max-w-3xl">
        <Link href="/admin/pages" className="text-sm text-[#4472C4] hover:underline">← Pages</Link>
        <h1 className="text-2xl font-bold text-[#1F2937] mt-1 mb-4 max-w-2xl truncate">{page.h1}</h1>
        <SeoEditorBanner />
        {error && <Alert variant="danger" className="mb-4">{error}</Alert>}
        <SEOPanel value={seoJson} onChange={setSeoJson} pageUrl={`https://carworkshop.ae/brands/${page.slug}`} defaultTitle={metaTitle || h1} defaultDescription={metaDesc || subheadline} autoSchemas={['BreadcrumbList', 'Service', 'FAQPage']} />
        <div className="flex justify-end mt-4">
          <Button variant="primary" onClick={() => void saveSeo()}>Save SEO</Button>
        </div>
        {savingLabel && <p className="text-xs text-[#6B7280] text-right mt-2">{savingLabel}</p>}
      </div>
    )
  }

  return (
    <EditorChrome
      breadcrumb={[{ label: 'Pages', href: '/admin/pages' }, { label: h1 || page.h1 }]}
      title={h1 || page.h1}
      onSaveDraft={() => void save()}
      onPublish={() => void save('published')}
      saving={saving}
      sidebar={
        <>
          <Section title="Status">
            <StatusToggle value={status} onChange={s => { setStatus(s); markDirty() }} />
            <p className="text-xs text-[#9CA3AF]">Last updated {new Date(page.updated_at).toLocaleString('en-AE')}</p>
            {savingLabel && <p className="text-xs text-[#6B7280]">{savingLabel}</p>}
            <a href={`/brands/${page.slug}`} target="_blank" rel="noopener noreferrer" className="inline-block text-sm text-[#4472C4] hover:underline">Open Preview ↗</a>
          </Section>

          <Section title="SEO Settings">
            <Input label="Meta Title" value={metaTitle} onChange={e => { setMetaTitle(e.target.value); markDirty() }} />
            <p className={`text-xs -mt-3 ${metaColor(metaTitle.length, 60)}`}>{metaTitle.length}/60 characters</p>
            <Textarea label="Meta Description" value={metaDesc} rows={3} onChange={e => { setMetaDesc(e.target.value); markDirty() }} />
            <p className={`text-xs -mt-3 ${metaColor(metaDesc.length, 160)}`}>{metaDesc.length}/160 characters</p>
            <Input label="Canonical URL" value={canonical} onChange={e => { setCanonical(e.target.value); markDirty() }} />
            <MediaPicker label="OG Image" value={ogImage} onChange={v => { setOgImage(v); markDirty() }} />

            <div className="border border-[#E5E7EB] rounded-md p-3 bg-[#F9FAFB]">
              <p className="text-[#1A0DAB] text-sm truncate">{metaTitle || h1}</p>
              <p className="text-[#006621] text-xs truncate">carworkshop.ae › {page.slug.replace(/\//g, ' › ')}</p>
              <p className="text-[#545454] text-xs line-clamp-2">{metaDesc || subheadline}</p>
            </div>
          </Section>

          <Section title="Advanced SEO (robots, schema, social)">
            <SEOPanel value={seoJson} onChange={v => { setSeoJson(v); markDirty() }} pageUrl={`https://carworkshop.ae/brands/${page.slug}`} defaultTitle={metaTitle || h1} defaultDescription={metaDesc || subheadline} autoSchemas={['BreadcrumbList', 'Service', 'FAQPage']} />
            <Button variant="primary" size="sm" onClick={() => void saveSeo()}>Save SEO</Button>
          </Section>

          <Section title="Page Info">
            <dl className="text-sm space-y-1">
              <InfoRow label="Page Type" value={page.page_type} />
              {related?.brand && <InfoRow label="Brand" value={related.brand.name} />}
              {related?.model && <InfoRow label="Model" value={related.model.name} />}
              {related?.service && <InfoRow label="Service" value={related.service.name} />}
              {related?.location && <InfoRow label="Location" value={related.location.name} />}
              <InfoRow label="URL" value={`/brands/${page.slug}`} mono />
            </dl>
          </Section>

          {related?.brand && (
            <Section title="Internal Links">
              <ul className="text-sm space-y-1">
                {related.model && <li><Link className="text-[#4472C4] hover:underline" href={`/admin/pages?search=${related.brand.slug}/${related.model.slug}`}>Other services for {related.brand.name} {related.model.name}</Link></li>}
                {related.service && <li><Link className="text-[#4472C4] hover:underline" href={`/admin/pages?search=${related.service.slug}`}>Same service, other models</Link></li>}
                <li><Link className="text-[#4472C4] hover:underline" href={`/admin/pages?brand=${page.brand_id ?? ''}`}>All {related.brand.name} pages</Link></li>
              </ul>
            </Section>
          )}
        </>
      }
    >
      <p className="font-mono text-xs text-[#9CA3AF] mb-4">/brands/{page.slug}</p>
      {error && <Alert variant="danger" className="mb-4">{error}</Alert>}

      <div className="space-y-6">
        {/* content */}
        <div className="space-y-6">
          <Section title="Page Identity">
            <Input label="Page H1 Heading" value={h1} placeholder="Audi A4 Oil Change in UAE" onChange={e => { setH1(e.target.value); markDirty() }} required />
            <p className="text-xs text-[#9CA3AF] -mt-3">{h1.length} characters</p>
            <Input label="Hero Subheadline" value={subheadline} placeholder="Free pickup & delivery across UAE" onChange={e => { setSubheadline(e.target.value); markDirty() }} />
            <MediaPicker label="Hero Image" value={heroImage} onChange={v => { setHeroImage(v); markDirty() }} />
          </Section>

          <Section title="Main Content">
            <RichTextEditor value={mainContent} onChange={v => { setMainContent(v); markDirty() }} placeholder="Expert Audi A4 oil change…" minHeight={300} />
            <p className="text-xs text-[#9CA3AF]">Rendered in the page body. Formatting + images supported (sanitized on save).</p>
          </Section>

          <Section title="Service Details">
            <Input label="Starting Price (AED)" type="number" value={price} onChange={e => { setPrice(e.target.value); markDirty() }} />
            <IncludesRepeater items={includes} onChange={v => { setIncludes(v); markDirty() }} />
          </Section>

          <Section title="FAQs">
            <FAQRepeater items={faqs} onChange={v => { setFaqs(v); markDirty() }} />
          </Section>

          <Section title="Call To Action">
            <Input label="CTA Headline" value={ctaHeadline} onChange={e => { setCtaHeadline(e.target.value); markDirty() }} />
            <Input label="CTA Button Text" value={ctaButton} onChange={e => { setCtaButton(e.target.value); markDirty() }} />
            <Input label="CTA Button Link" value={ctaLink} onChange={e => { setCtaLink(e.target.value); markDirty() }} />
          </Section>
        </div>
      </div>
    </EditorChrome>
  )
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-white rounded-lg shadow-card border border-[#E5E7EB] p-6 space-y-4">
      <h3 className="text-sm font-semibold text-[#1F2937] border-b border-[#E5E7EB] pb-3">{title}</h3>
      {children}
    </div>
  )
}

function InfoRow({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <div className="flex justify-between gap-2">
      <dt className="text-[#6B7280]">{label}</dt>
      <dd className={`text-[#1F2937] text-right ${mono ? 'font-mono text-xs' : ''}`}>{value}</dd>
    </div>
  )
}

function IncludesRepeater({ items, onChange }: { items: string[]; onChange: (v: string[]) => void }) {
  return (
    <div>
      <label className="text-sm font-semibold text-[#1F2937]">What&apos;s Included</label>
      <div className="space-y-2 mt-2">
        {items.map((it, i) => (
          <div key={i} className="flex gap-2">
            <input value={it} onChange={e => { const n = [...items]; n[i] = e.target.value; onChange(n) }} className="flex-1 px-3 py-2 rounded-md border border-[#E5E7EB] text-sm" placeholder="Full synthetic oil" />
            <button type="button" onClick={() => onChange(items.filter((_, j) => j !== i))} className="px-3 text-[#DC2626] hover:bg-[#FEE2E2] rounded-md" aria-label="Remove">×</button>
          </div>
        ))}
      </div>
      <button type="button" onClick={() => onChange([...items, ''])} className="mt-2 text-sm text-[#4472C4] hover:underline">+ Add item</button>
    </div>
  )
}
