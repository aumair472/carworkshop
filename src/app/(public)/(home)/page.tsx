import type { Metadata } from 'next'
import { createPublicSupabase } from '@/lib/supabase/public'
import { HeroSection } from '@/components/sections/HeroSection'
import { TrustBar } from '@/components/sections/TrustBar'
import { ServiceCardsSection } from '@/components/sections/ServiceCardsSection'
import { BrandsGrid } from '@/components/sections/BrandsGrid'
import { HowItWorks } from '@/components/sections/HowItWorks'
import { WhyChooseUs } from '@/components/sections/WhyChooseUs'
import { ReviewsCarousel } from '@/components/sections/ReviewsCarousel'
import { BlogPreview } from '@/components/sections/BlogPreview'
import { LocationsSection } from '@/components/sections/LocationsSection'
import { FAQSection } from '@/components/sections/FAQSection'
import { CTABanner } from '@/components/sections/CTABanner'
import { Reveal } from '@/components/ui/Reveal'
import { generateOrganizationSchema } from '@/lib/page-engine/schema'
import { resolveSEO, seoToMetadata } from '@/lib/seo'
import { getStaticPageSeo } from '@/lib/get-page-seo'
import { getSettings } from '@/lib/hooks/useSettings'
import type { ServiceWithPrice, FAQItem } from '@/types'

const DEFAULT_TITLE = 'CarWorkshop.ae — Trusted Car Repair & Service in UAE'
const DEFAULT_DESC = 'Book expert car repair, servicing, and maintenance across UAE. Certified technicians, transparent pricing, doorstep service. Get a free quote today.'

export async function generateMetadata(): Promise<Metadata> {
  const supabase = await createPublicSupabase()
  const { data } = await supabase
    .from('static_pages')
    .select('seo_title, seo_description')
    .eq('slug', 'home')
    .eq('status', 'published')
    .maybeSingle()
  const title = data?.seo_title || DEFAULT_TITLE
  const description = data?.seo_description || DEFAULT_DESC
  const seo = resolveSEO(await getStaticPageSeo('home'), { title, description, url: 'https://carworkshop.ae' })
  return seoToMetadata(seo, 'https://carworkshop.ae')
}

// Shape of static_pages.content_json for the home page (all optional).
interface HomeContent {
  hero?: { h1?: string; subheadline?: string; cta_primary_text?: string; cta_primary_link?: string; cta_secondary_text?: string; cta_secondary_link?: string; image_url?: string | null }
  trust_bar?: { visible?: boolean; stats?: Array<{ icon: string; value: string; label: string }> }
  services?: { visible?: boolean; heading?: string; service_ids?: string[] }
  brands?: { visible?: boolean; heading?: string; brand_ids?: string[] }
  how_it_works?: { visible?: boolean; heading?: string; steps?: Array<{ icon?: string; title: string; description: string }> }
  why_choose_us?: { visible?: boolean; heading?: string; items?: Array<{ icon?: string; text: string }> }
  reviews?: { visible?: boolean; heading?: string; reviews?: Array<{ name: string; rating: number; service: string; text: string }> }
  blog_preview?: { visible?: boolean; heading?: string; count?: number }
  locations?: { visible?: boolean; heading?: string; location_ids?: string[] }
  faq?: { visible?: boolean; heading?: string; faqs?: Array<{ q: string; a: string }> }
  cta_banner?: { visible?: boolean; headline?: string; subheadline?: string; button_text?: string; button_link?: string; bg_color?: string }
}

const vis = (s?: { visible?: boolean }) => s?.visible !== false
const pick = <T extends { id: string }>(rows: T[], ids?: string[]) =>
  ids && ids.length > 0 ? rows.filter(r => ids.includes(r.id)) : rows

export const revalidate = 3600

