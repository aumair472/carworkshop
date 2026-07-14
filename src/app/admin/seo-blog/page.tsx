import { AdminTopbar } from '@/components/admin/AdminTopbar'
import { SeoBlogTable, type SeoBlogRow } from '@/components/admin/seo-blog/SeoBlogTable'
import { createServiceClient } from '@/lib/supabase/service'
import { getActingUser } from '@/lib/auth-guard'
import { canApprove } from '@/lib/approval'

export const metadata = { title: 'SEO Blog' }
export const dynamic = 'force-dynamic'

export default async function SeoBlogPage() {
  const acting = await getActingUser()
  const service = createServiceClient()

  const [{ data: posts }, { data: users }] = await Promise.all([
    service
      .from('blog_posts')
      .select('id, title, slug, seo_title, seo_description, meta_keyword, status, approval_status, assignee_id, assigned_at, country, state, image_png_url, image_webp_url, is_featured, updated_at')
      .order('updated_at', { ascending: false })
      .limit(1000),
    service.from('users').select('id, full_name'),
  ])

  const userName = new Map((users ?? []).map(u => [u.id, u.full_name]))
  const rows: SeoBlogRow[] = (posts ?? []).map(p => ({
    ...p,
    assignee_name: p.assignee_id ? userName.get(p.assignee_id) ?? null : null,
  }))

  return (
    <>
      <AdminTopbar title="Manage SEO BLOG" />
      <div className="p-6">
        <SeoBlogTable initialRows={rows} isApprover={!!acting && canApprove(acting.role)} />
      </div>
    </>
  )
}
