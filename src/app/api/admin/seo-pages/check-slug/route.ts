import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/service'
import { getActingUser } from '@/lib/auth-guard'

// GET /api/admin/seo-pages/check-slug?slug=dubai/audi&excludeId=<uuid>
// Pre-save availability check for the SEO Page editor's auto-generated slug.
export async function GET(req: NextRequest) {
  try {
    const acting = await getActingUser()
    if (!acting) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const slug = req.nextUrl.searchParams.get('slug')
    const excludeId = req.nextUrl.searchParams.get('excludeId')
    if (!slug) return NextResponse.json({ error: 'slug required' }, { status: 400 })

    const service = createServiceClient()
    let query = service.from('generated_pages').select('id').eq('slug', slug)
    if (excludeId) query = query.neq('id', excludeId)
    const { data, error } = await query.maybeSingle()
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })

    return NextResponse.json({ available: !data })
  } catch (err) {
    console.error('GET /api/admin/seo-pages/check-slug:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
