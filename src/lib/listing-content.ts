import { createPublicSupabase } from '@/lib/supabase/public'

export interface ListingContent {
  hero?: { h1?: string; subtitle?: string }
  cta_banner?: { headline?: string; button_text?: string; button_link?: string }
}

// Loads the editable hero/CTA overlay for a collection page (services/brands/
// locations/blog listings). Returns {} when no published record exists so
// callers fall back to their hardcoded defaults.
export async function getListingContent(slug: string): Promise<ListingContent> {
  try {
    const supabase = await createPublicSupabase()
    const { data } = await supabase
      .from('static_pages')
      .select('content_json')
      .eq('slug', slug)
      .eq('status', 'published')
      .maybeSingle()
    return (data?.content_json ?? {}) as ListingContent
  } catch {
    return {}
  }
}
