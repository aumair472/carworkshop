import { createServiceClient } from '@/lib/supabase/service'
import { generateMeta } from './meta'
import type { InsertGeneratedPage } from '@/types'

export interface GenerateOptions {
  brandId: string
  modelIds?: string[]
  serviceIds?: string[]
  locationIds?: string[]
  templateId: string
  includeLocationPages: boolean
}

export interface GenerateResult {
  generated: number
  failed: number
  slugs: string[]
}

interface BrandWithRelations {
  id: string
  name: string
  slug: string
  brand_models: Array<{ id: string; name: string; slug: string; status: string }>
  brand_service_map: Array<{
    service_id: string
    is_active: boolean
    services: { id: string; name: string; slug: string } | null
  }>
  brand_location_map: Array<{
    location_id: string
    is_active: boolean
    locations: { id: string; name: string; slug: string } | null
  }>
}

const BATCH_SIZE = 100

export async function generatePages(options: GenerateOptions): Promise<GenerateResult> {
  const supabase = createServiceClient()
  const pages: InsertGeneratedPage[] = []

  const { data, error: brandError } = await supabase
    .from('brands')
    .select(`
      id, name, slug,
      brand_models(id, name, slug, status),
      brand_service_map(service_id, is_active, services(id, name, slug)),
      brand_location_map(location_id, is_active, locations(id, name, slug))
    `)
    .eq('id', options.brandId)
    .single()

  if (brandError || !data) {
    throw new Error(`Brand not found: ${brandError?.message ?? 'unknown'}`)
  }

  const brand = data as unknown as BrandWithRelations

  const allModels = (brand.brand_models ?? []).filter(m => m.status === 'published')
  const models = options.modelIds ? allModels.filter(m => options.modelIds!.includes(m.id)) : allModels

  const allServiceMaps = (brand.brand_service_map ?? []).filter(sm => sm.is_active && sm.services)
  const serviceMaps = options.serviceIds
    ? allServiceMaps.filter(sm => options.serviceIds!.includes(sm.service_id))
    : allServiceMaps

  const allLocationMaps = (brand.brand_location_map ?? []).filter(lm => lm.is_active && lm.locations)
  const locationMaps = options.locationIds
    ? allLocationMaps.filter(lm => options.locationIds!.includes(lm.location_id))
    : allLocationMaps

  for (const model of models) {
    for (const serviceMap of serviceMaps) {
      const service = serviceMap.services
      if (!service) continue

      const slug = `${brand.slug}/${model.slug}/${service.slug}`
      const meta = generateMeta({
        type: 'model_service',
        brand: { name: brand.name, slug: brand.slug },
        model: { name: model.name, slug: model.slug },
        service: { name: service.name, slug: service.slug },
      })

      const page: InsertGeneratedPage = {
        page_type: 'model_service',
        brand_id: brand.id,
        model_id: model.id,
        service_id: service.id,
        location_id: null,
        slug,
        h1: `${brand.name} ${model.name} ${service.name} in UAE`,
        meta_title: meta.meta_title,
        meta_description: meta.meta_description,
        template_id: options.templateId,
        status: 'draft',
      }
      pages.push(page)

      if (options.includeLocationPages) {
        for (const locationMap of locationMaps) {
          const location = locationMap.locations
          if (!location) continue

          const locSlug = `${slug}/${location.slug}`
          const locMeta = generateMeta({
            type: 'model_service_location',
            brand: { name: brand.name, slug: brand.slug },
            model: { name: model.name, slug: model.slug },
            service: { name: service.name, slug: service.slug },
            location: { name: location.name, slug: location.slug },
          })

          pages.push({
            ...page,
            page_type: 'model_service_location',
            location_id: location.id,
            slug: locSlug,
            h1: `${brand.name} ${model.name} ${service.name} in ${location.name}`,
            meta_title: locMeta.meta_title,
            meta_description: locMeta.meta_description,
          })
        }
      }
    }
  }

  let generated = 0
  let failed = 0
  const slugs: string[] = []

  for (let i = 0; i < pages.length; i += BATCH_SIZE) {
    const batch = pages.slice(i, i + BATCH_SIZE)
    const { data: insertedData, error } = await supabase
      .from('generated_pages')
      .upsert(batch, { onConflict: 'slug' })
      .select('slug')

    if (error) {
      console.error(`Batch ${i} failed:`, error)
      failed += batch.length
    } else {
      generated += insertedData?.length ?? 0
      slugs.push(...(insertedData?.map(p => p.slug) ?? []))
    }
  }

  return { generated, failed, slugs }
}

interface CountBrand {
  brand_models: Array<{ id: string; status: string }>
  brand_service_map: Array<{ service_id: string; is_active: boolean }>
  brand_location_map: Array<{ location_id: string; is_active: boolean }>
}

export async function countGeneratedPages(options: GenerateOptions): Promise<number> {
  const supabase = createServiceClient()

  const { data } = await supabase
    .from('brands')
    .select(`
      brand_models(id, status),
      brand_service_map(service_id, is_active),
      brand_location_map(location_id, is_active)
    `)
    .eq('id', options.brandId)
    .single()

  if (!data) return 0

  const brand = data as unknown as CountBrand

  const models = (brand.brand_models ?? []).filter(m => m.status === 'published')
  const filteredModels = options.modelIds ? models.filter(m => options.modelIds!.includes(m.id)) : models

  const services = (brand.brand_service_map ?? []).filter(sm => sm.is_active)
  const filteredServices = options.serviceIds ? services.filter(sm => options.serviceIds!.includes(sm.service_id)) : services

  const locations = (brand.brand_location_map ?? []).filter(lm => lm.is_active)
  const filteredLocations = options.locationIds ? locations.filter(lm => options.locationIds!.includes(lm.location_id)) : locations

  const basePages = filteredModels.length * filteredServices.length
  const locationPages = options.includeLocationPages ? basePages * filteredLocations.length : 0

  return basePages + locationPages
}
