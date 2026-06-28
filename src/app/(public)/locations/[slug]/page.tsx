import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { createPublicSupabase } from '@/lib/supabase/public'
import { createServiceClient } from '@/lib/supabase/service'
import { HeroSection } from '@/components/sections/HeroSection'
import { ServiceCardsSection } from '@/components/sections/ServiceCardsSection'
import { WhyChooseUs } from '@/components/sections/WhyChooseUs'
import { FAQSection } from '@/components/sections/FAQSection'
import { CTABanner } from '@/components/sections/CTABanner'
import { Breadcrumb } from '@/components/ui/Breadcrumb'
import { generateMeta } from '@/lib/page-engine/meta'
import { generateLocalBusinessSchema } from '@/lib/page-engine/schema'
import { resolveSEO, seoToMetadata } from '@/lib/seo'
import type { FAQItem, ServiceWithPrice, PageContent } from '@/types'

interface PageProps {
  params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params
  const supabase = await createPublicSupabase()
  const { data: location } = await supabase.from('locations').select('name, slug, emirate, seo_json').eq('slug', slug).single()

  if (!location) return { title: 'Not Found' }

  const meta = generateMeta({ type: 'location', location: { name: location.name, slug: location.slug } })
  const url = `https://carworkshop.ae/locations/${slug}`
  const seo = resolveSEO(location.seo_json, { title: meta.meta_title, description: meta.meta_description, url })
  return seoToMetadata(seo, url)
}

export const revalidate = 86400

export async function generateStaticParams() {
  if (!process.env.SUPABASE_SERVICE_ROLE_KEY) return []
  const supabase = createServiceClient()
  const { data } = await supabase.from('locations').select('slug').eq('status', 'published')
  return (data ?? []).map(l => ({ slug: l.slug }))
}

export default async function LocationPage({ params }: PageProps) {
  const { slug } = await params
  const supabase = await createPublicSupabase()

  const { data: location } = await supabase
    .from('locations')
    .select('*')
    .eq('slug', slug)
    .eq('status', 'published')
    .single()

  if (!location) notFound()

  const { data: services } = await supabase
    .from('services')
    .select('*')
    .eq('status', 'published')
    .order('sort_order')

  const c = (location.content_json ?? {}) as PageContent
  const h1 = c.hero?.h1 || `Car Service & Repair in ${location.name}`
  const subtitle = c.hero?.subheadline || location.description || `Expert car maintenance and repair in ${location.name}. Certified technicians, transparent pricing, doorstep service.`

  const faqs: FAQItem[] = c.faqs && c.faqs.length > 0
    ? c.faqs.map(f => ({ question: f.q, answer: f.a }))
    : [
        { question: `What car services are available in ${location.name}?`, answer: `We offer a full range of car services in ${location.name} including oil change, brake service, AC repair, engine diagnostics, tyre change, and more.` },
        { question: `Do you offer doorstep car service in ${location.name}?`, answer: `Yes! We offer doorstep car service across ${location.name}. Book online and a certified technician will come to your location.` },
      ]

  const schema = generateLocalBusinessSchema(location)
  const servicesWithPrice: ServiceWithPrice[] = (services ?? []).map(s => ({ ...s }))

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />

      <div className="bg-mesh py-8 border-b border-hairline">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Breadcrumb items={[{ label: 'Home', href: '/' }, { label: 'Locations', href: '/locations' }, { label: location.name }]} />
        </div>
      </div>

      <HeroSection
        h1={h1}
        subtitle={subtitle}
        ctaLabel={`Book Service in ${location.name}`}
      />

      <ServiceCardsSection services={servicesWithPrice} title={`Services in ${location.name}`} />
      <WhyChooseUs heading={c.why_choose_us?.heading} items={c.why_choose_us?.items} />
      <FAQSection faqs={faqs} title={`Car Service in ${location.name} — FAQ`} />
      <CTABanner
        title={c.cta?.headline || `Book Car Service in ${location.name} Today`}
        {...(c.cta?.button_text ? { ctaLabel: c.cta.button_text } : {})}
        {...(c.cta?.button_link ? { ctaHref: c.cta.button_link } : {})}
      />
    </>
  )
}
