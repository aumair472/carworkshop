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
  content_json: PageContent | null
  seo_json: SeoJson | null
}

const SELECT_COLS = 'id, slug, h1, template_type, brand_id, model_id, state, meta_title, meta_description, short_description, content_json, seo_json'

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

export interface RelatedLink { h1: string; slug: string }

export interface RelatedSections {
  services: RelatedLink[]
  otherServices: RelatedLink[]
  locations: RelatedLink[]
}

async function findPublished(filters: { template_type: TemplateType; brand_id?: string | null; model_id?: string | null; excludeState?: string | null; sameState?: string | null }): Promise<RelatedLink[]> {
  const supabase = createPublicSupabase()
  let query = supabase
    .from('generated_pages')
    .select('h1, slug, state')
    .eq('status', 'published')
    .eq('template_type', filters.template_type)

  if (filters.brand_id) query = query.eq('brand_id', filters.brand_id)
  if (filters.model_id) query = query.eq('model_id', filters.model_id)
  if (filters.sameState) query = query.eq('state', filters.sameState)
  if (filters.excludeState) query = query.neq('state', filters.excludeState)

  const { data } = await query.limit(20)
  return (data ?? []).map(r => ({ h1: r.h1, slug: r.slug }))
}

// Auto-assembles the Services / Other Services / Locations We Serve sections
// for a generated page, per template. Computed fresh on every render — never
// stored — so newly published pages show up immediately everywhere they're
// relevant.
export async function getRelatedSections(page: GeneratedPageRow): Promise<RelatedSections> {
  const empty: RelatedSections = { services: [], otherServices: [], locations: [] }

  switch (page.template_type) {
    case 'brand': {
      let services = await findPublished({ template_type: 'brand_service', brand_id: page.brand_id, sameState: page.state })
      if (services.length === 0) services = await findPublished({ template_type: 'general_service', sameState: page.state })
      const otherServices = await findPublished({ template_type: 'brand_model', brand_id: page.brand_id, sameState: page.state })
      const locations = await findPublished({ template_type: 'brand', brand_id: page.brand_id, excludeState: page.state })
      return { services, otherServices, locations }
    }
    case 'brand_service': {
      let services = await findPublished({ template_type: 'brand_model_service', brand_id: page.brand_id, sameState: page.state })
      if (services.length === 0) services = await findPublished({ template_type: 'general_service', sameState: page.state })
      const locations = await findPublished({ template_type: 'brand_service', brand_id: page.brand_id, excludeState: page.state })
      return { ...empty, services, locations }
    }
    case 'brand_model': {
      let services = await findPublished({ template_type: 'brand_model_service', brand_id: page.brand_id, model_id: page.model_id, sameState: page.state })
      if (services.length === 0) services = await findPublished({ template_type: 'general_service', sameState: page.state })
      const locations = await findPublished({ template_type: 'brand_model', brand_id: page.brand_id, model_id: page.model_id, excludeState: page.state })
      return { ...empty, services, locations }
    }
    case 'brand_model_service': {
      const locations = await findPublished({ template_type: 'brand_model_service', brand_id: page.brand_id, model_id: page.model_id, excludeState: page.state })
      return { ...empty, locations }
    }
    case 'general_service': {
      const locations = await findPublished({ template_type: 'general_service', excludeState: page.state })
      return { ...empty, locations }
    }
    default:
      return empty
  }
}
