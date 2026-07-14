import { AdminTopbar } from '@/components/admin/AdminTopbar'
import { LanguageKeyManager } from '@/components/admin/language-key/LanguageKeyManager'
import { createServiceClient } from '@/lib/supabase/service'

export const metadata = { title: 'Language Key' }
export const dynamic = 'force-dynamic'

export default async function LanguageKeyPage() {
  const service = createServiceClient()
  const { data: keys } = await service.from('language_keys').select('*').order('created_at', { ascending: false }).limit(2000)

  return (
    <>
      <AdminTopbar title="Manage" />
      <div className="p-6">
        <LanguageKeyManager initialRows={keys ?? []} />
      </div>
    </>
  )
}
