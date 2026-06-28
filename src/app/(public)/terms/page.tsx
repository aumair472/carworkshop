import type { Metadata } from 'next'
import { createPublicSupabase } from '@/lib/supabase/public'
import { sanitizeHTML } from '@/lib/sanitize'
import { PageHeader } from '@/components/sections/PageHeader'
import { resolveSEO, seoToMetadata } from '@/lib/seo'

const DEFAULT_TITLE = 'Terms & Conditions | CarWorkshop.ae'
const DEFAULT_DESC = 'Terms and conditions for using CarWorkshop.ae car service platform in the UAE.'

export async function generateMetadata(): Promise<Metadata> {
  const supabase = await createPublicSupabase()
  const { data } = await supabase.from('static_pages').select('seo_title, seo_description, seo_json').eq('slug', 'terms').eq('status', 'published').maybeSingle()
  const seo = resolveSEO(data?.seo_json, { title: data?.seo_title || DEFAULT_TITLE, description: data?.seo_description || DEFAULT_DESC, url: 'https://carworkshop.ae/terms' })
  return seoToMetadata(seo, 'https://carworkshop.ae/terms')
}

export const revalidate = 86400

interface PolicyContent { h1?: string; last_updated?: string; content?: string }

const FALLBACK = `
  <h2>Acceptance of Terms</h2><p>By using CarWorkshop.ae you agree to these terms. If you do not agree, please do not use our services.</p>
  <h2>Services</h2><p>CarWorkshop.ae connects customers with certified car service technicians in the UAE. All prices are in AED and include VAT.</p>
  <h2>Booking &amp; Payments</h2><ul><li>A booking is confirmed once you receive a confirmation from our team.</li><li>Payment is due upon completion of service.</li></ul>
  <h2>Warranty</h2><p>All services carry a 12-month or 20,000 km warranty on parts and labour.</p>
  <h2>Governing Law</h2><p>These terms are governed by UAE law. Disputes are subject to the jurisdiction of Dubai courts.</p>`

export default async function TermsPage() {
  const supabase = await createPublicSupabase()
  const { data } = await supabase.from('static_pages').select('content_json').eq('slug', 'terms').eq('status', 'published').maybeSingle()
  const c = (data?.content_json ?? {}) as PolicyContent
  const h1 = c.h1 || 'Terms & Conditions'
  const updated = c.last_updated ? new Date(c.last_updated).toLocaleDateString('en-AE', { day: 'numeric', month: 'long', year: 'numeric' }) : 'June 2025'
  const html = c.content || FALLBACK

  return (
    <div>
      <PageHeader
        breadcrumb={[{ label: 'Home', href: '/' }, { label: 'Terms & Conditions' }]}
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
