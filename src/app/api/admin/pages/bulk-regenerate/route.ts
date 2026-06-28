import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabase } from '@/lib/supabase/server'
import { createServiceClient } from '@/lib/supabase/service'
import { z } from 'zod'
import { revalidatePath } from 'next/cache'
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
    const { error } = await client.from('generated_pages').update({ updated_at: new Date().toISOString() }).in('id', parsed.data.ids)
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })

    revalidatePath('/brands')
    await logAudit({ userId: user.id, action: 'generate', table: 'generated_pages', recordId: parsed.data.ids.join(',') })
    return NextResponse.json({ success: true, count: parsed.data.ids.length })
  } catch (err) {
    console.error('POST /api/admin/pages/bulk-regenerate:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
