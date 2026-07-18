import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { createPublicSupabase } from '@/lib/supabase/public'
import { sanitizeHTML } from '@/lib/sanitize'
import { TrustBar } from '@/components/sections/TrustBar'
import { InlineBookingForm } from '@/components/sections/InlineBookingForm'
import { WhyChooseUs } from '@/components/sections/WhyChooseUs'
import { FAQSection } from '@/components/sections/FAQSection'
import { LocationPills } from '@/components/sections/LocationPills'
import { RelatedServices } from '@/components/sections/RelatedServices'
import { CTABanner } from '@/components/sections/CTABanner'
import { Breadcrumb } from '@/components/ui/Breadcrumb'
import { generateMeta } from '@/lib/page-engine/meta'
import { generateServicePageSchema } from '@/lib/page-engine/schema'
import { getPageContent, getPageSeo, getPageTemplateRow } from '@/lib/page-engine/content'
import { resolveSEO, seoToMetadata, renderSchemas } from '@/lib/seo'
import { BrandServiceLocationView } from '@/components/views/BrandServiceLocationView'
import { ServicePageTemplate } from '@/components/templates/ServicePageTemplate'
import type { FAQItem, ServiceWithPrice, Location } from '@/types'

interface PageProps {
  params: Promise<{ brand: string; model: string; service: string }>
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { brand: brandSlug, model: modelSlug, service: serviceSlug } = await params
  const supabase = await createPublicSupabase()

  const [{ data: brand }, { data: model }, { data: service }] = await Promise.all([
    supabase.from('brands').select('name, slug').eq('slug', brandSlug).single(),
    supabase.from('brand_models').select('name, slug').eq('slug', modelSlug).single(),
    supabase.from('services').select('name, slug').eq('slug', serviceSlug).single(),
  ])

  if (!brand) return { title: 'Not Found' }

  // Middle segment may be a model (model+service) OR a service. In the latter case
  // the last segment is a location → Brand + Service + Location page.
  if (!model) {
    const [{ data: svc }, { data: loc }] = await Promise.all([
      supabase.from('services').select('name').eq('slug', modelSlug).single(),
      supabase.from('locations').select('name').eq('slug', serviceSlug).single(),
    ])
    if (!svc || !loc) return { title: 'Not Found' }
    const title = `${brand.name} ${svc.name} in ${loc.name} | CarWorkshop.ae`
    const description = `Professional ${brand.name} ${svc.name} in ${loc.name}, UAE. Free pickup & delivery, 12-month warranty.`
    const canonical = `https://carworkshop.ae/brands/${brandSlug}/${modelSlug}/${serviceSlug}`
    return { title, description, alternates: { canonical }, openGraph: { title, description, type: 'website', url: canonical } }
  }

  if (!service) return { title: 'Not Found' }

  const meta = generateMeta({
    type: 'model_service',
    brand: { name: brand.name, slug: brand.slug },
    model: { name: model.name, slug: model.slug },
    service: { name: service.name, slug: service.slug },
  })
  const canonical = `https://carworkshop.ae/brands/${brandSlug}/${modelSlug}/${serviceSlug}`
  const seo = resolveSEO(await getPageSeo(`${brandSlug}/${modelSlug}/${serviceSlug}`), {
    title: meta.meta_title, description: meta.meta_description, url: canonical,
  })
  return seoToMetadata(seo, canonical)
}

export const revalidate = 86400
// Prebuild the top 500 model+service pages at build; the rest render on-demand
// and cache via ISR (presence of generateStaticParams enables that caching).
export async function generateStaticParams() {
  const supabase = createPublicSupabase()
  const { data } = await supabase
    .from('generated_pages')
    .select('slug')
    .eq('page_type', 'model_service')
    .eq('status', 'published')
    .limit(500)
  return (data ?? []).flatMap(p => {
    const [brand, model, service] = p.slug.split('/')
    return brand && model && service ? [{ brand, model, service }] : []
  })
}

interface LocationMapRow {
  location_id: string
  is_active: boolean
  locations: Location | null
}

