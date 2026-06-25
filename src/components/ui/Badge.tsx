import React from 'react'

type BadgeVariant = 'published' | 'draft' | 'archived' | 'new' | 'contacted' | 'in_progress' | 'converted' | 'closed' | 'info' | 'success' | 'warning' | 'danger'

interface BadgeProps {
  variant?: BadgeVariant
  children: React.ReactNode
  className?: string
}

const variants: Record<BadgeVariant, string> = {
  published: 'bg-[#D1FAE5] text-[#065F46]',
  draft: 'bg-[#FEF3C7] text-[#92400E]',
  archived: 'bg-[#F3F4F6] text-[#374151]',
  new: 'bg-[#DBEAFE] text-[#1E40AF]',
  contacted: 'bg-[#FEF3C7] text-[#92400E]',
  in_progress: 'bg-[#EDE9FE] text-[#5B21B6]',
  converted: 'bg-[#D1FAE5] text-[#065F46]',
  closed: 'bg-[#F3F4F6] text-[#374151]',
  info: 'bg-[#DBEAFE] text-[#1E40AF]',
  success: 'bg-[#D1FAE5] text-[#065F46]',
  warning: 'bg-[#FEF3C7] text-[#92400E]',
  danger: 'bg-[#FEE2E2] text-[#991B1B]',
}

export function Badge({ variant = 'info', children, className = '' }: BadgeProps) {
  return (
    <span className={['inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold', variants[variant], className].join(' ')}>
      {children}
    </span>
  )
}
