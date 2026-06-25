'use client'

interface AdminTopbarProps {
  title: string
  actions?: React.ReactNode
}

export function AdminTopbar({ title, actions }: AdminTopbarProps) {
  return (
    <div className="h-14 bg-white border-b border-[#E5E7EB] flex items-center justify-between px-6 shrink-0">
      <h1 className="text-base font-bold text-[#1F2937]">{title}</h1>
      {actions && <div className="flex items-center gap-3">{actions}</div>}
    </div>
  )
}
