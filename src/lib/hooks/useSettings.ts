import 'server-only'
import { createServiceClient } from '@/lib/supabase/service'
import { DEFAULT_SETTINGS, SERVER_ONLY_SETTING_KEYS, type SiteSettings } from '@/types/settings'

// Server-side fetch of all site settings, merged over typed defaults so callers
// always receive a complete SiteSettings object even if a key is missing.
export async function getSettings(): Promise<SiteSettings> {
  try {
    const supabase = createServiceClient()
    const { data } = await supabase.from('website_settings').select('key, value')
    if (!data) return DEFAULT_SETTINGS

    const merged: Record<string, unknown> = { ...DEFAULT_SETTINGS }
    for (const row of data) {
      // Keep typed defaults for null DB values (e.g. unset logo URLs stay null,
      // which already matches the default).
      if (row.key in merged) merged[row.key] = row.value
    }
    // Strip server-only secrets so they never reach client components / public HTML.
    for (const k of SERVER_ONLY_SETTING_KEYS) merged[k] = DEFAULT_SETTINGS[k]
    return merged as unknown as SiteSettings
  } catch {
    return DEFAULT_SETTINGS
  }
}
