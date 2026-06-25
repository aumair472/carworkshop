import type { MetaContext, PageMeta } from '@/types'

const TEMPLATES: Record<string, { title: string; description: string }> = {
  model_service: {
    title: '{brand} {model} {service} in UAE | CarWorkshop.ae',
    description: 'Get expert {brand} {model} {service} in UAE. Certified technicians, competitive pricing, free pickup & delivery, 12-month warranty.',
  },
  model_service_location: {
    title: '{brand} {model} {service} in {location} | CarWorkshop.ae',
    description: 'Professional {brand} {model} {service} in {location}, UAE. Book online today — free collection & delivery, 12-month warranty.',
  },
  brand: {
    title: '{brand} Service & Repair in UAE | CarWorkshop.ae',
    description: 'Expert {brand} service and repair in UAE. Certified {brand} specialists, transparent pricing, free pickup & delivery. Book online now.',
  },
  brand_service: {
    title: '{brand} {service} in UAE | CarWorkshop.ae',
    description: 'Professional {brand} {service} in UAE. Certified technicians, free pickup & delivery, 12-month warranty.',
  },
  model: {
    title: '{brand} {model} Service in UAE | CarWorkshop.ae',
    description: 'Professional {brand} {model} service and repair in UAE. All services from AED 149. Free pickup & delivery, 12-month warranty.',
  },
  service: {
    title: '{service} in UAE | CarWorkshop.ae',
    description: 'Expert {service} in UAE. Certified technicians, transparent pricing, free pickup & delivery. Book online now.',
  },
  location: {
    title: 'Car Service in {location} | CarWorkshop.ae',
    description: 'Professional car service and repair in {location}, UAE. All makes and models. Free pickup & delivery, 12-month warranty.',
  },
  model_service_location_default: {
    title: '{brand} {model} {service} in {location} | CarWorkshop.ae',
    description: 'Professional {brand} {model} {service} in {location}, UAE. Certified technicians. Free pickup & delivery, 12-month warranty.',
  },
}

export function generateMeta(ctx: MetaContext): PageMeta {
  const template = TEMPLATES[ctx.type] ?? TEMPLATES['model_service']

  const replace = (str: string): string =>
    str
      .replace('{brand}', ctx.brand?.name ?? '')
      .replace('{model}', ctx.model?.name ?? '')
      .replace('{service}', ctx.service?.name ?? '')
      .replace('{location}', ctx.location?.name ?? '')
      .trim()

  return {
    meta_title: replace(template.title).slice(0, 60),
    meta_description: replace(template.description).slice(0, 160),
  }
}
