import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { createPublicSupabase } from '@/lib/supabase/public'
import { createServiceClient } from '@/lib/supabase/service'
import { sanitizeHTML } from '@/lib/sanitize'
import { HeroSection, DEFAULT_HERO_STATS } from '@/components/sections/HeroSection'
import { WhyChooseUs } from '@/components/sections/WhyChooseUs'
import { FAQSection } from '@/components/sections/FAQSection'
import { LocationsSection } from '@/components/sections/LocationsSection'
import { RelatedServices } from '@/components/sections/RelatedServices'
import { CTABanner } from '@/components/sections/CTABanner'
import { Breadcrumb } from '@/components/ui/Breadcrumb'
import { generateServicePageSchema } from '@/lib/page-engine/schema'
import { resolveSEO, seoToMetadata } from '@/lib/seo'
import type { FAQItem, PageContent } from '@/types'

interface PageProps {
  params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params
  const supabase = await createPublicSupabase()
  const { data: service } = await supabase
    .from('services')
    .select('name, short_description, seo_title, seo_description, seo_json')
    .eq('slug', slug)
    .eq('status', 'published')
    .single()

  if (!service) return { title: 'Service Not Found' }

  const url = `https://carworkshop.ae/services/${slug}`
  const seo = resolveSEO(service.seo_json, {
    title: service.seo_title ?? `${service.name} in UAE | CarWorkshop.ae`,
    description: service.seo_description ?? service.short_description ?? `Book ${service.name} across UAE. Certified technicians, transparent pricing, doorstep service.`,
    url,
  })
  return seoToMetadata(seo, url)
}

export const revalidate = 86400

export async function generateStaticParams() {
  if (!process.env.SUPABASE_SERVICE_ROLE_KEY) return []
  const supabase = createServiceClient()
  const { data } = await supabase.from('services').select('slug').eq('status', 'published')
  return (data ?? []).map(s => ({ slug: s.slug }))
}

export default async function ServicePage({ params }: PageProps) {
  const { slug } = await params
  const supabase = await createPublicSupabase()

  const [{ data: service }, { data: allServices }, { data: locations }] = await Promise.all([
    supabase.from('services').select('*').eq('slug', slug).eq('status', 'published').single(),
    supabase.from('services').select('*').eq('status', 'published').order('sort_order'),
    supabase.from('locations').select('*').eq('status', 'published').order('sort_order'),
  ])

  if (!service) notFound()

  const c = (service.content_json ?? {}) as PageContent
  const h1 = c.hero?.h1 || `${service.name} in UAE`
  const subtitle = c.hero?.subheadline || service.short_description || undefined
  const mainContentHtml = c.main_content || service.content || null

  const faqs: FAQItem[] = c.faqs && c.faqs.length > 0
    ? c.faqs.map(f => ({ question: f.q, answer: f.a }))
    : Array.isArray(service.faq_json)
      ? (service.faq_json as unknown as FAQItem[])
      : []

  const schema = generateServicePageSchema({
    service: service.name,
    url: `https://carworkshop.ae/services/${service.slug}`,
    faqs,
    ...(service.starting_price ? { price: service.starting_price } : {}),
  })

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />

      <div className="bg-mesh py-8 border-b border-hairline">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Breadcrumb items={[{ label: 'Home', href: '/' }, { label: 'Services', href: '/services' }, { label: service.name }]} />
        </div>
      </div>

      <HeroSection
        h1={h1}
        subtitle={subtitle}
        ctaLabel={`Book ${service.name}`}
        heroStats={[
          { value: service.starting_price != null ? `From AED ${service.starting_price}` : 'Get a Quote', label: 'Starting Price' },
          ...DEFAULT_HERO_STATS.slice(1),
        ]}
      />

      {mainContentHtml && (
        <section className="py-12">
          <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 rich-content">
            <div dangerouslySetInnerHTML={{ __html: sanitizeHTML(mainContentHtml) }} />
          </div>
        </section>
      )}

      <WhyChooseUs heading={c.why_choose_us?.heading} items={c.why_choose_us?.items} />
      <FAQSection faqs={faqs} />
      <LocationsSection locations={locations ?? []} serviceSlug={slug} title={`${service.name} — Service Locations`} />
      <RelatedServices services={allServices ?? []} currentServiceId={service.id} />
      <CTABanner
        title={c.cta?.headline || `Ready to Book ${service.name}?`}
        {...(c.cta?.button_text ? { ctaLabel: c.cta.button_text } : {})}
        {...(c.cta?.button_link ? { ctaHref: c.cta.button_link } : {})}
      />
    </>
  )
}
