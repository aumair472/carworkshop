import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/service'
import { getActingUser } from '@/lib/auth-guard'
import { sanitizeHTML } from '@/lib/sanitize'
import { logAudit } from '@/lib/audit'
import { revalidatePage } from '@/lib/revalidate'
import { nextStatusOnSave } from '@/lib/approval'
import { SeoBlogUpdateSchema } from '@/lib/schemas/seo-blog'

interface RouteContext { params: Promise<{ id: string }> }

export async function GET(_req: NextRequest, { params }: RouteContext) {
  try {
    const { id } = await params
    const acting = await getActingUser()
    if (!acting) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const service = createServiceClient()
    const { data, error } = await service.from('blog_posts').select('*').eq('id', id).single()
    if (error || !data) return NextResponse.json({ error: 'Not found' }, { status: 404 })
    return NextResponse.json({ post: data })
  } catch (err) {
    console.error('GET /api/admin/seo-blog/[id]:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function PATCH(req: NextRequest, { params }: RouteContext) {
  try {
    const { id } = await params
    const acting = await getActingUser()
    if (!acting) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const body: unknown = await req.json()
    const parsed = SeoBlogUpdateSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ error: 'Invalid data', details: parsed.error.flatten().fieldErrors }, { status: 400 })
    }

    const d = parsed.data
    const service = createServiceClient()
    const { data, error } = await service
      .from('blog_posts')
      .update({
        ...d,
        ...(d.content !== undefined ? { content: d.content ? sanitizeHTML(d.content) : null } : {}),
        ...(d.arabic_content !== undefined ? { arabic_content: d.arabic_content ? sanitizeHTML(d.arabic_content) : null } : {}),
        approval_status: nextStatusOnSave(acting.role),
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select('slug, status')
      .single()
    if (error || !data) return NextResponse.json({ error: error?.message ?? 'Update failed' }, { status: 500 })

    await revalidatePage('blog', data.slug)
    await logAudit({ userId: acting.id, action: d.status === 'published' ? 'publish' : 'update', table: 'blog_posts', recordId: id })
    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('PATCH /api/admin/seo-blog/[id]:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(_req: NextRequest, { params }: RouteContext) {
  try {
    const { id } = await params
    const acting = await getActingUser()
    if (!acting) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const service = createServiceClient()
    const { data, error } = await service.from('blog_posts').delete().eq('id', id).select('slug').single()
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })

    await logAudit({ userId: acting.id, action: 'delete', table: 'blog_posts', recordId: id })
    if (data?.slug) await revalidatePage('blog', data.slug)
    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('DELETE /api/admin/seo-blog/[id]:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
