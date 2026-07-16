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
    template: page.template ?? 'template_1',
    h1: page.h1,
    arabic_title: page.arabic_title ?? '',
    slug: page.slug,
    meta_title: page.meta_title,
    meta_keyword: page.meta_keyword ?? '',
    meta_description: page.meta_description ?? '',
    schema_headline: page.schema_headline ?? '',
    schema_description: page.schema_description ?? '',
    brand_id: page.brand_id ?? '',
    model_id: page.model_id ?? '',
    image_png_url: page.image_png_url ?? '',
    image_webp_url: page.image_webp_url ?? '',
    image_title: page.image_title ?? '',
    image_alt: page.image_alt ?? '',
    use_dynamic_content: page.use_dynamic_content ?? false,
    short_description: page.short_description ?? '',
    complete_description: content.main_content ?? '',
    status: page.status,
    is_expensive_car: page.is_expensive_car ?? false,
    display_in_footer: page.display_in_footer ?? false,
    highlight_text: page.highlight_text ?? '',
    mid_category_title: page.mid_category_title ?? '',
    key_points: page.key_points ?? '',
    icon_image_png_url: page.icon_image_png_url ?? '',
    icon_image_webp_url: page.icon_image_webp_url ?? '',
    icon_image_title: page.icon_image_title ?? '',
    icon_image_alt: page.icon_image_alt ?? '',
    image_bottom_png_url: page.image_bottom_png_url ?? '',
    image_bottom_webp_url: page.image_bottom_webp_url ?? '',
    image_bottom_title: page.image_bottom_title ?? '',
    image_bottom_alt: page.image_bottom_alt ?? '',
    image_large_url: page.image_large_url ?? '',
    image_mobile_url: page.image_mobile_url ?? '',
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
