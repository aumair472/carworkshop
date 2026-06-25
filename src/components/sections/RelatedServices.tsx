import Link from 'next/link'
import type { Service } from '@/types'

interface RelatedServicesProps {
  services: Service[]
  brandSlug?: string
  modelSlug?: string
  currentServiceId?: string
}

export function RelatedServices({ services, brandSlug, modelSlug, currentServiceId }: RelatedServicesProps) {
  const filtered = services.filter(s => s.id !== currentServiceId).slice(0, 6)
  if (!filtered.length) return null

  return (
    <section className="py-10 border-t border-[#E5E7EB]" aria-labelledby="related-heading">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 id="related-heading" className="text-xl font-extrabold text-[#1F2937] mb-6">
          Related Services
        </h2>
        <div className="flex flex-wrap gap-3">
          {filtered.map(service => {
            const href = brandSlug && modelSlug
              ? `/brands/${brandSlug}/${modelSlug}/${service.slug}`
              : `/services/${service.slug}`
            return (
              <Link
                key={service.id}
                href={href}
                className="px-4 py-2 rounded-md border border-[#E5E7EB] text-sm font-medium text-[#374151] hover:border-[#4472C4] hover:text-[#4472C4] hover:bg-[#EEF3FB] transition-all"
              >
                {service.name}
              </Link>
            )
          })}
        </div>
      </div>
    </section>
  )
}
