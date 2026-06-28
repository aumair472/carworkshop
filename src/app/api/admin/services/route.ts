import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabase } from '@/lib/supabase/server'
import { createServiceClient } from '@/lib/supabase/service'
import { CreateServiceSchema } from '@/lib/schemas/service'
import { sanitizeHTML } from '@/lib/sanitize'
import { logAudit } from '@/lib/audit'
import { generateSlug } from '@/lib/page-engine/slugify'
import { revalidatePage } from '@/lib/revalidate'

export async function GET() {
  try {
    const supabase = await createServerSupabase()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const service = createServiceClient()
    const { data, error } = await service.from('services').select('*').order('sort_order')
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })

    return NextResponse.json({ services: data })
  } catch (err) {
    console.error('GET /api/admin/services:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const supabase = await createServerSupabase()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const body: unknown = await req.json()
    const parsed = CreateServiceSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ error: 'Invalid data', details: parsed.error.flatten().fieldErrors }, { status: 400 })
    }

    const { slug, name, content, ...rest } = parsed.data
    const resolvedSlug = slug ?? generateSlug(name)
    const sanitizedContent = content ? sanitizeHTML(content) : null

    const client = createServiceClient()
    const { data, error } = await client.from('services').insert({ name, slug: resolvedSlug, content: sanitizedContent, ...rest }).select().single()
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })

    await logAudit({ userId: user.id, action: 'create', table: 'services', recordId: data.id })
    if (data.status === 'published') await revalidatePage('service', data.slug)
    return NextResponse.json({ service: data }, { status: 201 })
  } catch (err) {
    console.error('POST /api/admin/services:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
