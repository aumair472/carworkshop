import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { createServerSupabase } from '@/lib/supabase/server'
import { createServiceClient } from '@/lib/supabase/service'
import { sanitizeHTML } from '@/lib/sanitize'
import { HeroSection } from '@/components/sections/HeroSection'
import { TrustBar } from '@/components/sections/TrustBar'
import { WhyChooseUs } from '@/components/sections/WhyChooseUs'
import { FAQSection } from '@/components/sections/FAQSection'
import { LocationsSection } from '@/components/sections/LocationsSection'
import { RelatedServices } from '@/components/sections/RelatedServices'
import { CTABanner } from '@/components/sections/CTABanner'
import { Breadcrumb } from '@/components/ui/Breadcrumb'
import { generateServicePageSchema } from '@/lib/page-engine/schema'
import type { FAQItem } from '@/types'

interface PageProps {
  params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params
  const supabase = await createServerSupabase()
  const { data: service } = await supabase
    .from('services')
    .select('name, short_description, seo_title, seo_description')
    .eq('slug', slug)
    .eq('status', 'published')
    .single()

  if (!service) return { title: 'Service Not Found' }

  const title = service.seo_title ?? `${service.name} in UAE | CarWorkshop.ae`
  const description = service.seo_description ?? service.short_description ?? `Book ${service.name} across UAE. Certified technicians, transparent pricing, doorstep service.`

  return {
    title,
    description,
    alternates: { canonical: `https://carworkshop.ae/services/${slug}` },
    openGraph: { title, description, type: 'website', url: `https://carworkshop.ae/services/${slug}` },
  }
}

export const revalidate = 86400

export async function generateStaticParams() {
  const supabase = createServiceClient()
  const { data } = await supabase.from('services').select('slug').eq('status', 'published')
  return (data ?? []).map(s => ({ slug: s.slug }))
}

export default async function ServicePage({ params }: PageProps) {
  const { slug } = await params
  const supabase = await createServerSupabase()

  const [{ data: service }, { data: allServices }, { data: locations }] = await Promise.all([
    supabase.from('services').select('*').eq('slug', slug).eq('status', 'published').single(),
    supabase.from('services').select('*').eq('status', 'published').order('sort_order'),
    supabase.from('locations').select('*').eq('status', 'published').order('sort_order'),
  ])

  if (!service) notFound()

  const faqs: FAQItem[] = Array.isArray(service.faq_json)
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

      <div className="bg-[#F0F4FF] py-10 border-b border-[#C7D9F5]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Breadcrumb items={[{ label: 'Home', href: '/' }, { label: 'Services', href: '/services' }, { label: service.name }]} />
        </div>
      </div>

      <HeroSection
        h1={`${service.name} in UAE`}
        subtitle={service.short_description ?? undefined}
        ctaLabel={`Book ${service.name}`}
      />

      <TrustBar />

      {service.content && (
        <section className="py-12">
          <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 prose prose-slate max-w-none">
            <div dangerouslySetInnerHTML={{ __html: sanitizeHTML(service.content) }} />
          </div>
        </section>
      )}

      <WhyChooseUs />
      <FAQSection faqs={faqs} />
      <LocationsSection locations={locations ?? []} serviceSlug={slug} title={`${service.name} — Service Locations`} />
      <RelatedServices services={allServices ?? []} currentServiceId={service.id} />
      <CTABanner title={`Ready to Book ${service.name}?`} />
    </>
  )
}
