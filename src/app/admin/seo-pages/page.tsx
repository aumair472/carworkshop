import { AdminTopbar } from '@/components/admin/AdminTopbar'
import { AccessDeniedBanner } from '@/components/admin/AccessDeniedBanner'
import { SeoPagesTable, type SeoPageRow } from '@/components/admin/seo-pages/SeoPagesTable'
import { createServiceClient } from '@/lib/supabase/service'
import { getActingUser } from '@/lib/auth-guard'
import { canApprove } from '@/lib/approval'

export const metadata = { title: 'SEO Pages' }
export const dynamic = 'force-dynamic'

export default async function SeoPagesPage() {
  const acting = await getActingUser()
  const service = createServiceClient()

  const [{ data: pages }, { data: brands }, { data: users }] = await Promise.all([
    service
      .from('generated_pages')
      .select('id, template_type, brand_id, model_id, slug, h1, meta_title, meta_keyword, status, approval_status, assignee_id, assigned_at, created_by, country, state, updated_at, generated_at')
      .order('updated_at', { ascending: false })
      .limit(2000),
    service.from('brands').select('id, name').order('name'),
    service.from('users').select('id, full_name, role').eq('is_active', true).order('full_name'),
  ])

  // Resolve model names for the rows that have one.
  const modelIds = [...new Set((pages ?? []).map(p => p.model_id).filter(Boolean))] as string[]
  const { data: models } = modelIds.length
    ? await service.from('brand_models').select('id, name').in('id', modelIds)
    : { data: [] as Array<{ id: string; name: string }> }

  const brandName = new Map((brands ?? []).map(b => [b.id, b.name]))
  const modelName = new Map((models ?? []).map(m => [m.id, m.name]))
  const userName = new Map((users ?? []).map(u => [u.id, u.full_name]))

  const rows: SeoPageRow[] = (pages ?? []).map(p => ({
    ...p,
    brand_name: p.brand_id ? brandName.get(p.brand_id) ?? null : null,
    model_name: p.model_id ? modelName.get(p.model_id) ?? null : null,
    assignee_name: p.assignee_id ? userName.get(p.assignee_id) ?? null : null,
    created_by_name: p.created_by ? userName.get(p.created_by) ?? null : null,
  }))

  return (
    <>
      <AdminTopbar title="Manage SEO PAGES" />
      <div className="p-6">
        <AccessDeniedBanner />
        <SeoPagesTable
          initialRows={rows}
          brands={brands ?? []}
          users={(users ?? []).map(u => ({ id: u.id, full_name: u.full_name, role: u.role }))}
          isApprover={!!acting && canApprove(acting.role)}
        />
      </div>
    </>
  )
}
