import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabase } from '@/lib/supabase/server'
import { createServiceClient } from '@/lib/supabase/service'
import { z } from 'zod'
import { revalidatePage } from '@/lib/revalidate'
import { logAudit } from '@/lib/audit'

const BulkSchema = z.object({
  ids: z.array(z.string().uuid()).min(1).max(500),
})

export async function POST(req: NextRequest) {
  try {
    const supabase = await createServerSupabase()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const body: unknown = await req.json()
    const parsed = BulkSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ error: 'Invalid data', details: parsed.error.flatten().fieldErrors }, { status: 400 })
    }

    const client = createServiceClient()
    const { data: updated, error } = await client.from('generated_pages').update({ status: 'published' }).in('id', parsed.data.ids).select('slug')
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })

    // Revalidate every published page + the brand hub / home it surfaces on.
    for (const row of updated ?? []) { await revalidatePage('generated', row.slug) }
    await revalidatePage('static', 'home')
    await revalidatePage('static', 'brands')
    await logAudit({ userId: user.id, action: 'publish', table: 'generated_pages', recordId: parsed.data.ids.join(',') })

    return NextResponse.json({ success: true, count: parsed.data.ids.length })
  } catch (err) {
    console.error('POST /api/admin/pages/bulk-publish:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
