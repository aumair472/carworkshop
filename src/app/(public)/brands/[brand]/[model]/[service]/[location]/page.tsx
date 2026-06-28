import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { createPublicSupabase } from '@/lib/supabase/public'
import { sanitizeHTML } from '@/lib/sanitize'
import { HeroSection } from '@/components/sections/HeroSection'
import { WhyChooseUs } from '@/components/sections/WhyChooseUs'
import { FAQSection } from '@/components/sections/FAQSection'
import { RelatedServices } from '@/components/sections/RelatedServices'
import { CTABanner } from '@/components/sections/CTABanner'
import { Breadcrumb } from '@/components/ui/Breadcrumb'
import { generateMeta } from '@/lib/page-engine/meta'
import { generateServicePageSchema } from '@/lib/page-engine/schema'
import { getPageContent, getPageSeo } from '@/lib/page-engine/content'
import { resolveSEO, seoToMetadata } from '@/lib/seo'
import type { FAQItem, ServiceWithPrice } from '@/types'

interface PageProps {
  params: Promise<{ brand: string; model: string; service: string; location: string }>
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { brand: brandSlug, model: modelSlug, service: serviceSlug, location: locationSlug } = await params
  const supabase = await createPublicSupabase()

  const [{ data: brand }, { data: model }, { data: service }, { data: location }] = await Promise.all([
    supabase.from('brands').select('name, slug').eq('slug', brandSlug).single(),
    supabase.from('brand_models').select('name, slug').eq('slug', modelSlug).single(),
    supabase.from('services').select('name, slug').eq('slug', serviceSlug).single(),
    supabase.from('locations').select('name, slug').eq('slug', locationSlug).single(),
  ])

  if (!brand || !model || !service || !location) return { title: 'Not Found' }

  const meta = generateMeta({
    type: 'model_service_location',
    brand: { name: brand.name, slug: brand.slug },
    model: { name: model.name, slug: model.slug },
    service: { name: service.name, slug: service.slug },
    location: { name: location.name, slug: location.slug },
  })
  const canonical = `https://carworkshop.ae/brands/${brandSlug}/${modelSlug}/${serviceSlug}/${locationSlug}`
  const seo = resolveSEO(await getPageSeo(`${brandSlug}/${modelSlug}/${serviceSlug}/${locationSlug}`), { title: meta.meta_title, description: meta.meta_description, url: canonical })
  return seoToMetadata(seo, canonical)
}

export const revalidate = 86400
export const dynamicParams = true
// Empty = prebuild none (4D combos explode), but enable on-demand ISR caching.
export async function generateStaticParams() { return [] }

export default async function LocationServicePage({ params }: PageProps) {
  const { brand: brandSlug, model: modelSlug, service: serviceSlug, location: locationSlug } = await params
  const supabase = await createPublicSupabase()

  const [{ data: brand }, { data: model }, { data: service }, { data: location }] = await Promise.all([
    supabase.from('brands').select('*').eq('slug', brandSlug).eq('status', 'published').single(),
    supabase.from('brand_models').select('*').eq('slug', modelSlug).eq('status', 'published').single(),
    supabase.from('services').select('*').eq('slug', serviceSlug).eq('status', 'published').single(),
    supabase.from('locations').select('*').eq('slug', locationSlug).eq('status', 'published').single(),
  ])

  if (!brand || !model || !service || !location) notFound()

  const { data: allServices } = await supabase.from('services').select('*').eq('status', 'published').order('sort_order')

  // Editable overlay (content_json on the generated 4D page) wins over defaults.
  const content = await getPageContent(`${brandSlug}/${modelSlug}/${serviceSlug}/${locationSlug}`)
  const h1 = content?.hero?.h1 || `${brand.name} ${model.name} ${service.name} in ${location.name}`
  const subtitle = content?.hero?.subheadline || `Expert ${brand.name} ${model.name} ${service.name} in ${location.name} by certified technicians. Transparent pricing, doorstep service.`
  const mainContentHtml = content?.main_content || service.content || null

  const faqs: FAQItem[] = content?.faqs && content.faqs.length > 0
    ? content.faqs.map(f => ({ question: f.q, answer: f.a }))
    : Array.isArray(service.faq_json) && service.faq_json.length > 0
    ? (service.faq_json as unknown as FAQItem[])
    : [
        {
          question: `How much does ${service.name} cost for ${brand.name} ${model.name} in ${location.name}?`,
          answer: `${service.name} for ${brand.name} ${model.name} in ${location.name} starts from AED ${service.starting_price ?? 149}. Contact us for an exact quote.`,
        },
        {
          question: `Do you offer ${service.name} at home in ${location.name}?`,
          answer: `Yes, we offer doorstep ${service.name} in ${location.name} and surrounding areas. Book online and our certified technician will come to you.`,
        },
        {
          question: `How quickly can I get ${service.name} in ${location.name}?`,
          answer: `Same-day and next-day ${service.name} is available in ${location.name}. Call or WhatsApp us for the earliest available slot.`,
        },
      ]

  const schema = generateServicePageSchema({
    brand: brand.name,
    model: model.name,
    service: service.name,
    location: location.name,
    url: `https://carworkshop.ae/brands/${brandSlug}/${modelSlug}/${serviceSlug}/${locationSlug}`,
    faqs,
    ...(service.starting_price ? { price: service.starting_price } : {}),
  })

  const servicesWithPrice: ServiceWithPrice[] = (allServices ?? []).map(s => ({ ...s }))

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />

      <div className="bg-mesh py-8 border-b border-hairline">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Breadcrumb items={[
            { label: 'Home', href: '/' },
            { label: 'Brands', href: '/brands' },
            { label: brand.name, href: `/brands/${brandSlug}` },
            { label: model.name, href: `/brands/${brandSlug}/${modelSlug}` },
            { label: service.name, href: `/brands/${brandSlug}/${modelSlug}/${serviceSlug}` },
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
      <FAQSection faqs={faqs} title={`${service.name} in ${location.name} — FAQ`} />
      <RelatedServices services={servicesWithPrice} currentServiceId={service.id} brandSlug={brandSlug} modelSlug={modelSlug} />
      <CTABanner
        title={content?.cta?.headline || `Book ${brand.name} ${model.name} ${service.name} in ${location.name}`}
        {...(content?.cta?.button_text ? { ctaLabel: content.cta.button_text } : {})}
        {...(content?.cta?.button_link ? { ctaHref: content.cta.button_link } : {})}
      />
    </>
  )
}
