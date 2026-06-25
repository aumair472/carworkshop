import { describe, it, expect } from 'vitest'
import { generateServicePageSchema, generateOrganizationSchema } from '../schema'

describe('generateServicePageSchema', () => {
  const ctx = {
    brand: 'Audi',
    model: 'A4',
    service: 'Oil Change',
    url: 'https://carworkshop.ae/audi/a4/oil-change',
  }

  it('produces @context https://schema.org', () => {
    const schema = generateServicePageSchema(ctx)
    expect(schema['@context']).toBe('https://schema.org')
  })

  it('includes @graph array', () => {
    const schema = generateServicePageSchema(ctx)
    expect(Array.isArray(schema['@graph'])).toBe(true)
  })

  it('includes Service type in graph', () => {
    const schema = generateServicePageSchema(ctx)
    const graph = schema['@graph'] as Array<Record<string, unknown>>
    const service = graph.find(n => n['@type'] === 'Service')
    expect(service).toBeDefined()
    expect(service?.name).toContain('Audi')
  })

  it('includes BreadcrumbList in graph', () => {
    const schema = generateServicePageSchema(ctx)
    const graph = schema['@graph'] as Array<Record<string, unknown>>
    const breadcrumb = graph.find(n => n['@type'] === 'BreadcrumbList')
    expect(breadcrumb).toBeDefined()
  })

  it('includes FAQPage when faqs provided', () => {
    const schema = generateServicePageSchema({
      ...ctx,
      faqs: [{ question: 'How long?', answer: '1 hour.' }],
    })
    const graph = schema['@graph'] as Array<Record<string, unknown>>
    const faq = graph.find(n => n['@type'] === 'FAQPage')
    expect(faq).toBeDefined()
  })

  it('does not include FAQPage when no faqs', () => {
    const schema = generateServicePageSchema(ctx)
    const graph = schema['@graph'] as Array<Record<string, unknown>>
    const faq = graph.find(n => n['@type'] === 'FAQPage')
    expect(faq).toBeUndefined()
  })

  it('includes price in offers when provided', () => {
    const schema = generateServicePageSchema({ ...ctx, price: 149 })
    const graph = schema['@graph'] as Array<Record<string, unknown>>
    const service = graph.find(n => n['@type'] === 'Service') as Record<string, unknown>
    expect(service?.offers).toBeDefined()
    const offers = service?.offers as Record<string, unknown>
    expect(offers.priceCurrency).toBe('AED')
  })
})

describe('generateOrganizationSchema', () => {
  it('returns AutoRepair schema', () => {
    const schema = generateOrganizationSchema()
    expect(schema['@type']).toBe('AutoRepair')
    expect(schema.name).toBe('CarWorkshop.ae')
  })
})
