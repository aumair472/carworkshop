import type { Metadata } from 'next'
import Link from 'next/link'
import Image from 'next/image'
import { createServerSupabase } from '@/lib/supabase/server'
import { Breadcrumb } from '@/components/ui/Breadcrumb'
import { Card } from '@/components/ui/Card'

export const metadata: Metadata = {
  title: 'Car Care Blog | Tips, News & Advice | CarWorkshop.ae',
  description: 'Car care tips, maintenance guides, and automotive news for UAE drivers. Expert advice from certified technicians.',
  alternates: { canonical: 'https://carworkshop.ae/blog' },
  openGraph: { title: 'Car Care Blog | CarWorkshop.ae', description: 'Car care tips and automotive news for UAE drivers.', type: 'website', url: 'https://carworkshop.ae/blog' },
}

export default async function BlogPage() {
  const supabase = await createServerSupabase()
  const { data: posts } = await supabase
    .from('blog_posts')
    .select('*')
    .eq('status', 'published')
    .order('published_at', { ascending: false })
    .limit(12)

  return (
    <div>
      <div className="bg-[#F0F4FF] py-10 border-b border-[#C7D9F5]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Breadcrumb items={[{ label: 'Home', href: '/' }, { label: 'Blog' }]} />
          <h1 className="text-3xl sm:text-4xl font-extrabold text-[#1F2937] mt-4">Car Care Blog</h1>
          <p className="text-[#6B7280] mt-2">Expert tips, maintenance guides, and automotive news for UAE drivers.</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
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
    </div>
  )
}
