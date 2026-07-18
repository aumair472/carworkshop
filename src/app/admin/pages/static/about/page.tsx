'use client'

import { MediaPicker } from '@/components/admin/MediaPicker'
import { FAQRepeater } from '@/components/admin/FAQRepeater'
import { RichTextEditor } from '@/components/admin/RichTextEditor'
import { useStaticPage } from '@/components/admin/useStaticPage'
import { AdminInput, AdminLabel } from '@/components/admin/ui/AdminField'
import { AdminButton } from '@/components/admin/ui/AdminButton'
import { AdminSectionCard } from '@/components/admin/ui/AdminSectionCard'
import { Repeater, inputCls } from '@/components/admin/ui/Repeater'
import { EditorChrome, StatusCard, SeoCard, InfoCard } from '@/components/admin/EditorChrome'
import { StaticSeoCard } from '@/components/admin/StaticSeoCard'
import { EditorSkeleton } from '@/app/admin/brands/[id]/page'

interface Value { icon: string; title: string; description: string }
interface Stat { value: string; label: string }
interface USP { icon: string; text: string }
interface FAQ { q: string; a: string }
interface AboutContent {
  hero: { h1: string; subheadline: string; image_url: string | null }
  main_content: string
  mission: { visible: boolean; heading: string; content: string; values: Value[] }
  stats: { visible: boolean; items: Stat[] }
  why_choose_us: { visible: boolean; heading: string; items: USP[] }
  faq: { visible: boolean; heading: string; faqs: FAQ[] }
  cta_banner: { visible: boolean; headline: string; subheadline: string; button_text: string; button_link: string; bg_color: string }
}

const merge = (s: Partial<AboutContent> | null): AboutContent => ({
  hero: { h1: 'About CarWorkshop.ae', subheadline: "UAE's trusted car service platform", image_url: null, ...s?.hero },
  main_content: s?.main_content ?? '',
  mission: { visible: true, heading: 'Our Mission', content: '', values: [
    { icon: '🎯', title: 'Our Mission', description: 'To make car service easy, honest and convenient.' },
    { icon: '💎', title: 'Our Vision', description: "To be UAE's #1 car service platform." },
    { icon: '🤝', title: 'Our Values', description: 'Transparency, quality and trust.' },
  ], ...s?.mission },
  stats: { visible: true, items: [
    { value: '10,000+', label: 'Cars Serviced' }, { value: '5', label: 'UAE Emirates' },
    { value: '12 Month', label: 'Warranty' }, { value: '5-Star', label: 'Customer Rating' },
  ], ...s?.stats },
  why_choose_us: { visible: true, heading: 'Why Choose Us', items: [
    { icon: '✅', text: 'Save up to 30% vs dealerships' }, { icon: '✅', text: '12-month warranty' }, { icon: '✅', text: 'Free collection & delivery' },
  ], ...s?.why_choose_us },
  faq: { visible: true, heading: 'Common Questions', faqs: [], ...s?.faq },
  cta_banner: { visible: true, headline: 'Ready to book your car service?', subheadline: 'Free pickup & delivery across UAE', button_text: 'Book Now', button_link: '/contact', bg_color: '#4472C4', ...s?.cta_banner },
})

