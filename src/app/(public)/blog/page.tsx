import type { Metadata } from 'next'
import Link from 'next/link'
import Image from 'next/image'
import { createPublicSupabase } from '@/lib/supabase/public'
import { PageHeader } from '@/components/sections/PageHeader'
import { Card } from '@/components/ui/Card'
import { CTABanner } from '@/components/sections/CTABanner'
import { generateCollectionSchema } from '@/lib/page-engine/schema'
import { getListingContent } from '@/lib/listing-content'
import { resolveSEO, seoToMetadata } from '@/lib/seo'
import { getStaticPageSeo } from '@/lib/get-page-seo'

export async function generateMetadata(): Promise<Metadata> {
  const seo = resolveSEO(await getStaticPageSeo('blog-listing'), {
    title: 'Car Care Blog | Tips, News & Advice | CarWorkshop.ae',
    description: 'Car care tips, maintenance guides, and automotive news for UAE drivers. Expert advice from certified technicians.',
    url: 'https://carworkshop.ae/blog',
  })
  return seoToMetadata(seo, 'https://carworkshop.ae/blog')
}

export const revalidate = 3600

export default async function BlogPage() {
  const supabase = await createPublicSupabase()
  const { data: posts } = await supabase
    .from('blog_posts')
    .select('*')
    .eq('status', 'published')
    .order('published_at', { ascending: false })
    .limit(12)

  const lc = await getListingContent('blog-listing')

  const schema = generateCollectionSchema({
    name: 'Car Care Blog',
    description: 'Car care tips, maintenance guides, and automotive news for UAE drivers.',
    path: '/blog',
    items: (posts ?? []).map(p => ({ name: p.title, path: `/blog/${p.slug}` })),
  })

  return (
    <div>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />
      <PageHeader
        breadcrumb={[{ label: 'Home', href: '/' }, { label: 'Blog' }]}
        title={lc.hero?.h1 || 'Car Care Blog'}
        subtitle={lc.hero?.subtitle || 'Expert tips, maintenance guides, and automotive news for UAE drivers.'}
        showTrust={false}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
        {(!posts || posts.length === 0) ? (
          <p className="text-center text-[#6B7280] py-20">No posts published yet. Check back soon.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {posts.map(post => (
              <Card key={post.id} padding="none" hover className="overflow-hidden flex flex-col">
                {post.featured_image && (
                  <div className="relative h-48 bg-[#F3F4F6]">
                    <Image src={post.featured_image} alt={post.title} fill className="object-cover" sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw" />
                  </div>
                )}
                <div className="p-5 flex flex-col flex-1">
                  <h2 className="font-bold text-[#1F2937] mb-2 leading-snug line-clamp-2">
                    <Link href={`/blog/${post.slug}`} className="hover:text-[#4472C4] transition-colors">
                      {post.title}
                    </Link>
                  </h2>
                  {post.excerpt && (
                    <p className="text-sm text-[#6B7280] mb-4 flex-1 line-clamp-3">{post.excerpt}</p>
                  )}
                  <div className="flex justify-between items-center text-xs text-[#9CA3AF] mt-auto pt-3 border-t border-[#F3F4F6]">
                    <span>CarWorkshop Team</span>
                    {post.published_at && (
                      <time dateTime={post.published_at}>
                        {new Date(post.published_at).toLocaleDateString('en-AE', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </time>
                    )}
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>

      <CTABanner
        {...(lc.cta_banner?.headline ? { title: lc.cta_banner.headline } : {})}
        {...(lc.cta_banner?.button_text ? { ctaLabel: lc.cta_banner.button_text } : {})}
        {...(lc.cta_banner?.button_link ? { ctaHref: lc.cta_banner.button_link } : {})}
      />
    </div>
  )
}
