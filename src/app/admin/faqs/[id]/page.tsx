import { notFound } from 'next/navigation'
import { AdminTopbar } from '@/components/admin/AdminTopbar'
import { FaqForm, type FaqFormValues } from '@/components/admin/faqs/FaqForm'
import { createServiceClient } from '@/lib/supabase/service'

export const metadata = { title: 'Edit FAQ' }
export const dynamic = 'force-dynamic'

export default async function EditFaqPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const service = createServiceClient()
  const { data: faq } = await service.from('faqs').select('*').eq('id', id).maybeSingle()
  if (!faq) notFound()

  const initial: FaqFormValues = {
    country: faq.country,
    name: faq.name,
    arabic_name: faq.arabic_name ?? '',
    description_html: faq.description_html,
    arabic_description_html: faq.arabic_description_html,
    display_order: faq.display_order,
    is_active: faq.is_active,
  }

  return (
    <>
      <AdminTopbar title={`Edit FAQ's - ${faq.name}`} />
      <div className="p-6">
        <FaqForm faqId={id} initial={initial} />
      </div>
    </>
  )
}
