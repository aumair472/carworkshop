import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { createServerSupabase } from '@/lib/supabase/server'
import { createServiceClient } from '@/lib/supabase/service'
import { sanitizeHTML } from '@/lib/sanitize'
import { HeroSection } from '@/components/sections/HeroSection'
import { CTABanner } from '@/components/sections/CTABanner'
import { WhyChooseUs } from '@/components/sections/WhyChooseUs'

interface PageProps {
  params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params
  const supabase = await createServerSupabase()
  const { data: page } = await supabase.from('static_pages').select('title, seo_title, seo_description').eq('slug', `lp/${slug}`).single()

  if (!page) return { title: 'Not Found' }
  const title = page.seo_title ?? page.title
  const description = page.seo_description ?? ''
  return {
    title,
    description,
    alternates: { canonical: `https://carworkshop.ae/lp/${slug}` },
    openGraph: { title, description, type: 'website', url: `https://carworkshop.ae/lp/${slug}` },
    robots: { index: false },
  }
}

export const revalidate = 3600

export async function generateStaticParams() {
  const supabase = createServiceClient()
  const { data } = await supabase.from('static_pages').select('slug').like('slug', 'lp/%').eq('status', 'published')
  return (data ?? []).map(p => ({ slug: p.slug.replace('lp/', '') }))
}

export default async function LandingPage({ params }: PageProps) {
  const { slug } = await params
  const supabase = await createServerSupabase()
  const { data: page } = await supabase.from('static_pages').select('*').eq('slug', `lp/${slug}`).eq('status', 'published').single()

  if (!page) notFound()

  const sections = (page.sections_json as Record<string, unknown> | null)
  const h1 = sections?.h1 as string | undefined
  const subtitle = sections?.subtitle as string | undefined
  const body = sections?.body as string | undefined

  return (
    <>
      <HeroSection
        h1={h1 ?? page.title}
        subtitle={subtitle}
        ctaLabel="Get a Free Quote"
      />

      {body && (
        <section className="py-12">
          <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 prose prose-slate max-w-none">
            <div dangerouslySetInnerHTML={{ __html: sanitizeHTML(body) }} />
          </div>
        </section>
      )}

      <WhyChooseUs />
      <CTABanner title="Ready to book your service?" />
    </>
  )
}
