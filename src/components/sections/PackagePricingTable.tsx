import Link from 'next/link'

interface ServicePackage {
  name: string
  price: string
  image?: string
  link?: string
}

interface PackagePricingTableProps {
  packages: ServicePackage[]
  title?: string
}

// Simple package comparison table (name + price, optional deep link).
export function PackagePricingTable({ packages, title = 'Compare Service Packages' }: PackagePricingTableProps) {
  if (!packages.length) return null

  return (
    <section className="py-12" aria-labelledby="package-pricing-heading">
      <div className="max-w-2xl mx-auto px-4 sm:px-6">
        <h2 id="package-pricing-heading" className="text-2xl font-extrabold text-[#1F2937] mb-5">{title}</h2>
        <div className="overflow-hidden rounded-2xl border border-[#E5E7EB] bg-white">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-[#F9FAFB] border-b border-[#E5E7EB]">
                <th className="px-5 py-3.5 text-left font-semibold text-[#374151]">Package</th>
                <th className="px-5 py-3.5 text-right font-semibold text-[#374151]">Price</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E5E7EB]">
              {packages.map((pkg, i) => (
                <tr key={i} className="hover:bg-[#F9FAFB] transition-colors">
                  <td className="px-5 py-4">
                    {pkg.link ? (
                      <Link href={pkg.link} className="font-medium text-[#1F2937] hover:text-[#4472C4]">{pkg.name}</Link>
                    ) : (
                      <span className="font-medium text-[#1F2937]">{pkg.name}</span>
                    )}
                  </td>
                  <td className="px-5 py-4 text-right font-bold text-[#E8601C]">{pkg.price}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  )
}
