interface EmptyStateProps {
  icon?: React.ReactNode
  title: string
  description?: string
  action?: React.ReactNode
}

export function EmptyState({ icon, title, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center text-center py-16 px-6">
      {icon && <div className="h-12 w-12 rounded-xl bg-zinc-100 text-zinc-400 flex items-center justify-center mb-4">{icon}</div>}
      <h3 className="text-sm font-semibold text-zinc-900">{title}</h3>
      {description && <p className="text-sm text-zinc-500 mt-1 max-w-sm">{description}</p>}
      {action && <div className="mt-5">{action}</div>}
    </div>
  )
}

interface ErrorStateProps {
  title?: string
  description?: string
  onRetry?: () => void
}

export function ErrorState({ title = 'Something went wrong', description = 'Please check your connection and try again.', onRetry }: ErrorStateProps) {
  return (
    <div className="flex flex-col items-center justify-center text-center py-16 px-6">
      <div className="h-12 w-12 rounded-xl bg-red-50 text-red-500 flex items-center justify-center mb-4 text-xl">⚠️</div>
      <h3 className="text-sm font-semibold text-zinc-900">{title}</h3>
      <p className="text-sm text-zinc-500 mt-1 max-w-sm">{description}</p>
      {onRetry && <button onClick={onRetry} className="mt-5 px-4 py-2 rounded-lg border border-zinc-300 text-sm font-medium text-zinc-700 hover:bg-zinc-50">Retry</button>}
    </div>
  )
}

// Pulsing skeleton rows for table loading states.
export function SkeletonRows({ rows = 6, cols = 4 }: { rows?: number; cols?: number }) {
  return (
    <div className="animate-pulse divide-y divide-zinc-100">
      {Array.from({ length: rows }).map((_, r) => (
        <div key={r} className="flex items-center gap-4 px-5 py-3.5">
          {Array.from({ length: cols }).map((_, c) => (
            <div key={c} className="h-3.5 bg-zinc-200 rounded" style={{ width: c === 0 ? '30%' : `${100 / cols}%` }} />
          ))}
        </div>
      ))}
    </div>
  )
}

// Pulsing skeleton cards for grid loading states.
export function SkeletonCards({ count = 6 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 animate-pulse">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="bg-white rounded-xl border border-zinc-200 p-5 space-y-3">
          <div className="h-10 w-10 bg-zinc-200 rounded-lg" />
          <div className="h-4 bg-zinc-200 rounded w-2/3" />
          <div className="h-3 bg-zinc-100 rounded w-1/2" />
        </div>
      ))}
    </div>
  )
}
