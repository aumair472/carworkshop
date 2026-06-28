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
        <h2 id="pricing-heading" className="text-2xl font-extrabold text-[#0F172A] mb-5">{title}</h2>
        <div className="overflow-hidden rounded-2xl border border-hairline shadow-[var(--shadow-card)] bg-white">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-[#F8FAFC] border-b border-hairline">
                <th className="px-5 py-3.5 text-left font-semibold text-[#334155]">Service</th>
                <th className="px-5 py-3.5 text-right font-semibold text-[#334155]">Starting Price</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-hairline">
              {items.map(item => (
                <tr key={item.label} className="hover:bg-[#F8FAFC] transition-colors">
                  <td className="px-5 py-4">
                    <span className="font-medium text-[#0F172A]">{item.label}</span>
                    {item.notes && <span className="block text-xs text-[#94A3B8] mt-0.5">{item.notes}</span>}
                  </td>
                  <td className="px-5 py-4 text-right font-bold text-[#E8601C]">{item.price}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {disclaimer && (
          <p className="mt-3 text-xs text-[#94A3B8]">{disclaimer}</p>
        )}
      </div>
    </section>
  )
}
