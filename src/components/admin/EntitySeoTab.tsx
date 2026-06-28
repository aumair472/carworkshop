'use client'

import { useState } from 'react'
import toast from 'react-hot-toast'
import { SEOPanel } from '@/components/admin/SEOPanel'
import { AdminButton } from '@/components/admin/ui/AdminButton'
import type { SeoJson } from '@/lib/schemas/seo'

interface EntitySeoTabProps {
  endpoint: string            // e.g. /api/admin/brands/123/seo
  initial: SeoJson
  pageUrl: string
  defaultTitle?: string
  defaultDescription?: string
  autoSchemas?: string[]
}

// Self-contained SEO tab for entity editors (brand/service/location/blog). Loads
// the record's seo_json, edits via SEOPanel, saves to the /seo endpoint.
export function EntitySeoTab({ endpoint, initial, pageUrl, defaultTitle, defaultDescription, autoSchemas }: EntitySeoTabProps) {
  const [seoJson, setSeoJson] = useState<SeoJson>(initial ?? {})
  const [saving, setSaving] = useState(false)

  async function save() {
    setSaving(true)
    const t = toast.loading('Saving SEO…')
    try {
      const res = await fetch(endpoint, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ seo_json: seoJson }) })
      const d = await res.json().catch(() => ({})) as { error?: string }
      toast[res.ok ? 'success' : 'error'](res.ok ? 'SEO settings saved' : (d.error ?? 'Save failed'), { id: t })
    } catch { toast.error('Network error', { id: t }) } finally { setSaving(false) }
  }

  return (
    <div className="space-y-4">
      <SEOPanel value={seoJson} onChange={setSeoJson} pageUrl={pageUrl} defaultTitle={defaultTitle} defaultDescription={defaultDescription} autoSchemas={autoSchemas} />
      <div className="flex justify-end">
        <AdminButton variant="orange" loading={saving} onClick={() => void save()}>Save SEO</AdminButton>
      </div>
    </div>
  )
}
