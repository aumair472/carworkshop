import { NextRequest, NextResponse } from 'next/server'
import { revalidatePath } from 'next/cache'
import { createServiceClient } from '@/lib/supabase/service'
import { getActingUser } from '@/lib/auth-guard'
import { logAudit } from '@/lib/audit'
import { SeoJsonSchema } from '@/lib/schemas/seo'
import type { Json } from '@/types/database'
import type { UserRole } from '@/types'

// Roles allowed to edit SEO (includes the restricted seo_editor).
export const SEO_ROLES: UserRole[] = ['super_admin', 'admin', 'editor', 'seo_editor']

type Table = 'brands' | 'services' | 'locations' | 'static_pages' | 'generated_pages' | 'blog_posts'

interface HandleOpts {
  table: Table
  idColumn: 'id' | 'slug'
  idValue: string
  /** Build the public path(s) to revalidate from the row's slug. */
  pathFor: (slug: string) => string | string[]
}

// Shared PUT handler for every /seo route. Auth + role (seo_editor allowed) +
// Zod-validate seo_json + update only that column + ISR revalidate + audit.
export async function handleSeoUpdate(req: NextRequest, opts: HandleOpts) {
  try {
    const acting = await getActingUser()
    if (!acting) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    if (!SEO_ROLES.includes(acting.role)) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

    const body: unknown = await req.json()
    const parsed = SeoJsonSchema.safeParse((body as { seo_json?: unknown })?.seo_json ?? body)
    if (!parsed.success) {
      return NextResponse.json({ error: 'Invalid SEO data', details: parsed.error.flatten().fieldErrors }, { status: 400 })
    }

    const service = createServiceClient()
    const { data, error } = await service
      .from(opts.table)
      .update({ seo_json: parsed.data as unknown as Json, updated_at: new Date().toISOString() })
      .eq(opts.idColumn, opts.idValue)
      .select('slug')
      .single()
    if (error || !data) return NextResponse.json({ error: error?.message ?? 'Not found' }, { status: 404 })

    const slug = (data as { slug?: string }).slug ?? opts.idValue
    const paths = ([] as string[]).concat(opts.pathFor(slug))
    for (const p of paths) { try { revalidatePath(p) } catch { /* best-effort */ } }

    await logAudit({ userId: acting.id, action: 'update', table: opts.table, recordId: opts.idValue })
    return NextResponse.json({ success: true })
  } catch (err) {
    console.error(`PUT seo (${opts.table}):`, err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
