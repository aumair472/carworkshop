interface AdminCardProps {
  title?: string
  description?: string
  actions?: React.ReactNode
  children: React.ReactNode
  className?: string
  bodyClassName?: string
}

export function AdminCard({ title, description, actions, children, className = '', bodyClassName = '' }: AdminCardProps) {
  return (
    <section className={`bg-white rounded-xl border border-zinc-200 shadow-sm ${className}`}>
      {(title || actions) && (
        <header className="flex items-start justify-between gap-4 px-6 py-4 border-b border-zinc-200">
          <div>
            {title && <h2 className="text-sm font-semibold text-zinc-900">{title}</h2>}
            {description && <p className="text-xs text-zinc-500 mt-0.5">{description}</p>}
          </div>
          {actions && <div className="flex items-center gap-2 shrink-0">{actions}</div>}
        </header>
      )}
      <div className={`px-6 py-5 ${bodyClassName}`}>{children}</div>
    </section>
  )
}
