import type { Metadata } from 'next'
import { createPublicSupabase } from '@/lib/supabase/public'
import { ContactForm } from './ContactForm'
import { FAQSection } from '@/components/sections/FAQSection'
import { generateOrganizationSchema } from '@/lib/page-engine/schema'
import { resolveSEO, seoToMetadata } from '@/lib/seo'
import type { FAQItem } from '@/types'

const DEFAULT_TITLE = 'Get a Free Car Service Quote | CarWorkshop.ae'
const DEFAULT_DESC = 'Book car service, repair, or maintenance in UAE. Get a free quote within 30 minutes. Certified technicians, transparent pricing.'

export async function generateMetadata(): Promise<Metadata> {
  const supabase = await createPublicSupabase()
  const { data } = await supabase.from('static_pages').select('seo_title, seo_description, seo_json').eq('slug', 'contact').eq('status', 'published').maybeSingle()
  const seo = resolveSEO(data?.seo_json, { title: data?.seo_title || DEFAULT_TITLE, description: data?.seo_description || DEFAULT_DESC, url: 'https://carworkshop.ae/contact' })
  return seoToMetadata(seo, 'https://carworkshop.ae/contact')
}

export const revalidate = 3600

interface ContactContent {
  hero?: { h1?: string; subheadline?: string }
  details?: { visible?: boolean; phone?: string; whatsapp?: string; email?: string; address?: string; weekday_hours?: string; weekend_hours?: string }
  maps?: { visible?: boolean; embed_url?: string; height?: string }
  form?: { visible?: boolean; heading?: string; success_message?: string; show_service?: boolean; show_brand?: boolean }
  faq?: { visible?: boolean; heading?: string; faqs?: Array<{ q: string; a: string }> }
}

export default async function ContactPage() {
  const supabase = await createPublicSupabase()
  const [{ data }, { data: services }, { data: brands }] = await Promise.all([
    supabase.from('static_pages').select('content_json').eq('slug', 'contact').eq('status', 'published').maybeSingle(),
    supabase.from('services').select('id, name').eq('status', 'published').order('sort_order'),
    supabase.from('brands').select('id, name').eq('status', 'published').order('sort_order'),
  ])
  const c = (data?.content_json ?? {}) as ContactContent
  const schema = generateOrganizationSchema()
  const faqs: FAQItem[] = (c.faq?.faqs ?? []).map(f => ({ question: f.q, answer: f.a }))
  const d = c.details
  const rows = d ? [
    d.phone && { label: 'Phone', value: d.phone, href: `tel:${d.phone.replace(/[^0-9+]/g, '')}` },
    d.whatsapp && { label: 'WhatsApp', value: d.whatsapp, href: `https://wa.me/${d.whatsapp.replace(/[^0-9]/g, '')}` },
    d.email && { label: 'Email', value: d.email, href: `mailto:${d.email}` },
    d.address && { label: 'Address', value: d.address },
    d.weekday_hours && { label: 'Weekdays', value: d.weekday_hours },
    d.weekend_hours && { label: 'Weekend', value: d.weekend_hours },
  ].filter(Boolean) as Array<{ label: string; value: string; href?: string }> : []

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />

      {c.form?.visible !== false ? (
        <ContactForm
          {...(c.hero?.h1 ? { heading: c.hero.h1 } : {})}
          {...(c.hero?.subheadline ? { subheadline: c.hero.subheadline } : {})}
          {...(c.form?.success_message ? { successMessage: c.form.success_message } : {})}
          {...(c.form?.show_service !== undefined ? { showService: c.form.show_service } : {})}
          showBrand={c.form?.show_brand !== false}
          services={services ?? []}
          brands={brands ?? []}
        />
      ) : (
        <div className="bg-mesh py-8 border-b border-hairline">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h1 className="text-3xl sm:text-4xl font-extrabold text-[#1F2937]">{c.hero?.h1 || 'Contact CarWorkshop.ae'}</h1>
            {c.hero?.subheadline && <p className="text-[#6B7280] mt-2 max-w-xl">{c.hero.subheadline}</p>}
          </div>
        </div>
      )}

      {c.details?.visible !== false && rows.length > 0 && (
        <section className="py-10 border-b border-[#E5E7EB]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {rows.map(r => (
              <div key={r.label} className="bg-white rounded-lg border border-[#E5E7EB] p-4">
                <p className="text-xs font-semibold text-[#6B7280] uppercase tracking-wide">{r.label}</p>
                {r.href ? <a href={r.href} className="text-[#1F2937] font-medium hover:text-[#4472C4]">{r.value}</a> : <p className="text-[#1F2937] font-medium">{r.value}</p>}
              </div>
            ))}
          </div>
        </section>
      )}

      {c.maps?.visible !== false && c.maps?.embed_url?.startsWith('https://') && (
        <section className="pb-14">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="rounded-lg overflow-hidden border border-[#E5E7EB]" style={{ height: c.maps.height || '400px' }}>
              <iframe src={c.maps.embed_url} title="Our location" className="w-full h-full" loading="lazy" referrerPolicy="no-referrer-when-downgrade" />
            </div>
          </div>
        </section>
      )}

      {c.faq?.visible !== false && faqs.length > 0 && (
        <FAQSection faqs={faqs} title={c.faq?.heading || 'Common Questions'} />
      )}
    </>
  )
}
