'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import { Input } from '@/components/ui/Input'
import { Textarea } from '@/components/ui/Textarea'
import { Select } from '@/components/ui/Select'
import { Button } from '@/components/ui/Button'
import { Alert } from '@/components/ui/Alert'
import type { BlogPost } from '@/types'

const STATUS_OPTIONS = [
  { value: 'draft', label: 'Draft' },
  { value: 'published', label: 'Published' },
  { value: 'archived', label: 'Archived' },
]

interface BlogEditorProps {
  post?: BlogPost
}

export function BlogEditor({ post }: BlogEditorProps) {
  const router = useRouter()
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  const editor = useEditor({
    extensions: [StarterKit],
    content: post?.content ?? '',
    editorProps: {
      attributes: {
        class: 'min-h-[400px] p-4 focus:outline-none prose prose-slate max-w-none',
      },
    },
  })

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
      content: editor?.getHTML() ?? '',
      status: fd.get('status') as string,
      seo_title: fd.get('seo_title') as string || null,
      seo_description: fd.get('seo_description') as string || null,
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
    <form onSubmit={handleSave} className="space-y-5">
      {error && <Alert variant="danger">{error}</Alert>}
      {success && <Alert variant="success">Saved successfully!</Alert>}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <div className="lg:col-span-2 space-y-5">
          <Input label="Title" name="title" required defaultValue={post?.title} placeholder="Enter post title..." />

          <div>
            <label className="text-sm font-semibold text-[#1F2937] block mb-1">Content</label>
            <div className="border border-[#E5E7EB] rounded-md overflow-hidden">
              <div className="flex gap-1 p-2 border-b border-[#E5E7EB] bg-[#F9FAFB] flex-wrap">
                {[
                  { label: 'B', action: () => editor?.chain().focus().toggleBold().run() },
                  { label: 'I', action: () => editor?.chain().focus().toggleItalic().run() },
                  { label: 'H2', action: () => editor?.chain().focus().toggleHeading({ level: 2 }).run() },
                  { label: 'H3', action: () => editor?.chain().focus().toggleHeading({ level: 3 }).run() },
                  { label: 'UL', action: () => editor?.chain().focus().toggleBulletList().run() },
                  { label: 'OL', action: () => editor?.chain().focus().toggleOrderedList().run() },
                  { label: '""', action: () => editor?.chain().focus().toggleBlockquote().run() },
                  { label: '—', action: () => editor?.chain().focus().setHorizontalRule().run() },
                ].map(btn => (
                  <button
                    key={btn.label}
                    type="button"
                    onClick={btn.action}
                    className="px-2 py-1 text-xs font-semibold border border-[#E5E7EB] rounded hover:bg-[#EEF3FB] hover:border-[#4472C4] hover:text-[#4472C4] transition-colors"
                  >
                    {btn.label}
                  </button>
                ))}
              </div>
              <EditorContent editor={editor} />
            </div>
          </div>
        </div>

        <div className="space-y-5">
          <Select label="Status" name="status" options={STATUS_OPTIONS} defaultValue={post?.status ?? 'draft'} />
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
  )
}
