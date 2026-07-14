import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/service'
import { getActingUser } from '@/lib/auth-guard'
import { sanitizeHTML } from '@/lib/sanitize'
import { logAudit } from '@/lib/audit'
import { revalidatePage } from '@/lib/revalidate'
import { nextStatusOnSave } from '@/lib/approval'
import { SeoPageCreateSchema } from '@/lib/schemas/seo-page'
import type { ApprovalStatus } from '@/types'

// GET /api/admin/seo-pages — filtered list for the SEO Pages module.
export async function GET(req: NextRequest) {
  try {
    const acting = await getActingUser()
    if (!acting) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const sp = req.nextUrl.searchParams
    const service = createServiceClient()
    let query = service
      .from('generated_pages')
      .select('id, page_type, brand_id, model_id, slug, h1, meta_title, meta_keyword, status, approval_status, assignee_id, assigned_at, created_by, country, state, image_png_url, image_webp_url, updated_at, generated_at')
      .order('updated_at', { ascending: false })

    if (sp.get('country')) query = query.eq('country', sp.get('country')!)
    if (sp.get('state')) query = query.eq('state', sp.get('state')!)
    if (sp.get('approval_status')) query = query.eq('approval_status', sp.get('approval_status') as ApprovalStatus)
    if (sp.get('assignee_id')) query = query.eq('assignee_id', sp.get('assignee_id')!)
    if (sp.get('brand_id')) query = query.eq('brand_id', sp.get('brand_id')!)
    if (sp.get('name')) query = query.ilike('h1', `%${sp.get('name')!}%`)
    if (sp.get('keyword')) query = query.ilike('meta_keyword', `%${sp.get('keyword')!}%`)

    const { data, error } = await query.limit(2000)
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ pages: data })
  } catch (err) {
    console.error('GET /api/admin/seo-pages:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// POST /api/admin/seo-pages — create a page from the SMC-style editor.
export async function POST(req: NextRequest) {
  try {
    const acting = await getActingUser()
    if (!acting) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const body: unknown = await req.json()
    const parsed = SeoPageCreateSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ error: 'Invalid data', details: parsed.error.flatten().fieldErrors }, { status: 400 })
    }

    const { complete_description, short_description, arabic_short_description, arabic_complete_description, ...rest } = parsed.data

    const service = createServiceClient()
    const { data, error } = await service
      .from('generated_pages')
      .insert({
        ...rest,
        meta_description: rest.meta_description ?? '',
        short_description: short_description ? sanitizeHTML(short_description) : null,
        arabic_short_description: arabic_short_description ? sanitizeHTML(arabic_short_description) : null,
        arabic_complete_description: arabic_complete_description ? sanitizeHTML(arabic_complete_description) : null,
        content_json: complete_description ? { main_content: sanitizeHTML(complete_description) } : null,
        approval_status: nextStatusOnSave(acting.role),
        created_by: acting.id,
      })
      .select('id, slug, status')
      .single()
    if (error || !data) return NextResponse.json({ error: error?.message ?? 'Create failed' }, { status: 500 })

    if (data.status === 'published') await revalidatePage('generated', data.slug)
    await logAudit({ userId: acting.id, action: 'create', table: 'generated_pages', recordId: data.id })
    return NextResponse.json({ success: true, id: data.id }, { status: 201 })
  } catch (err) {
    console.error('POST /api/admin/seo-pages:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
