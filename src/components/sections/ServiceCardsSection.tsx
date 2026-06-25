import Link from 'next/link'
import Image from 'next/image'
import { Card } from '@/components/ui/Card'
import type { ServiceWithPrice } from '@/types'

interface ServiceCardsSectionProps {
  services: ServiceWithPrice[]
  title?: string
  subtitle?: string
  brandSlug?: string
  modelSlug?: string
}

export function ServiceCardsSection({
  services,
  title = 'Our Services',
  subtitle,
  brandSlug,
  modelSlug,
}: ServiceCardsSectionProps) {
  return (
    <section className="py-14 lg:py-20" aria-labelledby="services-heading">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-10">
          <h2 id="services-heading" className="text-2xl sm:text-3xl font-extrabold text-[#1F2937] mb-3">
            {title}
          </h2>
          {subtitle && <p className="text-[#6B7280] max-w-2xl mx-auto">{subtitle}</p>}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {services.map(service => {
            const href = brandSlug && modelSlug
              ? `/brands/${brandSlug}/${modelSlug}/${service.slug}`
              : `/services/${service.slug}`

            return (
              <Card key={service.id} hover padding="lg" className="flex flex-col">
                {service.icon_url && (
                  <div className="w-12 h-12 rounded-xl bg-[#EEF3FB] flex items-center justify-center mb-4">
                    <Image src={service.icon_url} alt="" width={28} height={28} aria-hidden="true" />
                  </div>
                )}
                {!service.icon_url && (
                  <div className="w-12 h-12 rounded-xl bg-[#EEF3FB] flex items-center justify-center mb-4">
                    <svg className="w-6 h-6 text-[#4472C4]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  </div>
                )}

                <h3 className="text-lg font-bold text-[#1F2937] mb-2">{service.name}</h3>
                {service.short_description && (
                  <p className="text-sm text-[#6B7280] leading-relaxed flex-1 mb-4">{service.short_description}</p>
                )}

                {service.starting_price && (
                  <p className="text-sm font-semibold text-[#E8601C] mb-4">
                    From AED {service.starting_price}
                  </p>
                )}

                <Link
                  href={href}
                  className="mt-auto inline-flex items-center justify-center w-full py-2.5 rounded-md border-2 border-[#4472C4] text-[#4472C4] font-semibold text-sm hover:bg-[#4472C4] hover:text-white transition-colors"
                >
                  View Details
                </Link>
              </Card>
            )
          })}
        </div>
      </div>
    </section>
  )
}
