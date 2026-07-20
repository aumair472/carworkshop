'use client'

import { useStaticPage } from '@/components/admin/useStaticPage'
import { AdminInput } from '@/components/admin/ui/AdminField'
import { AdminButton } from '@/components/admin/ui/AdminButton'
import { AdminSectionCard } from '@/components/admin/ui/AdminSectionCard'
import { EditorChrome, StatusCard, SeoCard, InfoCard } from '@/components/admin/EditorChrome'
import { StaticSeoCard } from '@/components/admin/StaticSeoCard'
import { EditorSkeleton } from '@/components/admin/ui/EditorSkeleton'

export interface ListingContent {
  hero: { h1: string; subtitle: string }
  cta_banner: { headline: string; button_text: string; button_link: string }
}

interface ListingDefaults {
  h1: string
  subtitle: string
  cta_headline: string
  cta_button_text: string
  cta_button_link: string
}

interface ListingPageEditorProps {
  slug: string
  title: string
  viewHref: string
  defaults: ListingDefaults
}

// Shared editor for collection-page heroes (services/brands/locations/blog lists).
// Only three editable areas: H1, subtitle, and the CTA banner.
export function ListingPageEditor({ slug, title, viewHref, defaults }: ListingPageEditorProps) {
  const merge = (s: Partial<ListingContent> | null): ListingContent => ({
    hero: { h1: defaults.h1, subtitle: defaults.subtitle, ...s?.hero },
    cta_banner: {
      headline: defaults.cta_headline,
      button_text: defaults.cta_button_text,
      button_link: defaults.cta_button_link,
      ...s?.cta_banner,
    },
  })

  const p = useStaticPage<ListingContent>(slug, title, merge)
  const c = p.content
  if (p.loading) return <EditorSkeleton />

  return (
    <EditorChrome
      breadcrumb={[{ label: 'Pages', href: '/admin/pages' }, { label: title }]}
      title={title} saving={p.saving}
      onSaveDraft={() => void p.save('draft')} onPublish={() => void p.save('published')}
      sidebar={<>
        <StatusCard status={p.status} onChange={p.setStatus} viewHref={viewHref} savedLabel={p.savedLabel} />
        <SeoCard slug={viewHref.replace(/^\//, '')} title={p.seoTitle} description={p.seoDesc} onTitle={p.setSeoTitle} onDescription={p.setSeoDesc} />
        <InfoCard rows={[{ k: 'Type', v: `Static — ${title}` }, { k: 'URL', v: viewHref, mono: true }]} />
      </>}
    >
      <div className="space-y-4">
        <AdminSectionCard title="Hero">
          <AdminInput label="H1 Heading" required value={c.hero.h1} onChange={e => p.patch('hero', { h1: e.target.value })} />
          <AdminInput label="Subtitle" value={c.hero.subtitle} onChange={e => p.patch('hero', { subtitle: e.target.value })} />
        </AdminSectionCard>

        <AdminSectionCard title="CTA Banner">
          <AdminInput label="Headline" value={c.cta_banner.headline} onChange={e => p.patch('cta_banner', { headline: e.target.value })} />
          <div className="grid grid-cols-2 gap-3">
            <AdminInput label="Button Text" value={c.cta_banner.button_text} onChange={e => p.patch('cta_banner', { button_text: e.target.value })} />
            <AdminInput label="Button Link" value={c.cta_banner.button_link} onChange={e => p.patch('cta_banner', { button_link: e.target.value })} />
          </div>
        </AdminSectionCard>

        <AdminSectionCard title="SEO (Advanced)" defaultOpen={false}>
          <StaticSeoCard seoJson={p.seoJson} setSeoJson={p.setSeoJson} saveSeo={() => void p.saveSeo()} saving={p.saving}
            pageUrl={`https://carworkshop.ae${viewHref}`} defaultTitle={c.hero.h1} defaultDescription={c.hero.subtitle} autoSchemas={['CollectionPage', 'BreadcrumbList']}
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
