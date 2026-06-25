'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/Button'
import { Alert } from '@/components/ui/Alert'
import { Select } from '@/components/ui/Select'
import { PagePreview } from '@/components/admin/PagePreview'

interface Brand { id: string; name: string }
interface GenerateResult { generated: number; failed: number }

export default function PageGeneratePage() {
  const [brands, setBrands] = useState<Brand[]>([])
  const [selectedBrand, setSelectedBrand] = useState('')
  const [includeLocations, setIncludeLocations] = useState(true)
  const [preview, setPreview] = useState<number | null>(null)
  const [previewing, setPreviewing] = useState(false)
  const [generating, setGenerating] = useState(false)
  const [result, setResult] = useState<GenerateResult | null>(null)
  const [error, setError] = useState('')

  useEffect(() => {
    void (async () => {
      const res = await fetch('/api/admin/brands')
      if (!res.ok) return
      const data = await res.json() as { brands: Brand[] }
      setBrands(data.brands ?? [])
    })()
  }, [])

  async function handlePreview() {
    if (!selectedBrand) return
    setPreviewing(true); setError(''); setPreview(null)
    try {
      const res = await fetch('/api/admin/generate/preview', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ brand_id: selectedBrand, include_location_pages: includeLocations }),
      })
      const data = await res.json() as { count?: number; error?: string }
      if (!res.ok) { setError(data.error ?? 'Preview failed'); return }
      setPreview(data.count ?? 0)
    } catch { setError('Network error.') } finally { setPreviewing(false) }
  }

  async function handleGenerate() {
    if (!selectedBrand) return
    setGenerating(true); setError(''); setResult(null)
    try {
      const res = await fetch('/api/admin/generate/run', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ brand_id: selectedBrand, template_id: 'default', include_location_pages: includeLocations }),
      })
      const data = await res.json() as { generated?: number; failed?: number; error?: string }
      if (!res.ok) { setError(data.error ?? 'Generation failed'); return }
      setResult({ generated: data.generated ?? 0, failed: data.failed ?? 0 })
    } catch { setError('Network error.') } finally { setGenerating(false) }
  }

  const brandOptions = brands.map(b => ({ value: b.id, label: b.name }))
  const selectedBrandName = brands.find(b => b.id === selectedBrand)?.name

  return (
    <div>
      <h1 className="text-2xl font-bold text-[#1F2937] mb-6">Page Engine — Generate</h1>

      {error && <Alert variant="danger" className="mb-4">{error}</Alert>}
      {result && (
        <Alert variant="success" className="mb-4">
          Generated {result.generated} pages. {result.failed > 0 ? `${result.failed} failed.` : 'All succeeded.'}
        </Alert>
      )}

      <div className="max-w-xl space-y-6">
        <Select
          label="Select Brand"
          name="brand_id"
          value={selectedBrand}
          onChange={e => { setSelectedBrand(e.target.value); setPreview(null); setResult(null) }}
          options={brandOptions}
          placeholder="Choose a brand..."
          required
        />

        <div className="flex items-center gap-3">
          <input
            type="checkbox"
            id="include-locations"
            checked={includeLocations}
            onChange={e => setIncludeLocations(e.target.checked)}
            className="rounded border-[#D1D5DB]"
          />
          <label htmlFor="include-locations" className="text-sm font-medium text-[#374151]">
            Include location pages (brand/model/service/location)
          </label>
        </div>

        {selectedBrandName && (
          <PagePreview brandName={selectedBrandName} serviceName="Oil Change" modelName="A4" />
        )}

        <div className="flex gap-3">
          <Button type="button" variant="secondary" onClick={handlePreview} disabled={!selectedBrand} loading={previewing}>
            Preview Count
          </Button>
          <Button type="button" variant="primary" onClick={handleGenerate} disabled={!selectedBrand} loading={generating}>
            Generate Pages
          </Button>
        </div>

        {preview !== null && (
          <p className="text-sm text-[#374151]">
            This will generate <strong>{preview}</strong> pages for the selected brand.
          </p>
        )}
      </div>
    </div>
  )
}
