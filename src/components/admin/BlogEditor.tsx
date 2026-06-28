'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Input } from '@/components/ui/Input'
import { Textarea } from '@/components/ui/Textarea'
import { Select } from '@/components/ui/Select'
import { Button } from '@/components/ui/Button'
import { Alert } from '@/components/ui/Alert'
import { RichTextEditor } from '@/components/admin/RichTextEditor'
import { EntitySeoTab } from '@/components/admin/EntitySeoTab'
import { SeoEditorBanner, useActingRole } from '@/components/admin/seo-editor-ui'
import type { BlogPost } from '@/types'
import type { SeoJson } from '@/lib/schemas/seo'

const STATUS_OPTIONS = [
  { value: 'draft', label: 'Draft' },
  { value: 'published', label: 'Published' },
  { value: 'archived', label: 'Archived' },
]

interface BlogEditorProps {
  post?: BlogPost
  users?: Array<{ id: string; full_name: string }>
}

export function BlogEditor({ post, users = [] }: BlogEditorProps) {
  const router = useRouter()
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [content, setContent] = useState(post?.content ?? '')
  const { isSEOEditor } = useActingRole()

  // SEO editors get a focused SEO-only view (only meaningful on an existing post).
  if (isSEOEditor && post) {
    return (
      <div>
        <SeoEditorBanner />
        <EntitySeoTab
          endpoint={`/api/admin/blog/${post.id}/seo`}
          initial={(post.seo_json ?? {}) as SeoJson}
          pageUrl={`https://carworkshop.ae/blog/${post.slug}`}
          defaultTitle={`${post.title} | CarWorkshop.ae`}
          autoSchemas={['Article', 'BreadcrumbList']}
        />
      </div>
    )
  }

  async function handleSave(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setSaving(true)
    setError('')
    setSuccess(false)

    const fd = new FormData(e.currentTarget)
    const data = {
      title: fd.get('title') as string,
      slug: fd.get('slug') as string,
      excerpt: fd.get('excerpt') as string,
      content,
      status: fd.get('status') as string,
      seo_title: fd.get('seo_title') as string || null,
      seo_description: fd.get('seo_description') as string || null,
      author_id: (fd.get('author_id') as string) || null,
    }

    try {
      const url = post ? `/api/admin/blog/${post.id}` : '/api/admin/blog'
      const method = post ? 'PATCH' : 'POST'

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })

      if (!res.ok) {
        const body = await res.json() as { error?: string }
        throw new Error(body.error ?? 'Save failed')
      }

      setSuccess(true)
      if (!post) {
        router.push('/admin/blog')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Save failed')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="space-y-6">
    <form onSubmit={handleSave} className="space-y-5">
      {error && <Alert variant="danger">{error}</Alert>}
      {success && <Alert variant="success">Saved successfully!</Alert>}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <div className="lg:col-span-2 space-y-5">
          <Input label="Title" name="title" required defaultValue={post?.title} placeholder="Enter post title..." />

          <div>
            <label className="text-sm font-semibold text-[#1F2937] block mb-1">Content</label>
            <RichTextEditor value={content} onChange={setContent} placeholder="Write the post…" minHeight={400} />
          </div>
        </div>

        <div className="space-y-5">
          <Select label="Status" name="status" options={STATUS_OPTIONS} defaultValue={post?.status ?? 'draft'} />
          <Select
            label="Author"
            name="author_id"
            options={[{ value: '', label: 'Default (site author)' }, ...users.map(u => ({ value: u.id, label: u.full_name }))]}
            defaultValue={post?.author_id ?? ''}
          />
          <Input label="URL Slug" name="slug" required defaultValue={post?.slug} placeholder="my-post-slug" />
          <Textarea label="Excerpt" name="excerpt" defaultValue={post?.excerpt ?? ''} maxLength={300} charCount />
          <Input label="SEO Title" name="seo_title" defaultValue={post?.seo_title ?? ''} placeholder="Override meta title..." />
          <Textarea label="SEO Description" name="seo_description" defaultValue={post?.seo_description ?? ''} maxLength={160} charCount />

          <div className="flex gap-3 pt-2">
            <Button type="submit" variant="primary" loading={saving} fullWidth>
              {post ? 'Update Post' : 'Create Post'}
            </Button>
          </div>
        </div>
      </div>
    </form>

    {post && (
      <details className="bg-white rounded-lg border border-[#E5E7EB] shadow-card">
        <summary className="cursor-pointer px-5 py-3.5 text-sm font-semibold text-[#1F2937]">Advanced SEO (robots, schema, social)</summary>
        <div className="px-5 pb-5 border-t border-[#E5E7EB] pt-4">
          <EntitySeoTab
            endpoint={`/api/admin/blog/${post.id}/seo`}
            initial={(post.seo_json ?? {}) as SeoJson}
            pageUrl={`https://carworkshop.ae/blog/${post.slug}`}
            defaultTitle={`${post.title} | CarWorkshop.ae`}
            autoSchemas={['Article', 'BreadcrumbList']}
          />
        </div>
      </details>
    )}
    </div>
  )
}
