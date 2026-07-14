import { AdminTopbar } from '@/components/admin/AdminTopbar'
import { SeoPageForm, EMPTY_SEO_PAGE } from '@/components/admin/seo-pages/SeoPageForm'
import { createServiceClient } from '@/lib/supabase/service'

export const metadata = { title: 'Add New Page' }
export const dynamic = 'force-dynamic'

export default async function NewSeoPagePage() {
  const service = createServiceClient()
  const { data: brands } = await service.from('brands').select('id, name').order('name')

  return (
    <>
      <AdminTopbar title="ADD NEW PAGE" />
      <div className="p-6">
        <SeoPageForm initial={EMPTY_SEO_PAGE} brands={brands ?? []} />
      </div>
    </>
  )
}
