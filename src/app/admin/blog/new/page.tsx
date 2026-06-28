import { AdminTopbar } from '@/components/admin/AdminTopbar'
import { BlogEditor } from '@/components/admin/BlogEditor'
import { createServiceClient } from '@/lib/supabase/service'
import Link from 'next/link'

export const metadata = { title: 'New Blog Post' }

export default async function NewBlogPostPage() {
  const { data: users } = await createServiceClient().from('users').select('id, full_name').eq('is_active', true).order('full_name')
  return (
    <div className="flex flex-col flex-1">
      <AdminTopbar
        title="New Blog Post"
        actions={
          <Link href="/admin/blog" className="text-sm text-[#6B7280] hover:text-[#1F2937]">
            ← Back to Posts
          </Link>
        }
      />
      <div className="p-6">
        <BlogEditor users={users ?? []} />
      </div>
    </div>
  )
}
