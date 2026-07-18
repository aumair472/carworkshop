import type { Metadata } from 'next'
import { createPublicSupabase } from '@/lib/supabase/public'
import { LocationsSection } from '@/components/sections/LocationsSection'
import { CTABanner } from '@/components/sections/CTABanner'
import { PageHeader } from '@/components/sections/PageHeader'
import { Reveal } from '@/components/ui/Reveal'
import { generateCollectionSchema } from '@/lib/page-engine/schema'
import { getListingContent } from '@/lib/listing-content'
import { resolveSEO, seoToMetadata } from '@/lib/seo'
import { getStaticPageSeo, getStaticPageMetaKeyword } from '@/lib/get-page-seo'

export async function generateMetadata(): Promise<Metadata> {
  const seo = resolveSEO(await getStaticPageSeo('locations-listing'), {
    title: 'Car Service Locations Across UAE | CarWorkshop.ae',
    description: 'Find car repair and service centres across UAE — Dubai, Abu Dhabi, Sharjah, Ajman, RAK, and more. Doorstep service available.',
    url: 'https://carworkshop.ae/locations',
  })
  return seoToMetadata(seo, 'https://carworkshop.ae/locations', await getStaticPageMetaKeyword('locations-listing'))
}

export const revalidate = 3600

export default async function LocationsPage() {
  const supabase = await createPublicSupabase()
  const { data: locations } = await supabase
    .from('locations')
    .select('*')
    .eq('status', 'published')
    .order('sort_order')

  const lc = await getListingContent('locations-listing')

  const schema = generateCollectionSchema({
    name: 'Car Service Locations in UAE',
    description: 'Car repair and service coverage across the UAE.',
    path: '/locations',
    items: (locations ?? []).map(l => ({ name: l.name, path: `/locations/${l.slug}` })),
  })

  return (
    <div>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />
      <PageHeader
        breadcrumb={[{ label: 'Home', href: '/' }, { label: 'Locations' }]}
        title={lc.hero?.h1 || 'Car Service Locations in UAE'}
        subtitle={lc.hero?.subtitle || 'Find a workshop near you or book doorstep service anywhere across UAE.'}
      />
      <Reveal><LocationsSection locations={locations ?? []} title="" /></Reveal>
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
