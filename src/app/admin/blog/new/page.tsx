import { AdminTopbar } from '@/components/admin/AdminTopbar'
import { BlogEditor } from '@/components/admin/BlogEditor'
import Link from 'next/link'

export const metadata = { title: 'New Blog Post' }

export default function NewBlogPostPage() {
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
        <BlogEditor />
      </div>
    </div>
  )
}
