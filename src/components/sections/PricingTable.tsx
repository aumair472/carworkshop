interface PricingItem {
  label: string
  price: string
  notes?: string
}

interface PricingTableProps {
  items: PricingItem[]
  title?: string
  disclaimer?: string
}

export function PricingTable({ items, title = 'Pricing Guide', disclaimer }: PricingTableProps) {
  if (!items.length) return null

  return (
    <section className="py-10" aria-labelledby="pricing-heading">
      <div className="max-w-2xl mx-auto px-4 sm:px-6">
        <h2 id="pricing-heading" className="text-xl font-extrabold text-[#1F2937] mb-4">{title}</h2>
        <div className="overflow-hidden rounded-lg border border-[#E5E7EB]">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-[#F9FAFB] border-b border-[#E5E7EB]">
                <th className="px-4 py-3 text-left font-semibold text-[#374151]">Service</th>
                <th className="px-4 py-3 text-right font-semibold text-[#374151]">Starting Price</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F3F4F6]">
              {items.map(item => (
                <tr key={item.label} className="hover:bg-[#F9FAFB]">
                  <td className="px-4 py-3">
                    <span className="font-medium text-[#1F2937]">{item.label}</span>
                    {item.notes && <span className="block text-xs text-[#9CA3AF] mt-0.5">{item.notes}</span>}
                  </td>
                  <td className="px-4 py-3 text-right font-semibold text-[#E8601C]">{item.price}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {disclaimer && (
          <p className="mt-3 text-xs text-[#9CA3AF]">{disclaimer}</p>
        )}
      </div>
    </section>
  )
}