export default function AboutEditor() {
  const p = useStaticPage<AboutContent>('about', 'About', merge)
  const c = p.content
  if (p.loading) return <EditorSkeleton />

  return (
    <EditorChrome
      breadcrumb={[{ label: 'Pages', href: '/admin/pages' }, { label: 'About' }]}
      title="About Page" saving={p.saving}
      onSaveDraft={() => void p.save('draft')} onPublish={() => void p.save('published')}
      sidebar={<>
        <StatusCard status={p.status} onChange={p.setStatus} viewHref="/about" savedLabel={p.savedLabel} />
        <SeoCard slug="about" title={p.seoTitle} description={p.seoDesc} onTitle={p.setSeoTitle} onDescription={p.setSeoDesc} />
        <InfoCard rows={[{ k: 'Type', v: 'Static — About' }, { k: 'URL', v: '/about', mono: true }]} />
      </>}
    >
      <div className="space-y-4">
        <AdminSectionCard title="Hero">
          <AdminInput label="H1 Heading" required maxCount={60} value={c.hero.h1} onChange={e => p.patch('hero', { h1: e.target.value })} />
          <AdminInput label="Subheadline" value={c.hero.subheadline} onChange={e => p.patch('hero', { subheadline: e.target.value })} />
          <MediaPicker label="Hero Image" value={c.hero.image_url} onChange={v => p.patch('hero', { image_url: v })} />
        </AdminSectionCard>

        <AdminSectionCard title="Main Content">
          <RichTextEditor value={c.main_content} onChange={v => p.setContent(prev => ({ ...prev, main_content: v }))} placeholder="Tell your story…" />
        </AdminSectionCard>

        <AdminSectionCard title="Mission & Values" visible={c.mission.visible} onVisibleChange={v => p.patch('mission', { visible: v })}>
          <AdminInput label="Section Heading" value={c.mission.heading} onChange={e => p.patch('mission', { heading: e.target.value })} />
          <div><AdminLabel>Mission Content</AdminLabel><RichTextEditor value={c.mission.content} onChange={v => p.patch('mission', { content: v })} placeholder="Our mission…" minHeight={140} /></div>
          <Repeater<Value> items={c.mission.values} max={6} addLabel="+ Add Value" onChange={values => p.patch('mission', { values })} blank={{ icon: '🎯', title: '', description: '' }}
            render={(it, upd) => (
              <div className="grid grid-cols-[3rem_1fr] gap-2 flex-1">
                <input value={it.icon} onChange={e => upd({ icon: e.target.value })} className={inputCls} />
                <div className="space-y-2">
                  <input value={it.title} onChange={e => upd({ title: e.target.value })} className={inputCls} placeholder="Title" />
                  <input value={it.description} onChange={e => upd({ description: e.target.value })} className={inputCls} placeholder="Description" />
                </div>
              </div>
            )} />
        </AdminSectionCard>

        <AdminSectionCard title="Stats / Achievements" visible={c.stats.visible} onVisibleChange={v => p.patch('stats', { visible: v })}>
          <Repeater<Stat> items={c.stats.items} max={8} addLabel="+ Add Stat" onChange={items => p.patch('stats', { items })} blank={{ value: '', label: '' }}
            render={(it, upd) => (
              <div className="grid grid-cols-2 gap-2 flex-1">
                <input value={it.value} onChange={e => upd({ value: e.target.value })} className={inputCls} placeholder="10,000+" />
                <input value={it.label} onChange={e => upd({ label: e.target.value })} className={inputCls} placeholder="Cars Serviced" />
              </div>
            )} />
        </AdminSectionCard>

        <AdminSectionCard title="Why Choose Us" visible={c.why_choose_us.visible} onVisibleChange={v => p.patch('why_choose_us', { visible: v })}>
          <AdminInput label="Section Heading" value={c.why_choose_us.heading} onChange={e => p.patch('why_choose_us', { heading: e.target.value })} />
          <Repeater<USP> items={c.why_choose_us.items} max={6} addLabel="+ Add USP" onChange={items => p.patch('why_choose_us', { items })} blank={{ icon: '✅', text: '' }}
            render={(it, upd) => (
              <div className="grid grid-cols-[3rem_1fr] gap-2 flex-1">
                <input value={it.icon} onChange={e => upd({ icon: e.target.value })} className={inputCls} />
                <input value={it.text} onChange={e => upd({ text: e.target.value })} className={inputCls} placeholder="Benefit" />
              </div>
            )} />
        </AdminSectionCard>

        <AdminSectionCard title="FAQ" visible={c.faq.visible} onVisibleChange={v => p.patch('faq', { visible: v })}>
          <AdminInput label="Section Heading" value={c.faq.heading} onChange={e => p.patch('faq', { heading: e.target.value })} />
          <FAQRepeater items={c.faq.faqs.map(f => ({ question: f.q, answer: f.a }))} onChange={v => p.patch('faq', { faqs: v.map(i => ({ q: i.question, a: i.answer })) })} />
        </AdminSectionCard>

        <AdminSectionCard title="CTA Banner" visible={c.cta_banner.visible} onVisibleChange={v => p.patch('cta_banner', { visible: v })}>
          <AdminInput label="Headline" value={c.cta_banner.headline} onChange={e => p.patch('cta_banner', { headline: e.target.value })} />
          <AdminInput label="Subheadline" value={c.cta_banner.subheadline} onChange={e => p.patch('cta_banner', { subheadline: e.target.value })} />
          <div className="grid grid-cols-2 gap-3">
            <AdminInput label="Button Text" value={c.cta_banner.button_text} onChange={e => p.patch('cta_banner', { button_text: e.target.value })} />
            <AdminInput label="Button Link" value={c.cta_banner.button_link} onChange={e => p.patch('cta_banner', { button_link: e.target.value })} />
          </div>
        </AdminSectionCard>

        <AdminSectionCard title="SEO (Advanced)" defaultOpen={false}>
          <StaticSeoCard seoJson={p.seoJson} setSeoJson={p.setSeoJson} saveSeo={() => void p.saveSeo()} saving={p.saving}
            pageUrl="https://carworkshop.ae/about" defaultTitle={c.hero.h1} defaultDescription={c.hero.subheadline} autoSchemas={['Organization', 'FAQPage (from FAQs)']}
            subTitle={p.subTitle} setSubTitle={p.setSubTitle} metaKeyword={p.metaKeyword} setMetaKeyword={p.setMetaKeyword}
            h3Text={p.h3Text} setH3Text={p.setH3Text} shortDescription={p.shortDescription} setShortDescription={p.setShortDescription} />
        </AdminSectionCard>

        <div className="flex justify-end gap-2 pt-2">
          <AdminButton variant="outline" loading={p.saving} onClick={() => void p.save('draft')}>Save Draft</AdminButton>
          <AdminButton variant="orange" loading={p.saving} onClick={() => void p.save('published')}>Publish</AdminButton>
        </div>
      </div>
    </EditorChrome>
  )
}
