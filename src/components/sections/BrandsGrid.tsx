import Link from 'next/link'
import Image from 'next/image'
import type { Brand } from '@/types'

interface BrandsGridProps {
  brands: Brand[]
  title?: string
}

export function BrandsGrid({ brands, title = 'Brands We Service' }: BrandsGridProps) {
  return (
    <section className="py-14 bg-[#F9FAFB]" aria-labelledby="brands-heading">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 id="brands-heading" className="text-2xl sm:text-3xl font-extrabold text-[#1F2937] text-center mb-10">
          {title}
        </h2>

        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-4">
          {brands.map(brand => (
            <Link
              key={brand.id}
              href={`/brands/${brand.slug}`}
              className="group flex flex-col items-center gap-2 p-4 bg-white rounded-lg border border-[#E5E7EB] hover:border-[#4472C4] hover:shadow-md transition-all duration-150"
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
                <div className="w-12 h-12 rounded-full bg-[#EEF3FB] flex items-center justify-center">
                  <span className="text-lg font-bold text-[#4472C4]">{brand.name[0]}</span>
                </div>
              )}
              <span className="text-xs font-semibold text-[#374151] group-hover:text-[#4472C4] transition-colors text-center leading-tight">
                {brand.name}
              </span>
            </Link>
          ))}
        </div>

        <div className="text-center mt-8">
          <Link
            href="/brands"
            className="inline-flex items-center text-[#4472C4] font-semibold hover:underline"
          >
            View All Brands →
          </Link>
        </div>
      </div>
    </section>
  )
}
