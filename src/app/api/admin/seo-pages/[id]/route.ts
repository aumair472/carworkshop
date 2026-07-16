import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/service'
import { getActingUser } from '@/lib/auth-guard'
import { sanitizeHTML } from '@/lib/sanitize'
import { logAudit } from '@/lib/audit'
import { revalidatePage } from '@/lib/revalidate'
import { nextStatusOnSave } from '@/lib/approval'
import { SeoPageUpdateSchema } from '@/lib/schemas/seo-page'
import type { PageContent } from '@/types'

interface RouteContext { params: Promise<{ id: string }> }

export async function GET(_req: NextRequest, { params }: RouteContext) {
  try {
    const { id } = await params
    const acting = await getActingUser()
    if (!acting) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const service = createServiceClient()
    const { data, error } = await service.from('generated_pages').select('*').eq('id', id).single()
    if (error || !data) return NextResponse.json({ error: 'Not found' }, { status: 404 })
    return NextResponse.json({ page: data })
  } catch (err) {
    console.error('GET /api/admin/seo-pages/[id]:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function PATCH(req: NextRequest, { params }: RouteContext) {
  try {
    const { id } = await params
    const acting = await getActingUser()
    if (!acting) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const body: unknown = await req.json()
    const parsed = SeoPageUpdateSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ error: 'Invalid data', details: parsed.error.flatten().fieldErrors }, { status: 400 })
    }

    const { complete_description, short_description, arabic_short_description, arabic_complete_description, content_json, ...rest } = parsed.data

    const service = createServiceClient()

    // Complete Description + structured content_json fields all live in content_json — merge, don't clobber.
    let contentUpdate: Record<string, unknown> = {}
    if (complete_description !== undefined || content_json !== undefined) {
      const { data: existing } = await service.from('generated_pages').select('content_json').eq('id', id).single()
      const current = (existing?.content_json ?? {}) as PageContent
      const incoming = (content_json ?? {}) as PageContent
      const merged: PageContent = { ...current, ...incoming }
      if (complete_description !== undefined) {
        merged.main_content = complete_description ? sanitizeHTML(complete_description) : null
      }
      if (incoming.cost_description !== undefined) {
        merged.cost_description = incoming.cost_description ? sanitizeHTML(incoming.cost_description) : incoming.cost_description
      }
      if (incoming.why_important !== undefined) {
        merged.why_important = incoming.why_important ? sanitizeHTML(incoming.why_important) : incoming.why_important
      }
      if (incoming.why_choose_us_brand !== undefined) {
        merged.why_choose_us_brand = incoming.why_choose_us_brand ? sanitizeHTML(incoming.why_choose_us_brand) : incoming.why_choose_us_brand
      }
      if (incoming.service_section?.description) {
        merged.service_section = { ...incoming.service_section, description: sanitizeHTML(incoming.service_section.description) }
      }
      contentUpdate = { content_json: merged }
    }

    const { data, error } = await service
      .from('generated_pages')
      .update({
        ...rest,
        ...(short_description !== undefined ? { short_description: short_description ? sanitizeHTML(short_description) : null } : {}),
        ...(arabic_short_description !== undefined ? { arabic_short_description: arabic_short_description ? sanitizeHTML(arabic_short_description) : null } : {}),
        ...(arabic_complete_description !== undefined ? { arabic_complete_description: arabic_complete_description ? sanitizeHTML(arabic_complete_description) : null } : {}),
        ...contentUpdate,
        approval_status: nextStatusOnSave(acting.role),
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select('slug, status')
      .single()
    if (error || !data) return NextResponse.json({ error: error?.message ?? 'Update failed' }, { status: 500 })

    await revalidatePage('generated', data.slug)
    await logAudit({ userId: acting.id, action: rest.status === 'published' ? 'publish' : 'update', table: 'generated_pages', recordId: id })
    return NextResponse.json({ success: true, slug: data.slug, status: data.status })
  } catch (err) {
    console.error('PATCH /api/admin/seo-pages/[id]:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(_req: NextRequest, { params }: RouteContext) {
  try {
    const { id } = await params
    const acting = await getActingUser()
    if (!acting) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const service = createServiceClient()
    const { data, error } = await service.from('generated_pages').delete().eq('id', id).select('slug').single()
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })

    await logAudit({ userId: acting.id, action: 'delete', table: 'generated_pages', recordId: id })
    if (data?.slug) await revalidatePage('generated', data.slug)
    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('DELETE /api/admin/seo-pages/[id]:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
