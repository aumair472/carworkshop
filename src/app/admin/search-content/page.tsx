import { AdminTopbar } from '@/components/admin/AdminTopbar'
import { SearchContentManager } from '@/components/admin/search-content/SearchContentManager'
import { createServiceClient } from '@/lib/supabase/service'

export const metadata = { title: 'Search Content' }
export const dynamic = 'force-dynamic'

export default async function SearchContentPage() {
  const service = createServiceClient()
  const { data: items } = await service.from('search_content').select('*').order('display_order')

  return (
    <>
      <AdminTopbar title="Manage SEARCH CONTENT" />
      <div className="p-6">
        <SearchContentManager initialRows={items ?? []} />
      </div>
    </>
  )
}
