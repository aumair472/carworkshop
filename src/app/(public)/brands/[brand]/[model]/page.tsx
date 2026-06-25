import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { createServerSupabase } from '@/lib/supabase/server'
import { createServiceClient as createServiceClientBuild } from '@/lib/supabase/service'
import { HeroSection } from '@/components/sections/HeroSection'
import { ServiceCardsSection } from '@/components/sections/ServiceCardsSection'
import { WhyChooseUs } from '@/components/sections/WhyChooseUs'
import { FAQSection } from '@/components/sections/FAQSection'
import { CTABanner } from '@/components/sections/CTABanner'
import { Breadcrumb } from '@/components/ui/Breadcrumb'
import { generateMeta } from '@/lib/page-engine/meta'
import { generateServicePageSchema } from '@/lib/page-engine/schema'
import type { Service, ServiceWithPrice, FAQItem } from '@/types'

interface PageProps {
  params: Promise<{ brand: string; model: string }>
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { brand: brandSlug, model: modelSlug } = await params
  const supabase = await createServerSupabase()

  const [{ data: brand }, { data: model }] = await Promise.all([
    supabase.from('brands').select('name, slug').eq('slug', brandSlug).single(),
    supabase.from('brand_models').select('name, slug').eq('slug', modelSlug).single(),
  ])

  if (!brand || !model) return { title: 'Not Found' }

  const meta = generateMeta({ type: 'model', brand: { name: brand.name, slug: brand.slug }, model: { name: model.name, slug: model.slug } })
  const canonical = `https://carworkshop.ae/brands/${brandSlug}/${modelSlug}`
  return {
    title: meta.meta_title,
    description: meta.meta_description,
    alternates: { canonical },
    openGraph: { title: meta.meta_title, description: meta.meta_description, type: 'website', url: canonical },
  }
}

export const revalidate = 86400

export async function generateStaticParams() {
  if (!process.env.SUPABASE_SERVICE_ROLE_KEY) return []
  const supabase = createServiceClientBuild()
  const { data: modelsData } = await supabase
    .from('brand_models')
    .select('slug, brand_id')
    .eq('status', 'published')

  if (!modelsData) return []

  const brandIds = [...new Set(modelsData.map(m => m.brand_id))]
  const { data: brandsData } = await supabase.from('brands').select('id, slug').in('id', brandIds)

  const brandMap = new Map((brandsData ?? []).map(b => [b.id, b.slug]))

  return modelsData.flatMap(m => {
    const brandSlug = brandMap.get(m.brand_id)
    if (!brandSlug) return []
    return [{ brand: brandSlug, model: m.slug }]
  })
}

interface ServiceMapRow {
  service_id: string
  is_active: boolean
  services: Service | null
}

export default async function ModelPage({ params }: PageProps) {
  const { brand: brandSlug, model: modelSlug } = await params
  const supabase = await createServerSupabase()

  const [{ data: brand }, { data: model }] = await Promise.all([
    supabase.from('brands').select('*').eq('slug', brandSlug).eq('status', 'published').single(),
    supabase.from('brand_models').select('*').eq('slug', modelSlug).eq('status', 'published').single(),
  ])

  if (!brand || !model) notFound()

  const { data: serviceMapsData } = await supabase
    .from('brand_service_map')
    .select('service_id, is_active, services(*)')
    .eq('brand_id', brand.id)
    .eq('is_active', true)

  const serviceMaps = (serviceMapsData ?? []) as unknown as ServiceMapRow[]

  const services: ServiceWithPrice[] = serviceMaps
    .filter(sm => sm.services)
    .map(sm => ({ ...(sm.services as Service) }))

  const faqs: FAQItem[] = [
    { question: `How often should I service my ${brand.name} ${model.name}?`, answer: `Most ${brand.name} ${model.name} models require servicing every 10,000–15,000 km or annually, whichever comes first.` },
    { question: `How much does ${brand.name} ${model.name} service cost in UAE?`, answer: 'Service costs depend on type. Basic oil service from AED 149. Full annual service from AED 499. Get a free quote for exact pricing.' },
  ]

  const schema = generateServicePageSchema({
    brand: brand.name,
    model: model.name,
    url: `https://carworkshop.ae/brands/${brandSlug}/${modelSlug}`,
    faqs,
  })

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />
      <div className="bg-[#F0F4FF] py-10 border-b border-[#C7D9F5]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Breadcrumb items={[
            { label: 'Home', href: '/' },
            { label: 'Brands', href: '/brands' },
            { label: brand.name, href: `/brands/${brandSlug}` },
            { label: model.name },
          ]} />
        </div>
      </div>

      <HeroSection
        h1={`${brand.name} ${model.name} Service & Repair in UAE`}
        subtitle={model.description ?? `Expert ${brand.name} ${model.name} maintenance by certified technicians across UAE.`}
        ctaLabel={`Book ${model.name} Service`}
      />

      <ServiceCardsSection
        services={services}
        title={`${brand.name} ${model.name} Services`}
        brandSlug={brandSlug}
        modelSlug={modelSlug}
      />

      <WhyChooseUs />
      <FAQSection faqs={faqs} />
      <CTABanner title={`Book Your ${brand.name} ${model.name} Service`} />
    </>
  )
}
