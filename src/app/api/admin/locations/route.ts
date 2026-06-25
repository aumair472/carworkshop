import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabase } from '@/lib/supabase/server'
import { createServiceClient } from '@/lib/supabase/service'
import { CreateLocationSchema } from '@/lib/schemas/location'
import { logAudit } from '@/lib/audit'
import { generateSlug } from '@/lib/page-engine/slugify'

export async function GET() {
  try {
    const supabase = await createServerSupabase()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const client = createServiceClient()
    const { data, error } = await client.from('locations').select('*').order('sort_order')
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })

    return NextResponse.json({ locations: data })
  } catch (err) {
    console.error('GET /api/admin/locations:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const supabase = await createServerSupabase()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const body: unknown = await req.json()
    const parsed = CreateLocationSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ error: 'Invalid data', details: parsed.error.flatten().fieldErrors }, { status: 400 })
    }

    const { slug, name, ...rest } = parsed.data
    const resolvedSlug = slug ?? generateSlug(name)

    const client = createServiceClient()
    const { data, error } = await client.from('locations').insert({ name, slug: resolvedSlug, ...rest }).select().single()
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })

    await logAudit({ userId: user.id, action: 'create', table: 'locations', recordId: data.id })
    return NextResponse.json({ location: data }, { status: 201 })
  } catch (err) {
    console.error('POST /api/admin/locations:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