export default async function HomePage() {
  const supabase = await createPublicSupabase()

  const [{ data: services }, { data: brands }, { data: locations }, { data: posts }, { data: page }] = await Promise.all([
    supabase.from('services').select('*').eq('status', 'published').order('sort_order'),
    supabase.from('brands').select('*').eq('status', 'published').order('sort_order'),
    supabase.from('locations').select('*').eq('status', 'published').order('sort_order'),
    supabase.from('blog_posts').select('*').eq('status', 'published').order('published_at', { ascending: false }).limit(6),
    supabase.from('static_pages').select('content_json').eq('slug', 'home').eq('status', 'published').maybeSingle(),
  ])

  const c = (page?.content_json ?? {}) as HomeContent
  const settings = await getSettings()
  const orgSchema = generateOrganizationSchema()

  const chosenServices = pick(services ?? [], c.services?.service_ids).slice(0, 8)
  const chosenBrands = pick(brands ?? [], c.brands?.brand_ids).slice(0, 12)
  const chosenLocations = pick(locations ?? [], c.locations?.location_ids).slice(0, 8)
  const servicesWithPrice: ServiceWithPrice[] = chosenServices.map(s => ({ ...s }))
  const blogPosts = (posts ?? []).slice(0, c.blog_preview?.count ?? 3)
  const faqs: FAQItem[] = (c.faq?.faqs ?? []).map(f => ({ question: f.q, answer: f.a }))

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(orgSchema) }} />

      <HeroSection
        h1={c.hero?.h1 || 'Expert Car Repair & Service Across UAE'}
        subtitle={c.hero?.subheadline || 'Certified technicians, transparent pricing, and doorstep convenience. Trusted by 50,000+ UAE car owners.'}
        badge="UAE's #1 Car Service Platform"
        ctaLabel={c.hero?.cta_primary_text || 'Book Now'}
        ctaHref={c.hero?.cta_primary_link || '/contact'}
        secondaryCtaLabel={c.hero?.cta_secondary_text || 'See All Services'}
        secondaryCtaHref={c.hero?.cta_secondary_link || '/services'}
        heroStats={[
          { value: settings.hero_stat_1_value, label: settings.hero_stat_1_label },
          { value: settings.hero_stat_2_value, label: settings.hero_stat_2_label },
          { value: settings.hero_stat_3_value, label: settings.hero_stat_3_label },
          { value: settings.hero_stat_4_value, label: settings.hero_stat_4_label },
        ]}
      />

      {vis(c.trust_bar) && c.trust_bar?.stats && c.trust_bar.stats.length > 0 && <TrustBar items={c.trust_bar.stats} />}

      {vis(c.services) && <Reveal><ServiceCardsSection services={servicesWithPrice} title={c.services?.heading || 'Popular Car Services'} subtitle="From routine maintenance to complex repairs — we cover it all." /></Reveal>}
      {vis(c.brands) && <Reveal><BrandsGrid brands={chosenBrands} title={c.brands?.heading || 'Brands We Service'} /></Reveal>}
      {vis(c.how_it_works) && <Reveal><HowItWorks heading={c.how_it_works?.heading} steps={c.how_it_works?.steps} /></Reveal>}
      {vis(c.why_choose_us) && <Reveal><WhyChooseUs heading={c.why_choose_us?.heading} items={c.why_choose_us?.items} /></Reveal>}
      {vis(c.locations) && <Reveal><LocationsSection locations={chosenLocations} title={c.locations?.heading || 'Find Us Across UAE'} /></Reveal>}
      {vis(c.reviews) && <Reveal><ReviewsCarousel heading={c.reviews?.heading} reviews={c.reviews?.reviews} /></Reveal>}
      {vis(c.blog_preview) && <Reveal><BlogPreview posts={blogPosts} title={c.blog_preview?.heading || 'Car Care Tips & News'} /></Reveal>}
      {vis(c.faq) && faqs.length > 0 && <Reveal><FAQSection faqs={faqs} title={c.faq?.heading || 'Common Questions'} /></Reveal>}
      {vis(c.cta_banner) && (
        <Reveal>
          <CTABanner
            title={c.cta_banner?.headline || 'Book Your Car Service Today'}
            {...(c.cta_banner?.subheadline ? { subtitle: c.cta_banner.subheadline } : {})}
            {...(c.cta_banner?.button_text ? { ctaLabel: c.cta_banner.button_text } : {})}
            {...(c.cta_banner?.button_link ? { ctaHref: c.cta_banner.button_link } : {})}
            {...(c.cta_banner?.bg_color ? { bgColor: c.cta_banner.bg_color } : {})}
            {...(settings.header_phone_number ? { secondaryHref: `tel:${settings.header_phone_number}` } : {})}
          />
        </Reveal>
      )}
    </>
  )
}
