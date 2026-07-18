import type { Metadata } from 'next'
import { createPublicSupabase } from '@/lib/supabase/public'
import { sanitizeHTML } from '@/lib/sanitize'
import { PageHeader } from '@/components/sections/PageHeader'
import { resolveSEO, seoToMetadata } from '@/lib/seo'

const DEFAULT_TITLE = 'Privacy Policy | CarWorkshop.ae'
const DEFAULT_DESC = 'How CarWorkshop.ae collects, uses, and protects your personal data in accordance with UAE data protection laws.'

export async function generateMetadata(): Promise<Metadata> {
  const supabase = await createPublicSupabase()
  const { data } = await supabase.from('static_pages').select('seo_title, seo_description, seo_json, meta_keyword').eq('slug', 'privacy').eq('status', 'published').maybeSingle()
  const seo = resolveSEO(data?.seo_json, { title: data?.seo_title || DEFAULT_TITLE, description: data?.seo_description || DEFAULT_DESC, url: 'https://carworkshop.ae/privacy' })
  return seoToMetadata(seo, 'https://carworkshop.ae/privacy', data?.meta_keyword)
}

export const revalidate = 86400

interface PolicyContent { h1?: string; last_updated?: string; content?: string }

const FALLBACK = `
  <h2>Information We Collect</h2><p>When you request a quote or contact us, we collect your name, phone number, email address, and details about your vehicle and service needs.</p>
  <h2>How We Use Your Information</h2><ul><li>To respond to your service enquiry and provide quotes</li><li>To schedule and confirm appointments</li><li>To improve our services and website</li></ul>
  <h2>Data Sharing</h2><p>We never sell your personal data. We may share it with trusted service partners solely to fulfil your booking.</p>
  <h2>Your Rights</h2><p>You have the right to access, correct, or delete your personal data. Email <a href="mailto:privacy@carworkshop.ae">privacy@carworkshop.ae</a>.</p>`

export default async function PrivacyPage() {
  const supabase = await createPublicSupabase()
  const { data } = await supabase.from('static_pages').select('content_json').eq('slug', 'privacy').eq('status', 'published').maybeSingle()
  const c = (data?.content_json ?? {}) as PolicyContent
  const h1 = c.h1 || 'Privacy Policy'
  const updated = c.last_updated ? new Date(c.last_updated).toLocaleDateString('en-AE', { day: 'numeric', month: 'long', year: 'numeric' }) : 'June 2025'
  const html = c.content || FALLBACK

  return (
    <div>
      <PageHeader
        breadcrumb={[{ label: 'Home', href: '/' }, { label: 'Privacy Policy' }]}
        title={h1}
        subtitle={`Last updated: ${updated}`}
        showTrust={false}
      />
      <section className="py-14">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 rich-content" dangerouslySetInnerHTML={{ __html: sanitizeHTML(html) }} />
      </section>
    </div>
  )
}
