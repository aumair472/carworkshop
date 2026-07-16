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

// Flat SMC-style template columns (added in migration 010) plus `template`
// itself, used by ServicePageTemplate / BrandPageTemplate to pick a layout and
// source their non-content_json fields. Selected loosely (not against the
// generated Database type, which predates migration 010) so this keeps working
// even before `supabase gen types` is re-run.
export interface PageTemplateRow {
  template: string | null
  highlight_text: string | null
  mid_category_title: string | null
  key_points: string | null
  icon_image_png_url: string | null
  icon_image_webp_url: string | null
  icon_image_title: string | null
  icon_image_alt: string | null
  image_bottom_png_url: string | null
  image_bottom_webp_url: string | null
  image_bottom_title: string | null
  image_bottom_alt: string | null
  image_large_url: string | null
  image_mobile_url: string | null
}

export async function getPageTemplateRow(slug: string): Promise<PageTemplateRow | null> {
  try {
    const supabase = await createPublicSupabase()
    const { data } = await supabase
      .from('generated_pages')
      .select('template, highlight_text, mid_category_title, key_points, icon_image_png_url, icon_image_webp_url, icon_image_title, icon_image_alt, image_bottom_png_url, image_bottom_webp_url, image_bottom_title, image_bottom_alt, image_large_url, image_mobile_url')
      .eq('slug', slug)
      .eq('status', 'published')
      .maybeSingle()
    return (data as PageTemplateRow | null) ?? null
  } catch {
    return null
  }
}
