import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabase } from '@/lib/supabase/server'
import { createServiceClient } from '@/lib/supabase/service'
import { CreateBlogPostSchema } from '@/lib/schemas/blog'
import { sanitizeHTML } from '@/lib/sanitize'
import { logAudit } from '@/lib/audit'
import { revalidatePage } from '@/lib/revalidate'

export async function POST(req: NextRequest) {
  try {
    const supabase = await createServerSupabase()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const body: unknown = await req.json()
    const parsed = CreateBlogPostSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ error: 'Invalid data', details: parsed.error.flatten().fieldErrors }, { status: 400 })
    }

    const { title, slug, excerpt, content, status, seo_title, seo_description, author_id, featured_image } = parsed.data
    const sanitizedContent = content ? sanitizeHTML(content) : null
    const resolvedSlug = slug ?? title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')

    const service = createServiceClient()
    const { data, error } = await service
      .from('blog_posts')
      .insert({
        title,
        slug: resolvedSlug,
        excerpt: excerpt ?? null,
        content: sanitizedContent,
        status: status ?? 'draft',
        seo_title: seo_title ?? null,
        seo_description: seo_description ?? null,
        featured_image: featured_image ?? null,
        author_id: author_id ?? user.id,
        published_at: status === 'published' ? new Date().toISOString() : null,
      })
      .select('id, slug')
      .single()

    if (error) {
      console.error('Blog create error:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    await logAudit({ userId: user.id, action: 'create', table: 'blog_posts', recordId: data.id })
    if ((status ?? 'draft') === 'published') await revalidatePage('blog', data.slug)

    return NextResponse.json(data, { status: 201 })
  } catch (err) {
    console.error('Blog POST error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
