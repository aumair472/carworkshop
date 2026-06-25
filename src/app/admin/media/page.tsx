import { createServerSupabase } from '@/lib/supabase/server'
import { AdminTopbar } from '@/components/admin/AdminTopbar'
import { Card } from '@/components/ui/Card'
import Image from 'next/image'

export const metadata = { title: 'Media' }

export default async function MediaAdminPage() {
  const supabase = await createServerSupabase()
  const { data: files, count } = await supabase
    .from('media')
    .select('*', { count: 'exact' })
    .order('created_at', { ascending: false })
    .limit(48)

  return (
    <div className="flex flex-col flex-1">
      <AdminTopbar title={`Media Library (${count ?? 0})`} />

      <div className="p-6">
        {(!files || files.length === 0) ? (
          <Card padding="lg" className="text-center text-[#9CA3AF]">
            <p className="text-4xl mb-3">🖼️</p>
            <p className="font-medium">No media files yet.</p>
            <p className="text-sm mt-1">Upload images via the blog post or brand editors.</p>
          </Card>
        ) : (
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-3">
            {files.map(file => (
              <div key={file.id} className="group relative aspect-square bg-[#F3F4F6] rounded-lg overflow-hidden border border-[#E5E7EB] hover:border-[#4472C4] transition-colors">
                <Image
                  src={file.url}
                  alt={file.alt_text ?? file.filename}
                  fill
                  className="object-cover"
                  sizes="150px"
                />
                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-2">
                  <p className="text-white text-xs truncate w-full">{file.filename}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
