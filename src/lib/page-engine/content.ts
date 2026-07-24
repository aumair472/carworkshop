import { createPublicSupabase } from '@/lib/supabase/public'
import type { PageContent, TemplateType } from '@/types'
import type { SeoJson } from '@/lib/schemas/seo'

export interface GeneratedPageRow {
  id: string
  slug: string
  h1: string
  template_type: TemplateType
  brand_id: string | null
  model_id: string | null
  state: string | null
  meta_title: string
  meta_description: string
  short_description: string | null
  starting_price: string | null
  content_json: PageContent | null
  seo_json: SeoJson | null
}

const SELECT_COLS = 'id, slug, h1, template_type, brand_id, model_id, state, meta_title, meta_description, short_description, starting_price, content_json, seo_json'

export async function getPageBySlug(slug: string): Promise<GeneratedPageRow | null> {
  try {
    const supabase = createPublicSupabase()
    const { data } = await supabase
      .from('generated_pages')
      .select(SELECT_COLS)
      .eq('slug', slug)
      .eq('status', 'published')
      .maybeSingle()
    return (data as unknown as GeneratedPageRow | null) ?? null
  } catch {
    return null
  }
}

export async function getBrandName(brandId: string | null): Promise<string | null> {
  if (!brandId) return null
  try {
    const supabase = createPublicSupabase()
    const { data } = await supabase.from('brands').select('name').eq('id', brandId).maybeSingle()
    return data?.name ?? null
  } catch {
    return null
  }
}

export interface RelatedLink { h1: string; slug: string; short_description?: string | null }

export interface RelatedSections {
  services: RelatedLink[]
  models: RelatedLink[]
  locations: RelatedLink[]
}

interface FoundRow { h1: string; slug: string; state: string | null; short_description: string | null }

async function findPublished(filters: { template_type: TemplateType; brand_id?: string | null; model_id?: string | null; excludeState?: string | null; sameState?: string | null }): Promise<FoundRow[]> {
  const supabase = createPublicSupabase()
  let query = supabase
    .from('generated_pages')
    .select('h1, slug, state, short_description')
    .eq('status', 'published')
    .eq('template_type', filters.template_type)

  if (filters.brand_id) query = query.eq('brand_id', filters.brand_id)
  if (filters.model_id) query = query.eq('model_id', filters.model_id)
  if (filters.sameState) query = query.eq('state', filters.sameState)
  if (filters.excludeState) query = query.neq('state', filters.excludeState)

  const { data } = await query.limit(20)
  return data ?? []
}

// Auto-assembles the Services / Models We Serve / Locations We Serve sections
// for a generated page, per template. Computed fresh on every render — never
// stored — so newly published pages show up immediately everywhere they're
// relevant.
export async function getRelatedSections(page: GeneratedPageRow, brandName: string | null): Promise<RelatedSections> {
  const empty: RelatedSections = { services: [], models: [], locations: [] }

  // Locations always link to other-state pages of the SAME template for the
  // same brand/model — display label is constructed ("{Brand} Service
  // {State}"), not the target page's own H1, so naming stays consistent
  // regardless of what the admin typed there.
  function toLocationLinks(rows: FoundRow[]): RelatedLink[] {
    return rows.map(r => ({
      h1: brandName && r.state ? `${brandName} Service ${r.state}` : r.h1,
      slug: r.slug,
    }))
  }
  function toLinks(rows: FoundRow[]): RelatedLink[] {
    return rows.map(r => ({ h1: r.h1, slug: r.slug, short_description: r.short_description }))
  }

  switch (page.template_type) {
    case 'brand': {
      let services = await findPublished({ template_type: 'brand_service', brand_id: page.brand_id, sameState: page.state })
      if (services.length === 0) services = await findPublished({ template_type: 'general_service', sameState: page.state })
      const models = await findPublished({ template_type: 'brand_model', brand_id: page.brand_id, sameState: page.state })
      const locations = await findPublished({ template_type: 'brand', brand_id: page.brand_id, excludeState: page.state })
      return { services: toLinks(services), models: toLinks(models), locations: toLocationLinks(locations) }
    }
    case 'brand_service': {
      let services = await findPublished({ template_type: 'brand_model_service', brand_id: page.brand_id, sameState: page.state })
      if (services.length === 0) services = await findPublished({ template_type: 'general_service', sameState: page.state })
      const locations = await findPublished({ template_type: 'brand_service', brand_id: page.brand_id, excludeState: page.state })
      return { ...empty, services: toLinks(services), locations: toLocationLinks(locations) }
    }
    case 'brand_model': {
      let services = await findPublished({ template_type: 'brand_model_service', brand_id: page.brand_id, model_id: page.model_id, sameState: page.state })
      if (services.length === 0) services = await findPublished({ template_type: 'general_service', sameState: page.state })
      const locations = await findPublished({ template_type: 'brand_model', brand_id: page.brand_id, model_id: page.model_id, excludeState: page.state })
      return { ...empty, services: toLinks(services), locations: toLocationLinks(locations) }
    }
    case 'brand_model_service': {
      const locations = await findPublished({ template_type: 'brand_model_service', brand_id: page.brand_id, model_id: page.model_id, excludeState: page.state })
      return { ...empty, locations: toLocationLinks(locations) }
    }
    case 'general_service': {
      const locations = await findPublished({ template_type: 'general_service', excludeState: page.state })
      return { ...empty, locations: locations.map(r => ({ h1: r.h1, slug: r.slug })) }
    }
    default:
      return empty
  }
}
