import { NextResponse } from 'next/server'
import { getSettings } from '@/lib/hooks/useSettings'
import { PUBLIC_SETTING_KEYS, type SiteSettings } from '@/types/settings'

export const revalidate = 3600

// Public settings — only non-sensitive keys, used by Header, Footer, floating buttons.
export async function GET() {
  try {
    const all = await getSettings()
    const publicSettings: Partial<Record<keyof SiteSettings, unknown>> = {}
    for (const key of PUBLIC_SETTING_KEYS) {
      publicSettings[key] = all[key]
    }
    return NextResponse.json(publicSettings, {
      headers: { 'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400' },
    })
  } catch (err) {
    console.error('GET /api/settings:', err)
    return NextResponse.json({ error: 'Failed to fetch settings' }, { status: 500 })
  }
}
