import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabase } from '@/lib/supabase/server'
import { createServiceClient } from '@/lib/supabase/service'
import { logAudit } from '@/lib/audit'
import { generateSlug } from '@/lib/page-engine/slugify'
import { z } from 'zod'

interface RouteContext {
  params: Promise<{ id: string }>
}

const BulkModelsSchema = z.object({
  names: z.array(z.string().min(1).max(100).trim()).min(1).max(200),
  status: z.enum(['draft', 'published', 'archived']).default('published'),
})

export async function GET(_req: NextRequest, { params }: RouteContext) {
  try {
    const { id } = await params
    const supabase = await createServerSupabase()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const service = createServiceClient()
    const { data, error } = await service.from('brand_models').select('*').eq('brand_id', id).order('sort_order')
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })

    return NextResponse.json({ models: data })
  } catch (err) {
    console.error('GET /api/admin/brands/[id]/models:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(req: NextRequest, { params }: RouteContext) {
  try {
    const { id } = await params
    const supabase = await createServerSupabase()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const body: unknown = await req.json()
    const parsed = BulkModelsSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ error: 'Invalid data', details: parsed.error.flatten().fieldErrors }, { status: 400 })
    }

    const service = createServiceClient()
    const { data: existing } = await service.from('brand_models').select('slug').eq('brand_id', id)
    const existingSlugs = new Set((existing ?? []).map(m => m.slug))

    const rows = parsed.data.names
      .map((name, i) => ({ brand_id: id, name, slug: generateSlug(name), status: parsed.data.status, sort_order: i }))
      .filter(r => r.slug.length > 0 && !existingSlugs.has(r.slug))

    if (rows.length === 0) return NextResponse.json({ models: [], skipped: parsed.data.names.length })

    const { data, error } = await service.from('brand_models').insert(rows).select()
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })

    await logAudit({ userId: user.id, action: 'create', table: 'brand_models', recordId: id })
    return NextResponse.json({ models: data, skipped: parsed.data.names.length - rows.length }, { status: 201 })
  } catch (err) {
    console.error('POST /api/admin/brands/[id]/models:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest, { params }: RouteContext) {
  try {
    const { id } = await params
    const supabase = await createServerSupabase()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const modelId = new URL(req.url).searchParams.get('modelId')
    if (!modelId) return NextResponse.json({ error: 'modelId required' }, { status: 400 })

    const service = createServiceClient()
    const { error } = await service.from('brand_models').delete().eq('id', modelId).eq('brand_id', id)
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })

    await logAudit({ userId: user.id, action: 'delete', table: 'brand_models', recordId: modelId })
    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('DELETE /api/admin/brands/[id]/models:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
