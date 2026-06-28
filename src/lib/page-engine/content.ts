import { createPublicSupabase } from '@/lib/supabase/public'
import type { PageContent } from '@/types'
import type { SeoJson } from '@/lib/schemas/seo'

// Editable SEO overlay (seo_json) for a generated page by its full slug.
export async function getPageSeo(slug: string): Promise<SeoJson> {
  try {
    const supabase = await createPublicSupabase()
    const { data } = await supabase
      .from('generated_pages')
      .select('seo_json')
      .eq('slug', slug)
      .eq('status', 'published')
      .maybeSingle()
    return (data?.seo_json ?? {}) as SeoJson
  } catch {
    return {}
  }
}

// Fetch the editable content_json overlay for a generated page by its full slug
// (e.g. "audi/a4/oil-change"). Returns null when the page has no custom content.
export async function getPageContent(slug: string): Promise<PageContent | null> {
  try {
    const supabase = await createPublicSupabase()
    const { data } = await supabase
      .from('generated_pages')
      .select('content_json')
      .eq('slug', slug)
      .eq('status', 'published')
      .maybeSingle()
    if (!data?.content_json) return null
    return data.content_json as unknown as PageContent
  } catch {
    return null
  }
}
