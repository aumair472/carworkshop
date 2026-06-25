'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Input } from '@/components/ui/Input'
import { Textarea } from '@/components/ui/Textarea'
import { Button } from '@/components/ui/Button'
import { Alert } from '@/components/ui/Alert'
import { SlugField } from '@/components/admin/SlugField'
import { SEOFields } from '@/components/admin/SEOFields'
import { StatusToggle } from '@/components/admin/StatusToggle'
import { MediaPicker } from '@/components/admin/MediaPicker'

type Status = 'draft' | 'published' | 'archived'

export default function NewBrandPage() {
  const router = useRouter()
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [name, setName] = useState('')
  const [slug, setSlug] = useState('')
  const [description, setDescription] = useState('')
  const [logoUrl, setLogoUrl] = useState<string | null>(null)
  const [seoTitle, setSeoTitle] = useState('')
  const [seoDescription, setSeoDescription] = useState('')
  const [status, setStatus] = useState<Status>('draft')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    setError('')
    try {
      const res = await fetch('/api/admin/brands', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, slug: slug || undefined, description: description || undefined, logo_url: logoUrl, seo_title: seoTitle || null, seo_description: seoDescription || null, status }),
      })
      const data = await res.json() as { brand?: { id: string }; error?: string }
      if (!res.ok) { setError(data.error ?? 'Failed to create brand'); return }
      router.push(`/admin/brands/${data.brand!.id}`)
    } catch {
      setError('Network error. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <Link href="/admin/brands" className="text-sm text-[#4472C4] hover:underline">← Brands</Link>
          <h1 className="text-2xl font-bold text-[#1F2937] mt-1">New Brand</h1>
        </div>
      </div>

      {error && <Alert variant="danger" className="mb-4">{error}</Alert>}

      <form onSubmit={handleSubmit} className="space-y-6 max-w-2xl">
        <Input label="Brand Name" value={name} onChange={e => setName(e.target.value)} required placeholder="e.g. BMW" />
        <SlugField name="slug" value={slug} sourceValue={name} onChange={setSlug} />
        <Textarea label="Description" value={description} onChange={e => setDescription(e.target.value)} rows={4} />
        <MediaPicker value={logoUrl} onChange={setLogoUrl} label="Logo" />
        <SEOFields title={seoTitle} description={seoDescription} onTitleChange={setSeoTitle} onDescriptionChange={setSeoDescription} />
        <div>
          <label className="block text-sm font-medium text-[#374151] mb-2">Status</label>
          <StatusToggle value={status} onChange={setStatus} />
        </div>
        <div className="flex gap-3">
          <Button type="submit" variant="primary" loading={saving}>Create Brand</Button>
          <Link href="/admin/brands"><Button type="button" variant="secondary">Cancel</Button></Link>
        </div>
      </form>
    </div>
  )
}
