type BadgeKind = 'published' | 'draft' | 'archived' | 'new' | 'contacted' | 'converted' | 'closed' | 'in_progress'

const STYLES: Record<BadgeKind, string> = {
  published: 'bg-green-50 text-green-700 border-green-200',
  draft: 'bg-amber-50 text-amber-700 border-amber-200',
  archived: 'bg-zinc-100 text-zinc-600 border-zinc-200',
  new: 'bg-blue-50 text-blue-700 border-blue-200',
  contacted: 'bg-amber-50 text-amber-700 border-amber-200',
  converted: 'bg-green-50 text-green-700 border-green-200',
  closed: 'bg-zinc-100 text-zinc-600 border-zinc-200',
  in_progress: 'bg-blue-50 text-blue-700 border-blue-200',
}

const DOT: Record<BadgeKind, string> = {
  published: 'bg-green-500',
  draft: 'bg-amber-500',
  archived: 'bg-zinc-400',
  new: 'bg-blue-500',
  contacted: 'bg-amber-500',
  converted: 'bg-green-500',
  closed: 'bg-zinc-400',
  in_progress: 'bg-blue-500',
}

export function AdminBadge({ kind, children }: { kind: BadgeKind; children?: React.ReactNode }) {
  return (
    <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium border ${STYLES[kind]}`}>
      <span className={`h-1.5 w-1.5 rounded-full ${DOT[kind]}`} aria-hidden="true" />
      {children ?? kind.replace('_', ' ')}
    </span>
  )
}
