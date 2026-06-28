import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { createPublicSupabase } from '@/lib/supabase/public'
import { createServiceClient } from '@/lib/supabase/service'
import { HeroSection } from '@/components/sections/HeroSection'
import { ModelGrid } from '@/components/sections/ModelGrid'
import { ServiceCardsSection } from '@/components/sections/ServiceCardsSection'
import { WhyChooseUs } from '@/components/sections/WhyChooseUs'
import { CTABanner } from '@/components/sections/CTABanner'
import { Breadcrumb } from '@/components/ui/Breadcrumb'
import { generateServicePageSchema } from '@/lib/page-engine/schema'
import { resolveSEO, seoToMetadata } from '@/lib/seo'
import type { Service, ServiceWithPrice, BrandModel, PageContent } from '@/types'

interface PageProps {
  params: Promise<{ brand: string }>
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { brand: brandSlug } = await params
  const supabase = await createPublicSupabase()
  const { data: brand } = await supabase
    .from('brands')
    .select('id, name, seo_title, seo_description, seo_json')
    .eq('slug', brandSlug)
    .eq('status', 'published')
    .single()

  if (!brand) return { title: 'Brand Not Found' }

  const url = `https://carworkshop.ae/brands/${brandSlug}`
  const seo = resolveSEO(brand.seo_json, {
    title: brand.seo_title ?? `${brand.name} Service & Repair in UAE | CarWorkshop.ae`,
    description: brand.seo_description ?? `Expert ${brand.name} service, repair, and maintenance across UAE. Certified ${brand.name} technicians. Get a free quote today.`,
    url,
  })
  return seoToMetadata(seo, url)
}

export const revalidate = 86400

export async function generateStaticParams() {
  if (!process.env.SUPABASE_SERVICE_ROLE_KEY) return []
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
  const supabase = await createPublicSupabase()

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

  // Editable overlay from the admin Public Page Content editor.
  const c = (brand.content_json ?? {}) as PageContent
  const h1 = c.hero?.h1 || `${brand.name} Service & Repair in UAE`
  const subtitle = c.hero?.subheadline || brand.description || `Expert ${brand.name} maintenance and repair by certified technicians across UAE.`

  const schema = generateServicePageSchema({
    brand: brand.name,
    url: `https://carworkshop.ae/brands/${brandSlug}`,
  })

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />
      <div className="bg-mesh py-8 border-b border-hairline">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Breadcrumb items={[{ label: 'Home', href: '/' }, { label: 'Brands', href: '/brands' }, { label: brand.name }]} />
        </div>
      </div>

      <HeroSection
        h1={h1}
        subtitle={subtitle}
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

      <WhyChooseUs heading={c.why_choose_us?.heading} items={c.why_choose_us?.items} />
      <CTABanner
        title={c.cta?.headline || `Book Your ${brand.name} Service Today`}
        {...(c.cta?.button_text ? { ctaLabel: c.cta.button_text } : {})}
        {...(c.cta?.button_link ? { ctaHref: c.cta.button_link } : {})}
      />
    </>
  )
}
