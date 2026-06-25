import { describe, it, expect, vi, beforeEach } from 'vitest'
import { countGeneratedPages } from '../generate'

vi.mock('@/lib/supabase/service', () => ({
  createServiceClient: vi.fn(() => ({
    from: vi.fn(() => ({
      select: vi.fn(() => ({
        eq: vi.fn(() => ({
          single: vi.fn().mockResolvedValue({
            data: {
              brand_models: [
                { id: 'm1', status: 'published' },
                { id: 'm2', status: 'draft' },
              ],
              brand_service_map: [
                { service_id: 's1', is_active: true },
                { service_id: 's2', is_active: false },
              ],
              brand_location_map: [
                { location_id: 'l1', is_active: true },
                { location_id: 'l2', is_active: true },
              ],
            },
            error: null,
          }),
        })),
      })),
    })),
  })),
}))

describe('countGeneratedPages', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('counts base pages = published models × active services', async () => {
    const count = await countGeneratedPages({
      brandId: 'b1',
      templateId: 't1',
      includeLocationPages: false,
    })
    expect(count).toBe(1)
  })

  it('counts with location pages = base × active locations', async () => {
    const count = await countGeneratedPages({
      brandId: 'b1',
      templateId: 't1',
      includeLocationPages: true,
    })
    expect(count).toBe(3)
  })

  it('filters to specified model IDs', async () => {
    const count = await countGeneratedPages({
      brandId: 'b1',
      modelIds: ['m3'],
      templateId: 't1',
      includeLocationPages: false,
    })
    expect(count).toBe(0)
  })

  it('returns 0 when data is null', async () => {
    const { createServiceClient } = await import('@/lib/supabase/service')
    vi.mocked(createServiceClient).mockReturnValueOnce({
      from: vi.fn(() => ({
        select: vi.fn(() => ({
          eq: vi.fn(() => ({
            single: vi.fn().mockResolvedValue({ data: null, error: null }),
          })),
        })),
      })),
    } as unknown as ReturnType<typeof createServiceClient>)

    const count = await countGeneratedPages({ brandId: 'b1', templateId: 't1', includeLocationPages: false })
    expect(count).toBe(0)
  })
})
