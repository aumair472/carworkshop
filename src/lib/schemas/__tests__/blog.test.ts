import { describe, it, expect } from 'vitest'
import { CreateBlogPostSchema, UpdateBlogPostSchema } from '../blog'

describe('CreateBlogPostSchema', () => {
  it('accepts valid post', () => {
    const result = CreateBlogPostSchema.safeParse({
      title: 'How to Change Oil in Dubai',
      slug: 'oil-change-dubai',
      excerpt: 'Step-by-step guide.',
      content: '<p>Content here</p>',
      status: 'published',
    })
    expect(result.success).toBe(true)
  })

  it('requires title', () => {
    const result = CreateBlogPostSchema.safeParse({ slug: 'test' })
    expect(result.success).toBe(false)
    expect(result.error?.flatten().fieldErrors.title).toBeDefined()
  })

  it('rejects title exceeding 300 chars', () => {
    const result = CreateBlogPostSchema.safeParse({ title: 'A'.repeat(301) })
    expect(result.success).toBe(false)
  })

  it('rejects invalid status', () => {
    const result = CreateBlogPostSchema.safeParse({ title: 'Test', status: 'unknown' })
    expect(result.success).toBe(false)
  })

  it('defaults status to draft', () => {
    const result = CreateBlogPostSchema.safeParse({ title: 'Test' })
    expect(result.success).toBe(true)
    if (result.success) expect(result.data.status).toBe('draft')
  })

  it('accepts nullable content', () => {
    const result = CreateBlogPostSchema.safeParse({ title: 'Test', content: null })
    expect(result.success).toBe(true)
  })
})

describe('UpdateBlogPostSchema', () => {
  it('accepts partial update', () => {
    const result = UpdateBlogPostSchema.safeParse({ status: 'published' })
    expect(result.success).toBe(true)
  })

  it('accepts empty object', () => {
    const result = UpdateBlogPostSchema.safeParse({})
    expect(result.success).toBe(true)
  })
})
