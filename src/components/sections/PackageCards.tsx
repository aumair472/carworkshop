import Link from 'next/link'
import Image from 'next/image'

interface ServicePackage {
  name: string
  price: string
  image?: string
  link?: string
}

interface PackageCardsProps {
  packages: ServicePackage[]
  title?: string
}

// Horizontal row of service package cards (fixed-price bundles), e.g.
// "Basic Service", "Full Service", "Major Service".
export function PackageCards({ packages, title = 'Service Packages' }: PackageCardsProps) {
  if (!packages.length) return null

  return (
    <section className="py-12 lg:py-16" aria-labelledby="packages-heading">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 id="packages-heading" className="display-tight text-balance text-2xl sm:text-3xl font-extrabold text-[#1F2937] text-center mb-8">
          {title}
        </h2>
        <div className="flex gap-4 overflow-x-auto pb-2 sm:grid sm:grid-cols-2 lg:grid-cols-4 sm:overflow-visible">
          {packages.map((pkg, i) => {
            const cardClass = 'group card-premium shrink-0 w-64 sm:w-auto flex flex-col p-5 text-left'
            const inner = (
              <>
                {pkg.image && (
                  <div className="relative w-full h-28 mb-4 rounded-xl overflow-hidden bg-[#F9FAFB]">
                    <Image src={pkg.image} alt={pkg.name} fill className="object-cover" sizes="256px" />
                  </div>
                )}
                <h3 className="font-bold text-[#1F2937] mb-1 group-hover:text-[#4472C4] transition-colors">{pkg.name}</h3>
                <p className="text-lg font-extrabold text-[#E8601C]">{pkg.price}</p>
              </>
            )
            return pkg.link ? (
              <Link key={i} href={pkg.link} className={cardClass}>{inner}</Link>
            ) : (
              <div key={i} className={cardClass}>{inner}</div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
