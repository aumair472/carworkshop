import Link from 'next/link'
import Image from 'next/image'
import type { Brand } from '@/types'

interface BrandsGridProps {
  brands: Brand[]
  title?: string
}

export function BrandsGrid({ brands, title = 'Brands We Service' }: BrandsGridProps) {
  return (
    <section className="py-16 lg:py-24 bg-white" aria-labelledby="brands-heading">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 id="brands-heading" className="display-tight text-balance text-3xl sm:text-4xl font-extrabold text-[#0F172A] text-center mb-12">
          {title}
        </h2>

        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-3 sm:gap-4">
          {brands.map(brand => (
            <Link
              key={brand.id}
              href={`/brands/${brand.slug}`}
              className="group card-premium flex flex-col items-center gap-2.5 p-5"
            >
              {brand.logo_url ? (
                <div className="relative w-12 h-12">
                  <Image
                    src={brand.logo_url}
                    alt={`${brand.name} logo`}
                    fill
                    className="object-contain"
                    sizes="48px"
                  />
                </div>
              ) : (
                <div className="w-12 h-12 rounded-2xl bg-[#EEF3FB] ring-1 ring-[#DCE6F6] flex items-center justify-center group-hover:bg-[#FDEEE4] group-hover:ring-[#F6D2BC] transition-all">
                  <span className="text-lg font-bold text-[#4472C4] group-hover:text-[#E8601C] transition-colors">{brand.name[0]}</span>
                </div>
              )}
              <span className="text-xs font-semibold text-[#334155] group-hover:text-[#274E96] transition-colors text-center leading-tight">
                {brand.name}
              </span>
            </Link>
          ))}
        </div>

        <div className="text-center mt-10">
          <Link
            href="/brands"
            className="inline-flex items-center gap-1 text-[#4472C4] font-semibold hover:gap-2 transition-all"
          >
            View All Brands
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
          </Link>
        </div>
      </div>
    </section>
  )
}
