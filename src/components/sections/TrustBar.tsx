import type { TrustStat } from '@/types'

const DEFAULT_STATS: TrustStat[] = [
  { label: 'Repairs Completed', value: '50,000+' },
  { label: 'Expert Technicians', value: '200+' },
  { label: 'UAE Locations', value: '7' },
  { label: 'Customer Rating', value: '4.9★' },
]

interface TrustBarProps {
  stats?: TrustStat[]
}

export function TrustBar({ stats = DEFAULT_STATS }: TrustBarProps) {
  return (
    <section className="bg-[#F0F4FF] border-y border-[#C7D9F5] py-6" aria-label="Trust statistics">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <dl className="grid grid-cols-2 sm:grid-cols-4 gap-6 text-center">
          {stats.map(stat => (
            <div key={stat.label}>
              <dt className="text-sm text-[#6B7280] font-medium">{stat.label}</dt>
              <dd className="text-2xl font-extrabold text-[#4472C4] mt-1">{stat.value}</dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  )
}
