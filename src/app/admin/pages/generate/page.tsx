'use client'

import { useState, useEffect, useCallback } from 'react'
import toast from 'react-hot-toast'
import { AdminTopbar } from '@/components/admin/AdminTopbar'
import { AdminCard } from '@/components/admin/ui/AdminCard'
import { AdminButton, AdminLinkButton } from '@/components/admin/ui/AdminButton'
import { AdminSelect } from '@/components/admin/ui/AdminField'
import { Check } from 'lucide-react'

interface Named { id: string; name: string }

const STEPS = ['Brand', 'Types', 'Models', 'Services', 'Locations', 'Generate']

export default function GenerateWizard() {
  const [step, setStep] = useState(0)
  const [brands, setBrands] = useState<Named[]>([])
  const [brandId, setBrandId] = useState('')

  const [models, setModels] = useState<Named[]>([])
  const [services, setServices] = useState<Named[]>([])
  const [locations, setLocations] = useState<Named[]>([])
  const [modelSel, setModelSel] = useState<Set<string>>(new Set())
  const [serviceSel, setServiceSel] = useState<Set<string>>(new Set())
  const [locationSel, setLocationSel] = useState<Set<string>>(new Set())
  const [loadingData, setLoadingData] = useState(false)

  // Page types — only the model-based ones drive generation; brand-only pages are
  // served dynamically and need no stored rows.
  const [types, setTypes] = useState({ brand_service: true, brand_service_location: true, model_service: true, model_service_location: true })

  const [phase, setPhase] = useState<'idle' | 'running' | 'done' | 'error'>('idle')
  const [result, setResult] = useState<{ generated: number; failed: number } | null>(null)
  const [errMsg, setErrMsg] = useState('')

  useEffect(() => {
    void (async () => {
      const res = await fetch('/api/admin/brands')
      if (res.ok) { const d = await res.json() as { brands: Named[] }; setBrands(d.brands ?? []) }
    })()
  }, [])

  // Load brand's models/services/locations and pre-select assigned ones.
  const loadBrandData = useCallback(async (id: string) => {
    setLoadingData(true)
    try {
      const [m, allSvc, svcAssign, allLoc, locAssign] = await Promise.all([
        fetch(`/api/admin/brands/${id}/models`).then(r => r.json() as Promise<{ models: Named[] }>),
        fetch('/api/admin/services').then(r => r.json() as Promise<{ services: Named[] }>),
        fetch(`/api/admin/brands/${id}/services`).then(r => r.json() as Promise<{ service_ids: string[] }>),
        fetch('/api/admin/locations').then(r => r.json() as Promise<{ locations: Named[] }>),
        fetch(`/api/admin/brands/${id}/locations`).then(r => r.json() as Promise<{ location_ids: string[] }>),
      ])
      setModels(m.models ?? [])
      const assignedSvc = new Set(svcAssign.service_ids ?? [])
      setServices((allSvc.services ?? []).filter(s => assignedSvc.has(s.id)))
      setLocations((allLoc.locations ?? []).filter(l => (locAssign.location_ids ?? []).includes(l.id)))
      setModelSel(new Set((m.models ?? []).map(x => x.id)))
      setServiceSel(new Set(assignedSvc))
      setLocationSel(new Set(locAssign.location_ids ?? []))
    } catch { toast.error('Failed to load brand data') } finally { setLoadingData(false) }
  }, [])

  function chooseBrand(id: string) {
    setBrandId(id); setResult(null); setPhase('idle')
    if (id) void loadBrandData(id)
  }

  const nModels = modelSel.size, nServices = serviceSel.size, nLocations = locationSel.size
  const counts = {
    brand_service: types.brand_service ? nServices : 0,
    brand_service_location: types.brand_service_location ? nServices * nLocations : 0,
    model_service: types.model_service ? nModels * nServices : 0,
    model_service_location: types.model_service_location ? nModels * nServices * nLocations : 0,
  }
  const total = counts.brand_service + counts.brand_service_location + counts.model_service + counts.model_service_location

  async function generate() {
    setPhase('running'); setErrMsg(''); setResult(null)
    try {
      const res = await fetch('/api/admin/generate/run', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          brand_id: brandId,
          model_ids: Array.from(modelSel),
          service_ids: Array.from(serviceSel),
          location_ids: Array.from(locationSel),
          include_location_pages: types.model_service_location,
        }),
      })
      const d = await res.json() as { generated?: number; failed?: number; error?: string }
      if (!res.ok) { setErrMsg(d.error ?? 'Generation failed'); setPhase('error'); return }
      setResult({ generated: d.generated ?? 0, failed: d.failed ?? 0 }); setPhase('done')
    } catch { setErrMsg('Network error'); setPhase('error') }
  }

  const canNext = step === 0 ? !!brandId : true

  return (
    <div className="flex flex-col flex-1">
      <AdminTopbar title="⚡ Generate Pages" actions={<AdminLinkButton href="/admin/pages" variant="outline">All Pages →</AdminLinkButton>} />

      <div className="p-6 lg:p-8 max-w-3xl">
        {/* Step indicator */}
        <ol className="flex items-center justify-between mb-8">
          {STEPS.map((s, i) => (
            <li key={s} className="flex items-center gap-2 flex-1 last:flex-none">
              <span className={['h-8 w-8 rounded-full flex items-center justify-center text-sm font-semibold shrink-0', i < step ? 'bg-green-500 text-white' : i === step ? 'bg-[#4472C4] text-white' : 'bg-zinc-200 text-zinc-500'].join(' ')}>
                {i < step ? <Check size={16} /> : i + 1}
              </span>
              <span className={['text-xs font-medium hidden sm:inline', i === step ? 'text-[#4472C4]' : 'text-zinc-500'].join(' ')}>{s}</span>
              {i < STEPS.length - 1 && <span className={['h-px flex-1 mx-1', i < step ? 'bg-green-400' : 'bg-zinc-200'].join(' ')} />}
            </li>
          ))}
        </ol>

        <AdminCard title={`Step ${step + 1} — ${STEPS[step]}`}>
          {step === 0 && (
            <AdminSelect label="Select Brand" value={brandId} onChange={e => chooseBrand(e.target.value)}
              options={[{ value: '', label: 'Choose a brand…' }, ...brands.map(b => ({ value: b.id, label: b.name }))]} />
          )}

          {step === 1 && (
            <div className="space-y-2">
              <TypeRow label="Brand + Service" sample="/brands/audi/oil-change" checked={types.brand_service} onChange={v => setTypes(t => ({ ...t, brand_service: v }))} note="served dynamically" />
              <TypeRow label="Brand + Service + Location" sample="/brands/audi/oil-change/dubai" checked={types.brand_service_location} onChange={v => setTypes(t => ({ ...t, brand_service_location: v }))} note="served dynamically" />
              <TypeRow label="Brand + Model + Service" sample="/brands/audi/a4/oil-change" checked={types.model_service} onChange={v => setTypes(t => ({ ...t, model_service: v }))} />
              <TypeRow label="Brand + Model + Service + Location" sample="/brands/audi/a4/oil-change/dubai" checked={types.model_service_location} onChange={v => setTypes(t => ({ ...t, model_service_location: v }))} />
              <p className="text-xs text-zinc-400 pt-2">Only Model-based pages create stored rows. Brand-only pages are rendered on demand.</p>
            </div>
          )}

          {step === 2 && <PickList loading={loadingData} items={models} sel={modelSel} setSel={setModelSel} empty="No models for this brand." />}
          {step === 3 && <PickList loading={loadingData} items={services} sel={serviceSel} setSel={setServiceSel} empty="No services assigned to this brand." />}
          {step === 4 && <PickList loading={loadingData} items={locations} sel={locationSel} setSel={setLocationSel} empty="No locations assigned to this brand." />}

          {step === 5 && (
            <div className="space-y-4">
              {phase === 'idle' && (
                <div className="border border-zinc-200 rounded-lg p-4 bg-zinc-50 text-sm">
                  <p className="font-semibold text-zinc-900 mb-2">Ready to Generate</p>
                  <Row label="Brand + Service" value={counts.brand_service} muted />
                  <Row label="Brand + Service + Location" value={counts.brand_service_location} muted />
                  <Row label="Brand + Model + Service" value={counts.model_service} />
                  <Row label="Brand + Model + Service + Location" value={counts.model_service_location} />
                  <div className="border-t border-zinc-200 mt-2 pt-2 flex justify-between font-bold text-zinc-900"><span>Stored pages to generate</span><span>{(counts.model_service + counts.model_service_location).toLocaleString('en-AE')}</span></div>
                </div>
              )}
              {phase === 'running' && (
                <div>
                  <p className="text-sm text-zinc-600 mb-2">Generating pages… this can take a moment for large brands.</p>
                  <div className="h-2 w-full bg-zinc-100 rounded-full overflow-hidden"><div className="h-full w-1/2 bg-[#4472C4] animate-pulse rounded-full" /></div>
                </div>
              )}
              {phase === 'done' && result && (
                <div className="text-center py-4">
                  <p className="text-3xl mb-2">✅</p>
                  <p className="font-bold text-zinc-900">{result.generated.toLocaleString('en-AE')} pages generated!</p>
                  {result.failed > 0 && <p className="text-sm text-amber-600">{result.failed} failed.</p>}
                  <div className="flex justify-center gap-2 mt-4">
                    <AdminLinkButton href="/admin/pages?status=draft" variant="orange">View in All Pages →</AdminLinkButton>
                    <AdminButton variant="outline" onClick={() => { setPhase('idle'); setStep(0); setBrandId('') }}>Generate More</AdminButton>
                  </div>
                </div>
              )}
              {phase === 'error' && (
                <div className="text-center py-4">
                  <p className="text-3xl mb-2">❌</p>
                  <p className="font-bold text-zinc-900">Generation failed</p>
                  <p className="text-sm text-zinc-500">{errMsg}</p>
                  <div className="mt-4"><AdminButton variant="outline" onClick={() => void generate()}>Retry</AdminButton></div>
                </div>
              )}
            </div>
          )}

          {/* Nav */}
          {phase === 'idle' && (
            <div className="flex justify-between pt-5 mt-5 border-t border-zinc-100">
              <AdminButton variant="ghost" onClick={() => setStep(s => Math.max(0, s - 1))} disabled={step === 0}>← Back</AdminButton>
              {step < 5
                ? <AdminButton variant="primary" onClick={() => setStep(s => s + 1)} disabled={!canNext}>Continue →</AdminButton>
                : <AdminButton variant="orange" onClick={() => void generate()} disabled={total === 0}>⚡ Generate All Pages</AdminButton>}
            </div>
          )}
        </AdminCard>
      </div>
    </div>
  )
}

