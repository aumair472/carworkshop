import Image from 'next/image'
import { createServerSupabase } from '@/lib/supabase/server'
import { AdminTopbar } from '@/components/admin/AdminTopbar'
import { AdminBadge } from '@/components/admin/ui/AdminBadge'
import { AdminLinkButton } from '@/components/admin/ui/AdminButton'
import { EmptyState } from '@/components/admin/ui/AdminStates'
import { Car, Plus, ExternalLink } from 'lucide-react'
import type { ContentStatus } from '@/types'

export const metadata = { title: 'Brands' }

export default async function BrandsAdminPage() {
  const supabase = await createServerSupabase()
  const { data: brands, count } = await supabase
    .from('brands')
    .select('id, name, slug, logo_url, status', { count: 'exact' })
    .order('sort_order')

  return (
    <div className="flex flex-col flex-1">
      <AdminTopbar
        title={`Brands (${count ?? 0})`}
        actions={<AdminLinkButton href="/admin/brands/new" variant="primary"><Plus size={15} /> New Brand</AdminLinkButton>}
      />

      <div className="p-6 lg:p-8">
        {!brands?.length ? (
          <div className="bg-white rounded-xl border border-zinc-200">
            <EmptyState
              icon={<Car size={22} />}
              title="No brands yet"
              description="Add your first brand to start generating pages."
              action={<AdminLinkButton href="/admin/brands/new" variant="primary"><Plus size={15} /> Add Brand</AdminLinkButton>}
            />
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {brands.map(brand => (
              <div key={brand.id} className="group bg-white rounded-xl border border-zinc-200 shadow-sm p-5 hover:shadow-md hover:border-zinc-300 transition-all flex flex-col">
                <div className="flex items-center gap-3 mb-4">
                  <div className="h-12 w-12 rounded-lg bg-zinc-50 border border-zinc-100 flex items-center justify-center overflow-hidden shrink-0">
                    {brand.logo_url
                      ? <Image src={brand.logo_url} alt={`${brand.name} logo`} width={36} height={36} className="object-contain" />
                      : <span className="text-sm font-bold text-zinc-400">{brand.name.slice(0, 2).toUpperCase()}</span>}
                  </div>
                  <div className="min-w-0">
                    <p className="font-semibold text-zinc-900 truncate">{brand.name}</p>
                    <p className="text-xs text-zinc-400 font-mono truncate">/{brand.slug}</p>
                  </div>
                </div>
                <div className="mb-4"><AdminBadge kind={brand.status as ContentStatus} /></div>
                <div className="mt-auto flex items-center gap-2">
                  <AdminLinkButton href={`/admin/brands/${brand.id}`} variant="outline" className="flex-1">Edit</AdminLinkButton>
                  <AdminLinkButton href={`/brands/${brand.slug}`} target="_blank" rel="noopener noreferrer" variant="ghost"><ExternalLink size={15} /></AdminLinkButton>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
