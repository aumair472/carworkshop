'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import toast from 'react-hot-toast'
import { AdminSectionCard } from '@/components/admin/ui/AdminSectionCard'
import { AdminInput, AdminTextarea, AdminSelect, AdminLabel } from '@/components/admin/ui/AdminField'
import { AdminButton } from '@/components/admin/ui/AdminButton'
import { RichTextEditor } from '@/components/admin/RichTextEditor'
import { COUNTRIES, STATES_BY_COUNTRY } from '@/lib/geo'

export interface SeoBlogFormValues {
  country: string
  state: string
  published_at: string
  title: string
  arabic_title: string
  slug: string
  seo_title: string
  meta_keyword: string
  seo_description: string
  image_png_url: string
  image_webp_url: string
  image_title: string
  image_alt: string
  excerpt: string
  arabic_excerpt: string
  blockquote: string
  arabic_blockquote: string
  content: string
  arabic_content: string
  tags: string
  tags_ar: string
  status: string
  is_featured: boolean
}

export const EMPTY_SEO_BLOG: SeoBlogFormValues = {
  country: 'AE', state: '', published_at: '', title: '', arabic_title: '', slug: '',
  seo_title: '', meta_keyword: '', seo_description: '', image_png_url: '', image_webp_url: '',
  image_title: '', image_alt: '', excerpt: '', arabic_excerpt: '', blockquote: '', arabic_blockquote: '',
  content: '', arabic_content: '', tags: '', tags_ar: '', status: 'draft', is_featured: false,
}

interface Props {
  postId?: string
  initial: SeoBlogFormValues
}

