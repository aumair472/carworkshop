import type { Metadata } from 'next'
import { createServerSupabase } from '@/lib/supabase/server'
import { BrandsGrid } from '@/components/sections/BrandsGrid'
import { CTABanner } from '@/components/sections/CTABanner'
import { Breadcrumb } from '@/components/ui/Breadcrumb'

export const metadata: Metadata = {
  title: 'Car Brands We Service in UAE | CarWorkshop.ae',
  description: 'We service all major car brands across UAE — BMW, Mercedes, Toyota, Audi, Nissan, Honda, and more. Certified technicians for every make and model.',
  alternates: { canonical: 'https://carworkshop.ae/brands' },
  openGraph: { title: 'Car Brands We Service in UAE | CarWorkshop.ae', description: 'We service all major car brands across UAE.', type: 'website', url: 'https://carworkshop.ae/brands' },
}

export default async function BrandsPage() {
  const supabase = await createServerSupabase()
  const { data: brands } = await supabase
    .from('brands')
    .select('*')
    .eq('status', 'published')
    .order('sort_order')

  return (
    <div>
      <div className="bg-[#F0F4FF] py-10 border-b border-[#C7D9F5]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Breadcrumb items={[{ label: 'Home', href: '/' }, { label: 'Car Brands' }]} />
          <h1 className="text-3xl sm:text-4xl font-extrabold text-[#1F2937] mt-4">
            Car Brands We Service
          </h1>
          <p className="text-[#6B7280] mt-2 max-w-xl">
            Expert service for all major makes. Factory-trained technicians for every brand.
          </p>
        </div>
      </div>
      <BrandsGrid brands={brands ?? []} title="" />
      <CTABanner />
    </div>
  )
}
