import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabase } from '@/lib/supabase/server'
import { createServiceClient } from '@/lib/supabase/service'
import { deleteMedia, UploadError } from '@/lib/upload'
import { logAudit } from '@/lib/audit'
import { z } from 'zod'

interface RouteContext {
  params: Promise<{ id: string }>
}

const PatchSchema = z.object({ alt_text: z.string().max(300) })

export async function PATCH(req: NextRequest, { params }: RouteContext) {
  try {
    const { id } = await params
    const supabase = await createServerSupabase()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const body: unknown = await req.json()
    const parsed = PatchSchema.safeParse(body)
    if (!parsed.success) return NextResponse.json({ error: 'Invalid data' }, { status: 400 })

    const client = createServiceClient()
    const { data, error } = await client.from('media').update({ alt_text: parsed.data.alt_text }).eq('id', id).select().single()
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })

    await logAudit({ userId: user.id, action: 'update', table: 'media', recordId: id })
    return NextResponse.json({ media: data })
  } catch (err) {
    console.error('PATCH /api/admin/media/[id]:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(_req: NextRequest, { params }: RouteContext) {
  try {
    const { id } = await params
    const supabase = await createServerSupabase()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const client = createServiceClient()
    const { data: mediaRow, error: fetchError } = await client.from('media').select('folder, filename').eq('id', id).single()
    if (fetchError || !mediaRow) return NextResponse.json({ error: 'Not found' }, { status: 404 })

    const storagePath = `${mediaRow.folder}/${mediaRow.filename}`
    await deleteMedia(storagePath)

    const { error } = await client.from('media').delete().eq('id', id)
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })

    await logAudit({ userId: user.id, action: 'delete', table: 'media', recordId: id })
    return NextResponse.json({ success: true })
  } catch (err) {
    if (err instanceof UploadError) {
      return NextResponse.json({ error: err.message }, { status: 400 })
    }
    console.error('DELETE /api/admin/media/[id]:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
