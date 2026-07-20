import { NextResponse } from 'next/server'
import { createServerSupabase } from '@/lib/supabase/server'
import { createServiceClient } from '@/lib/supabase/service'

export async function GET() {
  try {
    const supabase = await createServerSupabase()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const client = createServiceClient()
    const { data, error } = await client.from('locations').select('*').order('sort_order')
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })

    return NextResponse.json({ locations: data })
  } catch (err) {
    console.error('GET /api/admin/locations:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
