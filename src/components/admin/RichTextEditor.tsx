'use client'

import { useRef } from 'react'
import toast from 'react-hot-toast'
import { useEditor, EditorContent, type Editor } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Link from '@tiptap/extension-link'
import Image from '@tiptap/extension-image'
import {
  Bold, Italic, Heading2, Heading3, List, ListOrdered,
  Quote, Minus, Link as LinkIcon, Image as ImageIcon, Undo, Redo,
} from 'lucide-react'

interface RichTextEditorProps {
  value: string
  onChange: (html: string) => void
  placeholder?: string
  minHeight?: number
}

export function RichTextEditor({ value, onChange, placeholder = 'Write content…', minHeight = 200 }: RichTextEditorProps) {
  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit,
      Link.configure({ openOnClick: false, HTMLAttributes: { rel: 'noopener noreferrer' } }),
      Image,
    ],
    content: value || '',
    editorProps: {
      attributes: { class: 'rich-content max-w-none p-4 focus:outline-none', 'data-placeholder': placeholder },
    },
    onUpdate: ({ editor }) => onChange(editor.getHTML()),
  })

  const imgInputRef = useRef<HTMLInputElement>(null)

  async function uploadImage(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    e.target.value = ''
    if (!file || !editor) return
    const t = toast.loading('Uploading image…')
    try {
      const form = new FormData()
      form.append('file', file)
      const res = await fetch('/api/admin/media', { method: 'POST', body: form })
      const d = await res.json() as { media?: { url: string }; error?: string }
      if (!res.ok || !d.media) { toast.error(d.error ?? 'Upload failed', { id: t }); return }
      editor.chain().focus().setImage({ src: d.media.url, alt: file.name }).run()
      toast.success('Image inserted', { id: t })
    } catch { toast.error('Network error', { id: t }) }
  }

  if (!editor) {
    return <div className="border border-zinc-300 rounded-lg bg-white" style={{ minHeight }} />
  }

  return (
    <div className="admin-rte border border-zinc-300 rounded-lg overflow-hidden bg-white">
      <input ref={imgInputRef} type="file" accept="image/*" className="sr-only" onChange={e => void uploadImage(e)} />
      <div className="flex flex-wrap items-center gap-0.5 bg-zinc-50 border-b border-zinc-200 px-2 py-1.5">
        <Btn editor={editor} active={editor.isActive('bold')} onClick={() => editor.chain().focus().toggleBold().run()} label="Bold"><Bold size={15} /></Btn>
        <Btn editor={editor} active={editor.isActive('italic')} onClick={() => editor.chain().focus().toggleItalic().run()} label="Italic"><Italic size={15} /></Btn>
        <Divider />
        <Btn editor={editor} active={editor.isActive('heading', { level: 2 })} onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} label="Heading 2"><Heading2 size={15} /></Btn>
        <Btn editor={editor} active={editor.isActive('heading', { level: 3 })} onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()} label="Heading 3"><Heading3 size={15} /></Btn>
        <Divider />
        <Btn editor={editor} active={editor.isActive('bulletList')} onClick={() => editor.chain().focus().toggleBulletList().run()} label="Bullet list"><List size={15} /></Btn>
        <Btn editor={editor} active={editor.isActive('orderedList')} onClick={() => editor.chain().focus().toggleOrderedList().run()} label="Numbered list"><ListOrdered size={15} /></Btn>
        <Btn editor={editor} active={editor.isActive('blockquote')} onClick={() => editor.chain().focus().toggleBlockquote().run()} label="Quote"><Quote size={15} /></Btn>
        <Btn editor={editor} active={false} onClick={() => editor.chain().focus().setHorizontalRule().run()} label="Divider"><Minus size={15} /></Btn>
        <Divider />
        <Btn editor={editor} active={editor.isActive('link')} onClick={() => setLink(editor)} label="Link"><LinkIcon size={15} /></Btn>
        <Btn editor={editor} active={false} onClick={() => imgInputRef.current?.click()} label="Image"><ImageIcon size={15} /></Btn>
        <Divider />
        <Btn editor={editor} active={false} onClick={() => editor.chain().focus().undo().run()} label="Undo"><Undo size={15} /></Btn>
        <Btn editor={editor} active={false} onClick={() => editor.chain().focus().redo().run()} label="Redo"><Redo size={15} /></Btn>
      </div>
      <EditorContent editor={editor} style={{ minHeight }} />
    </div>
  )
}

function setLink(editor: Editor) {
  const prev = editor.getAttributes('link').href as string | undefined
  const url = window.prompt('Link URL', prev ?? 'https://')
  if (url === null) return
  if (url === '') { editor.chain().focus().extendMarkRange('link').unsetLink().run(); return }
  editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run()
}

function Divider() {
  return <span className="w-px h-5 bg-zinc-200 mx-1" aria-hidden="true" />
}

function Btn({ active, onClick, label, children }: { editor: Editor; active: boolean; onClick: () => void; label: string; children: React.ReactNode }) {
  return (
    <button
      type="button"
      title={label}
      aria-label={label}
      aria-pressed={active}
      onClick={onClick}
      className={['p-1.5 rounded transition-colors', active ? 'bg-zinc-200 text-zinc-900' : 'text-zinc-600 hover:bg-zinc-200'].join(' ')}
    >
      {children}
    </button>
  )
}
