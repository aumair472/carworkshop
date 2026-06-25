'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'
import { Input } from '@/components/ui/Input'
import { Textarea } from '@/components/ui/Textarea'
import { Button } from '@/components/ui/Button'
import { Alert } from '@/components/ui/Alert'
import { Select } from '@/components/ui/Select'
import { SlugField } from '@/components/admin/SlugField'
import { SEOFields } from '@/components/admin/SEOFields'
import { StatusToggle } from '@/components/admin/StatusToggle'
import { FAQRepeater } from '@/components/admin/FAQRepeater'
import { ConfirmModal } from '@/components/admin/ConfirmModal'

type Status = 'draft' | 'published' | 'archived'
type Emirate = 'Dubai' | 'Abu Dhabi' | 'Sharjah' | 'Ajman' | 'Ras Al Khaimah' | 'Umm Al Quwain' | 'Fujairah'
interface FAQItem { question: string; answer: string }
interface Location { id: string; name: string; slug: string; emirate: Emirate; address: string | null; description: string | null; seo_title: string | null; seo_description: string | null; status: Status; faq_json: FAQItem[] | null }

const EMIRATE_OPTIONS = ['Dubai', 'Abu Dhabi', 'Sharjah', 'Ajman', 'Ras Al Khaimah', 'Umm Al Quwain', 'Fujairah'].map(e => ({ value: e, label: e }))

export default function EditLocationPage() {
  const router = useRouter()
  const params = useParams()
  const id = String(params.id)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [confirmDelete, setConfirmDelete] = useState(false)
  const [loc, setLoc] = useState<Location | null>(null)

  const loadLocation = useCallback(async () => {
    try {
      const res = await fetch(`/api/admin/locations/${id}`)
      if (!res.ok) { router.push('/admin/locations'); return }
      const data = await res.json() as { location: Location }
      setLoc(data.location)
    } finally { setLoading(false) }
  }, [id, router])

  useEffect(() => { void loadLocation() }, [loadLocation])

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    if (!loc) return
    setSaving(true); setError('')
    try {
      const res = await fetch(`/api/admin/locations/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: loc.name, slug: loc.slug, emirate: loc.emirate, address: loc.address, description: loc.description, seo_title: loc.seo_title, seo_description: loc.seo_description, status: loc.status, faq_json: loc.faq_json ?? [] }),
      })
      const data = await res.json() as { location?: Location; error?: string }
      if (!res.ok) { setError(data.error ?? 'Failed to save'); return }
      setLoc(data.location!)
    } catch { setError('Network error.') } finally { setSaving(false) }
  }

  async function handleDelete() {
    await fetch(`/api/admin/locations/${id}`, { method: 'DELETE' })
    router.push('/admin/locations')
  }

  if (loading) return <div className="text-[#9CA3AF] p-8">Loading...</div>
  if (!loc) return null

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <Link href="/admin/locations" className="text-sm text-[#4472C4] hover:underline">← Locations</Link>
          <h1 className="text-2xl font-bold text-[#1F2937] mt-1">{loc.name}</h1>
        </div>
        <Button variant="danger" size="sm" onClick={() => setConfirmDelete(true)}>Delete</Button>
      </div>
      {error && <Alert variant="danger" className="mb-4">{error}</Alert>}
      <form onSubmit={handleSave} className="space-y-6 max-w-2xl">
        <Input label="Location Name" value={loc.name} onChange={e => setLoc(l => l ? { ...l, name: e.target.value } : l)} required />
        <SlugField name="slug" value={loc.slug} sourceValue={loc.name} onChange={v => setLoc(l => l ? { ...l, slug: v } : l)} />
        <Select label="Emirate" name="emirate" value={loc.emirate} onChange={e => setLoc(l => l ? { ...l, emirate: e.target.value as Emirate } : l)} options={EMIRATE_OPTIONS} required />
        <Textarea label="Address" value={loc.address ?? ''} onChange={e => setLoc(l => l ? { ...l, address: e.target.value } : l)} rows={2} />
        <Textarea label="Description" value={loc.description ?? ''} onChange={e => setLoc(l => l ? { ...l, description: e.target.value } : l)} rows={4} />
        <FAQRepeater items={loc.faq_json ?? []} onChange={items => setLoc(l => l ? { ...l, faq_json: items } : l)} />
        <SEOFields title={loc.seo_title ?? ''} description={loc.seo_description ?? ''} onTitleChange={v => setLoc(l => l ? { ...l, seo_title: v } : l)} onDescriptionChange={v => setLoc(l => l ? { ...l, seo_description: v } : l)} />
        <div>
          <label className="block text-sm font-medium text-[#374151] mb-2">Status</label>
          <StatusToggle value={loc.status} onChange={v => setLoc(l => l ? { ...l, status: v } : l)} />
        </div>
        <Button type="submit" variant="primary" loading={saving}>Save Changes</Button>
      </form>
      <ConfirmModal open={confirmDelete} title="Delete Location" message={`Delete "${loc.name}"?`} confirmLabel="Delete" variant="danger" onConfirm={handleDelete} onCancel={() => setConfirmDelete(false)} />
    </div>
  )
}
