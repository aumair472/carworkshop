import { notFound } from 'next/navigation'
import { createPublicSupabase } from '@/lib/supabase/public'
import { sanitizeHTML } from '@/lib/sanitize'
import { HeroSection } from '@/components/sections/HeroSection'
import { ModelGrid } from '@/components/sections/ModelGrid'
import { WhyChooseUs } from '@/components/sections/WhyChooseUs'
import { FAQSection } from '@/components/sections/FAQSection'
import { LocationPills } from '@/components/sections/LocationPills'
import { CTABanner } from '@/components/sections/CTABanner'
import { Breadcrumb } from '@/components/ui/Breadcrumb'
import { generateServicePageSchema } from '@/lib/page-engine/schema'
import { getPageContent, getPageTemplateRow } from '@/lib/page-engine/content'
import { ServicePageTemplate } from '@/components/templates/ServicePageTemplate'
import type { BrandModel, Location, FAQItem, ServiceWithPrice } from '@/types'

interface LocationMapRow {
  location_id: string
  is_active: boolean
  locations: Location | null
}

// Brand + Service + Location page, e.g. /brands/audi/oil-change/dubai.
// Rendered by the [brand]/[model]/[service] resolver when the second segment is
// a service slug and the third segment is a location slug.
export async function BrandServiceLocationView({ brandSlug, serviceSlug, locationSlug }: { brandSlug: string; serviceSlug: string; locationSlug: string }) {
  const supabase = await createPublicSupabase()

  const [{ data: brand }, { data: service }, { data: location }] = await Promise.all([
    supabase.from('brands').select('*').eq('slug', brandSlug).eq('status', 'published').single(),
    supabase.from('services').select('*').eq('slug', serviceSlug).eq('status', 'published').single(),
    supabase.from('locations').select('*').eq('slug', locationSlug).eq('status', 'published').single(),
  ])

  if (!brand || !service || !location) notFound()

  const [{ data: modelsData }, { data: locationMapsData }] = await Promise.all([
    supabase.from('brand_models').select('*').eq('brand_id', brand.id).eq('status', 'published').order('sort_order'),
    supabase.from('brand_location_map').select('location_id, is_active, locations(*)').eq('brand_id', brand.id).eq('is_active', true),
  ])

  const models = (modelsData ?? []) as BrandModel[]
  const locationMaps = (locationMapsData ?? []) as unknown as LocationMapRow[]
  const locations: Location[] = locationMaps.filter(lm => lm.locations).map(lm => lm.locations as Location)

  const price = service.starting_price ?? null
  const slug = `${brandSlug}/${serviceSlug}/${locationSlug}`
  const [content, templateRow] = await Promise.all([getPageContent(slug), getPageTemplateRow(slug)])
  const h1 = content?.hero?.h1 || `${brand.name} ${service.name} in ${location.name}`
  const subtitle = content?.hero?.subheadline || `Expert ${brand.name} ${service.name} in ${location.name} by certified technicians. Transparent pricing, doorstep service.`
  const mainContentHtml = content?.main_content || service.content || null
  const faqs: FAQItem[] = content?.faqs && content.faqs.length > 0
    ? content.faqs.map(f => ({ question: f.q, answer: f.a }))
    : Array.isArray(service.faq_json) && service.faq_json.length > 0
    ? (service.faq_json as unknown as FAQItem[])
    : [
        { question: `How much does ${brand.name} ${service.name} cost in ${location.name}?`, answer: `${brand.name} ${service.name} in ${location.name} starts from AED ${price ?? 149}. Contact us for an exact quote.` },
        { question: `Do you offer ${brand.name} ${service.name} at home in ${location.name}?`, answer: `Yes — we offer doorstep ${service.name} in ${location.name} and surrounding areas. Book online and our certified technician comes to you.` },
      ]

  const url = `https://carworkshop.ae/brands/${brandSlug}/${serviceSlug}/${locationSlug}`
  const schema = generateServicePageSchema({
    brand: brand.name,
    service: service.name,
    location: location.name,
    url,
    faqs,
    ...(price ? { price } : {}),
  })

  // 'template_1' opts a generated page into the SMC-style Service Page layout;
  // unset/legacy values preserve the current default rendering below so
  // existing published pages don't change.
  if (templateRow?.template === 'template_1') {
    const servicesWithPrice: ServiceWithPrice[] = []
    return (
      <>
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />
        <div className="bg-mesh py-8 border-b border-hairline">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <Breadcrumb items={[
              { label: 'Home', href: '/' },
              { label: 'Brands', href: '/brands' },
              { label: brand.name, href: `/brands/${brandSlug}` },
              { label: service.name, href: `/brands/${brandSlug}/${serviceSlug}` },
              { label: location.name },
            ]} />
          </div>
        </div>

        <ServicePageTemplate
          page={{
            h1,
            highlight_text: templateRow.highlight_text,
            key_points: templateRow.key_points,
            icon_image_png_url: templateRow.icon_image_png_url,
            icon_image_webp_url: templateRow.icon_image_webp_url,
            icon_image_alt: templateRow.icon_image_alt,
            image_bottom_png_url: templateRow.image_bottom_png_url,
            image_bottom_webp_url: templateRow.image_bottom_webp_url,
            image_bottom_alt: templateRow.image_bottom_alt,
            image_large_url: templateRow.image_large_url,
            image_mobile_url: templateRow.image_mobile_url,
            short_description: service.short_description,
            mid_category_title: templateRow.mid_category_title,
          }}
          content={content}
          mainContentHtml={mainContentHtml}
          sourcePageSlug={slug}
          locations={locations}
          relatedServices={servicesWithPrice}
          currentServiceId={service.id}
          brandSlug={brandSlug}
          serviceSlug={serviceSlug}
        />
      </>
    )
  }

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />

      <div className="bg-mesh py-8 border-b border-hairline">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Breadcrumb items={[
            { label: 'Home', href: '/' },
            { label: 'Brands', href: '/brands' },
            { label: brand.name, href: `/brands/${brandSlug}` },
            { label: service.name, href: `/brands/${brandSlug}/${serviceSlug}` },
            { label: location.name },
          ]} />
        </div>
      </div>

      <HeroSection
        h1={h1}
        subtitle={subtitle}
        ctaLabel="Get a Free Quote"
      />

      {mainContentHtml && (
        <section className="py-12">
          <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="rich-content" dangerouslySetInnerHTML={{ __html: sanitizeHTML(mainContentHtml) }} />
          </div>
        </section>
      )}

      <WhyChooseUs heading={content?.why_choose_us?.heading} items={content?.why_choose_us?.items} />

      {models.length > 0 && (
        <ModelGrid models={models} brandSlug={brandSlug} serviceSlug={serviceSlug} title={`Select Your ${brand.name} Model`} />
      )}

      <FAQSection faqs={faqs} title={`${brand.name} ${service.name} in ${location.name} — FAQ`} />
      <LocationPills locations={locations} brandSlug={brandSlug} serviceSlug={serviceSlug} currentLocationId={location.id} />
      <CTABanner
        title={content?.cta?.headline || `Book ${brand.name} ${service.name} in ${location.name}`}
        {...(content?.cta?.button_text ? { ctaLabel: content.cta.button_text } : {})}
        {...(content?.cta?.button_link ? { ctaHref: content.cta.button_link } : {})}
      />
    </>
  )
}
