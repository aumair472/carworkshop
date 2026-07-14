'use client'

import { useRef, useState } from 'react'
import toast from 'react-hot-toast'
import { useEditor, EditorContent, type Editor } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Link from '@tiptap/extension-link'
import Image from '@tiptap/extension-image'
import { TableKit } from '@tiptap/extension-table'
import TextAlign from '@tiptap/extension-text-align'
import { TextStyleKit } from '@tiptap/extension-text-style'
import Subscript from '@tiptap/extension-subscript'
import Superscript from '@tiptap/extension-superscript'
import {
  Code2, Bold, Italic, Underline as UnderlineIcon, Strikethrough,
  Subscript as SubIcon, Superscript as SupIcon, List, ListOrdered,
  Quote, Minus, Link as LinkIcon, Unlink, Image as ImageIcon,
  Table as TableIcon, Trash2, AlignLeft, AlignCenter, AlignRight, AlignJustify,
  RemoveFormatting, Undo, Redo,
} from 'lucide-react'

interface RichTextEditorProps {
  value: string
  onChange: (html: string) => void
  placeholder?: string
  minHeight?: number
  /** 'rtl' for Arabic content fields. */
  dir?: 'ltr' | 'rtl'
}

const FONTS = ['Arial', 'Georgia', 'Tahoma', 'Times New Roman', 'Verdana', 'Courier New']
const SIZES = ['12px', '14px', '16px', '18px', '20px', '24px', '28px', '32px']
const FORMATS = [
  { label: 'Normal', value: 'p' },
  { label: 'Heading 1', value: 'h1' },
  { label: 'Heading 2', value: 'h2' },
  { label: 'Heading 3', value: 'h3' },
  { label: 'Heading 4', value: 'h4' },
  { label: 'Heading 5', value: 'h5' },
  { label: 'Heading 6', value: 'h6' },
] as const

