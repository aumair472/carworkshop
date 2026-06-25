import Link from 'next/link'
import type { Location } from '@/types'

interface LocationsSectionProps {
  locations: Location[]
  title?: string
  serviceSlug?: string
}

export function LocationsSection({ locations, title = 'Find Us Across UAE', serviceSlug }: LocationsSectionProps) {
  return (
    <section className="py-14 bg-[#F9FAFB]" aria-labelledby="locations-heading">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 id="locations-heading" className="text-2xl sm:text-3xl font-extrabold text-[#1F2937] text-center mb-10">
          {title}
        </h2>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {locations.map(location => {
            const href = serviceSlug
              ? `/services/${serviceSlug}/${location.slug}`
              : `/locations/${location.slug}`

            return (
              <Link
                key={location.id}
                href={href}
                className="group flex flex-col items-center gap-3 p-6 bg-white rounded-lg border border-[#E5E7EB] hover:border-[#4472C4] hover:shadow-md transition-all duration-150 text-center"
              >
                <div className="w-10 h-10 rounded-full bg-[#EEF3FB] flex items-center justify-center group-hover:bg-[#4472C4] transition-colors">
                  <svg className="w-5 h-5 text-[#4472C4] group-hover:text-white transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </div>
                <div>
                  <p className="font-bold text-[#1F2937] group-hover:text-[#4472C4] transition-colors text-sm">
                    {location.name}
                  </p>
                  {location.emirate && (
                    <p className="text-xs text-[#9CA3AF] mt-0.5">{location.emirate}</p>
                  )}
                </div>
              </Link>
            )
          })}
        </div>

        <div className="text-center mt-8">
          <Link href="/locations" className="text-[#4472C4] font-semibold hover:underline">
            View All Locations →
          </Link>
        </div>
      </div>
    </section>
  )
}
