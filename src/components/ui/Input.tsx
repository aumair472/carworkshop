'use client'

import React from 'react'

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
  hint?: string
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, hint, id, className = '', ...props }, ref) => {
    const inputId = id ?? label?.toLowerCase().replace(/\s+/g, '-')

    return (
      <div className="flex flex-col gap-1">
        {label && (
          <label htmlFor={inputId} className="text-sm font-semibold text-[#1F2937]">
            {label}
            {props.required && <span className="text-[#DC2626] ml-1">*</span>}
          </label>
        )}
        <input
          ref={ref}
          id={inputId}
          {...props}
          className={[
            'w-full px-3 py-2.5 rounded-md border text-[#1F2937] text-base',
            'focus:outline-none focus:ring-2 focus:ring-[#4472C4] focus:border-[#4472C4]',
            'placeholder:text-[#9CA3AF]',
            'disabled:bg-[#F9FAFB] disabled:cursor-not-allowed',
            error ? 'border-[#DC2626] bg-[#FEF2F2]' : 'border-[#E5E7EB] bg-white',
            className,
          ].join(' ')}
        />
        {hint && !error && <p className="text-xs text-[#6B7280]">{hint}</p>}
        {error && <p className="text-xs text-[#DC2626]">{error}</p>}
      </div>
    )
  }
)

Input.displayName = 'Input'
