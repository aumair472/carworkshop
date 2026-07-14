import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/service'
import { getActingUser } from '@/lib/auth-guard'
import { sanitizeHTML } from '@/lib/sanitize'
import { logAudit } from '@/lib/audit'
import { revalidatePage } from '@/lib/revalidate'
import { nextStatusOnSave } from '@/lib/approval'
import { SeoBlogCreateSchema } from '@/lib/schemas/seo-blog'

// GET /api/admin/seo-blog — blog posts for the SEO Blog module.
export async function GET(req: NextRequest) {
  try {
    const acting = await getActingUser()
    if (!acting) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const sp = req.nextUrl.searchParams
    const service = createServiceClient()
    let query = service
      .from('blog_posts')
      .select('id, title, slug, seo_title, seo_description, meta_keyword, status, approval_status, assignee_id, assigned_at, country, state, image_png_url, image_webp_url, is_featured, published_at, updated_at')
      .order('updated_at', { ascending: false })

    if (sp.get('name')) query = query.ilike('title', `%${sp.get('name')!}%`)

    const { data, error } = await query.limit(1000)
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ posts: data })
  } catch (err) {
    console.error('GET /api/admin/seo-blog:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// POST /api/admin/seo-blog — create a blog post.
export async function POST(req: NextRequest) {
  try {
    const acting = await getActingUser()
    if (!acting) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const body: unknown = await req.json()
    const parsed = SeoBlogCreateSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ error: 'Invalid data', details: parsed.error.flatten().fieldErrors }, { status: 400 })
    }

    const d = parsed.data
    const service = createServiceClient()
    const { data, error } = await service
      .from('blog_posts')
      .insert({
        ...d,
        content: d.content ? sanitizeHTML(d.content) : null,
        arabic_content: d.arabic_content ? sanitizeHTML(d.arabic_content) : null,
        approval_status: nextStatusOnSave(acting.role),
        author_id: acting.id,
      })
      .select('id, slug, status')
      .single()
    if (error || !data) return NextResponse.json({ error: error?.message ?? 'Create failed' }, { status: 500 })

    if (data.status === 'published') await revalidatePage('blog', data.slug)
    await logAudit({ userId: acting.id, action: 'create', table: 'blog_posts', recordId: data.id })
    return NextResponse.json({ success: true, id: data.id }, { status: 201 })
  } catch (err) {
    console.error('POST /api/admin/seo-blog:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
