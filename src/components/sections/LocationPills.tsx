import Link from 'next/link'
import type { Location } from '@/types'

interface LocationPillsProps {
  locations: Location[]
  brandSlug?: string
  modelSlug?: string
  serviceSlug?: string
  currentLocationId?: string
}

export function LocationPills({ locations, brandSlug, modelSlug, serviceSlug, currentLocationId }: LocationPillsProps) {
  const filtered = locations.filter(l => l.id !== currentLocationId)
  if (!filtered.length) return null

  function getHref(location: Location) {
    if (brandSlug && modelSlug && serviceSlug) {
      return `/brands/${brandSlug}/${modelSlug}/${serviceSlug}/${location.slug}`
    }
    if (serviceSlug) {
      return `/services/${serviceSlug}/${location.slug}`
    }
    return `/locations/${location.slug}`
  }

  return (
    <section className="py-8 border-t border-[#E5E7EB]" aria-label="Service locations">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <p className="text-sm font-semibold text-[#374151] mb-3">Also Available In:</p>
        <div className="flex flex-wrap gap-2">
          {filtered.map(location => (
            <Link
              key={location.id}
              href={getHref(location)}
              className="px-3 py-1.5 rounded-full border border-[#E5E7EB] text-xs font-medium text-[#6B7280] hover:border-[#4472C4] hover:text-[#4472C4] transition-colors"
            >
              {location.name}
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}
