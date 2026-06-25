import { describe, it, expect } from 'vitest'
import { generateSlug } from '../slugify'

describe('generateSlug', () => {
  it('lowercases input', () => {
    expect(generateSlug('BMW')).toBe('bmw')
  })

  it('replaces spaces with hyphens', () => {
    expect(generateSlug('Oil Change')).toBe('oil-change')
  })

  it('handles Mercedes-Benz', () => {
    expect(generateSlug('Mercedes-Benz')).toBe('mercedes-benz')
  })

  it('handles model numbers with spaces', () => {
    expect(generateSlug('3 Series')).toBe('3-series')
  })

  it('handles alphanumeric model names', () => {
    expect(generateSlug('Q5')).toBe('q5')
    expect(generateSlug('A4')).toBe('a4')
  })

  it('strips leading/trailing whitespace', () => {
    expect(generateSlug('  Dubai Marina  ')).toBe('dubai-marina')
  })

  it('collapses multiple spaces', () => {
    expect(generateSlug('Abu  Dhabi')).toBe('abu-dhabi')
  })

  it('handles Arabic characters by removing them', () => {
    expect(generateSlug('Dubai - دبي')).toBe('dubai')
  })

  it('handles empty string', () => {
    expect(generateSlug('')).toBe('')
  })

  it('handles only special characters', () => {
    expect(generateSlug('!!!')).toBe('')
  })
})
