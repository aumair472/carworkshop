'use client'

interface PillToggleProps {
  value: boolean
  onChange: (value: boolean) => void
  disabled?: boolean
  onLabel?: string
  offLabel?: string
}

// ServiceMyCar-style ON/OFF pill switch: green when on, gray when off.
export function PillToggle({ value, onChange, disabled, onLabel = 'ON', offLabel = 'OFF' }: PillToggleProps) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={value}
      disabled={disabled}
      onClick={() => onChange(!value)}
      className={[
        'relative inline-flex items-center h-[26px] w-[64px] rounded-md text-[11px] font-bold text-white transition-colors',
        disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer',
      ].join(' ')}
      style={{ backgroundColor: value ? '#22C55E' : '#9CA3AF' }}
    >
      <span className={['absolute inset-y-0 flex items-center', value ? 'left-2' : 'right-2'].join(' ')}>
        {value ? onLabel : offLabel}
      </span>
      <span
        className={['absolute top-[3px] h-[20px] w-[22px] rounded bg-white/90 shadow transition-all', value ? 'right-[3px]' : 'left-[3px]'].join(' ')}
      />
    </button>
  )
}
