import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { createServerSupabase } from '@/lib/supabase/server'
import { createServiceClient } from '@/lib/supabase/service'
import { HeroSection } from '@/components/sections/HeroSection'
import { ModelGrid } from '@/components/sections/ModelGrid'
import { ServiceCardsSection } from '@/components/sections/ServiceCardsSection'
import { WhyChooseUs } from '@/components/sections/WhyChooseUs'
import { CTABanner } from '@/components/sections/CTABanner'
import { Breadcrumb } from '@/components/ui/Breadcrumb'
import { generateServicePageSchema } from '@/lib/page-engine/schema'
import type { Service, ServiceWithPrice, BrandModel } from '@/types'

interface PageProps {
  params: Promise<{ brand: string }>
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { brand: brandSlug } = await params
  const supabase = await createServerSupabase()
  const { data: brand } = await supabase
    .from('brands')
    .select('name, seo_title, seo_description')
    .eq('slug', brandSlug)
    .eq('status', 'published')
    .single()

  if (!brand) return { title: 'Brand Not Found' }

  const title = brand.seo_title ?? `${brand.name} Service & Repair in UAE | CarWorkshop.ae`
  const description = brand.seo_description ?? `Expert ${brand.name} service, repair, and maintenance across UAE. Certified ${brand.name} technicians. Get a free quote today.`

  return {
    title,
    description,
    alternates: { canonical: `https://carworkshop.ae/brands/${brandSlug}` },
    openGraph: { title, description, type: 'website', url: `https://carworkshop.ae/brands/${brandSlug}` },
  }
}

export const revalidate = 86400

export async function generateStaticParams() {
  const supabase = createServiceClient()
  const { data } = await supabase.from('brands').select('slug').eq('status', 'published')
  return (data ?? []).map(b => ({ brand: b.slug }))
}

interface ServiceMapRow {
  service_id: string
  is_active: boolean
  services: Service | null
}

export default async function BrandPage({ params }: PageProps) {
  const { brand: brandSlug } = await params
  const supabase = await createServerSupabase()

  const { data: brand } = await supabase
    .from('brands')
    .select('*')
    .eq('slug', brandSlug)
    .eq('status', 'published')
    .single()

  if (!brand) notFound()

  const [{ data: modelsData }, { data: serviceMapsData }] = await Promise.all([
    supabase.from('brand_models').select('*').eq('brand_id', brand.id).eq('status', 'published').order('sort_order'),
    supabase.from('brand_service_map').select('service_id, is_active, services(*)').eq('brand_id', brand.id).eq('is_active', true),
  ])

  const models = (modelsData ?? []) as BrandModel[]
  const serviceMaps = (serviceMapsData ?? []) as unknown as ServiceMapRow[]

  const services: ServiceWithPrice[] = serviceMaps
    .filter(sm => sm.services)
    .map(sm => ({ ...(sm.services as Service) }))

  const schema = generateServicePageSchema({
    brand: brand.name,
    url: `https://carworkshop.ae/brands/${brandSlug}`,
  })

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />
      <div className="bg-[#F0F4FF] py-10 border-b border-[#C7D9F5]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Breadcrumb items={[{ label: 'Home', href: '/' }, { label: 'Brands', href: '/brands' }, { label: brand.name }]} />
        </div>
      </div>

      <HeroSection
        h1={`${brand.name} Service & Repair in UAE`}
        subtitle={brand.description ?? `Expert ${brand.name} maintenance and repair by certified technicians across UAE.`}
        ctaLabel={`Book ${brand.name} Service`}
      />

      {models.length > 0 && (
        <ModelGrid models={models} brandSlug={brandSlug} title={`${brand.name} Models We Service`} />
      )}

      <ServiceCardsSection
        services={services}
        title={`${brand.name} Services`}
        brandSlug={brandSlug}
      />

      <WhyChooseUs />
      <CTABanner title={`Book Your ${brand.name} Service Today`} />
    </>
  )
}
