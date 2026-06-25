import React from 'react'
import type { FAQItem } from '@/types'

interface AccordionProps {
  items: FAQItem[]
  className?: string
}

export function Accordion({ items, className = '' }: AccordionProps) {
  return (
    <div className={['divide-y divide-[#E5E7EB] border-t border-[#E5E7EB]', className].join(' ')}>
      {items.map((item, index) => (
        <details key={index} className="group border-b border-[#E5E7EB]">
          <summary className="flex items-center justify-between gap-4 py-4 cursor-pointer list-none font-semibold text-[#1F2937] hover:text-[#4472C4] transition-colors">
            <span>{item.question}</span>
            <svg
              className="w-5 h-5 shrink-0 text-[#6B7280] group-open:rotate-45 transition-transform duration-150"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
          </summary>
          <div className="pb-4 text-[#6B7280] text-sm leading-relaxed">
            {item.answer}
          </div>
        </details>
      ))}
    </div>
  )
}
