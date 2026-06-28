// One-off backfill: create generated_pages rows for brand+service
// (/brands/[brand]/[service]) and brand+service+location
// (/brands/[brand]/[service]/[location]) so they become editable from admin.
// page_type is stored as 'brand_service' for both (the DB enum has no
// 'brand_service_location'); the slug + location_id distinguish them.
// Idempotent (upsert on slug), published. Run: node scripts/backfill-brand-service-pages.mjs
import { readFileSync } from 'node:fs'
import { createClient } from '@supabase/supabase-js'

const env = {}
for (const line of readFileSync(new URL('../.env.local', import.meta.url), 'utf8').split('\n')) {
  const m = line.match(/^([A-Z0-9_]+)\s*=\s*(.*)$/)
  if (m) env[m[1]] = m[2].replace(/^["']|["']$/g, '').trim()
}
const url = env.SUPABASE_URL || env.NEXT_PUBLIC_SUPABASE_URL
const key = env.SUPABASE_SERVICE_ROLE_KEY
if (!url || !key) { console.error('Missing SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY'); process.exit(1) }
const sb = createClient(url, key, { auth: { persistSession: false } })

const { data: brands, error: be } = await sb.from('brands').select('id, name, slug').eq('status', 'published')
if (be) { console.error('brands:', be.message); process.exit(1) }

let bs = 0, bsl = 0
const rows = []
for (const b of brands) {
  const [{ data: svcMap }, { data: locMap }] = await Promise.all([
    sb.from('brand_service_map').select('is_active, services(id, name, slug)').eq('brand_id', b.id).eq('is_active', true),
    sb.from('brand_location_map').select('is_active, locations(id, name, slug)').eq('brand_id', b.id).eq('is_active', true),
  ])
  const services = (svcMap ?? []).map(s => s.services).filter(Boolean)
  const locations = (locMap ?? []).map(l => l.locations).filter(Boolean)

  for (const s of services) {
    rows.push({
      page_type: 'brand_service', brand_id: b.id, model_id: null, service_id: s.id, location_id: null,
      slug: `${b.slug}/${s.slug}`,
      h1: `${b.name} ${s.name} in UAE`,
      meta_title: `${b.name} ${s.name} in UAE | CarWorkshop.ae`,
      meta_description: `Expert ${b.name} ${s.name} in UAE. Free pickup & delivery, 12-month warranty.`,
      status: 'published',
    })
    bs++
    for (const l of locations) {
      rows.push({
        page_type: 'brand_service', brand_id: b.id, model_id: null, service_id: s.id, location_id: l.id,
        slug: `${b.slug}/${s.slug}/${l.slug}`,
        h1: `${b.name} ${s.name} in ${l.name}`,
        meta_title: `${b.name} ${s.name} in ${l.name} | CarWorkshop.ae`,
        meta_description: `Professional ${b.name} ${s.name} in ${l.name}. Free pickup, 12-month warranty.`,
        status: 'published',
      })
      bsl++
    }
  }
}

console.log(`Upserting ${rows.length} rows…`)
let ok = 0
for (let i = 0; i < rows.length; i += 100) {
  const batch = rows.slice(i, i + 100)
  const { data, error } = await sb.from('generated_pages').upsert(batch, { onConflict: 'slug' }).select('slug')
  if (error) { console.error(`batch ${i}:`, error.message); continue }
  ok += data?.length ?? 0
}
console.log(`Generated ${bs} brand_service + ${bsl} brand_service_location pages. ${ok} upserted (published).`)
