'use client'

import { useState } from 'react'
import { ChevronDown, Eye, EyeOff } from 'lucide-react'

interface AdminSectionCardProps {
  title: string
  description?: string
  visible?: boolean
  onVisibleChange?: (v: boolean) => void
  defaultOpen?: boolean
  children: React.ReactNode
}

// Collapsible section card with an optional visible/hidden eye toggle.
// Used by the static page editors (home/about/contact/faq).
export function AdminSectionCard({ title, description, visible, onVisibleChange, defaultOpen = true, children }: AdminSectionCardProps) {
  const [open, setOpen] = useState(defaultOpen)
  const hidden = visible === false

  return (
    <section className={`bg-white rounded-xl border shadow-sm transition-colors ${hidden ? 'border-zinc-200 opacity-75' : 'border-zinc-200'}`}>
      <header className="flex items-center justify-between gap-3 px-5 py-3.5">
        <button type="button" onClick={() => setOpen(o => !o)} className="flex items-center gap-2 min-w-0 text-left">
          <ChevronDown size={16} className={`text-zinc-400 shrink-0 transition-transform ${open ? '' : '-rotate-90'}`} />
          <span className="min-w-0">
            <span className="block text-sm font-semibold text-zinc-900 truncate">{title}</span>
            {description && <span className="block text-xs text-zinc-400 truncate">{description}</span>}
          </span>
        </button>
        {onVisibleChange && (
          <button
            type="button"
            onClick={() => onVisibleChange(hidden)}
            title={hidden ? 'Hidden — click to show' : 'Visible — click to hide'}
            aria-pressed={!hidden}
            className={`inline-flex items-center gap-1.5 text-xs font-medium px-2 py-1 rounded-md shrink-0 ${hidden ? 'text-zinc-400 hover:bg-zinc-100' : 'text-green-600 hover:bg-green-50'}`}
          >
            {hidden ? <EyeOff size={14} /> : <Eye size={14} />}
            {hidden ? 'Hidden' : 'Visible'}
          </button>
        )}
      </header>
      {open && <div className="px-5 pb-5 pt-1 border-t border-zinc-100 space-y-4">{children}</div>}
    </section>
  )
}
