import type { Metadata } from 'next'
import { createServerSupabase } from '@/lib/supabase/server'
import { ServiceCardsSection } from '@/components/sections/ServiceCardsSection'
import { CTABanner } from '@/components/sections/CTABanner'
import { Breadcrumb } from '@/components/ui/Breadcrumb'
import type { ServiceWithPrice } from '@/types'

export const metadata: Metadata = {
  title: 'Car Services in UAE | CarWorkshop.ae',
  description: 'Browse all car repair and maintenance services in UAE. Oil change, brake service, AC repair, engine diagnostics, tyre change, and more. Book online today.',
  alternates: { canonical: 'https://carworkshop.ae/services' },
  openGraph: { title: 'Car Services in UAE | CarWorkshop.ae', description: 'Browse all car repair and maintenance services in UAE.', type: 'website', url: 'https://carworkshop.ae/services' },
}

export default async function ServicesPage() {
  const supabase = await createServerSupabase()
  const { data: services } = await supabase
    .from('services')
    .select('*')
    .eq('status', 'published')
    .order('sort_order')

  const servicesWithPrice: ServiceWithPrice[] = (services ?? []).map(s => ({ ...s }))

  return (
    <div>
      <div className="bg-[#F0F4FF] py-10 border-b border-[#C7D9F5]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Breadcrumb items={[{ label: 'Home', href: '/' }, { label: 'Services' }]} />
          <h1 className="text-3xl sm:text-4xl font-extrabold text-[#1F2937] mt-4">
            Car Services in UAE
          </h1>
          <p className="text-[#6B7280] mt-2 max-w-xl">
            From routine oil changes to complex engine repairs — certified technicians, transparent pricing.
          </p>
        </div>
      </div>
      <ServiceCardsSection
        services={servicesWithPrice}
        title=""
      />
      <CTABanner />
    </div>
  )
}
