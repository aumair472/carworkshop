import { AdminTopbar } from '@/components/admin/AdminTopbar'
import { ServiceContentTable, type ServiceContentRow } from '@/components/admin/service-content/ServiceContentTable'
import { createServiceClient } from '@/lib/supabase/service'
import { getActingUser } from '@/lib/auth-guard'
import { canApprove } from '@/lib/approval'

export const metadata = { title: 'Service Content' }
export const dynamic = 'force-dynamic'

import type { PageType } from '@/types'

const SERVICE_PAGE_TYPES: PageType[] = ['service', 'brand_service', 'model_service', 'model_service_location', 'brand_location', 'model_location', 'location']

export default async function ServiceContentPage() {
  const acting = await getActingUser()
  const service = createServiceClient()

  const [{ data: pages }, { data: brands }, { data: users }] = await Promise.all([
    service
      .from('generated_pages')
      .select('id, page_type, brand_id, slug, h1, status, approval_status, assignee_id, assigned_at, created_by, country, state, updated_at, generated_at')
      .in('page_type', SERVICE_PAGE_TYPES)
      .order('updated_at', { ascending: false })
      .limit(2000),
    service.from('brands').select('id, name'),
    service.from('users').select('id, full_name'),
  ])

  const brandName = new Map((brands ?? []).map(b => [b.id, b.name]))
  const userName = new Map((users ?? []).map(u => [u.id, u.full_name]))

  const rows: ServiceContentRow[] = (pages ?? []).map(p => ({
    ...p,
    brand_name: p.brand_id ? brandName.get(p.brand_id) ?? null : null,
    assignee_name: p.assignee_id ? userName.get(p.assignee_id) ?? null : null,
    created_by_name: p.created_by ? userName.get(p.created_by) ?? null : null,
  }))

  return (
    <>
      <AdminTopbar title="Manage SERVICE CONTENT" />
      <div className="p-6">
        <ServiceContentTable initialRows={rows} isApprover={!!acting && canApprove(acting.role)} />
      </div>
    </>
  )
}
