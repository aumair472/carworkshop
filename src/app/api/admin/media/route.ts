import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabase } from '@/lib/supabase/server'
import { createServiceClient } from '@/lib/supabase/service'
import { uploadMedia, UploadError } from '@/lib/upload'
import { logAudit } from '@/lib/audit'

export async function GET() {
  try {
    const supabase = await createServerSupabase()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const client = createServiceClient()
    const { data, error } = await client.from('media').select('*').order('created_at', { ascending: false })
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })

    return NextResponse.json({ media: data })
  } catch (err) {
    console.error('GET /api/admin/media:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const supabase = await createServerSupabase()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const formData = await req.formData()
    const file = formData.get('file')
    if (!(file instanceof File)) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    }

    const result = await uploadMedia(file)

    const pathParts = result.path.split('/')
    const storedFilename = pathParts.pop() ?? result.path
    const folder = pathParts.join('/') || 'uploads'

    const client = createServiceClient()
    const { data, error } = await client.from('media').insert({
      filename: storedFilename,
      original_name: file.name,
      url: result.url,
      size_bytes: result.size,
      mime_type: result.mimeType,
      folder,
      uploaded_by: user.id,
    }).select().single()

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })

    await logAudit({ userId: user.id, action: 'create', table: 'media', recordId: data.id })
    return NextResponse.json({ media: data }, { status: 201 })
  } catch (err) {
    if (err instanceof UploadError) {
      return NextResponse.json({ error: err.message }, { status: 400 })
    }
    console.error('POST /api/admin/media:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
