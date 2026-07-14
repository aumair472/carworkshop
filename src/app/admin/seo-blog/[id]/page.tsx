import { notFound } from 'next/navigation'
import { AdminTopbar } from '@/components/admin/AdminTopbar'
import { SeoBlogForm, type SeoBlogFormValues } from '@/components/admin/seo-blog/SeoBlogForm'
import { createServiceClient } from '@/lib/supabase/service'

export const metadata = { title: 'Edit Blog Page' }
export const dynamic = 'force-dynamic'

export default async function EditSeoBlogPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const service = createServiceClient()
  const { data: post } = await service.from('blog_posts').select('*').eq('id', id).maybeSingle()
  if (!post) notFound()

  const initial: SeoBlogFormValues = {
    country: post.country ?? 'AE',
    state: post.state ?? '',
    published_at: post.published_at ? post.published_at.slice(0, 10) : '',
    title: post.title,
    arabic_title: post.arabic_title ?? '',
    slug: post.slug,
    seo_title: post.seo_title ?? '',
    meta_keyword: post.meta_keyword ?? '',
    seo_description: post.seo_description ?? '',
    image_png_url: post.image_png_url ?? '',
    image_webp_url: post.image_webp_url ?? '',
    image_title: post.image_title ?? '',
    image_alt: post.image_alt ?? '',
    excerpt: post.excerpt ?? '',
    arabic_excerpt: post.arabic_excerpt ?? '',
    blockquote: post.blockquote ?? '',
    arabic_blockquote: post.arabic_blockquote ?? '',
    content: post.content ?? '',
    arabic_content: post.arabic_content ?? '',
    tags: post.tags ?? '',
    tags_ar: post.tags_ar ?? '',
    status: post.status,
    is_featured: post.is_featured ?? false,
  }

  return (
    <>
      <AdminTopbar title="EDIT BLOG PAGE" />
      <div className="p-6">
        <SeoBlogForm postId={id} initial={initial} />
      </div>
    </>
  )
}
