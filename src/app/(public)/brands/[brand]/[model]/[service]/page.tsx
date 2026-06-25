import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { createServerSupabase } from '@/lib/supabase/server'
import { sanitizeHTML } from '@/lib/sanitize'
import { HeroSection } from '@/components/sections/HeroSection'
import { TrustBar } from '@/components/sections/TrustBar'
import { WhyChooseUs } from '@/components/sections/WhyChooseUs'
import { FAQSection } from '@/components/sections/FAQSection'
import { LocationPills } from '@/components/sections/LocationPills'
import { RelatedServices } from '@/components/sections/RelatedServices'
import { CTABanner } from '@/components/sections/CTABanner'
import { Breadcrumb } from '@/components/ui/Breadcrumb'
import { generateMeta } from '@/lib/page-engine/meta'
import { generateServicePageSchema } from '@/lib/page-engine/schema'
import type { FAQItem, ServiceWithPrice, Location } from '@/types'

interface PageProps {
  params: Promise<{ brand: string; model: string; service: string }>
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { brand: brandSlug, model: modelSlug, service: serviceSlug } = await params
  const supabase = await createServerSupabase()

  const [{ data: brand }, { data: model }, { data: service }] = await Promise.all([
    supabase.from('brands').select('name, slug').eq('slug', brandSlug).single(),
    supabase.from('brand_models').select('name, slug').eq('slug', modelSlug).single(),
    supabase.from('services').select('name, slug').eq('slug', serviceSlug).single(),
  ])

  if (!brand || !model || !service) return { title: 'Not Found' }

  const meta = generateMeta({
    type: 'model_service',
    brand: { name: brand.name, slug: brand.slug },
    model: { name: model.name, slug: model.slug },
    service: { name: service.name, slug: service.slug },
  })
  const canonical = `https://carworkshop.ae/brands/${brandSlug}/${modelSlug}/${serviceSlug}`
  return {
    title: meta.meta_title,
    description: meta.meta_description,
    alternates: { canonical },
    openGraph: { title: meta.meta_title, description: meta.meta_description, type: 'website', url: canonical },
  }
}

export const revalidate = 86400

interface LocationMapRow {
  location_id: string
  is_active: boolean
  locations: Location | null
}

export default async function ModelServicePage({ params }: PageProps) {
  const { brand: brandSlug, model: modelSlug, service: serviceSlug } = await params
  const supabase = await createServerSupabase()

  const [{ data: brand }, { data: model }, { data: service }] = await Promise.all([
    supabase.from('brands').select('*').eq('slug', brandSlug).eq('status', 'published').single(),
    supabase.from('brand_models').select('*').eq('slug', modelSlug).eq('status', 'published').single(),
    supabase.from('services').select('*').eq('slug', serviceSlug).eq('status', 'published').single(),
  ])

  if (!brand || !model || !service) notFound()

  const [{ data: allServices }, { data: locationMapsData }] = await Promise.all([
    supabase.from('services').select('*').eq('status', 'published').order('sort_order'),
    supabase.from('brand_location_map').select('location_id, is_active, locations(*)').eq('brand_id', brand.id).eq('is_active', true),
  ])

  const locationMaps = (locationMapsData ?? []) as unknown as LocationMapRow[]
  const locations: Location[] = locationMaps
    .filter(lm => lm.locations)
    .map(lm => lm.locations as Location)

  const faqs: FAQItem[] = Array.isArray(service.faq_json) && service.faq_json.length > 0
    ? (service.faq_json as unknown as FAQItem[])
    : [
        { question: `How much does ${service.name} cost for ${brand.name} ${model.name} in UAE?`, answer: `${service.name} for ${brand.name} ${model.name} starts from AED ${service.starting_price ?? 149}. Contact us for an exact quote.` },
        { question: `How long does ${service.name} take for ${brand.name} ${model.name}?`, answer: `Most ${service.name} jobs are completed within 2–4 hours. We offer same-day service at most locations.` },
      ]

  const schema = generateServicePageSchema({
    brand: brand.name,
    model: model.name,
    service: service.name,
    url: `https://carworkshop.ae/brands/${brandSlug}/${modelSlug}/${serviceSlug}`,
    faqs,
    ...(service.starting_price ? { price: service.starting_price } : {}),
  })

  const servicesWithPrice: ServiceWithPrice[] = (allServices ?? []).map(s => ({ ...s }))

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />

      <div className="bg-[#F0F4FF] py-10 border-b border-[#C7D9F5]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Breadcrumb items={[
            { label: 'Home', href: '/' },
            { label: 'Brands', href: '/brands' },
            { label: brand.name, href: `/brands/${brandSlug}` },
            { label: model.name, href: `/brands/${brandSlug}/${modelSlug}` },
            { label: service.name },
          ]} />
        </div>
      </div>

      <HeroSection
        h1={`${brand.name} ${model.name} ${service.name} in UAE`}
        subtitle={service.short_description ?? `Expert ${brand.name} ${model.name} ${service.name} by certified technicians. Transparent pricing, doorstep service.`}
        ctaLabel="Get a Free Quote"
      />

      <TrustBar />

      {service.content && (
        <section className="py-12">
          <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="prose prose-slate max-w-none" dangerouslySetInnerHTML={{ __html: sanitizeHTML(service.content) }} />
          </div>
        </section>
      )}

      <WhyChooseUs />
      <FAQSection faqs={faqs} title={`${brand.name} ${model.name} ${service.name} — FAQ`} />
      <LocationPills locations={locations} brandSlug={brandSlug} modelSlug={modelSlug} serviceSlug={serviceSlug} />
      <RelatedServices services={servicesWithPrice} currentServiceId={service.id} brandSlug={brandSlug} modelSlug={modelSlug} />
      <CTABanner title={`Book ${brand.name} ${model.name} ${service.name} Today`} />
    </>
  )
}
