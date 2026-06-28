// One-off backfill: create a generated_pages row (page_type='model') for every
// published brand_model so model hub pages (/brands/[brand]/[model]) become
// editable via the admin and appear in the Models tab. Idempotent (upsert on
// slug). Run: node scripts/backfill-model-pages.mjs
import { readFileSync } from 'node:fs'
import { createClient } from '@supabase/supabase-js'

// Load env from .env.local
const env = {}
for (const line of readFileSync(new URL('../.env.local', import.meta.url), 'utf8').split('\n')) {
  const m = line.match(/^([A-Z0-9_]+)\s*=\s*(.*)$/)
  if (m) env[m[1]] = m[2].replace(/^["']|["']$/g, '').trim()
}

const url = env.SUPABASE_URL || env.NEXT_PUBLIC_SUPABASE_URL
const key = env.SUPABASE_SERVICE_ROLE_KEY
if (!url || !key) { console.error('Missing SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY'); process.exit(1) }

const sb = createClient(url, key, { auth: { persistSession: false } })

const clip = (s, n) => (s.length > n ? s.slice(0, n) : s)

const { data: brands, error: be } = await sb.from('brands').select('id, name, slug')
if (be) { console.error('brands:', be.message); process.exit(1) }
const brandById = new Map(brands.map(b => [b.id, b]))

const { data: models, error: me } = await sb
  .from('brand_models').select('id, brand_id, name, slug, status').eq('status', 'published')
if (me) { console.error('models:', me.message); process.exit(1) }

const rows = []
for (const m of models) {
  const b = brandById.get(m.brand_id)
  if (!b) continue
  rows.push({
    page_type: 'model',
    brand_id: b.id,
    model_id: m.id,
    service_id: null,
    location_id: null,
    slug: `${b.slug}/${m.slug}`,
    h1: `${b.name} ${m.name} Service & Repair in UAE`,
    meta_title: clip(`${b.name} ${m.name} Service in UAE | CarWorkshop.ae`, 60),
    meta_description: clip(`Professional ${b.name} ${m.name} service and repair in UAE. All services from AED 149. Free pickup & delivery, 12-month warranty.`, 160),
    status: 'published',
  })
}

console.log(`Upserting ${rows.length} model-hub pages…`)
let ok = 0
for (let i = 0; i < rows.length; i += 100) {
  const batch = rows.slice(i, i + 100)
  const { data, error } = await sb.from('generated_pages').upsert(batch, { onConflict: 'slug' }).select('slug')
  if (error) { console.error(`batch ${i}:`, error.message); continue }
  ok += data?.length ?? 0
}
console.log(`Done. ${ok} model pages upserted.`)
