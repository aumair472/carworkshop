import type { Metadata } from 'next'
import { createPublicSupabase } from '@/lib/supabase/public'
import { sanitizeHTML } from '@/lib/sanitize'
import { WhyChooseUs } from '@/components/sections/WhyChooseUs'
import { CTABanner } from '@/components/sections/CTABanner'
import { FAQSection } from '@/components/sections/FAQSection'
import { PageHeader } from '@/components/sections/PageHeader'
import { generateOrganizationSchema } from '@/lib/page-engine/schema'
import { resolveSEO, seoToMetadata } from '@/lib/seo'
import type { FAQItem } from '@/types'

const DEFAULT_TITLE = 'About CarWorkshop.ae | Trusted Car Service in UAE'
const DEFAULT_DESC = "CarWorkshop.ae is UAE's trusted car repair platform connecting drivers with certified technicians for fast, transparent, and affordable car care."

export async function generateMetadata(): Promise<Metadata> {
  const supabase = await createPublicSupabase()
  const { data } = await supabase.from('static_pages').select('seo_title, seo_description, seo_json, meta_keyword').eq('slug', 'about').eq('status', 'published').maybeSingle()
  const seo = resolveSEO(data?.seo_json, { title: data?.seo_title || DEFAULT_TITLE, description: data?.seo_description || DEFAULT_DESC, url: 'https://carworkshop.ae/about' })
  return seoToMetadata(seo, 'https://carworkshop.ae/about', data?.meta_keyword)
}

export const revalidate = 86400

interface AboutContent {
  hero?: { h1?: string; subheadline?: string }
  main_content?: string
  mission?: { visible?: boolean; heading?: string; content?: string; values?: Array<{ icon: string; title: string; description: string }> }
  stats?: { visible?: boolean; items?: Array<{ value: string; label: string }> }
  why_choose_us?: { visible?: boolean; heading?: string; items?: Array<{ icon?: string; text?: string }> }
  faq?: { visible?: boolean; heading?: string; faqs?: Array<{ q: string; a: string }> }
  cta_banner?: { visible?: boolean; headline?: string; button_text?: string; button_link?: string }
}

const FALLBACK_MAIN = `
  <h2>Our Mission</h2><p>CarWorkshop.ae was founded with one goal: make car repair honest, convenient, and accessible for every driver in the UAE. We partner with certified workshops and mobile technicians across all seven emirates.</p>
  <h2>What We Do</h2><p>From routine oil changes to complex engine diagnostics, we cover every aspect of car care. Book online, get a fixed quote upfront, and choose workshop drop-off or doorstep service.</p>`

export default async function AboutPage() {
  const supabase = await createPublicSupabase()
  const { data } = await supabase.from('static_pages').select('content_json, sub_title').eq('slug', 'about').eq('status', 'published').maybeSingle()
  const c = (data?.content_json ?? {}) as AboutContent
  const schema = generateOrganizationSchema()

  const mainHtml = c.main_content || FALLBACK_MAIN
  const values = c.mission?.values ?? []
  const stats = c.stats?.items ?? []
  const faqs: FAQItem[] = (c.faq?.faqs ?? []).map(f => ({ question: f.q, answer: f.a }))

  return (
    <div>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />
      <PageHeader
        breadcrumb={[{ label: 'Home', href: '/' }, { label: 'About' }]}
        title={c.hero?.h1 || 'About CarWorkshop.ae'}
        subtitle={data?.sub_title || c.hero?.subheadline || "UAE's trusted platform for transparent, reliable car repair and maintenance."}
      />

      {c.stats?.visible !== false && stats.length > 0 && (
        <section className="bg-white border-b border-[#E5E7EB] py-8">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-2 sm:grid-cols-4 gap-6 text-center">
            {stats.map((s, i) => (
              <div key={i}><p className="text-2xl font-extrabold text-[#4472C4]">{s.value}</p><p className="text-sm text-[#6B7280] mt-1">{s.label}</p></div>
            ))}
          </div>
        </section>
      )}

      <section className="py-14">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 rich-content" dangerouslySetInnerHTML={{ __html: sanitizeHTML(mainHtml) }} />
      </section>

      {c.mission?.visible !== false && values.length > 0 && (
        <section className="py-12 bg-[#F9FAFB]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            {c.mission?.heading && <h2 className="text-2xl font-bold text-[#1F2937] text-center mb-8">{c.mission.heading}</h2>}
            <div className="grid sm:grid-cols-3 gap-6">
              {values.map((v, i) => (
                <div key={i} className="bg-white rounded-lg border border-[#E5E7EB] p-6 text-center">
                  <span className="text-3xl" aria-hidden="true">{v.icon}</span>
                  <h3 className="text-lg font-bold text-[#1F2937] mt-3">{v.title}</h3>
                  <p className="text-sm text-[#6B7280] mt-2">{v.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {c.why_choose_us?.visible !== false && <WhyChooseUs heading={c.why_choose_us?.heading} items={c.why_choose_us?.items} />}
      {c.faq?.visible !== false && faqs.length > 0 && <FAQSection faqs={faqs} title={c.faq?.heading || 'Common Questions'} />}
      <CTABanner
        title={c.cta_banner?.headline || 'Ready to book your car service?'}
        {...(c.cta_banner?.button_text ? { ctaLabel: c.cta_banner.button_text } : {})}
        {...(c.cta_banner?.button_link ? { ctaHref: c.cta_banner.button_link } : {})}
      />
    </div>
  )
}
