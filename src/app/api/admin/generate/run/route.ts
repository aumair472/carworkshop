import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabase } from '@/lib/supabase/server'
import { createServiceClient } from '@/lib/supabase/service'
import { z } from 'zod'
import { revalidatePage } from '@/lib/revalidate'
import { generatePages } from '@/lib/page-engine/generate'
import { logAudit } from '@/lib/audit'

const GenerateSchema = z.object({
  brand_id: z.string().uuid(),
  template_id: z.string().min(1).optional(),
  model_ids: z.array(z.string().uuid()).optional(),
  service_ids: z.array(z.string().uuid()).optional(),
  location_ids: z.array(z.string().uuid()).optional(),
  include_location_pages: z.boolean().default(true),
})

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

// generated_pages.template_id is a UUID FK to page_templates. The generate UI
// historically sent the literal "default", which is not a valid UUID and caused
// every insert to fail silently. Resolve to a real template id, creating one if
// none exists yet.
async function resolveTemplateId(candidate: string | undefined): Promise<string> {
  if (candidate && UUID_RE.test(candidate)) return candidate
  const service = createServiceClient()
  const { data: existing } = await service
    .from('page_templates')
    .select('id')
    .order('is_default', { ascending: false })
    .limit(1)
    .maybeSingle()
  if (existing) return existing.id
  const { data: created, error } = await service
    .from('page_templates')
    .insert({ name: 'Standard', page_type: 'model_service', sections_json: [], is_default: true })
    .select('id')
    .single()
  if (error || !created) throw new Error(`Could not resolve a page template: ${error?.message ?? 'unknown'}`)
  return created.id
}

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

    const resolvedTemplateId = await resolveTemplateId(template_id)

    const result = await generatePages({
      brandId: brand_id,
      templateId: resolvedTemplateId,
      modelIds: model_ids,
      serviceIds: service_ids,
      locationIds: location_ids,
      includeLocationPages: include_location_pages,
    })

    // Revalidate the brand hub + listing pages so new pages surface immediately.
    const { data: brandRow } = await createServiceClient().from('brands').select('slug').eq('id', brand_id).maybeSingle()
    if (brandRow?.slug) await revalidatePage('brand', brandRow.slug)
    await revalidatePage('static', 'home')
    await revalidatePage('static', 'brands')
    await logAudit({ userId: user.id, action: 'generate', table: 'generated_pages', recordId: brand_id })

    return NextResponse.json({ generated: result.generated, failed: result.failed })
  } catch (err) {
    console.error('POST /api/admin/generate/run:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
