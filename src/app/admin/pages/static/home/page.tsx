'use client'

import { useState, useEffect, useCallback } from 'react'
import toast from 'react-hot-toast'
import { MediaPicker } from '@/components/admin/MediaPicker'
import { FAQRepeater } from '@/components/admin/FAQRepeater'
import { RichTextEditor } from '@/components/admin/RichTextEditor'
import { AdminInput, AdminTextarea, AdminLabel } from '@/components/admin/ui/AdminField'
import { AdminButton } from '@/components/admin/ui/AdminButton'
import { AdminSectionCard } from '@/components/admin/ui/AdminSectionCard'
import { Repeater, MultiSelect, inputCls } from '@/components/admin/ui/Repeater'
import { EditorChrome, StatusCard, SeoCard, InfoCard } from '@/components/admin/EditorChrome'
import { EntitySeoTab } from '@/components/admin/EntitySeoTab'
import { EditorSkeleton } from '@/app/admin/brands/[id]/page'
import type { SeoJson } from '@/lib/schemas/seo'

type Status = 'draft' | 'published' | 'archived'
interface NamedRow { id: string; name: string }
interface FAQ { q: string; a: string }
interface Stat { icon: string; value: string; label: string }
interface Step { icon: string; title: string; description: string }
interface USP { icon: string; text: string }
interface Review { name: string; rating: number; service: string; text: string }

interface HomeContent {
  hero: { h1: string; subheadline: string; cta_primary_text: string; cta_primary_link: string; cta_secondary_text: string; cta_secondary_link: string; image_url: string | null }
  trust_bar: { visible: boolean; stats: Stat[] }
  services: { visible: boolean; heading: string; service_ids: string[] }
  brands: { visible: boolean; heading: string; brand_ids: string[] }
  how_it_works: { visible: boolean; heading: string; steps: Step[] }
  why_choose_us: { visible: boolean; heading: string; items: USP[] }
  reviews: { visible: boolean; heading: string; reviews: Review[] }
  blog_preview: { visible: boolean; heading: string; count: number }
  locations: { visible: boolean; heading: string; location_ids: string[] }
  faq: { visible: boolean; heading: string; faqs: FAQ[] }
  cta_banner: { visible: boolean; headline: string; subheadline: string; button_text: string; button_link: string; bg_color: string }
}

const DEFAULTS: HomeContent = {
  hero: { h1: 'Car Service & Repair in UAE', subheadline: 'Free pickup & delivery. 12-month warranty.', cta_primary_text: 'Book Now', cta_primary_link: '/contact', cta_secondary_text: 'Get a Quote', cta_secondary_link: '/contact', image_url: null },
  trust_bar: { visible: true, stats: [
    { icon: '⭐', value: '4.9/5', label: 'Average Rating' },
    { icon: '🚗', value: '10,000+', label: 'Cars Serviced' },
    { icon: '🔧', value: 'Certified', label: 'Technicians' },
    { icon: '📦', value: 'Free', label: 'Pickup & Delivery' },
  ] },
  services: { visible: true, heading: 'Our Most Popular Services', service_ids: [] },
  brands: { visible: true, heading: 'Trusted Car Brands We Service', brand_ids: [] },
  how_it_works: { visible: true, heading: 'Car Maintenance, Made Easy', steps: [
    { icon: '🔍', title: 'Book Online', description: 'Choose your service and car details.' },
    { icon: '🚗', title: 'We Collect', description: 'Free pickup from your home or office.' },
    { icon: '🔧', title: 'Expert Repair', description: 'Certified technicians at vetted workshops.' },
    { icon: '✅', title: 'Delivered Back', description: 'Your car returned same/next day.' },
  ] },
  why_choose_us: { visible: true, heading: 'Why Choose CarWorkshop.ae?', items: [
    { icon: '✅', text: 'Save up to 30% vs dealerships' },
    { icon: '✅', text: '12-month warranty on all work' },
    { icon: '✅', text: 'Free collection & delivery' },
  ] },
  reviews: { visible: true, heading: 'What Our Customers Say', reviews: [] },
  blog_preview: { visible: true, heading: 'Latest from Our Blog', count: 3 },
  locations: { visible: true, heading: 'Areas We Serve in UAE', location_ids: [] },
  faq: { visible: true, heading: 'Common Questions', faqs: [] },
  cta_banner: { visible: true, headline: 'Book Your Car Service Today', subheadline: 'Free pickup & delivery across UAE', button_text: 'Book Now', button_link: '/contact', bg_color: '#4472C4' },
}

