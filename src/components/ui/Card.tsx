import React from 'react'

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  padding?: 'sm' | 'md' | 'lg' | 'none'
  hover?: boolean
}

const paddings = {
  none: '',
  sm: 'p-4',
  md: 'p-6',
  lg: 'p-8',
}

export function Card({ padding = 'md', hover = false, className = '', children, ...props }: CardProps) {
  return (
    <div
      {...props}
      className={[
        'bg-white rounded-2xl border border-hairline',
        'shadow-[var(--shadow-card)]',
        hover ? 'transition-all duration-250 hover:shadow-[var(--shadow-hover)] hover:-translate-y-0.5 hover:border-[#DCE6F6]' : '',
        paddings[padding],
        className,
      ].join(' ')}
    >
      {children}
    </div>
  )
}
