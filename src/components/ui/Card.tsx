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
        'bg-white rounded-lg border border-[#E5E7EB]',
        'shadow-[0_1px_3px_rgba(0,0,0,0.10),_0_1px_2px_rgba(0,0,0,0.06)]',
        hover ? 'transition-shadow duration-150 hover:shadow-[0_10px_15px_-3px_rgba(0,0,0,0.10),_0_4px_6px_-2px_rgba(0,0,0,0.05)]' : '',
        paddings[padding],
        className,
      ].join(' ')}
    >
      {children}
    </div>
  )
}
