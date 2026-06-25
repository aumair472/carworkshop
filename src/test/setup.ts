import '@testing-library/jest-dom'
import { vi } from 'vitest'

vi.mock('@/lib/supabase/server', () => ({
  createServerSupabase: vi.fn(),
}))

vi.mock('@/lib/rate-limit', () => ({
  leadFormLimiter: { limit: vi.fn().mockResolvedValue({ success: true }) },
  adminLoginLimiter: { limit: vi.fn().mockResolvedValue({ success: true }) },
}))
