import { notFound } from 'next/navigation'
import { createServerSupabase } from '@/lib/supabase/server'
import { AdminTopbar } from '@/components/admin/AdminTopbar'
import { BlogEditor } from '@/components/admin/BlogEditor'
import Link from 'next/link'

export const metadata = { title: 'Edit Blog Post' }

export default async function EditBlogPostPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createServerSupabase()
  const { data: post } = await supabase.from('blog_posts').select('*').eq('id', id).single()

  if (!post) notFound()

  return (
    <div className="flex flex-col flex-1">
      <AdminTopbar
        title={`Edit: ${post.title}`}
        actions={
          <Link href="/admin/blog" className="text-sm text-[#6B7280] hover:text-[#1F2937]">
            ← Back to Posts
          </Link>
        }
      />
      <div className="p-6">
        <BlogEditor post={post} />
      </div>
    </div>
  )
}
