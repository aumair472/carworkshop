import type { Metadata } from 'next'
import { createPublicSupabase } from '@/lib/supabase/public'
import { BrandsGrid } from '@/components/sections/BrandsGrid'
import { CTABanner } from '@/components/sections/CTABanner'
import { PageHeader } from '@/components/sections/PageHeader'
import { Reveal } from '@/components/ui/Reveal'
import { generateCollectionSchema } from '@/lib/page-engine/schema'
import { getListingContent } from '@/lib/listing-content'
import { resolveSEO, seoToMetadata } from '@/lib/seo'
import { getStaticPageSeo, getStaticPageMetaKeyword } from '@/lib/get-page-seo'

export async function generateMetadata(): Promise<Metadata> {
  const seo = resolveSEO(await getStaticPageSeo('brands-listing'), {
    title: 'Car Brands We Service in UAE | CarWorkshop.ae',
    description: 'We service all major car brands across UAE — BMW, Mercedes, Toyota, Audi, Nissan, Honda, and more. Certified technicians for every make and model.',
    url: 'https://carworkshop.ae/brands',
  })
  return seoToMetadata(seo, 'https://carworkshop.ae/brands', await getStaticPageMetaKeyword('brands-listing'))
}

export const revalidate = 3600

export default async function BrandsPage() {
  const supabase = await createPublicSupabase()
  const { data: brands } = await supabase
    .from('brands')
    .select('*')
    .eq('status', 'published')
    .order('sort_order')

  const lc = await getListingContent('brands-listing')

  const schema = generateCollectionSchema({
    name: 'Car Brands We Service',
    description: 'All car brands serviced by CarWorkshop.ae across the UAE.',
    path: '/brands',
    items: (brands ?? []).map(b => ({ name: b.name, path: `/brands/${b.slug}` })),
  })

  return (
    <div>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />
      <PageHeader
        breadcrumb={[{ label: 'Home', href: '/' }, { label: 'Car Brands' }]}
        title={lc.hero?.h1 || 'Car Brands We Service'}
        subtitle={lc.hero?.subtitle || 'Expert service for all major makes. Factory-trained technicians for every brand.'}
      />
      <Reveal><BrandsGrid brands={brands ?? []} title="" /></Reveal>
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
