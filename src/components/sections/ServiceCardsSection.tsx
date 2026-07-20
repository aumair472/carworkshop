import Link from 'next/link'
import Image from 'next/image'
import type { ServiceWithPrice } from '@/types'

interface ServiceCardsSectionProps {
  services: ServiceWithPrice[]
  title?: string
  subtitle?: string
}

export function ServiceCardsSection({
  services,
  title = 'Our Services',
  subtitle,
}: ServiceCardsSectionProps) {
  return (
    <section className="py-16 lg:py-24" aria-labelledby="services-heading">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12 max-w-2xl mx-auto">
          <h2 id="services-heading" className="display-tight text-balance text-3xl sm:text-4xl font-extrabold text-[#0F172A] mb-3">
            {title}
          </h2>
          {subtitle && <p className="text-pretty text-[#64748B] text-lg">{subtitle}</p>}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 lg:gap-6">
          {services.map(service => {
            return (
              <Link key={service.id} href="/contact" className="group card-premium flex flex-col p-6 lg:p-7">
                <div className="w-12 h-12 rounded-2xl bg-[#EEF3FB] ring-1 ring-[#DCE6F6] flex items-center justify-center mb-5 group-hover:bg-[#FDEEE4] group-hover:ring-[#F6D2BC] transition-all">
                  {service.icon_url ? (
                    <Image src={service.icon_url} alt="" width={26} height={26} aria-hidden="true" />
                  ) : (
                    <svg className="w-6 h-6 text-[#4472C4] group-hover:text-[#E8601C] transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  )}
                </div>

                <h3 className="text-lg font-bold text-[#0F172A] mb-2 group-hover:text-[#274E96] transition-colors">{service.name}</h3>
                {service.short_description && (
                  <p className="text-sm text-[#64748B] leading-relaxed flex-1 mb-4">{service.short_description}</p>
                )}

                <div className="mt-auto flex items-center justify-between pt-2">
                  {service.starting_price ? (
                    <span className="text-sm font-bold text-[#0F172A]">From <span className="text-[#E8601C]">AED {service.starting_price}</span></span>
                  ) : <span />}
                  <span className="inline-flex items-center gap-1 text-sm font-semibold text-[#4472C4] group-hover:gap-2 transition-all">
                    View details
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                  </span>
                </div>
              </Link>
            )
          })}
        </div>
      </div>
    </section>
  )
}
