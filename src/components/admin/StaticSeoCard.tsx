'use client'

import { SEOPanel } from '@/components/admin/SEOPanel'
import { RichTextEditor } from '@/components/admin/RichTextEditor'
import { AdminInput, AdminTextarea, AdminLabel } from '@/components/admin/ui/AdminField'
import { AdminButton } from '@/components/admin/ui/AdminButton'
import type { SeoJson } from '@/lib/schemas/seo'

interface StaticSeoCardProps {
  seoJson: SeoJson
  setSeoJson: (v: SeoJson) => void
  saveSeo: () => void
  saving: boolean
  pageUrl: string
  defaultTitle?: string
  defaultDescription?: string
  autoSchemas?: string[]
  subTitle: string
  setSubTitle: (v: string) => void
  metaKeyword: string
  setMetaKeyword: (v: string) => void
  h3Text: string
  setH3Text: (v: string) => void
  shortDescription: string
  setShortDescription: (v: string) => void
}

// Full SEO panel + Save button, driven by useStaticPage state. Used as the SEO
// section on every static-page editor.
export function StaticSeoCard({
  seoJson, setSeoJson, saveSeo, saving, pageUrl, defaultTitle, defaultDescription, autoSchemas,
  subTitle, setSubTitle, metaKeyword, setMetaKeyword, h3Text, setH3Text, shortDescription, setShortDescription,
}: StaticSeoCardProps) {
  return (
    <div className="space-y-4">
      <AdminInput label="Sub Title" value={subTitle} onChange={e => setSubTitle(e.target.value)} placeholder="Page subtitle shown below H1" />
      <div>
        <AdminInput label="Meta Keyword" value={metaKeyword} onChange={e => setMetaKeyword(e.target.value)} placeholder="keyword1, keyword2, keyword3" />
        <p className="text-xs text-zinc-500 mt-1">Separate keywords with commas</p>
      </div>
      <AdminTextarea label="H3 Text" rows={2} value={h3Text} onChange={e => setH3Text(e.target.value)} placeholder="Secondary heading shown on the page" />
      <div>
        <AdminLabel>Short Description</AdminLabel>
        <RichTextEditor value={shortDescription} onChange={setShortDescription} minHeight={160} />
      </div>
      <SEOPanel value={seoJson} onChange={setSeoJson} pageUrl={pageUrl} defaultTitle={defaultTitle} defaultDescription={defaultDescription} autoSchemas={autoSchemas} />
      <div className="flex justify-end">
        <AdminButton variant="orange" loading={saving} onClick={() => saveSeo()}>Save SEO</AdminButton>
      </div>
    </div>
  )
}
