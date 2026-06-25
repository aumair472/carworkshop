import { describe, it, expect } from 'vitest'
import { generateMeta } from '../meta'

const brand = { name: 'Audi', slug: 'audi' }
const model = { name: 'A4', slug: 'a4' }
const service = { name: 'Oil Change', slug: 'oil-change' }
const location = { name: 'Dubai Marina', slug: 'dubai-marina' }

describe('generateMeta', () => {
  it('generates model_service meta correctly', () => {
    const meta = generateMeta({ type: 'model_service', brand, model, service })
    expect(meta.meta_title).toBe('Audi A4 Oil Change in UAE | CarWorkshop.ae')
    expect(meta.meta_description).toContain('Audi A4 Oil Change')
    expect(meta.meta_title.length).toBeLessThanOrEqual(60)
    expect(meta.meta_description.length).toBeLessThanOrEqual(160)
  })

  it('generates model_service_location meta correctly', () => {
    const meta = generateMeta({ type: 'model_service_location', brand, model, service, location })
    expect(meta.meta_title).toContain('Dubai Marina')
    expect(meta.meta_description).toContain('Dubai Marina')
    expect(meta.meta_title.length).toBeLessThanOrEqual(60)
    expect(meta.meta_description.length).toBeLessThanOrEqual(160)
  })

  it('generates brand meta correctly', () => {
    const meta = generateMeta({ type: 'brand', brand })
    expect(meta.meta_title).toContain('Audi')
    expect(meta.meta_title.length).toBeLessThanOrEqual(60)
  })

  it('never exceeds 60 chars for title', () => {
    const longBrand = { name: 'A Very Long Brand Name That Is Really Quite Long Indeed', slug: 'long' }
    const meta = generateMeta({ type: 'brand', brand: longBrand })
    expect(meta.meta_title.length).toBeLessThanOrEqual(60)
  })

  it('never exceeds 160 chars for description', () => {
    const longBrand = { name: 'A Very Long Brand Name That Is Really Quite Long Indeed', slug: 'long' }
    const longModel = { name: 'A Very Long Model Name That Is Also Quite Long', slug: 'long-model' }
    const longService = { name: 'A Very Long Service Name For Testing Purposes Only', slug: 'long-service' }
    const meta = generateMeta({ type: 'model_service', brand: longBrand, model: longModel, service: longService })
    expect(meta.meta_description.length).toBeLessThanOrEqual(160)
  })

  it('falls back gracefully for unknown page type', () => {
    const meta = generateMeta({ type: 'model_service', brand, model, service })
    expect(meta.meta_title).toBeTruthy()
    expect(meta.meta_description).toBeTruthy()
  })
})
