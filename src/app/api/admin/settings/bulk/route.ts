import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabase } from '@/lib/supabase/server'
import { createServiceClient } from '@/lib/supabase/service'
import { logAudit } from '@/lib/audit'
import { revalidatePath } from 'next/cache'
import { z } from 'zod'
import type { Json } from '@/types/database'

const SETTINGS_PATHS = ['/', '/about', '/contact', '/services', '/brands', '/locations', '/blog', '/faq']

const BulkSchema = z.object({
  settings: z.array(z.object({ key: z.string().min(1).max(100), value: z.unknown() })).min(1).max(100),
})

export async function PUT(req: NextRequest) {
  try {
    const supabase = await createServerSupabase()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const body: unknown = await req.json()
    const parsed = BulkSchema.safeParse(body)
    if (!parsed.success) return NextResponse.json({ error: 'Invalid data' }, { status: 400 })

    const now = new Date().toISOString()
    // website_settings.value is NOT NULL — skip unset optional fields (e.g. no
    // logo/favicon chosen yet) instead of writing null and crashing the upsert.
    const rows = parsed.data.settings
      .filter(s => s.value != null)
      .map(s => ({
        key: s.key,
        value: s.value as Json,
        updated_at: now,
        updated_by: user.id,
      }))

    const service = createServiceClient()
    if (rows.length > 0) {
      const { error } = await service.from('website_settings').upsert(rows, { onConflict: 'key' })
      if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    }

    for (const p of SETTINGS_PATHS) { try { revalidatePath(p) } catch { /* best-effort */ } }
    try { revalidatePath('/', 'layout') } catch { /* best-effort */ }

    await logAudit({ userId: user.id, action: 'update', table: 'website_settings', recordId: parsed.data.settings.map(s => s.key).join(',') })
    return NextResponse.json({ success: true, count: rows.length })
  } catch (err) {
    console.error('PUT /api/admin/settings/bulk:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
