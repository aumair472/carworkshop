'use client'

import React from 'react'

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string
  error?: string
  hint?: string
  charCount?: boolean
  maxLength?: number
}

export const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ label, error, hint, charCount, maxLength, id, className = '', value, ...props }, ref) => {
    // Prefer `name` over `label` for the fallback id — see Input.tsx for why.
    const inputId = id ?? props.name ?? label?.toLowerCase().replace(/\s+/g, '-')
    const currentLength = typeof value === 'string' ? value.length : 0

    return (
      <div className="flex flex-col gap-1">
        {label && (
          <label htmlFor={inputId} className="text-sm font-semibold text-[#1F2937]">
            {label}
            {props.required && <span className="text-[#DC2626] ml-1">*</span>}
          </label>
        )}
        <textarea
          ref={ref}
          id={inputId}
          value={value}
          maxLength={maxLength}
          {...props}
          className={[
            'w-full px-3.5 py-3 rounded-xl border text-[#1F2937] text-base resize-y min-h-[100px] transition-all',
            'focus:outline-none focus:ring-2 focus:ring-[#4472C4] focus:border-transparent',
            'placeholder:text-[#9CA3AF]',
            'disabled:bg-[#F9FAFB] disabled:cursor-not-allowed',
            error ? 'border-[#DC2626] bg-[#FEF2F2]' : 'border-[#E5E7EB] bg-white',
            className,
          ].join(' ')}
        />
        <div className="flex justify-between items-start">
          <div>
            {hint && !error && <p className="text-xs text-[#6B7280]">{hint}</p>}
            {error && <p className="text-xs text-[#DC2626]">{error}</p>}
          </div>
          {charCount && maxLength && (
            <span className={`text-xs ${currentLength > maxLength * 0.9 ? 'text-[#D97706]' : 'text-[#9CA3AF]'}`}>
              {currentLength}/{maxLength}
            </span>
          )}
        </div>
      </div>
    )
  }
)

Textarea.displayName = 'Textarea'
