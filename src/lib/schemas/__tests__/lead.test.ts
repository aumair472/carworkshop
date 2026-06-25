import { describe, it, expect } from 'vitest'
import { CreateLeadSchema } from '../lead'

const validLead = {
  name: 'Ahmed Al-Rashid',
  phone: '+971501234567',
  email: 'ahmed@example.com',
  message: 'I need oil change for my Audi A4',
  honeypot: '',
}

describe('CreateLeadSchema', () => {
  it('accepts valid lead data', () => {
    const result = CreateLeadSchema.safeParse(validLead)
    expect(result.success).toBe(true)
  })

  it('rejects short names', () => {
    const result = CreateLeadSchema.safeParse({ ...validLead, name: 'A' })
    expect(result.success).toBe(false)
  })

  it('rejects invalid phone numbers', () => {
    const result = CreateLeadSchema.safeParse({ ...validLead, phone: '123' })
    expect(result.success).toBe(false)
  })

  it('rejects invalid email', () => {
    const result = CreateLeadSchema.safeParse({ ...validLead, email: 'not-an-email' })
    expect(result.success).toBe(false)
  })

  it('detects honeypot bots', () => {
    const result = CreateLeadSchema.safeParse({ ...validLead, honeypot: 'I am a bot' })
    expect(result.success).toBe(false)
  })

  it('accepts missing optional fields', () => {
    const result = CreateLeadSchema.safeParse({ name: 'Ahmed', phone: '+971501234567', honeypot: '' })
    expect(result.success).toBe(true)
  })

  it('accepts phone without country code', () => {
    const result = CreateLeadSchema.safeParse({ ...validLead, phone: '0501234567' })
    expect(result.success).toBe(true)
  })

  it('rejects name longer than 100 chars', () => {
    const result = CreateLeadSchema.safeParse({ ...validLead, name: 'A'.repeat(101) })
    expect(result.success).toBe(false)
  })
})
