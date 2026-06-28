'use client'

import { FAQRepeater } from '@/components/admin/FAQRepeater'
import { useStaticPage } from '@/components/admin/useStaticPage'
import { AdminInput, AdminSelect } from '@/components/admin/ui/AdminField'
import { AdminButton } from '@/components/admin/ui/AdminButton'
import { AdminSectionCard } from '@/components/admin/ui/AdminSectionCard'
import { EditorChrome, StatusCard, SeoCard, InfoCard } from '@/components/admin/EditorChrome'
import { StaticSeoCard } from '@/components/admin/StaticSeoCard'
import { EditorSkeleton } from '@/app/admin/brands/[id]/page'

interface FAQ { q: string; a: string }
interface ContactContent {
  hero: { h1: string; subheadline: string }
  details: { visible: boolean; phone: string; whatsapp: string; email: string; address: string; weekday_hours: string; weekend_hours: string }
  maps: { visible: boolean; embed_url: string; height: string }
  form: { visible: boolean; heading: string; success_message: string; show_service: boolean; show_brand: boolean }
  faq: { visible: boolean; heading: string; faqs: FAQ[] }
}

const merge = (s: Partial<ContactContent> | null): ContactContent => ({
  hero: { h1: 'Contact CarWorkshop.ae', subheadline: "Get in touch — we're here to help", ...s?.hero },
  details: { visible: true, phone: '', whatsapp: '', email: 'info@carworkshop.ae', address: 'Al Quoz, Dubai, UAE', weekday_hours: 'Monday – Friday: 8am – 8pm', weekend_hours: 'Saturday – Sunday: 9am – 6pm', ...s?.details },
  maps: { visible: true, embed_url: '', height: '400px', ...s?.maps },
  form: { visible: true, heading: 'Send Us a Message', success_message: "Thank you! We'll contact you within 24 hours.", show_service: true, show_brand: true, ...s?.form },
  faq: { visible: true, heading: 'Common Questions', faqs: [], ...s?.faq },
})

