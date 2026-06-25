import Link from 'next/link'
import Image from 'next/image'
import { Card } from '@/components/ui/Card'
import type { BlogPost } from '@/types'

interface BlogPreviewProps {
  posts: BlogPost[]
  title?: string
}

export function BlogPreview({ posts, title = 'Car Care Tips & News' }: BlogPreviewProps) {
  if (!posts.length) return null

  return (
    <section className="py-14 lg:py-20" aria-labelledby="blog-heading">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-10">
          <h2 id="blog-heading" className="text-2xl sm:text-3xl font-extrabold text-[#1F2937]">
            {title}
          </h2>
          <Link href="/blog" className="text-sm font-semibold text-[#4472C4] hover:underline hidden sm:block">
            View All →
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {posts.slice(0, 3).map(post => (
            <Card key={post.id} padding="none" hover className="overflow-hidden flex flex-col">
              {post.featured_image && (
                <div className="relative h-48 bg-[#F3F4F6]">
                  <Image
                    src={post.featured_image}
                    alt={post.title}
                    fill
                    className="object-cover"
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                  />
                </div>
              )}
              <div className="p-5 flex flex-col flex-1">
                {post.category_id && (
                  <span className="text-xs font-semibold text-[#4472C4] uppercase tracking-wide mb-2">
                    Car Tips
                  </span>
                )}
                <h3 className="font-bold text-[#1F2937] mb-2 leading-snug line-clamp-2">
                  <Link href={`/blog/${post.slug}`} className="hover:text-[#4472C4] transition-colors">
                    {post.title}
                  </Link>
                </h3>
                {post.excerpt && (
                  <p className="text-sm text-[#6B7280] leading-relaxed mb-4 flex-1 line-clamp-3">
                    {post.excerpt}
                  </p>
                )}
                <div className="flex items-center justify-between mt-auto text-xs text-[#9CA3AF]">
                  {post.author_id && <span>Expert Team</span>}
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

        <div className="text-center mt-8 sm:hidden">
          <Link href="/blog" className="text-[#4472C4] font-semibold hover:underline">
            View All Articles →
          </Link>
        </div>
      </div>
    </section>
  )
}
