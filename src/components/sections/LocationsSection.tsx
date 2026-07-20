import Link from 'next/link'
import type { Location } from '@/types'

interface LocationsSectionProps {
  locations: Location[]
  title?: string
}

export function LocationsSection({ locations, title = 'Find Us Across UAE' }: LocationsSectionProps) {
  return (
    <section className="py-16 lg:py-24 bg-[#F8FAFC]" aria-labelledby="locations-heading">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 id="locations-heading" className="display-tight text-balance text-3xl sm:text-4xl font-extrabold text-[#0F172A] text-center mb-12">
          {title}
        </h2>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
          {locations.map(location => {
            return (
              <Link
                key={location.id}
                href="/contact"
                className="group card-premium flex items-center gap-3 p-5 text-left"
              >
                <div className="shrink-0 w-11 h-11 rounded-2xl bg-[#EEF3FB] ring-1 ring-[#DCE6F6] flex items-center justify-center group-hover:bg-[#FDEEE4] group-hover:ring-[#F6D2BC] transition-all">
                  <svg className="w-5 h-5 text-[#4472C4] group-hover:text-[#E8601C] transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </div>
                <div className="min-w-0">
                  <p className="font-bold text-[#0F172A] group-hover:text-[#274E96] transition-colors text-sm truncate">
                    {location.name}
                  </p>
                  {location.emirate && (
                    <p className="text-xs text-[#94A3B8] mt-0.5 truncate">{location.emirate}</p>
                  )}
                </div>
              </Link>
            )
          })}
        </div>
      </div>
    </section>
  )
}