export default function ContactEditor() {
  const p = useStaticPage<ContactContent>('contact', 'Contact', merge)
  const c = p.content
  if (p.loading) return <EditorSkeleton />

  return (
    <EditorChrome
      breadcrumb={[{ label: 'Pages', href: '/admin/pages' }, { label: 'Contact' }]}
      title="Contact Page" saving={p.saving}
      onSaveDraft={() => void p.save('draft')} onPublish={() => void p.save('published')}
      sidebar={<>
        <StatusCard status={p.status} onChange={p.setStatus} viewHref="/contact" savedLabel={p.savedLabel} />
        <SeoCard slug="contact" title={p.seoTitle} description={p.seoDesc} onTitle={p.setSeoTitle} onDescription={p.setSeoDesc} />
        <InfoCard rows={[{ k: 'Type', v: 'Static — Contact' }, { k: 'URL', v: '/contact', mono: true }]} />
      </>}
    >
      <div className="space-y-4">
        <AdminSectionCard title="Hero">
          <AdminInput label="H1 Heading" required value={c.hero.h1} onChange={e => p.patch('hero', { h1: e.target.value })} />
          <AdminInput label="Subheadline" value={c.hero.subheadline} onChange={e => p.patch('hero', { subheadline: e.target.value })} />
        </AdminSectionCard>

        <AdminSectionCard title="Contact Details" visible={c.details.visible} onVisibleChange={v => p.patch('details', { visible: v })}>
          <div className="grid grid-cols-2 gap-3">
            <AdminInput label="Phone Number" value={c.details.phone} onChange={e => p.patch('details', { phone: e.target.value })} />
            <AdminInput label="WhatsApp Number" value={c.details.whatsapp} onChange={e => p.patch('details', { whatsapp: e.target.value })} />
            <AdminInput label="Email Address" value={c.details.email} onChange={e => p.patch('details', { email: e.target.value })} />
            <AdminInput label="Business Address" value={c.details.address} onChange={e => p.patch('details', { address: e.target.value })} />
            <AdminInput label="Weekday Hours" value={c.details.weekday_hours} onChange={e => p.patch('details', { weekday_hours: e.target.value })} />
            <AdminInput label="Weekend Hours" value={c.details.weekend_hours} onChange={e => p.patch('details', { weekend_hours: e.target.value })} />
          </div>
        </AdminSectionCard>

        <AdminSectionCard title="Google Maps" visible={c.maps.visible} onVisibleChange={v => p.patch('maps', { visible: v })}>
          <AdminInput label="Maps Embed URL" value={c.maps.embed_url} placeholder="https://www.google.com/maps/embed?…" onChange={e => p.patch('maps', { embed_url: e.target.value })} />
          <AdminSelect label="Height" value={c.maps.height} options={[{ value: '300px', label: '300px' }, { value: '400px', label: '400px' }, { value: '500px', label: '500px' }]} onChange={e => p.patch('maps', { height: e.target.value })} />
          {c.maps.embed_url.startsWith('https://') && (
            <div className="rounded-lg overflow-hidden border border-zinc-200 aspect-video"><iframe src={c.maps.embed_url} title="Map preview" className="w-full h-full" loading="lazy" referrerPolicy="no-referrer-when-downgrade" /></div>
          )}
        </AdminSectionCard>

        <AdminSectionCard title="Contact Form" visible={c.form.visible} onVisibleChange={v => p.patch('form', { visible: v })}>
          <p className="text-xs text-zinc-500 -mt-1">Toggle the eye to show or hide the lead-capture form on the public contact page.</p>
          <AdminInput label="Form Heading" value={c.form.heading} onChange={e => p.patch('form', { heading: e.target.value })} />
          <AdminInput label="Success Message" value={c.form.success_message} onChange={e => p.patch('form', { success_message: e.target.value })} />
          <div className="flex flex-wrap gap-4 pt-1">
            <Toggle label="Show service dropdown" checked={c.form.show_service} onChange={v => p.patch('form', { show_service: v })} />
            <Toggle label="Show brand dropdown" checked={c.form.show_brand} onChange={v => p.patch('form', { show_brand: v })} />
          </div>
        </AdminSectionCard>

        <AdminSectionCard title="FAQ" visible={c.faq.visible} onVisibleChange={v => p.patch('faq', { visible: v })}>
          <AdminInput label="Section Heading" value={c.faq.heading} onChange={e => p.patch('faq', { heading: e.target.value })} />
          <FAQRepeater items={c.faq.faqs.map(f => ({ question: f.q, answer: f.a }))} onChange={v => p.patch('faq', { faqs: v.map(i => ({ q: i.question, a: i.answer })) })} />
        </AdminSectionCard>

        <AdminSectionCard title="SEO (Advanced)" defaultOpen={false}>
          <StaticSeoCard seoJson={p.seoJson} setSeoJson={p.setSeoJson} saveSeo={() => void p.saveSeo()} saving={p.saving}
            pageUrl="https://carworkshop.ae/contact" defaultTitle={c.hero.h1} defaultDescription={c.hero.subheadline} autoSchemas={['Organization']} />
        </AdminSectionCard>

        <div className="flex justify-end gap-2 pt-2">
          <AdminButton variant="outline" loading={p.saving} onClick={() => void p.save('draft')}>Save Draft</AdminButton>
          <AdminButton variant="orange" loading={p.saving} onClick={() => void p.save('published')}>Publish</AdminButton>
        </div>
      </div>
    </EditorChrome>
  )
}

function Toggle({ label, checked, onChange }: { label: string; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <label className="flex items-center gap-2 text-sm text-zinc-700 cursor-pointer">
      <input type="checkbox" checked={checked} onChange={e => onChange(e.target.checked)} className="h-4 w-4 rounded border-zinc-300 text-[#4472C4]" />
      {label}
    </label>
  )
}
