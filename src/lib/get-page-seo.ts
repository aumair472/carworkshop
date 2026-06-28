import { createPublicSupabase } from '@/lib/supabase/public'
import type { SeoJson } from '@/lib/schemas/seo'

// Per-record SEO overlay loaders for public generateMetadata(). Each returns the
// seo_json (or {}) for the matching published record. Used with resolveSEO().

async function pick<T extends string>(table: 'brands' | 'services' | 'locations' | 'static_pages' | 'generated_pages' | 'blog_posts', col: 'id' | 'slug', val: T): Promise<SeoJson> {
  try {
    const supabase = await createPublicSupabase()
    const { data } = await supabase.from(table).select('seo_json').eq(col, val).maybeSingle()
    return (data?.seo_json ?? {}) as SeoJson
  } catch {
    return {}
  }
}

export const getBrandSeo = (brandId: string) => pick('brands', 'id', brandId)
export const getServiceSeo = (serviceId: string) => pick('services', 'id', serviceId)
export const getLocationSeo = (locationId: string) => pick('locations', 'id', locationId)
export const getStaticPageSeo = (pageSlug: string) => pick('static_pages', 'slug', pageSlug)
export const getGeneratedPageSeo = (slug: string) => pick('generated_pages', 'slug', slug)
export const getBlogPostSeo = (postSlug: string) => pick('blog_posts', 'slug', postSlug)
