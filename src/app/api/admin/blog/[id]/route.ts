import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabase } from '@/lib/supabase/server'
import { createServiceClient } from '@/lib/supabase/service'
import { UpdateBlogPostSchema } from '@/lib/schemas/blog'
import { sanitizeHTML } from '@/lib/sanitize'
import { logAudit } from '@/lib/audit'

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const supabase = await createServerSupabase()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const body: unknown = await req.json()
    const parsed = UpdateBlogPostSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ error: 'Invalid data', details: parsed.error.flatten().fieldErrors }, { status: 400 })
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { content, status, tag_ids: _tag_ids, ...rest } = parsed.data
    const sanitizedContent = content ? sanitizeHTML(content) : undefined

    const service = createServiceClient()
    const { data, error } = await service
      .from('blog_posts')
      .update({
        ...rest,
        ...(sanitizedContent !== undefined ? { content: sanitizedContent } : {}),
        ...(status ? { status, published_at: status === 'published' ? new Date().toISOString() : undefined } : {}),
      })
      .eq('id', id)
      .select('id, slug')
      .single()

    if (error) {
      console.error('Blog update error:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    await logAudit({ userId: user.id, action: 'update', table: 'blog_posts', recordId: id })

    return NextResponse.json(data)
  } catch (err) {
    console.error('Blog PATCH error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const supabase = await createServerSupabase()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const service = createServiceClient()
    const { error } = await service.from('blog_posts').delete().eq('id', id)

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    await logAudit({ userId: user.id, action: 'delete', table: 'blog_posts', recordId: id, changes: {} })

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('Blog DELETE error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
