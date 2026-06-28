import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/service'
import { leadFormLimiter } from '@/lib/rate-limit'
import { sanitizeHTML } from '@/lib/sanitize'
import { sendLeadNotification, sendLeadConfirmation } from '@/lib/email'
import { CreateLeadSchema } from '@/lib/schemas/lead'
import type { InsertFormSubmission } from '@/types'

function checkOrigin(req: NextRequest): boolean {
  const origin = req.headers.get('origin')
  if (!origin) return false
  // Trust the configured site origin (so it works on any production domain /
  // Vercel deployment) plus the canonical domain and localhost in dev.
  const siteOrigin = (() => {
    try { return process.env.NEXT_PUBLIC_SITE_URL ? new URL(process.env.NEXT_PUBLIC_SITE_URL).origin : null }
    catch { return null }
  })()
  const allowed = new Set([
    'https://carworkshop.ae',
    'https://www.carworkshop.ae',
    ...(siteOrigin ? [siteOrigin] : []),
    ...(process.env.NODE_ENV === 'development' ? ['http://localhost:3000'] : []),
  ])
  return allowed.has(origin)
}

export async function POST(req: NextRequest) {
  try {
    if (!checkOrigin(req)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ?? '127.0.0.1'

    if (leadFormLimiter) {
      const { success, limit, remaining, reset } = await leadFormLimiter.limit(ip)
      if (!success) {
        return NextResponse.json(
          { error: 'Too many requests. Please try again later.' },
          {
            status: 429,
            headers: {
              'X-RateLimit-Limit': limit.toString(),
              'X-RateLimit-Remaining': remaining.toString(),
              'X-RateLimit-Reset': reset.toString(),
            },
          }
        )
      }
    }

    const body: unknown = await req.json()
    const parsed = CreateLeadSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid form data', details: parsed.error.flatten().fieldErrors },
        { status: 400 }
      )
    }

    if (parsed.data.honeypot) {
      return NextResponse.json({ success: true }, { status: 201 })
    }

    const { name, phone, email, service_id, brand_id, model_id, location_id, message, source_page_slug } = parsed.data

    const sanitizedMessage = message ? sanitizeHTML(message) : null

    const supabase = createServiceClient()

    const submission: InsertFormSubmission = {
      name,
      phone,
      email: email ?? null,
      service_id: service_id ?? null,
      brand_id: brand_id ?? null,
      model_id: model_id ?? null,
      location_id: location_id ?? null,
      message: sanitizedMessage,
      source_url: req.headers.get('referer') ?? '/',
      source_page_slug: source_page_slug ?? null,
      ip_address: ip,
      user_agent: req.headers.get('user-agent') ?? null,
      status: 'new',
    }

    const { error } = await supabase.from('form_submissions').insert(submission)

    if (error) {
      console.error('Lead insert error:', error)
      return NextResponse.json({ error: 'Failed to submit. Please try again.' }, { status: 500 })
    }

    void sendLeadNotification({ name, phone, email, message: sanitizedMessage, sourcePageSlug: source_page_slug })
    if (email) void sendLeadConfirmation(email, name)

    return NextResponse.json({ success: true }, { status: 201 })
  } catch (err) {
    console.error('Lead route error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
