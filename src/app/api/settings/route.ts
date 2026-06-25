import { NextResponse } from 'next/server'
import { createServerSupabase } from '@/lib/supabase/server'

export async function GET() {
  try {
    const supabase = await createServerSupabase()
    const { data, error } = await supabase
      .from('website_settings')
      .select('key, value')

    if (error) {
      console.error('Settings fetch error:', error)
      return NextResponse.json({ error: 'Failed to fetch settings' }, { status: 500 })
    }

    const settings = Object.fromEntries((data ?? []).map(s => [s.key, s.value]))

    return NextResponse.json(settings, {
      headers: { 'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600' },
    })
  } catch (err) {
    console.error('Settings route error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
