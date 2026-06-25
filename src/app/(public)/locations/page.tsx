import type { Metadata } from 'next'
import { createServerSupabase } from '@/lib/supabase/server'
import { LocationsSection } from '@/components/sections/LocationsSection'
import { CTABanner } from '@/components/sections/CTABanner'
import { Breadcrumb } from '@/components/ui/Breadcrumb'

export const metadata: Metadata = {
  title: 'Car Service Locations Across UAE | CarWorkshop.ae',
  description: 'Find car repair and service centres across UAE — Dubai, Abu Dhabi, Sharjah, Ajman, RAK, and more. Doorstep service available.',
  alternates: { canonical: 'https://carworkshop.ae/locations' },
  openGraph: { title: 'Car Service Locations Across UAE | CarWorkshop.ae', description: 'Find car service across UAE.', type: 'website', url: 'https://carworkshop.ae/locations' },
}

export default async function LocationsPage() {
  const supabase = await createServerSupabase()
  const { data: locations } = await supabase
    .from('locations')
    .select('*')
    .eq('status', 'published')
    .order('sort_order')

  return (
    <div>
      <div className="bg-[#F0F4FF] py-10 border-b border-[#C7D9F5]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Breadcrumb items={[{ label: 'Home', href: '/' }, { label: 'Locations' }]} />
          <h1 className="text-3xl sm:text-4xl font-extrabold text-[#1F2937] mt-4">
            Car Service Locations in UAE
          </h1>
          <p className="text-[#6B7280] mt-2 max-w-xl">
            Find a workshop near you or book doorstep service anywhere across UAE.
          </p>
        </div>
      </div>
      <LocationsSection locations={locations ?? []} title="" />
      <CTABanner />
    </div>
  )
}
