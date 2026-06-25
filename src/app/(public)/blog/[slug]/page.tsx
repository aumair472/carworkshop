import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Image from 'next/image'
import { createServerSupabase } from '@/lib/supabase/server'
import { createServiceClient } from '@/lib/supabase/service'
import { sanitizeHTML } from '@/lib/sanitize'
import { Breadcrumb } from '@/components/ui/Breadcrumb'
import { CTABanner } from '@/components/sections/CTABanner'

interface PageProps {
  params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params
  const supabase = await createServerSupabase()
  const { data: post } = await supabase.from('blog_posts').select('title, excerpt, seo_title, seo_description, featured_image').eq('slug', slug).eq('status', 'published').single()

  if (!post) return { title: 'Post Not Found' }

  const title = post.seo_title ?? post.title
  const description = post.seo_description ?? post.excerpt ?? ''
  return {
    title,
    description,
    alternates: { canonical: `https://carworkshop.ae/blog/${slug}` },
    openGraph: { title, description, type: 'article', url: `https://carworkshop.ae/blog/${slug}`, images: post.featured_image ? [post.featured_image] : [] },
  }
}

export const revalidate = 3600

export async function generateStaticParams() {
  const supabase = createServiceClient()
  const { data } = await supabase.from('blog_posts').select('slug').eq('status', 'published')
  return (data ?? []).map(p => ({ slug: p.slug }))
}

export default async function BlogPostPage({ params }: PageProps) {
  const { slug } = await params
  const supabase = await createServerSupabase()
  const { data: post } = await supabase.from('blog_posts').select('*').eq('slug', slug).eq('status', 'published').single()

  if (!post) notFound()

  const articleSchema = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: post.title,
    description: post.excerpt,
    image: post.featured_image,
    datePublished: post.published_at,
    dateModified: post.updated_at,
    publisher: {
      '@type': 'Organization',
      name: 'CarWorkshop.ae',
    },
  }

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }} />

      <div className="bg-[#F0F4FF] py-10 border-b border-[#C7D9F5]">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <Breadcrumb items={[{ label: 'Home', href: '/' }, { label: 'Blog', href: '/blog' }, { label: post.title }]} />
        </div>
      </div>

      <article className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <header className="mb-8">
          <h1 className="text-3xl sm:text-4xl font-extrabold text-[#1F2937] mb-4 leading-tight">
            {post.title}
          </h1>
          <div className="flex items-center gap-3 text-sm text-[#9CA3AF]">
            <span>CarWorkshop Team</span>
            {post.published_at && (
              <>
                <span>·</span>
                <time dateTime={post.published_at}>
                  {new Date(post.published_at).toLocaleDateString('en-AE', { day: 'numeric', month: 'long', year: 'numeric' })}
                </time>
              </>
            )}
          </div>
        </header>

        {post.featured_image && (
          <div className="relative w-full h-64 sm:h-80 rounded-lg overflow-hidden mb-8">
            <Image src={post.featured_image} alt={post.title} fill className="object-cover" sizes="(max-width: 768px) 100vw, 768px" priority />
          </div>
        )}

        {post.content ? (
          <div className="prose prose-slate max-w-none" dangerouslySetInnerHTML={{ __html: sanitizeHTML(post.content) }} />
        ) : (
          <p className="text-[#6B7280]">{post.excerpt}</p>
        )}
      </article>

      <CTABanner />
    </>
  )
}
