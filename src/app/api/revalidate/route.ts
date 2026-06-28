import { NextRequest, NextResponse } from 'next/server'
import { revalidatePath, revalidateTag } from 'next/cache'
import { z } from 'zod'
import { pathsForRevalidate, type RevalidateType } from '@/lib/revalidate'

// External/manual ISR invalidation. Admin routes revalidate directly via
// revalidatePage(); this endpoint is for webhooks / scripts. Accepts a typed
// entity ({ type, slug }) or raw { path }/{ tag }. Secret via body or the
// x-revalidation-secret header, checked against REVALIDATION_SECRET.
const RevalidateSchema = z.object({
  secret: z.string().optional(),
  type: z.enum(['brand', 'service', 'location', 'blog', 'generated', 'static', 'all']).optional(),
  slug: z.string().optional(),
  path: z.string().optional(),
  tag: z.string().optional(),
})

export async function POST(req: NextRequest) {
  try {
    const parsed = RevalidateSchema.safeParse(await req.json())
    if (!parsed.success) return NextResponse.json({ error: 'Invalid request' }, { status: 400 })

    const { secret, type, slug, path, tag } = parsed.data
    const provided = secret ?? req.headers.get('x-revalidation-secret') ?? ''
    if (!process.env.REVALIDATION_SECRET || provided !== process.env.REVALIDATION_SECRET) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    if (type === 'all') {
      revalidatePath('/', 'layout')
      return NextResponse.json({ revalidated: true, type: 'all' })
    }

    if (type) {
      if (!slug) return NextResponse.json({ error: 'slug required for type' }, { status: 400 })
      const paths = pathsForRevalidate(type as RevalidateType, slug)
      paths.forEach(p => revalidatePath(p))
      return NextResponse.json({ revalidated: true, type, slug, paths })
    }

    if (tag) {
      revalidateTag(tag, 'default')
      return NextResponse.json({ revalidated: true, tag })
    }

    if (path) {
      revalidatePath(path)
      return NextResponse.json({ revalidated: true, path })
    }

    return NextResponse.json({ error: 'Provide type+slug, path, or tag' }, { status: 400 })
  } catch (err) {
    console.error('Revalidate error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
