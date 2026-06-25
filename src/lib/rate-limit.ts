import { Ratelimit } from '@upstash/ratelimit'
import { Redis } from '@upstash/redis'

function makeLimiter(prefix: string, limiter: Ratelimit['limiter']): Ratelimit | null {
  const url = process.env.UPSTASH_REDIS_REST_URL
  const token = process.env.UPSTASH_REDIS_REST_TOKEN
  if (!url || !token) return null
  return new Ratelimit({ redis: new Redis({ url, token }), limiter, analytics: true, prefix })
}

export const leadFormLimiter = makeLimiter('rl:lead', Ratelimit.slidingWindow(5, '1 h'))
export const adminLoginLimiter = makeLimiter('rl:admin-login', Ratelimit.slidingWindow(10, '15 m'))
