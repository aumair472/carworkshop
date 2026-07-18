import type { Metadata } from 'next'
import { createPublicSupabase } from '@/lib/supabase/public'
import { PageHeader } from '@/components/sections/PageHeader'
import { Accordion } from '@/components/ui/Accordion'
import { CTABanner } from '@/components/sections/CTABanner'
import { resolveSEO, seoToMetadata } from '@/lib/seo'

const DEFAULT_TITLE = 'Frequently Asked Questions | CarWorkshop.ae'
const DEFAULT_DESC = 'Answers to the most common questions about car service, booking, pricing, and warranties at CarWorkshop.ae.'

export async function generateMetadata(): Promise<Metadata> {
  const supabase = await createPublicSupabase()
  const { data } = await supabase.from('static_pages').select('seo_title, seo_description, seo_json, meta_keyword').eq('slug', 'faq').eq('status', 'published').maybeSingle()
  const seo = resolveSEO(data?.seo_json, { title: data?.seo_title || DEFAULT_TITLE, description: data?.seo_description || DEFAULT_DESC, url: 'https://carworkshop.ae/faq' })
  return seoToMetadata(seo, 'https://carworkshop.ae/faq', data?.meta_keyword)
}

export const revalidate = 3600

interface FaqContent {
  hero?: { h1?: string; subheadline?: string }
  categories?: Array<{ name: string; faqs: Array<{ q: string; a: string }> }>
  cta_banner?: { visible?: boolean; headline?: string; button_text?: string; button_link?: string }
}

const FALLBACK: Array<{ name: string; items: Array<{ question: string; answer: string }> }> = [
  { name: '', items: [
    { question: 'How do I book a car service?', answer: 'Fill out the quote form on our website or call/WhatsApp us. We respond within 30 minutes during business hours.' },
    { question: 'Do you offer doorstep or mobile car service?', answer: 'Yes! We offer doorstep car service across Dubai, Abu Dhabi, Sharjah, and other UAE locations.' },
    { question: 'How much does car service cost in UAE?', answer: 'Basic oil service starts from AED 149. Request a free, no-obligation quote before booking.' },
    { question: 'Are your technicians certified?', answer: 'All our technicians are factory-trained and certified for the brands they service.' },
    { question: 'What warranty do you offer?', answer: 'We provide a 12-month or 20,000 km warranty (whichever comes first) on all parts and labour.' },
  ] },
]

export default async function FAQPage() {
  const supabase = await createPublicSupabase()
  const { data } = await supabase.from('static_pages').select('content_json').eq('slug', 'faq').eq('status', 'published').maybeSingle()
  const c = (data?.content_json ?? {}) as FaqContent

  const groups = (c.categories && c.categories.some(cat => cat.faqs.length > 0))
    ? c.categories.filter(cat => cat.faqs.length > 0).map(cat => ({ name: cat.name, items: cat.faqs.map(f => ({ question: f.q, answer: f.a })) }))
    : FALLBACK

  const allItems = groups.flatMap(g => g.items)
  const faqSchema = {
    '@context': 'https://schema.org', '@type': 'FAQPage',
    mainEntity: allItems.map(f => ({ '@type': 'Question', name: f.question, acceptedAnswer: { '@type': 'Answer', text: f.answer } })),
  }

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
      <PageHeader
        breadcrumb={[{ label: 'Home', href: '/' }, { label: 'FAQ' }]}
        title={c.hero?.h1 || 'Frequently Asked Questions'}
        subtitle={c.hero?.subheadline || 'Everything you need to know about car service at CarWorkshop.ae.'}
        showTrust={false}
      />

      <section className="py-14">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
          {groups.map((g, i) => (
            <div key={i}>
              {g.name && <h2 className="text-xl font-bold text-[#1F2937] mb-4">{g.name}</h2>}
              <Accordion items={g.items} />
            </div>
          ))}
        </div>
      </section>

      {c.cta_banner?.visible !== false && (
        <CTABanner
          title={c.cta_banner?.headline || 'Still have questions? Talk to our team'}
          ctaLabel={c.cta_banner?.button_text || 'Contact Us'}
          ctaHref={c.cta_banner?.button_link || '/contact'}
        />
      )}
    </>
  )
}
