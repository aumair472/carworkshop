import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabase } from '@/lib/supabase/server'
import { createServiceClient } from '@/lib/supabase/service'
import { z } from 'zod'

const FilterSchema = z.object({
  status: z.enum(['new', 'contacted', 'in_progress', 'converted', 'closed']).optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
})

export async function GET(req: NextRequest) {
  try {
    const supabase = await createServerSupabase()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const url = new URL(req.url)
    const parsed = FilterSchema.safeParse({
      status: url.searchParams.get('status') ?? undefined,
      page: url.searchParams.get('page') ?? 1,
      limit: url.searchParams.get('limit') ?? 20,
    })
    if (!parsed.success) {
      return NextResponse.json({ error: 'Invalid query params' }, { status: 400 })
    }

    const { status, page, limit } = parsed.data
    const offset = (page - 1) * limit

    const client = createServiceClient()
    let query = client.from('form_submissions').select('*, services(name), brands(name)', { count: 'exact' }).order('created_at', { ascending: false }).range(offset, offset + limit - 1)
    if (status) query = query.eq('status', status)

    const { data, error, count } = await query
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })

    return NextResponse.json({ leads: data, total: count ?? 0, page, limit })
  } catch (err) {
    console.error('GET /api/admin/leads:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
