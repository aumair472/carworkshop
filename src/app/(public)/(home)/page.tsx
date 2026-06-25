import type { Metadata } from 'next'
import { createServerSupabase } from '@/lib/supabase/server'
import { HeroSection } from '@/components/sections/HeroSection'
import { TrustBar } from '@/components/sections/TrustBar'
import { ServiceCardsSection } from '@/components/sections/ServiceCardsSection'
import { BrandsGrid } from '@/components/sections/BrandsGrid'
import { HowItWorks } from '@/components/sections/HowItWorks'
import { WhyChooseUs } from '@/components/sections/WhyChooseUs'
import { ReviewsCarousel } from '@/components/sections/ReviewsCarousel'
import { BlogPreview } from '@/components/sections/BlogPreview'
import { LocationsSection } from '@/components/sections/LocationsSection'
import { CTABanner } from '@/components/sections/CTABanner'
import { generateOrganizationSchema } from '@/lib/page-engine/schema'
import type { ServiceWithPrice } from '@/types'

export const metadata: Metadata = {
  title: 'CarWorkshop.ae — Trusted Car Repair & Service in UAE',
  description: 'Book expert car repair, servicing, and maintenance across UAE. Certified technicians, transparent pricing, doorstep service. Get a free quote today.',
  openGraph: {
    title: 'CarWorkshop.ae — Trusted Car Repair & Service in UAE',
    description: 'Book expert car repair, servicing, and maintenance across UAE.',
    type: 'website',
  },
}

export default async function HomePage() {
  const supabase = await createServerSupabase()

  const [{ data: services }, { data: brands }, { data: locations }, { data: posts }] = await Promise.all([
    supabase.from('services').select('*').eq('status', 'published').order('sort_order').limit(6),
    supabase.from('brands').select('*').eq('status', 'published').order('sort_order').limit(12),
    supabase.from('locations').select('*').eq('status', 'published').order('sort_order').limit(8),
    supabase.from('blog_posts').select('*').eq('status', 'published').order('published_at', { ascending: false }).limit(3),
  ])

  const orgSchema = generateOrganizationSchema()

  const servicesWithPrice: ServiceWithPrice[] = (services ?? []).map(s => ({ ...s }))

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(orgSchema) }}
      />
      <HeroSection
        h1="Expert Car Repair & Service Across UAE"
        subtitle="Certified technicians, transparent pricing, and doorstep convenience. Trusted by 50,000+ UAE car owners."
        badge="UAE's #1 Car Service Platform"
      />
      <TrustBar />
      <ServiceCardsSection services={servicesWithPrice} title="Popular Car Services" subtitle="From routine maintenance to complex repairs — we cover it all." />
      <BrandsGrid brands={brands ?? []} />
      <HowItWorks />
      <WhyChooseUs />
      <LocationsSection locations={locations ?? []} />
      <ReviewsCarousel />
      <BlogPreview posts={posts ?? []} />
      <CTABanner />
    </>
  )
}