export default async function ModelServicePage({ params }: PageProps) {
  const { brand: brandSlug, model: modelSlug, service: serviceSlug } = await params
  const supabase = await createPublicSupabase()

  const [{ data: brand }, { data: model }, { data: service }] = await Promise.all([
    supabase.from('brands').select('*').eq('slug', brandSlug).eq('status', 'published').single(),
    supabase.from('brand_models').select('*').eq('slug', modelSlug).eq('status', 'published').single(),
    supabase.from('services').select('*').eq('slug', serviceSlug).eq('status', 'published').single(),
  ])

  if (!brand) notFound()

  // Middle segment may be a model OR a service. If it is not a published model,
  // resolve it as service + location → Brand + Service + Location page.
  if (!model) {
    const { data: svc } = await supabase.from('services').select('id').eq('slug', modelSlug).eq('status', 'published').single()
    const { data: loc } = await supabase.from('locations').select('id').eq('slug', serviceSlug).eq('status', 'published').single()
    if (svc && loc) return <BrandServiceLocationView brandSlug={brandSlug} serviceSlug={modelSlug} locationSlug={serviceSlug} />
    notFound()
  }

  if (!service) notFound()

  const [{ data: allServices }, { data: locationMapsData }, content, templateRow] = await Promise.all([
    supabase.from('services').select('*').eq('status', 'published').order('sort_order'),
    supabase.from('brand_location_map').select('location_id, is_active, locations(*)').eq('brand_id', brand.id).eq('is_active', true),
    getPageContent(`${brandSlug}/${modelSlug}/${serviceSlug}`),
    getPageTemplateRow(`${brandSlug}/${modelSlug}/${serviceSlug}`),
  ])

  const locationMaps = (locationMapsData ?? []) as unknown as LocationMapRow[]
  const locations: Location[] = locationMaps
    .filter(lm => lm.locations)
    .map(lm => lm.locations as Location)

  // Editable overlay (content_json from the admin page editor) wins over defaults.
  const h1 = content?.hero?.h1 || `${brand.name} ${model.name} ${service.name} in UAE`
  const subtitle = content?.hero?.subheadline || service.short_description || `Expert ${brand.name} ${model.name} ${service.name} by certified technicians. Transparent pricing, doorstep service.`
  const mainContentHtml = content?.main_content || service.content || null
  const price = content?.service_details?.price ?? service.starting_price ?? null
  const includes = content?.service_details?.includes ?? []

  const faqs: FAQItem[] = content?.faqs && content.faqs.length > 0
    ? content.faqs.map(f => ({ question: f.q, answer: f.a }))
    : Array.isArray(service.faq_json) && service.faq_json.length > 0
      ? (service.faq_json as unknown as FAQItem[])
      : [
          { question: `How much does ${service.name} cost for ${brand.name} ${model.name} in UAE?`, answer: `${service.name} for ${brand.name} ${model.name} starts from AED ${price ?? 149}. Contact us for an exact quote.` },
          { question: `How long does ${service.name} take for ${brand.name} ${model.name}?`, answer: `Most ${service.name} jobs are completed within 2–4 hours. We offer same-day service at most locations.` },
        ]

  const schema = generateServicePageSchema({
    brand: brand.name,
    model: model.name,
    service: service.name,
    url: `https://carworkshop.ae/brands/${brandSlug}/${modelSlug}/${serviceSlug}`,
    faqs,
    ...(price ? { price } : {}),
  })

  const servicesWithPrice: ServiceWithPrice[] = (allServices ?? []).map(s => ({ ...s }))
  const customSchemas = renderSchemas((await getPageSeo(`${brandSlug}/${modelSlug}/${serviceSlug}`)).schemas ?? [], { faqs: faqs.map(f => ({ question: f.question, answer: f.answer })) })

  // 'template_1' opts a generated page into the SMC-style Service Page layout;
  // anything else (unset/'template_2'/legacy values) preserves the current
  // default Fixter-style rendering below, so existing published pages don't change.
  if (templateRow?.template === 'template_1') {
    const { data: brandsData } = await supabase.from('brands').select('*').eq('status', 'published').order('sort_order')
    return (
      <>
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />
        {customSchemas.map((json, i) => <script key={i} type="application/ld+json" dangerouslySetInnerHTML={{ __html: json }} />)}

        <div className="bg-mesh py-8 border-b border-hairline">
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
            short_description: templateRow.short_description || service.short_description,
            mid_category_title: templateRow.mid_category_title,
          }}
          content={content}
          mainContentHtml={mainContentHtml}
          sourcePageSlug={`${brandSlug}/${modelSlug}/${serviceSlug}`}
          brands={brandsData ?? []}
          locations={locations}
          relatedServices={servicesWithPrice}
          currentServiceId={service.id}
          brandSlug={brandSlug}
          modelSlug={modelSlug}
          serviceSlug={serviceSlug}
        />
      </>
    )
  }

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />
      {customSchemas.map((json, i) => <script key={i} type="application/ld+json" dangerouslySetInnerHTML={{ __html: json }} />)}

      <div className="bg-mesh py-8 border-b border-hairline">
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

      {/* Fixter-style two-column hero with inline booking form */}
      <section className="bg-[#F9FAFB] border-b border-[#E5E7EB]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16 grid lg:grid-cols-2 gap-10 items-start">
          <div>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-[#1F2937] leading-tight mb-4">{h1}</h1>
            <p className="text-lg text-[#6B7280] mb-6 max-w-xl">{subtitle}</p>
            <ul className="space-y-2.5">
              {[
                price != null ? `From AED ${price}` : 'Transparent fixed pricing',
                '12-month / 10,000km warranty',
                `Certified ${brand.name} technicians`,
                'Free pickup & delivery · same/next day',
              ].map((b, i) => (
                <li key={i} className="flex items-center gap-2 text-[#374151] font-medium"><span className="text-[#059669]">✓</span>{b}</li>
              ))}
            </ul>
          </div>
          <div className="lg:pl-6">
            <InlineBookingForm
              sourcePageSlug={`${brandSlug}/${modelSlug}/${serviceSlug}`}
              prefillMessage={`I'd like to book ${brand.name} ${model.name} ${service.name}.`}
              heading={`Book ${model.name} ${service.name}`}
            />
          </div>
        </div>
      </section>

      <TrustBar />

      {(includes.length > 0 || price != null) && (
        <section className="py-12 bg-[#F9FAFB]">
          <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
            {price != null && <p className="text-2xl font-bold text-[#4472C4] mb-4">From AED {price}</p>}
            {includes.length > 0 && (
              <>
                <h2 className="text-xl font-bold text-[#1F2937] mb-3">What&apos;s Included</h2>
                <ul className="space-y-2">
                  {includes.map((it, i) => (
                    <li key={i} className="flex items-start gap-2 text-[#374151]"><span className="text-[#059669]">✓</span>{it}</li>
                  ))}
                </ul>
              </>
            )}
          </div>
        </section>
      )}

      {mainContentHtml && (
        <section className="py-12">
          <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="rich-content" dangerouslySetInnerHTML={{ __html: sanitizeHTML(mainContentHtml) }} />
          </div>
        </section>
      )}

      <WhyChooseUs heading={content?.why_choose_us?.heading} items={content?.why_choose_us?.items} />
      <FAQSection faqs={faqs} title={`${brand.name} ${model.name} ${service.name} — FAQ`} />
      <LocationPills locations={locations} brandSlug={brandSlug} modelSlug={modelSlug} serviceSlug={serviceSlug} />
      <RelatedServices services={servicesWithPrice} currentServiceId={service.id} brandSlug={brandSlug} modelSlug={modelSlug} />
      <CTABanner
        title={content?.cta?.headline || `Book ${brand.name} ${model.name} ${service.name} Today`}
        {...(content?.cta?.button_text ? { ctaLabel: content.cta.button_text } : {})}
        {...(content?.cta?.button_link ? { ctaHref: content.cta.button_link } : {})}
      />
    </>
  )
}
