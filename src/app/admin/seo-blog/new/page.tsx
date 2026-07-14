import { AdminTopbar } from '@/components/admin/AdminTopbar'
import { SeoBlogForm, EMPTY_SEO_BLOG } from '@/components/admin/seo-blog/SeoBlogForm'

export const metadata = { title: 'Add New Blog' }

export default function NewSeoBlogPage() {
  return (
    <>
      <AdminTopbar title="ADD NEW BLOG" />
      <div className="p-6">
        <SeoBlogForm initial={EMPTY_SEO_BLOG} />
      </div>
    </>
  )
}
