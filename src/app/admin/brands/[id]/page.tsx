'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'
import { Input } from '@/components/ui/Input'
import { Textarea } from '@/components/ui/Textarea'
import { Button } from '@/components/ui/Button'
import { Alert } from '@/components/ui/Alert'
import { SlugField } from '@/components/admin/SlugField'
import { SEOFields } from '@/components/admin/SEOFields'
import { StatusToggle } from '@/components/admin/StatusToggle'
import { MediaPicker } from '@/components/admin/MediaPicker'
import { ConfirmModal } from '@/components/admin/ConfirmModal'

type Status = 'draft' | 'published' | 'archived'
interface Brand { id: string; name: string; slug: string; description: string | null; logo_url: string | null; seo_title: string | null; seo_description: string | null; status: Status }

export default function EditBrandPage() {
  const router = useRouter()
  const params = useParams()
  const id = String(params.id)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [confirmDelete, setConfirmDelete] = useState(false)
  const [brand, setBrand] = useState<Brand | null>(null)

  const loadBrand = useCallback(async () => {
    try {
      const res = await fetch(`/api/admin/brands/${id}`)
      if (!res.ok) { router.push('/admin/brands'); return }
      const data = await res.json() as { brand: Brand }
      setBrand(data.brand)
    } finally {
      setLoading(false)
    }
  }, [id, router])

  useEffect(() => { void loadBrand() }, [loadBrand])

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    if (!brand) return
    setSaving(true); setError('')
    try {
      const res = await fetch(`/api/admin/brands/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: brand.name, slug: brand.slug, description: brand.description, logo_url: brand.logo_url, seo_title: brand.seo_title, seo_description: brand.seo_description, status: brand.status }),
      })
      const data = await res.json() as { brand?: Brand; error?: string }
      if (!res.ok) { setError(data.error ?? 'Failed to save'); return }
      setBrand(data.brand!)
    } catch { setError('Network error.') } finally { setSaving(false) }
  }

  async function handleDelete() {
    try {
      await fetch(`/api/admin/brands/${id}`, { method: 'DELETE' })
      router.push('/admin/brands')
    } catch { setError('Delete failed.') }
  }

  if (loading) return <div className="text-[#9CA3AF] p-8">Loading...</div>
  if (!brand) return null

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <Link href="/admin/brands" className="text-sm text-[#4472C4] hover:underline">← Brands</Link>
          <h1 className="text-2xl font-bold text-[#1F2937] mt-1">{brand.name}</h1>
        </div>
        <Button variant="danger" size="sm" onClick={() => setConfirmDelete(true)}>Delete</Button>
      </div>

      {error && <Alert variant="danger" className="mb-4">{error}</Alert>}

      <form onSubmit={handleSave} className="space-y-6 max-w-2xl">
        <Input label="Brand Name" value={brand.name} onChange={e => setBrand(b => b ? { ...b, name: e.target.value } : b)} required />
        <SlugField name="slug" value={brand.slug} sourceValue={brand.name} onChange={s => setBrand(b => b ? { ...b, slug: s } : b)} />
        <Textarea label="Description" value={brand.description ?? ''} onChange={e => setBrand(b => b ? { ...b, description: e.target.value } : b)} rows={4} />
        <MediaPicker value={brand.logo_url} onChange={url => setBrand(b => b ? { ...b, logo_url: url } : b)} label="Logo" />
        <SEOFields title={brand.seo_title ?? ''} description={brand.seo_description ?? ''} onTitleChange={v => setBrand(b => b ? { ...b, seo_title: v } : b)} onDescriptionChange={v => setBrand(b => b ? { ...b, seo_description: v } : b)} />
        <div>
          <label className="block text-sm font-medium text-[#374151] mb-2">Status</label>
          <StatusToggle value={brand.status} onChange={s => setBrand(b => b ? { ...b, status: s } : b)} />
        </div>
        <Button type="submit" variant="primary" loading={saving}>Save Changes</Button>
      </form>

      <ConfirmModal open={confirmDelete} title="Delete Brand" message={`Delete "${brand.name}"? This cannot be undone.`} confirmLabel="Delete" variant="danger" onConfirm={handleDelete} onCancel={() => setConfirmDelete(false)} />
    </div>
  )
}
