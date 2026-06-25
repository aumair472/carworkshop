'use client'

type Status = 'draft' | 'published' | 'archived'

interface StatusToggleProps {
  value: Status
  onChange: (status: Status) => void
  disabled?: boolean
}

const STATUS_CONFIG: Record<Status, { label: string; color: string; bg: string }> = {
  draft: { label: 'Draft', color: 'text-[#D97706]', bg: 'bg-[#FEF3C7]' },
  published: { label: 'Published', color: 'text-[#059669]', bg: 'bg-[#D1FAE5]' },
  archived: { label: 'Archived', color: 'text-[#6B7280]', bg: 'bg-[#F3F4F6]' },
}

export function StatusToggle({ value, onChange, disabled }: StatusToggleProps) {
  return (
    <div className="flex gap-2">
      {(Object.keys(STATUS_CONFIG) as Status[]).map(status => {
        const cfg = STATUS_CONFIG[status]
        const isActive = value === status
        return (
          <button
            key={status}
            type="button"
            onClick={() => !disabled && onChange(status)}
            className={[
              'px-3 py-1.5 rounded-full text-xs font-semibold border transition-all',
              isActive
                ? `${cfg.bg} ${cfg.color} border-current`
                : 'bg-white text-[#9CA3AF] border-[#E5E7EB] hover:border-[#D1D5DB]',
              disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer',
            ].join(' ')}
            aria-pressed={isActive}
            disabled={disabled}
          >
            {cfg.label}
          </button>
        )
      })}
    </div>
  )
}
