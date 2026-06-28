import React from 'react'
import type { FAQItem } from '@/types'

interface AccordionProps {
  items: FAQItem[]
  className?: string
}

export function Accordion({ items, className = '' }: AccordionProps) {
  return (
    <div className={['space-y-3', className].join(' ')}>
      {items.map((item, index) => (
        <details key={index} className="group card-premium open:ring-1 open:ring-[#DCE6F6] px-5">
          <summary className="flex items-center justify-between gap-4 py-4 cursor-pointer list-none font-semibold text-[#0F172A] group-hover:text-[#274E96] transition-colors">
            <span>{item.question}</span>
            <span className="shrink-0 h-7 w-7 rounded-full bg-[#EEF3FB] flex items-center justify-center ring-1 ring-[#DCE6F6]">
              <svg
                className="w-4 h-4 text-[#4472C4] group-open:rotate-45 transition-transform duration-200"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
            </span>
          </summary>
          <div className="pb-5 -mt-1 text-[#475569] text-sm leading-relaxed">
            {item.answer}
          </div>
        </details>
      ))}
    </div>
  )
}
