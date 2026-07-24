import { notFound } from 'next/navigation'
import { AdminTopbar } from '@/components/admin/AdminTopbar'
import { SeoPageForm, type SeoPageFormValues } from '@/components/admin/seo-pages/SeoPageForm'
import { createServiceClient } from '@/lib/supabase/service'
import type { PageContent } from '@/types'

export const metadata = { title: 'Edit Page' }
export const dynamic = 'force-dynamic'

export default async function EditSeoPagePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const service = createServiceClient()
  const [{ data: page }, { data: brands }] = await Promise.all([
    service.from('generated_pages').select('*').eq('id', id).maybeSingle(),
    service.from('brands').select('id, name').order('name'),
  ])
  if (!page) notFound()

  const content = (page.content_json ?? {}) as PageContent

  const initial: SeoPageFormValues = {
    country: page.country ?? 'AE',
    state: page.state ?? '',
    template_type: page.template_type,
    h1: page.h1,
    arabic_title: page.arabic_title ?? '',
    slug: page.slug,
    meta_title: page.meta_title,
    meta_keyword: page.meta_keyword ?? '',
    meta_description: page.meta_description ?? '',
    brand_id: page.brand_id ?? '',
    model_id: page.model_id ?? '',
    starting_price: page.starting_price ?? '',
    short_description: page.short_description ?? '',
    complete_description: content.main_content ?? '',
    status: page.status,
    display_in_footer: page.display_in_footer ?? false,
    content_json: content,
  }

  return (
    <>
      <AdminTopbar title="EDIT PAGE" />
      <div className="p-6">
        <SeoPageForm pageId={id} initial={initial} brands={brands ?? []} />
      </div>
    </>
  )
}
