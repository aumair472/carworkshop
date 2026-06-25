import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabase } from '@/lib/supabase/server'
import { createServiceClient } from '@/lib/supabase/service'
import { z } from 'zod'

const StatusSchema = z.enum(['new', 'contacted', 'in_progress', 'converted', 'closed'])

export async function GET(req: NextRequest) {
  try {
    const supabase = await createServerSupabase()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const url = new URL(req.url)
    const rawStatus = url.searchParams.get('status')
    const parsedStatus = rawStatus ? StatusSchema.safeParse(rawStatus) : null
    const status = parsedStatus?.success ? parsedStatus.data : null

    const client = createServiceClient()
    let query = client.from('form_submissions').select('*').order('created_at', { ascending: false })
    if (status) query = query.eq('status', status)

    const { data, error } = await query
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })

    const rows = (data ?? [])
    const headers = ['id', 'name', 'phone', 'email', 'status', 'message', 'source_url', 'created_at']
    const csv = [
      headers.join(','),
      ...rows.map(r =>
        headers.map(h => {
          const val = (r as Record<string, unknown>)[h]
          const str = val === null || val === undefined ? '' : String(val)
          return `"${str.replace(/"/g, '""')}"`
        }).join(',')
      ),
    ].join('\n')

    return new NextResponse(csv, {
      status: 200,
      headers: {
        'Content-Type': 'text/csv',
        'Content-Disposition': `attachment; filename="leads-${new Date().toISOString().split('T')[0]}.csv"`,
      },
    })
  } catch (err) {
    console.error('GET /api/admin/leads/export:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