function TypeRow({ label, sample, checked, onChange, note }: { label: string; sample: string; checked: boolean; onChange: (v: boolean) => void; note?: string }) {
  return (
    <label className="flex items-center gap-3 p-3 rounded-lg border border-zinc-200 hover:bg-zinc-50 cursor-pointer">
      <input type="checkbox" checked={checked} onChange={e => onChange(e.target.checked)} className="h-4 w-4 rounded border-zinc-300 text-[#4472C4]" />
      <span className="flex-1">
        <span className="text-sm font-medium text-zinc-900">{label}{note && <span className="ml-2 text-[10px] uppercase tracking-wide text-zinc-400">{note}</span>}</span>
        <span className="block text-xs text-zinc-400 font-mono">{sample}</span>
      </span>
    </label>
  )
}

function PickList({ loading, items, sel, setSel, empty }: { loading: boolean; items: Named[]; sel: Set<string>; setSel: (s: Set<string>) => void; empty: string }) {
  if (loading) return <p className="text-sm text-zinc-400">Loading…</p>
  if (items.length === 0) return <p className="text-sm text-zinc-400">{empty}</p>
  const allOn = sel.size === items.length
  return (
    <div>
      <label className="flex items-center gap-2 text-sm font-medium text-zinc-700 mb-3">
        <input type="checkbox" checked={allOn} onChange={() => setSel(allOn ? new Set() : new Set(items.map(i => i.id)))} className="h-4 w-4 rounded border-zinc-300 text-[#4472C4]" />
        Select All ({sel.size}/{items.length})
      </label>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
        {items.map(i => {
          const on = sel.has(i.id)
          return (
            <button key={i.id} type="button" onClick={() => { const n = new Set(sel); if (n.has(i.id)) n.delete(i.id); else n.add(i.id); setSel(n) }}
              className={['flex items-center gap-2 text-sm px-3 py-2 rounded-lg border text-left', on ? 'border-[#4472C4] bg-[#EEF3FB] text-[#274E96]' : 'border-zinc-200 text-zinc-600 hover:bg-zinc-50'].join(' ')}>
              <span className={['h-4 w-4 rounded flex items-center justify-center text-[10px] text-white shrink-0', on ? 'bg-[#4472C4]' : 'bg-zinc-300'].join(' ')}>{on ? '✓' : ''}</span>
              {i.name}
            </button>
          )
        })}
      </div>
    </div>
  )
}

function Row({ label, value, muted }: { label: string; value: number; muted?: boolean }) {
  return <div className={['flex justify-between py-0.5', muted ? 'text-zinc-400' : 'text-zinc-700'].join(' ')}><span>{label}{muted && ' (auto)'}</span><span>{value.toLocaleString('en-AE')}</span></div>
}
