import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabase } from '@/lib/supabase/server'
import { createServiceClient } from '@/lib/supabase/service'
import { sanitizeHTML } from '@/lib/sanitize'
import { logAudit } from '@/lib/audit'
import { revalidatePage } from '@/lib/revalidate'
import { z } from 'zod'

interface RouteContext {
  params: Promise<{ id: string }>
}

const FaqSchema = z.object({ q: z.string().max(500), a: z.string().max(2000) })

const ContentSchema = z.object({
  hero: z.object({
    h1: z.string().max(200).optional(),
    subheadline: z.string().max(300).optional(),
    image_url: z.string().url().nullable().optional(),
  }).optional(),
  main_content: z.string().max(50000).nullable().optional(),
  service_details: z.object({
    price: z.number().min(0).max(99999).nullable().optional(),
    includes: z.array(z.string().max(200)).max(30).optional(),
  }).optional(),
  faqs: z.array(FaqSchema).max(30).optional(),
  why_choose_us: z.object({
    visible: z.boolean().optional(),
    heading: z.string().max(200).optional(),
    items: z.array(z.object({
      icon: z.string().max(20).optional(),
      title: z.string().max(120).optional(),
      description: z.string().max(500).optional(),
    })).max(12).optional(),
  }).optional(),
  cta: z.object({
    headline: z.string().max(200).optional(),
    button_text: z.string().max(60).optional(),
    button_link: z.string().max(300).optional(),
  }).optional(),
}).optional()

const UpdatePageSchema = z.object({
  h1: z.string().min(1).max(200).optional(),
  meta_title: z.string().min(1).max(70).optional(),
  meta_description: z.string().min(1).max(200).optional(),
  og_image_url: z.string().url().nullable().optional(),
  status: z.enum(['draft', 'published', 'archived']).optional(),
  content_json: ContentSchema,
})

export async function GET(_req: NextRequest, { params }: RouteContext) {
  try {
    const { id } = await params
    const supabase = await createServerSupabase()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const service = createServiceClient()
    const { data, error } = await service.from('generated_pages').select('*').eq('id', id).single()
    if (error || !data) return NextResponse.json({ error: 'Not found' }, { status: 404 })

    // Resolve related entity names for the editor's Page Info panel.
    const [brand, model, svc, loc] = await Promise.all([
      data.brand_id ? service.from('brands').select('name, slug').eq('id', data.brand_id).maybeSingle() : Promise.resolve({ data: null }),
      data.model_id ? service.from('brand_models').select('name, slug').eq('id', data.model_id).maybeSingle() : Promise.resolve({ data: null }),
      data.service_id ? service.from('services').select('name, slug, starting_price').eq('id', data.service_id).maybeSingle() : Promise.resolve({ data: null }),
      data.location_id ? service.from('locations').select('name, slug').eq('id', data.location_id).maybeSingle() : Promise.resolve({ data: null }),
    ])

    return NextResponse.json({
      page: data,
      related: { brand: brand.data, model: model.data, service: svc.data, location: loc.data },
    })
  } catch (err) {
    console.error('GET /api/admin/pages/[id]:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function PUT(req: NextRequest, { params }: RouteContext) {
  try {
    const { id } = await params
    const supabase = await createServerSupabase()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const body: unknown = await req.json()
    const parsed = UpdatePageSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ error: 'Invalid data', details: parsed.error.flatten().fieldErrors }, { status: 400 })
    }

    const { content_json, ...rest } = parsed.data

    // Sanitize editable HTML before persisting.
    const sanitizedContent = content_json
      ? { ...content_json, main_content: content_json.main_content ? sanitizeHTML(content_json.main_content) : content_json.main_content }
      : undefined

    const service = createServiceClient()
    const { data, error } = await service
      .from('generated_pages')
      .update({
        ...rest,
        ...(sanitizedContent !== undefined ? { content_json: sanitizedContent } : {}),
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select('slug, status')
      .single()
    if (error || !data) return NextResponse.json({ error: error?.message ?? 'Update failed' }, { status: 500 })

    // Instant ISR revalidation for the generated page + its brand/model parents.
    await revalidatePage('generated', data.slug)

    await logAudit({ userId: user.id, action: rest.status === 'published' ? 'publish' : 'update', table: 'generated_pages', recordId: id })
    return NextResponse.json({ success: true, slug: data.slug, status: data.status })
  } catch (err) {
    console.error('PUT /api/admin/pages/[id]:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(_req: NextRequest, { params }: RouteContext) {
  try {
    const { id } = await params
    const supabase = await createServerSupabase()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const service = createServiceClient()
    const { error } = await service.from('generated_pages').delete().eq('id', id)
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })

    await logAudit({ userId: user.id, action: 'delete', table: 'generated_pages', recordId: id })
    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('DELETE /api/admin/pages/[id]:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
