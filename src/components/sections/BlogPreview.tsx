import Link from 'next/link'
import Image from 'next/image'
import type { BlogPost } from '@/types'

interface BlogPreviewProps {
  posts: BlogPost[]
  title?: string
}

export function BlogPreview({ posts, title = 'Car Care Tips & News' }: BlogPreviewProps) {
  if (!posts.length) return null

  return (
    <section className="py-16 lg:py-24" aria-labelledby="blog-heading">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-end justify-between mb-12">
          <h2 id="blog-heading" className="display-tight text-balance text-3xl sm:text-4xl font-extrabold text-[#0F172A]">
            {title}
          </h2>
          <Link href="/blog" className="text-sm font-semibold text-[#4472C4] hover:underline hidden sm:inline-flex items-center gap-1">
            View All →
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 lg:gap-6">
          {posts.slice(0, 3).map(post => (
            <article key={post.id} className="group card-premium overflow-hidden flex flex-col">
              <Link href={`/blog/${post.slug}`} className="relative h-48 bg-[#EEF1F5] block overflow-hidden">
                {post.featured_image ? (
                  <Image
                    src={post.featured_image}
                    alt={post.title}
                    fill
                    className="object-cover group-hover:scale-[1.04] transition-transform duration-500"
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                  />
                ) : (
                  <div className="absolute inset-0 bg-gradient-primary opacity-90" />
                )}
              </Link>
              <div className="p-6 flex flex-col flex-1">
                <span className="text-[11px] font-bold text-[#4472C4] uppercase tracking-wider mb-2">Car Tips</span>
                <h3 className="font-bold text-[#0F172A] mb-2 leading-snug line-clamp-2 text-lg">
                  <Link href={`/blog/${post.slug}`} className="group-hover:text-[#274E96] transition-colors">
                    {post.title}
                  </Link>
                </h3>
                {post.excerpt && (
                  <p className="text-sm text-[#64748B] leading-relaxed mb-4 flex-1 line-clamp-3">
                    {post.excerpt}
                  </p>
                )}
                <div className="flex items-center justify-between mt-auto text-xs text-[#94A3B8] border-t border-hairline pt-4">
                  <span>CarWorkshop Team</span>
                  {post.published_at && (
                    <time dateTime={post.published_at}>
                      {new Date(post.published_at).toLocaleDateString('en-AE', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </time>
                  )}
                </div>
              </div>
            </article>
          ))}
        </div>

        <div className="text-center mt-10 sm:hidden">
          <Link href="/blog" className="text-[#4472C4] font-semibold hover:underline">
            View All Articles →
          </Link>
        </div>
      </div>
    </section>
  )
}
