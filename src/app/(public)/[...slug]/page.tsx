import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { getPageBySlug, getRelatedSections, getBrandName, type RelatedLink } from '@/lib/page-engine/content'
import { resolveSEO, seoToMetadata } from '@/lib/seo'
import { createPublicSupabase } from '@/lib/supabase/public'
import { HeroSection, DEFAULT_HERO_STATS } from '@/components/sections/HeroSection'
import { WhyChooseUs } from '@/components/sections/WhyChooseUs'
import { CTABanner } from '@/components/sections/CTABanner'

export const revalidate = 3600

interface Props { params: Promise<{ slug: string[] }> }

async function loadPage(slugParts: string[]) {
  const slug = slugParts.join('/')
  const page = await getPageBySlug(slug)
  if (!page) return null
  const brandName = await getBrandName(page.brand_id)
  const sections = await getRelatedSections(page, brandName)
  return { page, sections, brandName }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const loaded = await loadPage(slug)
  if (!loaded) return {}
  const { page } = loaded
  const seo = resolveSEO(page.seo_json, {
    title: page.meta_title,
    description: page.meta_description,
    url: `https://carworkshop.ae/${page.slug}`,
  })
  return seoToMetadata(seo)
}

export async function generateStaticParams() {
  const supabase = createPublicSupabase()
  const { data } = await supabase
    .from('generated_pages')
    .select('slug')
    .eq('status', 'published')
    .order('updated_at', { ascending: false })
    .limit(500)
  return (data ?? []).map(p => ({ slug: p.slug.split('/') }))
}

function LinkGrid({ title, links }: { title: string; links: RelatedLink[] }) {
  if (links.length === 0) return null
  return (
    <section className="py-12 border-t border-hairline">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-xl font-extrabold text-[#0F172A] mb-6">{title}</h2>
        <div className="flex flex-wrap gap-2.5">
          {links.map(l => (
            <Link
              key={l.slug}
              href={`/${l.slug}`}
              className="inline-flex items-center rounded-full border border-[#E2E8F0] bg-white px-4 py-2 text-sm font-medium text-[#334155] hover:border-[#4472C4] hover:text-[#4472C4] transition-colors"
            >
              {l.h1}
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}

function ServiceCards({ title, links }: { title: string; links: RelatedLink[] }) {
  if (links.length === 0) return null
  return (
    <section className="py-12 border-t border-hairline">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-xl font-extrabold text-[#0F172A] mb-6">{title}</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {links.map(l => (
            <Link key={l.slug} href={`/${l.slug}`} className="group card-premium flex flex-col p-6">
              <h3 className="text-base font-bold text-[#0F172A] mb-2 group-hover:text-[#274E96] transition-colors">{l.h1}</h3>
              {l.short_description && (
                <p className="text-sm text-[#64748B] leading-relaxed line-clamp-3">{l.short_description}</p>
              )}
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}

export default async function GeneratedPage({ params }: Props) {
  const { slug } = await params
  const loaded = await loadPage(slug)
  if (!loaded) notFound()
  const { page, sections, brandName } = loaded

  const heroStats = page.starting_price
    ? [{ value: page.starting_price, label: 'Starting Price' }, ...DEFAULT_HERO_STATS.slice(1)]
    : undefined

  const servicesHeading = page.content_json?.services_heading || 'Our Services'
  const modelsHeading = brandName ? `${brandName} Models We Serve` : 'Models We Serve'

  return (
    <>
      <HeroSection h1={page.h1} subtitle={page.short_description ?? undefined} heroStats={heroStats} />

      <ServiceCards title={servicesHeading} links={sections.services} />

      <WhyChooseUs />

      {page.content_json?.main_content && (
        <section className="py-12 border-t border-hairline">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 prose prose-slate max-w-none">
            <div dangerouslySetInnerHTML={{ __html: page.content_json.main_content }} />
          </div>
        </section>
      )}

      {sections.models.length > 0 && <LinkGrid title={modelsHeading} links={sections.models} />}

      <LinkGrid title="Locations We Serve" links={sections.locations} />

      <CTABanner />
    </>
  )
}
