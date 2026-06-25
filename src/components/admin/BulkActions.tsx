'use client'

interface BulkAction {
  label: string
  onClick: () => void
  variant?: 'danger' | 'primary' | 'secondary'
  disabled?: boolean
}

interface BulkActionsProps {
  selectedCount: number
  actions: BulkAction[]
  onClearSelection: () => void
}

const VARIANT_CLASSES = {
  primary: 'bg-[#4472C4] text-white hover:bg-[#3563B0]',
  secondary: 'bg-white text-[#374151] border border-[#D1D5DB] hover:bg-[#F9FAFB]',
  danger: 'bg-[#DC2626] text-white hover:bg-[#B91C1C]',
}

export function BulkActions({ selectedCount, actions, onClearSelection }: BulkActionsProps) {
  if (selectedCount === 0) return null

  return (
    <div className="flex items-center gap-3 px-4 py-3 bg-[#EEF3FB] border border-[#C7D9F5] rounded-lg">
      <span className="text-sm font-medium text-[#4472C4]">
        {selectedCount} selected
      </span>
      <button
        type="button"
        onClick={onClearSelection}
        className="text-xs text-[#6B7280] hover:text-[#374151]"
      >
        Clear
      </button>
      <div className="flex-1" />
      <div className="flex items-center gap-2">
        {actions.map(action => (
          <button
            key={action.label}
            type="button"
            onClick={action.onClick}
            disabled={action.disabled}
            className={[
              'px-3 py-1.5 rounded-md text-xs font-semibold transition-colors',
              VARIANT_CLASSES[action.variant ?? 'secondary'],
              action.disabled ? 'opacity-50 cursor-not-allowed' : '',
            ].join(' ')}
          >
            {action.label}
          </button>
        ))}
      </div>
    </div>
  )
}
