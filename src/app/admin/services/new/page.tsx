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
import { FAQRepeater } from '@/components/admin/FAQRepeater'

type Status = 'draft' | 'published' | 'archived'
interface FAQItem { question: string; answer: string }

export default function NewServicePage() {
  const router = useRouter()
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [name, setName] = useState('')
  const [slug, setSlug] = useState('')
  const [shortDescription, setShortDescription] = useState('')
  const [startingPrice, setStartingPrice] = useState('')
  const [seoTitle, setSeoTitle] = useState('')
  const [seoDescription, setSeoDescription] = useState('')
  const [status, setStatus] = useState<Status>('draft')
  const [faqs, setFaqs] = useState<FAQItem[]>([])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true); setError('')
    try {
      const res = await fetch('/api/admin/services', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name, slug: slug || undefined,
          short_description: shortDescription || null,
          starting_price: startingPrice ? parseFloat(startingPrice) : null,
          seo_title: seoTitle || null, seo_description: seoDescription || null,
          status, faq_json: faqs,
        }),
      })
      const data = await res.json() as { service?: { id: string }; error?: string }
      if (!res.ok) { setError(data.error ?? 'Failed to create'); return }
      router.push(`/admin/services/${data.service!.id}`)
    } catch { setError('Network error.') } finally { setSaving(false) }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <Link href="/admin/services" className="text-sm text-[#4472C4] hover:underline">← Services</Link>
          <h1 className="text-2xl font-bold text-[#1F2937] mt-1">New Service</h1>
        </div>
      </div>
      {error && <Alert variant="danger" className="mb-4">{error}</Alert>}
      <form onSubmit={handleSubmit} className="space-y-6 max-w-2xl">
        <Input label="Service Name" value={name} onChange={e => setName(e.target.value)} required placeholder="e.g. Oil Change" />
        <SlugField name="slug" value={slug} sourceValue={name} onChange={setSlug} />
        <Textarea label="Short Description" value={shortDescription} onChange={e => setShortDescription(e.target.value)} rows={2} maxLength={300} />
        <Input label="Starting Price (AED)" type="number" value={startingPrice} onChange={e => setStartingPrice(e.target.value)} placeholder="149" min="0" />
        <FAQRepeater items={faqs} onChange={setFaqs} />
        <SEOFields title={seoTitle} description={seoDescription} onTitleChange={setSeoTitle} onDescriptionChange={setSeoDescription} />
        <div>
          <label className="block text-sm font-medium text-[#374151] mb-2">Status</label>
          <StatusToggle value={status} onChange={setStatus} />
        </div>
        <div className="flex gap-3">
          <Button type="submit" variant="primary" loading={saving}>Create Service</Button>
          <Link href="/admin/services"><Button type="button" variant="secondary">Cancel</Button></Link>
        </div>
      </form>
    </div>
  )
}
