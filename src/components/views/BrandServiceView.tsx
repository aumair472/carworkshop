import { notFound } from 'next/navigation'
import { createPublicSupabase } from '@/lib/supabase/public'
import { sanitizeHTML } from '@/lib/sanitize'
import { HeroSection } from '@/components/sections/HeroSection'
import { ModelGrid } from '@/components/sections/ModelGrid'
import { ServiceCardsSection } from '@/components/sections/ServiceCardsSection'
import { WhyChooseUs } from '@/components/sections/WhyChooseUs'
import { FAQSection } from '@/components/sections/FAQSection'
import { LocationPills } from '@/components/sections/LocationPills'
import { CTABanner } from '@/components/sections/CTABanner'
import { Breadcrumb } from '@/components/ui/Breadcrumb'
import { generateServicePageSchema } from '@/lib/page-engine/schema'
import { getPageContent } from '@/lib/page-engine/content'
import type { Service, ServiceWithPrice, BrandModel, Location, FAQItem } from '@/types'

interface ServiceMapRow {
  service_id: string
  is_active: boolean
  services: Service | null
}
interface LocationMapRow {
  location_id: string
  is_active: boolean
  locations: Location | null
}

// Brand + Service page, e.g. /brands/audi/oil-change.
// Rendered by the [brand]/[model] resolver when the second segment is a service slug.
export async function BrandServiceView({ brandSlug, serviceSlug }: { brandSlug: string; serviceSlug: string }) {
  const supabase = await createPublicSupabase()

  const [{ data: brand }, { data: service }] = await Promise.all([
    supabase.from('brands').select('*').eq('slug', brandSlug).eq('status', 'published').single(),
    supabase.from('services').select('*').eq('slug', serviceSlug).eq('status', 'published').single(),
  ])

  if (!brand || !service) notFound()

  const [{ data: modelsData }, { data: serviceMapsData }, { data: locationMapsData }] = await Promise.all([
    supabase.from('brand_models').select('*').eq('brand_id', brand.id).eq('status', 'published').order('sort_order'),
    supabase.from('brand_service_map').select('service_id, is_active, services(*)').eq('brand_id', brand.id).eq('is_active', true),
    supabase.from('brand_location_map').select('location_id, is_active, locations(*)').eq('brand_id', brand.id).eq('is_active', true),
  ])

  const models = (modelsData ?? []) as BrandModel[]
  const serviceMaps = (serviceMapsData ?? []) as unknown as ServiceMapRow[]
  const otherServices: ServiceWithPrice[] = serviceMaps
    .filter(sm => sm.services && sm.services.id !== service.id)
    .map(sm => ({ ...(sm.services as Service) }))
  const locationMaps = (locationMapsData ?? []) as unknown as LocationMapRow[]
  const locations: Location[] = locationMaps.filter(lm => lm.locations).map(lm => lm.locations as Location)

  const price = service.starting_price ?? null
  const content = await getPageContent(`${brandSlug}/${serviceSlug}`)
  const h1 = content?.hero?.h1 || `${brand.name} ${service.name} in UAE`
  const subtitle = content?.hero?.subheadline || service.short_description || `Expert ${brand.name} ${service.name} by certified technicians across UAE. Free pickup & delivery, 12-month warranty.`
  const mainContentHtml = content?.main_content || service.content || null
  const faqs: FAQItem[] = content?.faqs && content.faqs.length > 0
    ? content.faqs.map(f => ({ question: f.q, answer: f.a }))
    : Array.isArray(service.faq_json) && service.faq_json.length > 0
    ? (service.faq_json as unknown as FAQItem[])
    : [
        { question: `How much does ${brand.name} ${service.name} cost in UAE?`, answer: `${brand.name} ${service.name} starts from AED ${price ?? 149}. Contact us for an exact quote for your model.` },
        { question: `Do you offer ${brand.name} ${service.name} with pickup & delivery?`, answer: `Yes — we offer free collection and delivery across the UAE for ${brand.name} ${service.name}.` },
      ]

  const url = `https://carworkshop.ae/brands/${brandSlug}/${serviceSlug}`
  const schema = generateServicePageSchema({
    brand: brand.name,
    service: service.name,
    url,
    faqs,
    ...(price ? { price } : {}),
  })

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />

      <div className="bg-mesh py-8 border-b border-hairline">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Breadcrumb items={[
            { label: 'Home', href: '/' },
            { label: 'Brands', href: '/brands' },
            { label: brand.name, href: `/brands/${brandSlug}` },
            { label: service.name },
          ]} />
        </div>
      </div>

      <HeroSection
        h1={h1}
        subtitle={subtitle}
        ctaLabel={`Book ${brand.name} ${service.name}`}
      />

      {models.length > 0 && (
        <ModelGrid
          models={models}
          brandSlug={brandSlug}
          serviceSlug={serviceSlug}
          title={`Select Your ${brand.name} Model`}
        />
      )}

      {mainContentHtml && (
        <section className="py-12">
          <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="rich-content" dangerouslySetInnerHTML={{ __html: sanitizeHTML(mainContentHtml) }} />
          </div>
        </section>
      )}

      {otherServices.length > 0 && (
        <ServiceCardsSection services={otherServices} title={`Other ${brand.name} Services`} brandSlug={brandSlug} />
      )}

      <WhyChooseUs heading={content?.why_choose_us?.heading} items={content?.why_choose_us?.items} />
      <FAQSection faqs={faqs} title={`${brand.name} ${service.name} — FAQ`} />
      <LocationPills locations={locations} brandSlug={brandSlug} serviceSlug={serviceSlug} />
      <CTABanner
        title={content?.cta?.headline || `Book Your ${brand.name} ${service.name} Today`}
        {...(content?.cta?.button_text ? { ctaLabel: content.cta.button_text } : {})}
        {...(content?.cta?.button_link ? { ctaHref: content.cta.button_link } : {})}
      />
    </>
  )
}
