import { AdminTopbar } from '@/components/admin/AdminTopbar'
import { FaqTable } from '@/components/admin/faqs/FaqTable'
import { createServiceClient } from '@/lib/supabase/service'

export const metadata = { title: "FAQ's" }
export const dynamic = 'force-dynamic'

export default async function FaqsPage() {
  const service = createServiceClient()
  const { data: faqs } = await service.from('faqs').select('*').order('country').order('display_order')

  return (
    <>
      <AdminTopbar title="Manage FAQ's" />
      <div className="p-6">
        <FaqTable initialRows={faqs ?? []} />
      </div>
    </>
  )
}
