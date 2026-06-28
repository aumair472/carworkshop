interface TrustItem {
  icon: string
  value: string
  label: string
}

const DEFAULT_ITEMS: TrustItem[] = [
  { icon: '⭐', value: '4.9/5', label: 'Average Rating' },
  { icon: '🚗', value: '10,000+', label: 'Cars Serviced' },
  { icon: '🔧', value: 'Certified', label: 'Technicians' },
  { icon: '📦', value: 'Free', label: 'Pickup & Delivery' },
]

interface TrustBarProps {
  items?: TrustItem[]
}

// Premium trust strip: elevated chip cards with an icon medallion.
export function TrustBar({ items = DEFAULT_ITEMS }: TrustBarProps) {
  return (
    <section className="bg-white py-8 lg:py-10 border-b border-hairline" aria-label="Trust statistics">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <ul className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          {items.map(item => (
            <li key={item.label} className="card-premium flex items-center gap-3 px-4 py-4 sm:px-5">
              <span className="shrink-0 h-11 w-11 rounded-xl bg-[#EEF3FB] flex items-center justify-center text-xl ring-1 ring-[#DCE6F6]" aria-hidden="true">{item.icon}</span>
              <div className="min-w-0">
                <p className="text-lg font-extrabold text-[#0F172A] leading-tight truncate">{item.value}</p>
                <p className="text-xs text-[#64748B] truncate">{item.label}</p>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}