export function SeoBlogForm({ postId, initial }: Props) {
  const router = useRouter()
  const [v, setV] = useState<SeoBlogFormValues>(initial)
  const [saving, setSaving] = useState(false)

  const set = <K extends keyof SeoBlogFormValues>(key: K, value: SeoBlogFormValues[K]) =>
    setV(prev => ({ ...prev, [key]: value }))

  async function uploadImage(file: File, key: 'image_png_url' | 'image_webp_url') {
    const t = toast.loading('Uploading…')
    try {
      const form = new FormData()
      form.append('file', file)
      const res = await fetch('/api/admin/media', { method: 'POST', body: form })
      const d = await res.json() as { media?: { url: string }; error?: string }
      if (!res.ok || !d.media) { toast.error(d.error ?? 'Upload failed', { id: t }); return }
      set(key, d.media.url)
      toast.success('Uploaded', { id: t })
    } catch { toast.error('Network error', { id: t }) }
  }

  async function save() {
    if (!v.title || !v.slug) { toast.error('Title and slug are required'); return }
    setSaving(true)
    const payload = {
      country: v.country,
      state: v.state || null,
      published_at: v.published_at ? new Date(v.published_at).toISOString() : null,
      title: v.title,
      arabic_title: v.arabic_title || null,
      slug: v.slug,
      seo_title: v.seo_title || null,
      meta_keyword: v.meta_keyword || null,
      seo_description: v.seo_description || null,
      image_png_url: v.image_png_url || null,
      image_webp_url: v.image_webp_url || null,
      image_title: v.image_title || null,
      image_alt: v.image_alt || null,
      excerpt: v.excerpt || null,
      arabic_excerpt: v.arabic_excerpt || null,
      blockquote: v.blockquote || null,
      arabic_blockquote: v.arabic_blockquote || null,
      content: v.content || null,
      arabic_content: v.arabic_content || null,
      tags: v.tags || null,
      tags_ar: v.tags_ar || null,
      status: v.status,
      is_featured: v.is_featured,
    }
    const res = await fetch(postId ? `/api/admin/seo-blog/${postId}` : '/api/admin/seo-blog', {
      method: postId ? 'PATCH' : 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })
    setSaving(false)
    if (!res.ok) {
      const d = await res.json().catch(() => null) as { error?: string } | null
      toast.error(d?.error ?? 'Save failed')
      return
    }
    toast.success('Saved')
    router.push('/admin/seo-blog')
    router.refresh()
  }

  const siteUrl = typeof window !== 'undefined' ? window.location.origin : 'https://carworkshop.ae'

  return (
    <div className="max-w-4xl space-y-5">
      <AdminSectionCard title="Blog Details" headerColor="#22C55E">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <AdminSelect label="Country" value={v.country} onChange={e => set('country', e.target.value)} options={COUNTRIES.map(c => ({ value: c.code, label: c.name }))} />
          <AdminSelect label="State" value={v.state} onChange={e => set('state', e.target.value)} options={[{ value: '', label: 'Select' }, ...(STATES_BY_COUNTRY[v.country] ?? []).map(s => ({ value: s, label: s }))]} />
        </div>
        <AdminInput label="Article Date" type="date" value={v.published_at} onChange={e => set('published_at', e.target.value)} />
        <AdminInput label="Title" required value={v.title} onChange={e => set('title', e.target.value)} />
        <AdminInput label="Arabic Title" dir="rtl" value={v.arabic_title} onChange={e => set('arabic_title', e.target.value)} />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <AdminInput label="URL" required value={`${siteUrl}/blog/`} disabled readOnly />
          <AdminInput label="URL SLUG" required value={v.slug} onChange={e => set('slug', e.target.value.toLowerCase())} />
        </div>
        <AdminInput label="Meta Title" required value={v.seo_title} onChange={e => set('seo_title', e.target.value)} maxCount={100} />
        <AdminInput label="Meta Keyword" required value={v.meta_keyword} onChange={e => set('meta_keyword', e.target.value)} />
        <AdminTextarea label="Meta Description" value={v.seo_description} onChange={e => set('seo_description', e.target.value)} maxCount={300} rows={3} />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <ImageUpload label="Master Image (png)" required url={v.image_png_url} accept="image/png" onFile={f => void uploadImage(f, 'image_png_url')} />
          <ImageUpload label="Master Image (webp)" required url={v.image_webp_url} accept="image/webp" onFile={f => void uploadImage(f, 'image_webp_url')} />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <AdminInput label="Image Title" value={v.image_title} onChange={e => set('image_title', e.target.value)} />
          <AdminInput label="Image Alt" value={v.image_alt} onChange={e => set('image_alt', e.target.value)} />
        </div>
        <AdminTextarea label="Short Description" required value={v.excerpt} onChange={e => set('excerpt', e.target.value)} rows={4} />
        <AdminTextarea label="Arabic Short Description" required dir="rtl" value={v.arabic_excerpt} onChange={e => set('arabic_excerpt', e.target.value)} rows={4} />
        <AdminTextarea label="Blockquote" value={v.blockquote} onChange={e => set('blockquote', e.target.value)} rows={3} />
        <AdminTextarea label="Arabic Blockquote" dir="rtl" value={v.arabic_blockquote} onChange={e => set('arabic_blockquote', e.target.value)} rows={3} />
        <div>
          <AdminLabel required>Complete Description</AdminLabel>
          <RichTextEditor value={v.content} onChange={html => set('content', html)} minHeight={260} />
        </div>
        <div>
          <AdminLabel>Arabic Complete Description</AdminLabel>
          <RichTextEditor value={v.arabic_content} onChange={html => set('arabic_content', html)} minHeight={220} dir="rtl" />
        </div>
        <AdminInput label="Tags (Separate each points with semicolon (;) )" value={v.tags} onChange={e => set('tags', e.target.value)} />
        <AdminInput label="Tags Arabic (Separate each points with semicolon (;) )" dir="rtl" value={v.tags_ar} onChange={e => set('tags_ar', e.target.value)} />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <AdminSelect label="Publish Status" required value={v.status} onChange={e => set('status', e.target.value)} options={[{ value: 'published', label: 'Active' }, { value: 'draft', label: 'Inactive' }, { value: 'archived', label: 'Archived' }]} />
          <AdminSelect label="Is Featured?" value={v.is_featured ? 'yes' : 'no'} onChange={e => set('is_featured', e.target.value === 'yes')} options={[{ value: 'no', label: 'No' }, { value: 'yes', label: 'Yes' }]} />
        </div>
      </AdminSectionCard>

      <div className="flex gap-3">
        <AdminButton variant="success" loading={saving} onClick={() => void save()}>SAVE &amp; EXIT</AdminButton>
        <AdminButton variant="outline" onClick={() => router.push('/admin/seo-blog')}>CANCEL</AdminButton>
      </div>
    </div>
  )
}

function ImageUpload({ label, required, url, accept, onFile }: { label: string; required?: boolean; url: string; accept: string; onFile: (f: File) => void }) {
  return (
    <div>
      <AdminLabel required={required}>{label}</AdminLabel>
      <input
        type="file"
        accept={accept}
        onChange={e => { const f = e.target.files?.[0]; if (f) onFile(f); e.target.value = '' }}
        className="block w-full text-sm text-zinc-600 file:mr-3 file:rounded file:border file:border-zinc-300 file:bg-white file:px-3 file:py-1.5 file:text-sm file:text-zinc-700"
      />
      {url && (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={url} alt="" className="mt-2 h-20 rounded border border-[#E5E7EB] object-contain" />
      )}
    </div>
  )
}
