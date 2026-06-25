import React from 'react'

type AlertVariant = 'success' | 'warning' | 'danger' | 'info'

interface AlertProps {
  variant?: AlertVariant
  title?: string
  children: React.ReactNode
  onDismiss?: () => void
  className?: string
}

const styles: Record<AlertVariant, { container: string; icon: React.ReactNode }> = {
  success: {
    container: 'bg-[#D1FAE5] border-[#059669] text-[#065F46]',
    icon: (
      <svg className="w-5 h-5 text-[#059669] shrink-0" fill="currentColor" viewBox="0 0 20 20">
        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
      </svg>
    ),
  },
  warning: {
    container: 'bg-[#FEF3C7] border-[#D97706] text-[#92400E]',
    icon: (
      <svg className="w-5 h-5 text-[#D97706] shrink-0" fill="currentColor" viewBox="0 0 20 20">
        <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
      </svg>
    ),
  },
  danger: {
    container: 'bg-[#FEE2E2] border-[#DC2626] text-[#991B1B]',
    icon: (
      <svg className="w-5 h-5 text-[#DC2626] shrink-0" fill="currentColor" viewBox="0 0 20 20">
        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
      </svg>
    ),
  },
  info: {
    container: 'bg-[#DBEAFE] border-[#3B82F6] text-[#1E40AF]',
    icon: (
      <svg className="w-5 h-5 text-[#3B82F6] shrink-0" fill="currentColor" viewBox="0 0 20 20">
        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
      </svg>
    ),
  },
}

export function Alert({ variant = 'info', title, children, onDismiss, className }: AlertProps) {
  const style = styles[variant]
  return (
    <div className={['flex gap-3 p-4 rounded-md border', style.container, className ?? ''].join(' ')} role="alert">
      {style.icon}
      <div className="flex-1">
        {title && <p className="font-semibold text-sm mb-1">{title}</p>}
        <div className="text-sm">{children}</div>
      </div>
      {onDismiss && (
        <button onClick={onDismiss} className="shrink-0 self-start hover:opacity-70" aria-label="Dismiss">
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
          </svg>
        </button>
      )}
    </div>
  )
}
