'use client'

import { useState } from 'react'
import type { PageContent } from '@/types'

type WarrantyPolicy = NonNullable<PageContent['warranty_policy']>
type WarrantyKey = keyof WarrantyPolicy

const TAB_LABELS: Record<WarrantyKey, string> = {
  service: 'Service',
  electrical: 'Electrical',
  ac: 'A/C',
  batteries: 'Batteries',
}

interface WarrantyTabsProps {
  policy: WarrantyPolicy
  title?: string
}

// 4-tab warranty policy switcher (Service / Electrical / A/C / Batteries).
export function WarrantyTabs({ policy, title = 'Our Warranty Policy' }: WarrantyTabsProps) {
  const tabs = (Object.keys(TAB_LABELS) as WarrantyKey[]).filter(key => policy[key])
  const [active, setActive] = useState<WarrantyKey | null>(tabs[0] ?? null)

  if (!tabs.length || !active) return null
  const current = policy[active]

  return (
    <section className="py-14 lg:py-20 bg-[#F9FAFB]" aria-labelledby="warranty-heading">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 id="warranty-heading" className="display-tight text-balance text-2xl sm:text-3xl font-extrabold text-[#1F2937] text-center mb-8">
          {title}
        </h2>

        <div className="flex flex-wrap justify-center gap-2 mb-8" role="tablist">
          {tabs.map(key => (
            <button
              key={key}
              type="button"
              role="tab"
              aria-selected={active === key}
              onClick={() => setActive(key)}
              className={`px-5 py-2.5 rounded-full text-sm font-semibold transition-all ${
                active === key
                  ? 'bg-[#4472C4] text-white'
                  : 'bg-white text-[#374151] border border-[#E5E7EB] hover:border-[#4472C4]'
              }`}
            >
              {TAB_LABELS[key]}
            </button>
          ))}
        </div>

        {current && (
          <div className="card-premium p-6" role="tabpanel">
            <p className="text-lg font-bold text-[#4472C4] mb-4">
              {current.months} months / {current.km.toLocaleString()} km warranty
            </p>
            <ul className="space-y-2">
              {current.items.map((item, i) => (
                <li key={i} className="flex items-start gap-2 text-[#374151] text-sm">
                  <span className="text-[#22C55E] mt-0.5">✓</span>{item}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </section>
  )
}
