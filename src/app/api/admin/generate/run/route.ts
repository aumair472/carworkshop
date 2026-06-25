import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabase } from '@/lib/supabase/server'
import { z } from 'zod'
import { revalidatePath } from 'next/cache'
import { generatePages } from '@/lib/page-engine/generate'
import { logAudit } from '@/lib/audit'

const GenerateSchema = z.object({
  brand_id: z.string().uuid(),
  template_id: z.string().min(1),
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
    const parsed = GenerateSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ error: 'Invalid data', details: parsed.error.flatten().fieldErrors }, { status: 400 })
    }

    const { brand_id, template_id, model_ids, service_ids, location_ids, include_location_pages } = parsed.data

    const result = await generatePages({
      brandId: brand_id,
      templateId: template_id,
      modelIds: model_ids,
      serviceIds: service_ids,
      locationIds: location_ids,
      includeLocationPages: include_location_pages,
    })

    revalidatePath('/brands', 'page')
    await logAudit({ userId: user.id, action: 'generate', table: 'generated_pages', recordId: brand_id })

    return NextResponse.json({ generated: result.generated, failed: result.failed })
  } catch (err) {
    console.error('POST /api/admin/generate/run:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
