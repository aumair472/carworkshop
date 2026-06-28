import type { Metadata } from 'next'
import { createPublicSupabase } from '@/lib/supabase/public'
import { ServiceCardsSection } from '@/components/sections/ServiceCardsSection'
import { CTABanner } from '@/components/sections/CTABanner'
import { PageHeader } from '@/components/sections/PageHeader'
import { Reveal } from '@/components/ui/Reveal'
import { generateCollectionSchema } from '@/lib/page-engine/schema'
import { getListingContent } from '@/lib/listing-content'
import { resolveSEO, seoToMetadata } from '@/lib/seo'
import { getStaticPageSeo } from '@/lib/get-page-seo'
import type { ServiceWithPrice } from '@/types'

export async function generateMetadata(): Promise<Metadata> {
  const seo = resolveSEO(await getStaticPageSeo('services-listing'), {
    title: 'Car Services in UAE | CarWorkshop.ae',
    description: 'Browse all car repair and maintenance services in UAE. Oil change, brake service, AC repair, engine diagnostics, tyre change, and more. Book online today.',
    url: 'https://carworkshop.ae/services',
  })
  return seoToMetadata(seo, 'https://carworkshop.ae/services')
}

export const revalidate = 3600

export default async function ServicesPage() {
  const supabase = await createPublicSupabase()
  const { data: services } = await supabase
    .from('services')
    .select('*')
    .eq('status', 'published')
    .order('sort_order')

  const servicesWithPrice: ServiceWithPrice[] = (services ?? []).map(s => ({ ...s }))
  const lc = await getListingContent('services-listing')

  const schema = generateCollectionSchema({
    name: 'Car Services in UAE',
    description: 'All car repair and maintenance services available across the UAE.',
    path: '/services',
    items: servicesWithPrice.map(s => ({ name: s.name, path: `/services/${s.slug}` })),
  })

  return (
    <div>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />
      <PageHeader
        breadcrumb={[{ label: 'Home', href: '/' }, { label: 'Services' }]}
        title={lc.hero?.h1 || 'Car Services in UAE'}
        subtitle={lc.hero?.subtitle || 'From routine oil changes to complex engine repairs — certified technicians, transparent pricing.'}
      />
      <Reveal>
        <ServiceCardsSection services={servicesWithPrice} title="" />
      </Reveal>
      <Reveal>
        <CTABanner
          {...(lc.cta_banner?.headline ? { title: lc.cta_banner.headline } : {})}
          {...(lc.cta_banner?.button_text ? { ctaLabel: lc.cta_banner.button_text } : {})}
          {...(lc.cta_banner?.button_link ? { ctaHref: lc.cta_banner.button_link } : {})}
        />
      </Reveal>
    </div>
  )
}