export function RichTextEditor({ value, onChange, placeholder = 'Write content…', minHeight = 200, dir = 'ltr' }: RichTextEditorProps) {
  const [sourceMode, setSourceMode] = useState(false)
  const [sourceHtml, setSourceHtml] = useState('')

  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit.configure({ link: false }),
      Link.configure({ openOnClick: false, HTMLAttributes: { rel: 'noopener noreferrer' } }),
      Image,
      TableKit.configure({ table: { resizable: false } }),
      TextAlign.configure({ types: ['heading', 'paragraph'] }),
      TextStyleKit,
      Subscript,
      Superscript,
    ],
    content: value || '',
    editorProps: {
      attributes: { class: 'rich-content max-w-none p-4 focus:outline-none', 'data-placeholder': placeholder, dir },
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

  function toggleSource() {
    if (!editor) return
    if (sourceMode) {
      editor.commands.setContent(sourceHtml)
      onChange(sourceHtml)
      setSourceMode(false)
    } else {
      setSourceHtml(editor.getHTML())
      setSourceMode(true)
    }
  }

  function currentFormat(): string {
    if (!editor) return 'p'
    for (let level = 1; level <= 6; level++) {
      if (editor.isActive('heading', { level })) return `h${level}`
    }
    return 'p'
  }

  function applyFormat(value: string) {
    if (!editor) return
    if (value === 'p') editor.chain().focus().setParagraph().run()
    else editor.chain().focus().toggleHeading({ level: Number(value[1]) as 1 | 2 | 3 | 4 | 5 | 6 }).run()
  }

  if (!editor) {
    return <div className="border border-zinc-300 rounded-lg bg-white" style={{ minHeight }} />
  }

  return (
    <div className="admin-rte border border-[#D1D5DB] rounded overflow-hidden bg-white">
      <input ref={imgInputRef} type="file" accept="image/*" className="sr-only" onChange={e => void uploadImage(e)} />

      {/* Toolbar row 1 */}
      <div className="flex flex-wrap items-center gap-0.5 bg-[#F3F4F6] border-b border-[#E5E7EB] px-2 py-1">
        <button
          type="button"
          onClick={toggleSource}
          className={['flex items-center gap-1 px-1.5 py-1 rounded text-xs font-semibold', sourceMode ? 'bg-[#1F2937] text-white' : 'text-[#374151] hover:bg-[#E5E7EB]'].join(' ')}
          title="Source"
        >
          <Code2 size={14} /> Source
        </button>
        <Divider />
        <Btn active={editor.isActive('bold')} onClick={() => editor.chain().focus().toggleBold().run()} label="Bold"><Bold size={14} /></Btn>
        <Btn active={editor.isActive('italic')} onClick={() => editor.chain().focus().toggleItalic().run()} label="Italic"><Italic size={14} /></Btn>
        <Btn active={editor.isActive('underline')} onClick={() => editor.chain().focus().toggleUnderline().run()} label="Underline"><UnderlineIcon size={14} /></Btn>
        <Btn active={editor.isActive('strike')} onClick={() => editor.chain().focus().toggleStrike().run()} label="Strikethrough"><Strikethrough size={14} /></Btn>
        <Btn active={editor.isActive('subscript')} onClick={() => editor.chain().focus().toggleSubscript().run()} label="Subscript"><SubIcon size={14} /></Btn>
        <Btn active={editor.isActive('superscript')} onClick={() => editor.chain().focus().toggleSuperscript().run()} label="Superscript"><SupIcon size={14} /></Btn>
        <Divider />
        <Btn active={editor.isActive('orderedList')} onClick={() => editor.chain().focus().toggleOrderedList().run()} label="Numbered list"><ListOrdered size={14} /></Btn>
        <Btn active={editor.isActive('bulletList')} onClick={() => editor.chain().focus().toggleBulletList().run()} label="Bullet list"><List size={14} /></Btn>
        <Btn active={editor.isActive('blockquote')} onClick={() => editor.chain().focus().toggleBlockquote().run()} label="Quote"><Quote size={14} /></Btn>
        <Btn active={false} onClick={() => editor.chain().focus().setHorizontalRule().run()} label="Horizontal rule"><Minus size={14} /></Btn>
        <Divider />
        <Btn active={editor.isActive('link')} onClick={() => setLink(editor)} label="Link"><LinkIcon size={14} /></Btn>
        <Btn active={false} onClick={() => editor.chain().focus().extendMarkRange('link').unsetLink().run()} label="Unlink"><Unlink size={14} /></Btn>
        <Btn active={false} onClick={() => imgInputRef.current?.click()} label="Image"><ImageIcon size={14} /></Btn>
        <Btn active={editor.isActive('table')} onClick={() => editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run()} label="Insert table"><TableIcon size={14} /></Btn>
        {editor.isActive('table') && (
          <Btn active={false} onClick={() => editor.chain().focus().deleteTable().run()} label="Delete table"><Trash2 size={14} /></Btn>
        )}
        <Divider />
        <Btn active={editor.isActive({ textAlign: 'left' })} onClick={() => editor.chain().focus().toggleTextAlign('left').run()} label="Align left"><AlignLeft size={14} /></Btn>
        <Btn active={editor.isActive({ textAlign: 'center' })} onClick={() => editor.chain().focus().toggleTextAlign('center').run()} label="Align center"><AlignCenter size={14} /></Btn>
        <Btn active={editor.isActive({ textAlign: 'right' })} onClick={() => editor.chain().focus().toggleTextAlign('right').run()} label="Align right"><AlignRight size={14} /></Btn>
        <Btn active={editor.isActive({ textAlign: 'justify' })} onClick={() => editor.chain().focus().toggleTextAlign('justify').run()} label="Justify"><AlignJustify size={14} /></Btn>
        <Divider />
        <Btn active={false} onClick={() => editor.chain().focus().unsetAllMarks().clearNodes().run()} label="Remove format"><RemoveFormatting size={14} /></Btn>
        <Btn active={false} onClick={() => editor.chain().focus().undo().run()} label="Undo"><Undo size={14} /></Btn>
        <Btn active={false} onClick={() => editor.chain().focus().redo().run()} label="Redo"><Redo size={14} /></Btn>
      </div>

      {/* Toolbar row 2 — dropdowns + colors */}
      <div className="flex flex-wrap items-center gap-1.5 bg-[#F3F4F6] border-b border-[#E5E7EB] px-2 py-1">
        <select
          value={currentFormat()}
          onChange={e => applyFormat(e.target.value)}
          className="h-7 text-xs rounded border border-[#D1D5DB] bg-white px-1.5 text-[#374151]"
          aria-label="Format"
        >
          {FORMATS.map(f => <option key={f.value} value={f.value}>{f.label}</option>)}
        </select>
        <select
          defaultValue=""
          onChange={e => { if (e.target.value) editor.chain().focus().setFontFamily(e.target.value).run(); e.target.value = '' }}
          className="h-7 text-xs rounded border border-[#D1D5DB] bg-white px-1.5 text-[#374151]"
          aria-label="Font"
        >
          <option value="" disabled>Font</option>
          {FONTS.map(f => <option key={f} value={f}>{f}</option>)}
        </select>
        <select
          defaultValue=""
          onChange={e => { if (e.target.value) editor.chain().focus().setFontSize(e.target.value).run(); e.target.value = '' }}
          className="h-7 text-xs rounded border border-[#D1D5DB] bg-white px-1.5 text-[#374151]"
          aria-label="Size"
        >
          <option value="" disabled>Size</option>
          {SIZES.map(s => <option key={s} value={s}>{s.replace('px', '')}</option>)}
        </select>
        <label className="flex items-center gap-1 text-xs text-[#374151] cursor-pointer" title="Text color">
          <span className="font-bold underline decoration-2">A</span>
          <input
            type="color"
            className="h-6 w-7 p-0 border border-[#D1D5DB] rounded cursor-pointer"
            onChange={e => editor.chain().focus().setColor(e.target.value).run()}
            aria-label="Text color"
          />
        </label>
        <label className="flex items-center gap-1 text-xs text-[#374151] cursor-pointer" title="Background color">
          <span className="font-bold px-0.5 bg-yellow-200">A</span>
          <input
            type="color"
            className="h-6 w-7 p-0 border border-[#D1D5DB] rounded cursor-pointer"
            onChange={e => editor.chain().focus().setBackgroundColor(e.target.value).run()}
            aria-label="Background color"
          />
        </label>
        <button
          type="button"
          onClick={() => editor.chain().focus().unsetColor().unsetBackgroundColor().run()}
          className="h-7 px-1.5 rounded text-xs font-bold text-[#EF4444] hover:bg-[#E5E7EB]"
          title="Clear colors"
        >
          ⌫A
        </button>
      </div>

      {sourceMode ? (
        <textarea
          value={sourceHtml}
          onChange={e => setSourceHtml(e.target.value)}
          className="w-full p-4 font-mono text-xs text-[#1F2937] focus:outline-none resize-y"
          style={{ minHeight }}
          spellCheck={false}
        />
      ) : (
        <EditorContent editor={editor} style={{ minHeight }} dir={dir} />
      )}
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
  return <span className="w-px h-5 bg-[#D1D5DB] mx-1" aria-hidden="true" />
}

function Btn({ active, onClick, label, children }: { active: boolean; onClick: () => void; label: string; children: React.ReactNode }) {
  return (
    <button
      type="button"
      title={label}
      aria-label={label}
      aria-pressed={active}
      onClick={onClick}
      className={['p-1.5 rounded transition-colors', active ? 'bg-[#D1D5DB] text-[#1F2937]' : 'text-[#4B5563] hover:bg-[#E5E7EB]'].join(' ')}
    >
      {children}
    </button>
  )
}
