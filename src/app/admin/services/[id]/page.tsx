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
import { FAQRepeater } from '@/components/admin/FAQRepeater'
import { ConfirmModal } from '@/components/admin/ConfirmModal'

type Status = 'draft' | 'published' | 'archived'
interface FAQItem { question: string; answer: string }
interface Service { id: string; name: string; slug: string; short_description: string | null; starting_price: number | null; seo_title: string | null; seo_description: string | null; status: Status; faq_json: FAQItem[] | null }

export default function EditServicePage() {
  const router = useRouter()
  const params = useParams()
  const id = String(params.id)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [confirmDelete, setConfirmDelete] = useState(false)
  const [svc, setSvc] = useState<Service | null>(null)

  const loadService = useCallback(async () => {
    try {
      const res = await fetch(`/api/admin/services/${id}`)
      if (!res.ok) { router.push('/admin/services'); return }
      const data = await res.json() as { service: Service }
      setSvc(data.service)
    } finally { setLoading(false) }
  }, [id, router])

  useEffect(() => { void loadService() }, [loadService])

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    if (!svc) return
    setSaving(true); setError('')
    try {
      const res = await fetch(`/api/admin/services/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: svc.name, slug: svc.slug, short_description: svc.short_description, starting_price: svc.starting_price, seo_title: svc.seo_title, seo_description: svc.seo_description, status: svc.status, faq_json: svc.faq_json ?? [] }),
      })
      const data = await res.json() as { service?: Service; error?: string }
      if (!res.ok) { setError(data.error ?? 'Failed to save'); return }
      setSvc(data.service!)
    } catch { setError('Network error.') } finally { setSaving(false) }
  }

  async function handleDelete() {
    await fetch(`/api/admin/services/${id}`, { method: 'DELETE' })
    router.push('/admin/services')
  }

  if (loading) return <div className="text-[#9CA3AF] p-8">Loading...</div>
  if (!svc) return null

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <Link href="/admin/services" className="text-sm text-[#4472C4] hover:underline">← Services</Link>
          <h1 className="text-2xl font-bold text-[#1F2937] mt-1">{svc.name}</h1>
        </div>
        <Button variant="danger" size="sm" onClick={() => setConfirmDelete(true)}>Delete</Button>
      </div>
      {error && <Alert variant="danger" className="mb-4">{error}</Alert>}
      <form onSubmit={handleSave} className="space-y-6 max-w-2xl">
        <Input label="Service Name" value={svc.name} onChange={e => setSvc(s => s ? { ...s, name: e.target.value } : s)} required />
        <SlugField name="slug" value={svc.slug} sourceValue={svc.name} onChange={v => setSvc(s => s ? { ...s, slug: v } : s)} />
        <Textarea label="Short Description" value={svc.short_description ?? ''} onChange={e => setSvc(s => s ? { ...s, short_description: e.target.value } : s)} rows={2} maxLength={300} />
        <Input label="Starting Price (AED)" type="number" value={String(svc.starting_price ?? '')} onChange={e => setSvc(s => s ? { ...s, starting_price: e.target.value ? parseFloat(e.target.value) : null } : s)} />
        <FAQRepeater items={svc.faq_json ?? []} onChange={items => setSvc(s => s ? { ...s, faq_json: items } : s)} />
        <SEOFields title={svc.seo_title ?? ''} description={svc.seo_description ?? ''} onTitleChange={v => setSvc(s => s ? { ...s, seo_title: v } : s)} onDescriptionChange={v => setSvc(s => s ? { ...s, seo_description: v } : s)} />
        <div>
          <label className="block text-sm font-medium text-[#374151] mb-2">Status</label>
          <StatusToggle value={svc.status} onChange={v => setSvc(s => s ? { ...s, status: v } : s)} />
        </div>
        <Button type="submit" variant="primary" loading={saving}>Save Changes</Button>
      </form>
      <ConfirmModal open={confirmDelete} title="Delete Service" message={`Delete "${svc.name}"?`} confirmLabel="Delete" variant="danger" onConfirm={handleDelete} onCancel={() => setConfirmDelete(false)} />
    </div>
  )
}
