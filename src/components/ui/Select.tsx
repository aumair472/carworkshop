'use client'

import React from 'react'

interface SelectOption {
  value: string
  label: string
}

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string
  error?: string
  hint?: string
  options: SelectOption[]
  placeholder?: string
}

export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ label, error, hint, options, placeholder, id, className = '', ...props }, ref) => {
    const inputId = id ?? label?.toLowerCase().replace(/\s+/g, '-')

    return (
      <div className="flex flex-col gap-1">
        {label && (
          <label htmlFor={inputId} className="text-sm font-semibold text-[#1F2937]">
            {label}
            {props.required && <span className="text-[#DC2626] ml-1">*</span>}
          </label>
        )}
        <select
          ref={ref}
          id={inputId}
          {...props}
          className={[
            'w-full px-3.5 py-3 rounded-xl border text-[#1F2937] text-base bg-white transition-all',
            'focus:outline-none focus:ring-2 focus:ring-[#4472C4] focus:border-transparent',
            'disabled:bg-[#F9FAFB] disabled:cursor-not-allowed',
            error ? 'border-[#DC2626]' : 'border-[#E5E7EB]',
            className,
          ].join(' ')}
        >
          {placeholder && <option value="">{placeholder}</option>}
          {options.map(opt => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>
        {hint && !error && <p className="text-xs text-[#6B7280]">{hint}</p>}
        {error && <p className="text-xs text-[#DC2626]">{error}</p>}
      </div>
    )
  }
)

Select.displayName = 'Select'
