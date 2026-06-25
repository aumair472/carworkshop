import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabase } from '@/lib/supabase/server'
import { z } from 'zod'
import { countGeneratedPages } from '@/lib/page-engine/generate'

const PreviewSchema = z.object({
  brand_id: z.string().uuid(),
  model_ids: z.array(z.string().uuid()).optional(),
  service_ids: z.array(z.string().uuid()).optional(),
  location_ids: z.array(z.string().uuid()).optional(),
  include_location_pages: z.boolean().default(true),
})

export async function POST(req: NextRequest) {
  try {
    const supabase = await createServerSupabase()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const body: unknown = await req.json()
    const parsed = PreviewSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ error: 'Invalid data', details: parsed.error.flatten().fieldErrors }, { status: 400 })
    }

    const { brand_id, model_ids, service_ids, location_ids, include_location_pages } = parsed.data

    const count = await countGeneratedPages({
      brandId: brand_id,
      modelIds: model_ids,
      serviceIds: service_ids,
      locationIds: location_ids,
      templateId: '',
      includeLocationPages: include_location_pages,
    })

    return NextResponse.json({ count })
  } catch (err) {
    console.error('POST /api/admin/generate/preview:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
