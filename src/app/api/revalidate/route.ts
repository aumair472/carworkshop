import { NextRequest, NextResponse } from 'next/server'
import { revalidatePath, revalidateTag } from 'next/cache'
import { z } from 'zod'

const RevalidateSchema = z.object({
  secret: z.string(),
  path: z.string().optional(),
  tag: z.string().optional(),
})

export async function POST(req: NextRequest) {
  try {
    const body: unknown = await req.json()
    const parsed = RevalidateSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
    }

    const { secret, path, tag } = parsed.data

    if (secret !== process.env.REVALIDATE_SECRET) {
      return NextResponse.json({ error: 'Invalid secret' }, { status: 401 })
    }

    if (tag) {
      revalidateTag(tag, 'default')
      return NextResponse.json({ revalidated: true, tag })
    }

    if (path) {
      revalidatePath(path, 'page')
      return NextResponse.json({ revalidated: true, path })
    }

    return NextResponse.json({ error: 'Must provide path or tag' }, { status: 400 })
  } catch (err) {
    console.error('Revalidate error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