function merge(saved: Partial<HomeContent> | null): HomeContent {
  const c = saved ?? {}
  return {
    hero: { ...DEFAULTS.hero, ...c.hero },
    trust_bar: { ...DEFAULTS.trust_bar, ...c.trust_bar },
    services: { ...DEFAULTS.services, ...c.services },
    brands: { ...DEFAULTS.brands, ...c.brands },
    how_it_works: { ...DEFAULTS.how_it_works, ...c.how_it_works },
    why_choose_us: { ...DEFAULTS.why_choose_us, ...c.why_choose_us },
    reviews: { ...DEFAULTS.reviews, ...c.reviews },
    blog_preview: { ...DEFAULTS.blog_preview, ...c.blog_preview },
    locations: { ...DEFAULTS.locations, ...c.locations },
    faq: { ...DEFAULTS.faq, ...c.faq },
    cta_banner: { ...DEFAULTS.cta_banner, ...c.cta_banner },
  }
}

export default function HomeEditor() {
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [savedLabel, setSavedLabel] = useState('')
  const [c, setC] = useState<HomeContent>(DEFAULTS)
  const [status, setStatus] = useState<Status>('draft')
  const [seoTitle, setSeoTitle] = useState('')
  const [seoDesc, setSeoDesc] = useState('')
  const [seoJson, setSeoJson] = useState<SeoJson>({})
  const [subTitle, setSubTitle] = useState('')
  const [metaKeyword, setMetaKeyword] = useState('')
  const [h3Text, setH3Text] = useState('')
  const [shortDescription, setShortDescription] = useState('')
  const [services, setServices] = useState<NamedRow[]>([])
  const [brands, setBrands] = useState<NamedRow[]>([])
  const [locations, setLocations] = useState<NamedRow[]>([])

  useEffect(() => {
    let cancelled = false
    void (async () => {
      try {
        const [pageRes, svc, br, loc] = await Promise.all([
          fetch('/api/admin/pages/static/home'), fetch('/api/admin/services'), fetch('/api/admin/brands'), fetch('/api/admin/locations'),
        ])
        if (cancelled) return
        if (pageRes.ok) {
          const d = await pageRes.json() as { page: {
            content_json: Partial<HomeContent> | null; status: Status; seo_title: string | null; seo_description: string | null; seo_json?: SeoJson | null
            sub_title?: string | null; meta_keyword?: string | null; h3_text?: string | null; short_description?: string | null
          } }
          setC(merge(d.page.content_json)); setStatus(d.page.status); setSeoTitle(d.page.seo_title ?? ''); setSeoDesc(d.page.seo_description ?? ''); setSeoJson(d.page.seo_json ?? {})
          setSubTitle(d.page.sub_title ?? ''); setMetaKeyword(d.page.meta_keyword ?? ''); setH3Text(d.page.h3_text ?? ''); setShortDescription(d.page.short_description ?? '')
        }
        if (svc.ok) { const d = await svc.json() as { services: NamedRow[] }; setServices(d.services ?? []) }
        if (br.ok) { const d = await br.json() as { brands: NamedRow[] }; setBrands(d.brands ?? []) }
        if (loc.ok) { const d = await loc.json() as { locations: NamedRow[] }; setLocations(d.locations ?? []) }
      } catch { /* ignore */ } finally { if (!cancelled) setLoading(false) }
    })()
    return () => { cancelled = true }
  }, [])

  const save = useCallback(async (nextStatus?: Status) => {
    setSaving(true)
    const t = toast.loading('Saving…')
    try {
      const res = await fetch('/api/admin/pages/static/home', {
        method: 'PUT', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: 'Home', content_json: c, seo_title: seoTitle || null, seo_description: seoDesc || null,
          sub_title: subTitle || null, meta_keyword: metaKeyword || null, h3_text: h3Text || null, short_description: shortDescription || null,
          status: nextStatus ?? status,
        }),
      })
      const d = await res.json() as { error?: string }
      if (!res.ok) { toast.error(d.error ?? 'Save failed', { id: t }); return }
      if (nextStatus) setStatus(nextStatus)
      setSavedLabel(`Saved ${new Date().toLocaleTimeString('en-AE')}`)
      toast.success(nextStatus === 'published' ? 'Home page published!' : 'Home page saved', { id: t })
    } catch { toast.error('Network error', { id: t }) } finally { setSaving(false) }
  }, [c, seoTitle, seoDesc, subTitle, metaKeyword, h3Text, shortDescription, status])

  if (loading) return <EditorSkeleton />

  // Section patch helpers (typed).
  function patch<K extends keyof HomeContent>(key: K, value: Partial<HomeContent[K]>) {
    setC(prev => ({ ...prev, [key]: { ...prev[key], ...value } }))
  }

  return (
    <EditorChrome
      breadcrumb={[{ label: 'Pages', href: '/admin/pages' }, { label: 'Home' }]}
      title="Home Page"
      onSaveDraft={() => void save('draft')}
      onPublish={() => void save('published')}
      saving={saving}
      sidebar={
        <>
          <StatusCard status={status} onChange={setStatus} viewHref="/" savedLabel={savedLabel} />
          <SeoCard slug="" title={seoTitle} description={seoDesc} onTitle={setSeoTitle} onDescription={setSeoDesc} />
          <AdminSectionCard title="More SEO">
            <AdminInput label="Sub Title" value={subTitle} onChange={e => setSubTitle(e.target.value)} placeholder="Page subtitle shown below H1" />
            <AdminInput label="Meta Keyword" value={metaKeyword} onChange={e => setMetaKeyword(e.target.value)} placeholder="keyword1, keyword2, keyword3" />
            <AdminTextarea label="H3 Text" rows={2} value={h3Text} onChange={e => setH3Text(e.target.value)} placeholder="Secondary heading shown on the page" />
            <div><AdminLabel>Short Description</AdminLabel><RichTextEditor value={shortDescription} onChange={setShortDescription} minHeight={140} /></div>
          </AdminSectionCard>
          <InfoCard rows={[{ k: 'Type', v: 'Static — Home' }, { k: 'URL', v: '/', mono: true }]} />
        </>
      }
    >
      <div className="space-y-4">
        {/* 1 Hero */}
        <AdminSectionCard title="Hero">
          <AdminInput label="H1 Heading" required maxCount={60} value={c.hero.h1} onChange={e => patch('hero', { h1: e.target.value })} />
          <AdminInput label="Subheadline" value={c.hero.subheadline} onChange={e => patch('hero', { subheadline: e.target.value })} />
          <div className="grid grid-cols-2 gap-3">
            <AdminInput label="CTA Primary Text" value={c.hero.cta_primary_text} onChange={e => patch('hero', { cta_primary_text: e.target.value })} />
            <AdminInput label="CTA Primary Link" value={c.hero.cta_primary_link} onChange={e => patch('hero', { cta_primary_link: e.target.value })} />
            <AdminInput label="CTA Secondary Text" value={c.hero.cta_secondary_text} onChange={e => patch('hero', { cta_secondary_text: e.target.value })} />
            <AdminInput label="CTA Secondary Link" value={c.hero.cta_secondary_link} onChange={e => patch('hero', { cta_secondary_link: e.target.value })} />
          </div>
          <MediaPicker label="Background Image" value={c.hero.image_url} onChange={v => patch('hero', { image_url: v })} />
        </AdminSectionCard>

        {/* 2 Trust Bar */}
        <AdminSectionCard title="Trust Bar" visible={c.trust_bar.visible} onVisibleChange={v => patch('trust_bar', { visible: v })}>
          <Repeater<Stat>
            items={c.trust_bar.stats} max={4} addLabel="+ Add stat" onChange={stats => patch('trust_bar', { stats })}
            blank={{ icon: '⭐', value: '', label: '' }}
            render={(it, upd) => (
              <div className="grid grid-cols-[3rem_1fr_1fr] gap-2 flex-1">
                <input value={it.icon} onChange={e => upd({ icon: e.target.value })} className={inputCls} placeholder="⭐" />
                <input value={it.value} onChange={e => upd({ value: e.target.value })} className={inputCls} placeholder="4.9/5" />
                <input value={it.label} onChange={e => upd({ label: e.target.value })} className={inputCls} placeholder="Average Rating" />
              </div>
            )}
          />
        </AdminSectionCard>

        {/* 3 Services */}
        <AdminSectionCard title="Popular Services" visible={c.services.visible} onVisibleChange={v => patch('services', { visible: v })}>
          <AdminInput label="Section Heading" value={c.services.heading} onChange={e => patch('services', { heading: e.target.value })} />
          <MultiSelect label="Services to show" options={services} selected={c.services.service_ids} onChange={ids => patch('services', { service_ids: ids })} />
        </AdminSectionCard>

        {/* 4 Brands */}
        <AdminSectionCard title="Top Brands" visible={c.brands.visible} onVisibleChange={v => patch('brands', { visible: v })}>
          <AdminInput label="Section Heading" value={c.brands.heading} onChange={e => patch('brands', { heading: e.target.value })} />
          <MultiSelect label="Brands to show" options={brands} selected={c.brands.brand_ids} onChange={ids => patch('brands', { brand_ids: ids })} />
        </AdminSectionCard>

        {/* 5 How It Works */}
        <AdminSectionCard title="How It Works" visible={c.how_it_works.visible} onVisibleChange={v => patch('how_it_works', { visible: v })}>
          <AdminInput label="Section Heading" value={c.how_it_works.heading} onChange={e => patch('how_it_works', { heading: e.target.value })} />
          {c.how_it_works.steps.map((step, i) => (
            <div key={i} className="grid grid-cols-[3rem_1fr] gap-2 items-start">
              <input value={step.icon} onChange={e => patch('how_it_works', { steps: c.how_it_works.steps.map((s, j) => j === i ? { ...s, icon: e.target.value } : s) })} className={inputCls} placeholder="🔍" />
              <div className="space-y-2">
                <input value={step.title} onChange={e => patch('how_it_works', { steps: c.how_it_works.steps.map((s, j) => j === i ? { ...s, title: e.target.value } : s) })} className={inputCls} placeholder="Step title" />
                <input value={step.description} onChange={e => patch('how_it_works', { steps: c.how_it_works.steps.map((s, j) => j === i ? { ...s, description: e.target.value } : s) })} className={inputCls} placeholder="Step description" />
              </div>
            </div>
          ))}
        </AdminSectionCard>

        {/* 6 Why Choose Us */}
        <AdminSectionCard title="Why Choose Us" visible={c.why_choose_us.visible} onVisibleChange={v => patch('why_choose_us', { visible: v })}>
          <AdminInput label="Section Heading" value={c.why_choose_us.heading} onChange={e => patch('why_choose_us', { heading: e.target.value })} />
          <Repeater<USP>
            items={c.why_choose_us.items} max={6} addLabel="+ Add USP" onChange={items => patch('why_choose_us', { items })}
            blank={{ icon: '✅', text: '' }}
            render={(it, upd) => (
              <div className="grid grid-cols-[3rem_1fr] gap-2 flex-1">
                <input value={it.icon} onChange={e => upd({ icon: e.target.value })} className={inputCls} />
                <input value={it.text} onChange={e => upd({ text: e.target.value })} className={inputCls} placeholder="Benefit text" />
              </div>
            )}
          />
        </AdminSectionCard>

        {/* 7 Reviews */}
        <AdminSectionCard title="Customer Reviews" visible={c.reviews.visible} onVisibleChange={v => patch('reviews', { visible: v })}>
          <AdminInput label="Section Heading" value={c.reviews.heading} onChange={e => patch('reviews', { heading: e.target.value })} />
          <Repeater<Review>
            items={c.reviews.reviews} max={20} addLabel="+ Add Review" onChange={reviews => patch('reviews', { reviews })}
            blank={{ name: '', rating: 5, service: '', text: '' }}
            render={(it, upd) => (
              <div className="space-y-2 flex-1">
                <div className="grid grid-cols-3 gap-2">
                  <input value={it.name} onChange={e => upd({ name: e.target.value })} className={inputCls} placeholder="Customer name" />
                  <select value={it.rating} onChange={e => upd({ rating: Number(e.target.value) })} className={inputCls}>
                    {[5, 4, 3, 2, 1].map(r => <option key={r} value={r}>{'⭐'.repeat(r)} {r}/5</option>)}
                  </select>
                  <input value={it.service} onChange={e => upd({ service: e.target.value })} className={inputCls} placeholder="Service used" />
                </div>
                <textarea value={it.text} onChange={e => upd({ text: e.target.value })} rows={2} className={inputCls} placeholder="Review text" />
              </div>
            )}
          />
        </AdminSectionCard>

        {/* 8 Blog Preview */}
        <AdminSectionCard title="Blog Preview" visible={c.blog_preview.visible} onVisibleChange={v => patch('blog_preview', { visible: v })}>
          <AdminInput label="Section Heading" value={c.blog_preview.heading} onChange={e => patch('blog_preview', { heading: e.target.value })} />
          <div>
            <AdminLabel>Latest posts to show</AdminLabel>
            <select value={c.blog_preview.count} onChange={e => patch('blog_preview', { count: Number(e.target.value) })} className={inputCls + ' w-32'}>
              {[2, 3, 4, 6].map(n => <option key={n} value={n}>{n} posts</option>)}
            </select>
            <p className="text-xs text-zinc-400 mt-1">Auto-pulls latest published blog posts.</p>
          </div>
        </AdminSectionCard>

        {/* 9 Locations */}
        <AdminSectionCard title="Locations" visible={c.locations.visible} onVisibleChange={v => patch('locations', { visible: v })}>
          <AdminInput label="Section Heading" value={c.locations.heading} onChange={e => patch('locations', { heading: e.target.value })} />
          <MultiSelect label="Locations to show" options={locations} selected={c.locations.location_ids} onChange={ids => patch('locations', { location_ids: ids })} />
        </AdminSectionCard>

        {/* 10 FAQ */}
        <AdminSectionCard title="FAQ" visible={c.faq.visible} onVisibleChange={v => patch('faq', { visible: v })}>
          <AdminInput label="Section Heading" value={c.faq.heading} onChange={e => patch('faq', { heading: e.target.value })} />
          <FAQRepeater items={c.faq.faqs.map(f => ({ question: f.q, answer: f.a }))} onChange={v => patch('faq', { faqs: v.map(i => ({ q: i.question, a: i.answer })) })} />
        </AdminSectionCard>

        {/* 11 CTA Banner */}
        <AdminSectionCard title="CTA Banner" visible={c.cta_banner.visible} onVisibleChange={v => patch('cta_banner', { visible: v })}>
          <AdminInput label="Headline" value={c.cta_banner.headline} onChange={e => patch('cta_banner', { headline: e.target.value })} />
          <AdminInput label="Subheadline" value={c.cta_banner.subheadline} onChange={e => patch('cta_banner', { subheadline: e.target.value })} />
          <div className="grid grid-cols-2 gap-3">
            <AdminInput label="Button Text" value={c.cta_banner.button_text} onChange={e => patch('cta_banner', { button_text: e.target.value })} />
            <AdminInput label="Button Link" value={c.cta_banner.button_link} onChange={e => patch('cta_banner', { button_link: e.target.value })} />
          </div>
          <div>
            <AdminLabel>Background Color</AdminLabel>
            <div className="flex items-center gap-2">
              <input type="color" value={c.cta_banner.bg_color} onChange={e => patch('cta_banner', { bg_color: e.target.value })} className="h-9 w-12 rounded border border-zinc-300" />
              <input value={c.cta_banner.bg_color} onChange={e => patch('cta_banner', { bg_color: e.target.value })} className={inputCls + ' w-32'} />
            </div>
          </div>
        </AdminSectionCard>

        <AdminSectionCard title="SEO (Advanced)" defaultOpen={false}>
          <EntitySeoTab endpoint="/api/admin/pages/static/home/seo" initial={seoJson}
            pageUrl="https://carworkshop.ae" defaultTitle={c.hero.h1} defaultDescription={c.hero.subheadline}
            autoSchemas={['Organization', 'WebSite', 'LocalBusiness']} />
        </AdminSectionCard>

        <div className="flex justify-end gap-2 pt-2">
          <AdminButton variant="outline" loading={saving} onClick={() => void save('draft')}>Save Draft</AdminButton>
          <AdminButton variant="orange" loading={saving} onClick={() => void save('published')}>Publish</AdminButton>
        </div>
      </div>
    </EditorChrome>
  )
}

