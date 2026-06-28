'use client'

import { FAQRepeater } from '@/components/admin/FAQRepeater'
import { useStaticPage } from '@/components/admin/useStaticPage'
import { AdminInput } from '@/components/admin/ui/AdminField'
import { AdminButton } from '@/components/admin/ui/AdminButton'
import { AdminSectionCard } from '@/components/admin/ui/AdminSectionCard'
import { EditorChrome, StatusCard, SeoCard, InfoCard } from '@/components/admin/EditorChrome'
import { StaticSeoCard } from '@/components/admin/StaticSeoCard'
import { EditorSkeleton } from '@/app/admin/brands/[id]/page'

interface FAQ { q: string; a: string }
interface Category { name: string; faqs: FAQ[] }
interface FaqContent {
  hero: { h1: string; subheadline: string }
  categories: Category[]
  cta_banner: { visible: boolean; headline: string; button_text: string; button_link: string }
}

const DEFAULT_CATEGORIES = ['Booking & Payments', 'Our Services', 'Collection & Delivery', 'Warranty & Quality', 'About Us']
const merge = (s: Partial<FaqContent> | null): FaqContent => ({
  hero: { h1: 'Frequently Asked Questions', subheadline: 'Everything you need to know about CarWorkshop.ae', ...s?.hero },
  categories: s?.categories && s.categories.length > 0 ? s.categories : DEFAULT_CATEGORIES.map(name => ({ name, faqs: [] })),
  cta_banner: { visible: true, headline: 'Still have questions? Talk to our team', button_text: 'Contact Us', button_link: '/contact', ...s?.cta_banner },
})

export default function FaqEditor() {
  const p = useStaticPage<FaqContent>('faq', 'FAQ', merge)
  const c = p.content
  if (p.loading) return <EditorSkeleton />

  const totalQs = c.categories.reduce((n, cat) => n + cat.faqs.length, 0)
  const updateCat = (i: number, patch: Partial<Category>) => p.setContent(prev => ({ ...prev, categories: prev.categories.map((x, j) => j === i ? { ...x, ...patch } : x) }))

  return (
    <EditorChrome
      breadcrumb={[{ label: 'Pages', href: '/admin/pages' }, { label: 'FAQ' }]}
      title="FAQ Page" saving={p.saving}
      onSaveDraft={() => void p.save('draft')} onPublish={() => void p.save('published')}
      sidebar={<>
        <StatusCard status={p.status} onChange={p.setStatus} viewHref="/faq" savedLabel={p.savedLabel} />
        <SeoCard slug="faq" title={p.seoTitle} description={p.seoDesc} onTitle={p.setSeoTitle} onDescription={p.setSeoDesc} />
        <InfoCard rows={[{ k: 'Type', v: 'Static — FAQ' }, { k: 'URL', v: '/faq', mono: true }, { k: 'Schema', v: `FAQPage · ${totalQs} Q` }]} />
      </>}
    >
      <div className="space-y-4">
        <AdminSectionCard title="Hero">
          <AdminInput label="H1 Heading" required value={c.hero.h1} onChange={e => p.patch('hero', { h1: e.target.value })} />
          <AdminInput label="Subheadline" value={c.hero.subheadline} onChange={e => p.patch('hero', { subheadline: e.target.value })} />
        </AdminSectionCard>

        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-zinc-900">FAQ Categories ({c.categories.length})</h3>
            <AdminButton variant="outline" onClick={() => p.setContent(prev => ({ ...prev, categories: [...prev.categories, { name: 'New Category', faqs: [] }] }))}>+ Add Category</AdminButton>
          </div>
          {c.categories.map((cat, i) => (
            <AdminSectionCard key={i} title={cat.name || `Category ${i + 1}`}>
              <div className="flex items-center gap-2">
                <AdminInput label="Category Name" value={cat.name} onChange={e => updateCat(i, { name: e.target.value })} className="flex-1" />
                <button type="button" onClick={() => p.setContent(prev => ({ ...prev, categories: prev.categories.filter((_, j) => j !== i) }))} className="mt-6 h-9 px-3 rounded-md text-red-500 hover:bg-red-50 text-sm">Delete</button>
              </div>
              <FAQRepeater items={cat.faqs.map(f => ({ question: f.q, answer: f.a }))} onChange={v => updateCat(i, { faqs: v.map(x => ({ q: x.question, a: x.answer })) })} />
            </AdminSectionCard>
          ))}
        </div>

        <AdminSectionCard title="CTA Banner" visible={c.cta_banner.visible} onVisibleChange={v => p.patch('cta_banner', { visible: v })}>
          <AdminInput label="Headline" value={c.cta_banner.headline} onChange={e => p.patch('cta_banner', { headline: e.target.value })} />
          <div className="grid grid-cols-2 gap-3">
            <AdminInput label="Button Text" value={c.cta_banner.button_text} onChange={e => p.patch('cta_banner', { button_text: e.target.value })} />
            <AdminInput label="Button Link" value={c.cta_banner.button_link} onChange={e => p.patch('cta_banner', { button_link: e.target.value })} />
          </div>
        </AdminSectionCard>

        <AdminSectionCard title="SEO (Advanced)" defaultOpen={false}>
          <StaticSeoCard seoJson={p.seoJson} setSeoJson={p.setSeoJson} saveSeo={() => void p.saveSeo()} saving={p.saving}
            pageUrl="https://carworkshop.ae/faq" defaultTitle={c.hero.h1} defaultDescription={c.hero.subheadline} autoSchemas={['FAQPage', 'BreadcrumbList']} />
        </AdminSectionCard>

        <div className="flex justify-end gap-2 pt-2">
          <AdminButton variant="outline" loading={p.saving} onClick={() => void p.save('draft')}>Save Draft</AdminButton>
          <AdminButton variant="orange" loading={p.saving} onClick={() => void p.save('published')}>Publish</AdminButton>
        </div>
      </div>
    </EditorChrome>
  )
}
