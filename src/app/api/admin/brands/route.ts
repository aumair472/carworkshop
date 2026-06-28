import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabase } from '@/lib/supabase/server'
import { createServiceClient } from '@/lib/supabase/service'
import { CreateBrandSchema } from '@/lib/schemas/brand'
import { logAudit } from '@/lib/audit'
import { generateSlug } from '@/lib/page-engine/slugify'
import { revalidatePage } from '@/lib/revalidate'

export async function GET() {
  try {
    const supabase = await createServerSupabase()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const service = createServiceClient()
    const { data, error } = await service.from('brands').select('*').order('sort_order')
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })

    return NextResponse.json({ brands: data })
  } catch (err) {
    console.error('GET /api/admin/brands:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const supabase = await createServerSupabase()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const body: unknown = await req.json()
    const parsed = CreateBrandSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ error: 'Invalid data', details: parsed.error.flatten().fieldErrors }, { status: 400 })
    }

    const { slug, name, ...rest } = parsed.data
    const resolvedSlug = slug ?? generateSlug(name)

    const service = createServiceClient()
    const { data, error } = await service.from('brands').insert({ name, slug: resolvedSlug, ...rest }).select().single()
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })

    await logAudit({ userId: user.id, action: 'create', table: 'brands', recordId: data.id })
    if (data.status === 'published') await revalidatePage('brand', data.slug)
    return NextResponse.json({ brand: data }, { status: 201 })
  } catch (err) {
    console.error('POST /api/admin/brands:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
