'use client'

import { SEOPanel } from '@/components/admin/SEOPanel'
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
}

// Full SEO panel + Save button, driven by useStaticPage state. Used as the SEO
// section on every static-page editor.
export function StaticSeoCard({ seoJson, setSeoJson, saveSeo, saving, pageUrl, defaultTitle, defaultDescription, autoSchemas }: StaticSeoCardProps) {
  return (
    <div className="space-y-4">
      <SEOPanel value={seoJson} onChange={setSeoJson} pageUrl={pageUrl} defaultTitle={defaultTitle} defaultDescription={defaultDescription} autoSchemas={autoSchemas} />
      <div className="flex justify-end">
        <AdminButton variant="orange" loading={saving} onClick={() => saveSeo()}>Save SEO</AdminButton>
      </div>
    </div>
  )
}
