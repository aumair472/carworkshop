import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabase } from '@/lib/supabase/server'
import { createServiceClient } from '@/lib/supabase/service'
import { logAudit } from '@/lib/audit'
import { revalidatePath } from 'next/cache'
import { z } from 'zod'
import type { Json } from '@/types/database'
import { SECRET_SETTING_KEYS } from '@/types/settings'

// Mask a stored secret so the admin UI never receives the raw value.
function maskSecret(value: unknown): string {
  const s = typeof value === 'string' ? value : ''
  if (!s) return ''
  return s.length <= 4 ? '••••' : `${s.slice(0, 3)}••••${s.slice(-4)}`
}

const SETTINGS_PATHS = ['/', '/about', '/contact', '/services', '/brands', '/locations', '/blog', '/faq']

function revalidateSettings() {
  for (const p of SETTINGS_PATHS) {
    try { revalidatePath(p) } catch { /* best-effort */ }
  }
  try { revalidatePath('/', 'layout') } catch { /* best-effort */ }
}

export async function GET() {
  try {
    const supabase = await createServerSupabase()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const service = createServiceClient()
    const { data, error } = await service.from('website_settings').select('key, value')
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })

    const secret = new Set<string>(SECRET_SETTING_KEYS as string[])
    const settings = Object.fromEntries((data ?? []).map(s => [s.key, secret.has(s.key) ? maskSecret(s.value) : s.value]))
    return NextResponse.json({ settings })
  } catch (err) {
    console.error('GET /api/admin/settings:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

const PutSchema = z.object({
  key: z.string().min(1).max(100),
  value: z.unknown(),
})

export async function PUT(req: NextRequest) {
  try {
    const supabase = await createServerSupabase()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const body: unknown = await req.json()
    const parsed = PutSchema.safeParse(body)
    if (!parsed.success) return NextResponse.json({ error: 'Invalid data' }, { status: 400 })

    const service = createServiceClient()
    const { error } = await service.from('website_settings').upsert({
      key: parsed.data.key,
      value: (parsed.data.value ?? null) as Json,
      updated_at: new Date().toISOString(),
      updated_by: user.id,
    }, { onConflict: 'key' })
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })

    revalidateSettings()
    await logAudit({ userId: user.id, action: 'update', table: 'website_settings', recordId: parsed.data.key })
    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('PUT /api/admin/settings:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
