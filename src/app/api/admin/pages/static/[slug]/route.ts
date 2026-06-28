import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabase } from '@/lib/supabase/server'
import { createServiceClient } from '@/lib/supabase/service'
import { logAudit } from '@/lib/audit'
import { revalidatePage } from '@/lib/revalidate'
import { z } from 'zod'
import { STATIC_PAGES } from '../route'
import type { Json } from '@/types/database'

interface RouteContext {
  params: Promise<{ slug: string }>
}

const SectionSchema = z.object({
  id: z.string(),
  type: z.enum(['hero', 'text', 'service_cards', 'brand_grid', 'faq', 'cta']),
  data: z.record(z.string(), z.unknown()),
})

const UpdateSchema = z.object({
  title: z.string().min(1).max(200).optional(),
  sections_json: z.array(SectionSchema).max(50).optional(),
  content_json: z.record(z.string(), z.unknown()).optional(),
  seo_title: z.string().max(70).nullable().optional(),
  seo_description: z.string().max(200).nullable().optional(),
  status: z.enum(['draft', 'published', 'archived']).optional(),
})

function titleFor(slug: string): string {
  return STATIC_PAGES.find(p => p.slug === slug)?.title ?? slug
}

export async function GET(_req: NextRequest, { params }: RouteContext) {
  try {
    const { slug } = await params
    const supabase = await createServerSupabase()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    if (!STATIC_PAGES.some(p => p.slug === slug)) return NextResponse.json({ error: 'Unknown page' }, { status: 404 })

    const service = createServiceClient()
    const { data } = await service.from('static_pages').select('*').eq('slug', slug).maybeSingle()

    return NextResponse.json({
      page: data ?? { slug, title: titleFor(slug), sections_json: [], content_json: {}, seo_title: null, seo_description: null, status: 'draft' },
    })
  } catch (err) {
    console.error('GET /api/admin/pages/static/[slug]:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function PUT(req: NextRequest, { params }: RouteContext) {
  try {
    const { slug } = await params
    const supabase = await createServerSupabase()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    if (!STATIC_PAGES.some(p => p.slug === slug)) return NextResponse.json({ error: 'Unknown page' }, { status: 404 })

    const body: unknown = await req.json()
    const parsed = UpdateSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ error: 'Invalid data', details: parsed.error.flatten().fieldErrors }, { status: 400 })
    }

    const payload = {
      slug,
      title: parsed.data.title ?? titleFor(slug),
      seo_title: parsed.data.seo_title ?? null,
      seo_description: parsed.data.seo_description ?? null,
      status: parsed.data.status ?? 'draft',
      updated_at: new Date().toISOString(),
      ...(parsed.data.sections_json !== undefined ? { sections_json: parsed.data.sections_json as unknown as Json } : {}),
      ...(parsed.data.content_json !== undefined ? { content_json: parsed.data.content_json as unknown as Json } : {}),
    }

    const service = createServiceClient()
    const { error } = await service.from('static_pages').upsert(payload, { onConflict: 'slug' })
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })

    await revalidatePage('static', slug)

    await logAudit({ userId: user.id, action: 'update', table: 'static_pages', recordId: slug })
    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('PUT /api/admin/pages/static/[slug]:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
