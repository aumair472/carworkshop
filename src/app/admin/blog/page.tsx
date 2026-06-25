import { createServerSupabase } from '@/lib/supabase/server'
import { AdminTopbar } from '@/components/admin/AdminTopbar'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import Link from 'next/link'
import type { ContentStatus } from '@/types'

export const metadata = { title: 'Blog Posts' }

export default async function BlogAdminPage() {
  const supabase = await createServerSupabase()
  const { data: posts, count } = await supabase
    .from('blog_posts')
    .select('*', { count: 'exact' })
    .order('created_at', { ascending: false })

  return (
    <div className="flex flex-col flex-1">
      <AdminTopbar
        title={`Blog Posts (${count ?? 0})`}
        actions={
          <Link href="/admin/blog/new" className="px-4 py-2 rounded-md bg-[#4472C4] text-white text-sm font-semibold hover:bg-[#3563B0] transition-colors">
            + New Post
          </Link>
        }
      />

      <div className="p-6">
        <Card padding="none">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-[#F9FAFB] border-b border-[#E5E7EB]">
                  {['Title', 'Slug', 'Status', 'Published', 'Actions'].map(h => (
                    <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-[#6B7280]">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F3F4F6]">
                {(posts ?? []).map(post => (
                  <tr key={post.id} className="hover:bg-[#F9FAFB]">
                    <td className="px-4 py-3 font-medium text-[#1F2937] max-w-xs truncate">{post.title}</td>
                    <td className="px-4 py-3 text-[#6B7280] font-mono text-xs">{post.slug}</td>
                    <td className="px-4 py-3">
                      <Badge variant={post.status as ContentStatus}>{post.status}</Badge>
                    </td>
                    <td className="px-4 py-3 text-[#9CA3AF] text-xs">
                      {post.published_at ? new Date(post.published_at).toLocaleDateString('en-AE') : '—'}
                    </td>
                    <td className="px-4 py-3 flex gap-3">
                      <Link href={`/admin/blog/${post.id}`} className="text-[#4472C4] hover:underline text-xs font-medium">Edit</Link>
                      <a href={`/blog/${post.slug}`} target="_blank" rel="noopener noreferrer" className="text-[#6B7280] hover:underline text-xs">Preview</a>
                    </td>
                  </tr>
                ))}
                {!posts?.length && (
                  <tr><td colSpan={5} className="px-4 py-12 text-center text-[#9CA3AF]">No posts yet</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </div>
  )
}
