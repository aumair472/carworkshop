'use client'

import { useState, useEffect, useCallback } from 'react'
import toast from 'react-hot-toast'
import { AdminTopbar } from '@/components/admin/AdminTopbar'
import { AdminButton, AdminLinkButton } from '@/components/admin/ui/AdminButton'
import { EmptyState, ErrorState, SkeletonRows } from '@/components/admin/ui/AdminStates'
import { Inbox, Download, Search, MessageCircle, Phone, Mail, ChevronDown } from 'lucide-react'

type LeadStatus = 'new' | 'contacted' | 'in_progress' | 'converted' | 'closed'
interface Lead {
  id: string; name: string; phone: string; email: string | null; message: string | null
  source_url: string | null; status: LeadStatus; notes: string | null; created_at: string
  services?: { name: string } | null; brands?: { name: string } | null
}

const STATUSES: Array<{ value: LeadStatus; label: string }> = [
  { value: 'new', label: 'New' }, { value: 'contacted', label: 'Contacted' },
  { value: 'in_progress', label: 'In Progress' }, { value: 'converted', label: 'Converted' }, { value: 'closed', label: 'Closed' },
]
const PAGE_SIZE = 20

export default function LeadsPage() {
  const [leads, setLeads] = useState<Lead[]>([])
  const [total, setTotal] = useState(0)
  const [counts, setCounts] = useState<Record<string, number>>({})
  const [page, setPage] = useState(1)
  const [status, setStatus] = useState<'' | LeadStatus>('')
  const [search, setSearch] = useState('')
  const [loaded, setLoaded] = useState(false)
  const [error, setError] = useState(false)
  const [expanded, setExpanded] = useState<string | null>(null)
  const [reload, setReload] = useState(0)

  // Per-status counts for the stat row.
  useEffect(() => {
    void (async () => {
      try {
        const results = await Promise.all([
          fetch('/api/admin/leads?limit=1').then(r => r.json() as Promise<{ total: number }>),
          ...STATUSES.map(s => fetch(`/api/admin/leads?status=${s.value}&limit=1`).then(r => r.json() as Promise<{ total: number }>)),
        ])
        setCounts({ total: results[0].total, ...Object.fromEntries(STATUSES.map((s, i) => [s.value, results[i + 1].total])) })
      } catch { /* ignore */ }
    })()
  }, [reload])

  useEffect(() => {
    let cancelled = false
    void (async () => {
      setLoaded(false); setError(false)
      try {
        const qs = new URLSearchParams({ page: String(page), limit: String(PAGE_SIZE) })
        if (status) qs.set('status', status)
        const res = await fetch(`/api/admin/leads?${qs}`)
        if (cancelled) return
        if (!res.ok) { setError(true); return }
        const d = await res.json() as { leads: Lead[]; total: number }
        if (cancelled) return
        setLeads(d.leads ?? []); setTotal(d.total ?? 0)
      } catch { if (!cancelled) setError(true) } finally { if (!cancelled) setLoaded(true) }
    })()
    return () => { cancelled = true }
  }, [page, status, reload])

  const refresh = useCallback(() => setReload(n => n + 1), [])

  async function changeStatus(id: string, next: LeadStatus) {
    setLeads(ls => ls.map(l => l.id === id ? { ...l, status: next } : l))
    const t = toast.loading('Updating…')
    try {
      const res = await fetch(`/api/admin/leads/${id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ status: next }) })
      if (!res.ok) throw new Error()
      toast.success('Status updated', { id: t }); refresh()
    } catch { toast.error('Update failed', { id: t }) }
  }

  async function saveNotes(id: string, notes: string) {
    const t = toast.loading('Saving notes…')
    try {
      const res = await fetch(`/api/admin/leads/${id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ notes }) })
      if (!res.ok) throw new Error()
      setLeads(ls => ls.map(l => l.id === id ? { ...l, notes } : l))
      toast.success('Notes saved', { id: t })
    } catch { toast.error('Save failed', { id: t }) }
  }

  const visible = search
    ? leads.filter(l => l.name.toLowerCase().includes(search.toLowerCase()) || l.phone.includes(search))
    : leads
  const totalPages = Math.ceil(total / PAGE_SIZE)

  const STAT_CARDS = [
    { label: 'Total', value: counts.total ?? 0, kind: null },
    ...STATUSES.map(s => ({ label: s.label, value: counts[s.value] ?? 0, kind: s.value })),
  ]

  return (
    <div className="flex flex-col flex-1">
      <AdminTopbar title="Leads" actions={<AdminLinkButton href="/api/admin/leads/export" variant="outline"><Download size={15} /> Export CSV</AdminLinkButton>} />

      <div className="p-6 lg:p-8 space-y-5">
        {/* Stats */}
        <div className="grid grid-cols-3 lg:grid-cols-6 gap-3">
          {STAT_CARDS.map(c => (
            <div key={c.label} className="bg-white rounded-xl border border-zinc-200 shadow-sm p-4">
              <p className="text-2xl font-extrabold text-zinc-900">{c.value}</p>
              <p className="text-xs text-zinc-500 mt-0.5">{c.label}</p>
            </div>
          ))}
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex flex-wrap gap-1.5">
            {[{ value: '', label: 'All' }, ...STATUSES].map(f => (
              <button key={f.value} onClick={() => { setStatus(f.value as '' | LeadStatus); setPage(1) }}
                className={['px-3 py-1.5 rounded-lg text-sm font-medium border transition-colors', status === f.value ? 'bg-[#4472C4] text-white border-[#4472C4]' : 'border-zinc-200 text-zinc-600 hover:bg-zinc-50'].join(' ')}>
                {f.label}
              </button>
            ))}
          </div>
          <div className="relative ml-auto">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search name or phone…" className="pl-9 pr-3 py-2 rounded-lg border border-zinc-300 text-sm focus:outline-none focus:ring-2 focus:ring-[#4472C4] w-64" />
          </div>
        </div>

        {/* Table */}
        <div className="bg-white rounded-xl border border-zinc-200 shadow-sm overflow-hidden">
          {!loaded ? <SkeletonRows rows={8} cols={5} />
            : error ? <ErrorState onRetry={refresh} />
            : visible.length === 0 ? (
              <EmptyState icon={<Inbox size={22} />} title="No leads yet" description="Leads appear here when customers submit the contact form." />
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-zinc-50 border-b border-zinc-200 text-left text-xs font-semibold text-zinc-500 uppercase tracking-wider">
                      <th className="px-5 py-3">Name</th><th className="px-5 py-3">Phone</th><th className="px-5 py-3">Email</th>
                      <th className="px-5 py-3">Status</th><th className="px-5 py-3">Date</th><th className="px-5 py-3 w-8"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-100">
                    {visible.map(lead => {
                      const isOpen = expanded === lead.id
                      const wa = lead.phone.replace(/[^0-9]/g, '')
                      return (
                        <FragmentRow key={lead.id}>
                          <tr className="hover:bg-zinc-50 cursor-pointer" onClick={() => setExpanded(isOpen ? null : lead.id)}>
                            <td className="px-5 py-3 font-medium text-zinc-900 whitespace-nowrap">{lead.name}</td>
                            <td className="px-5 py-3 text-zinc-600 whitespace-nowrap">{lead.phone}</td>
                            <td className="px-5 py-3 text-zinc-500">{lead.email ?? '—'}</td>
                            <td className="px-5 py-3" onClick={e => e.stopPropagation()}>
                              <select value={lead.status} onChange={e => void changeStatus(lead.id, e.target.value as LeadStatus)} className="text-xs border border-zinc-200 rounded-md px-2 py-1 bg-white focus:outline-none focus:ring-2 focus:ring-[#4472C4]">
                                {STATUSES.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
                              </select>
                            </td>
                            <td className="px-5 py-3 text-zinc-400 text-xs whitespace-nowrap">{new Date(lead.created_at).toLocaleDateString('en-AE', { day: 'numeric', month: 'short', year: 'numeric' })}</td>
                            <td className="px-5 py-3 text-zinc-400"><ChevronDown size={16} className={isOpen ? 'rotate-180 transition-transform' : 'transition-transform'} /></td>
                          </tr>
                          {isOpen && (
                            <tr className="bg-zinc-50/60">
                              <td colSpan={6} className="px-5 py-4">
                                <LeadDetail lead={lead} wa={wa} onSaveNotes={saveNotes} />
                              </td>
                            </tr>
                          )}
                        </FragmentRow>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            )}
        </div>

        {totalPages > 1 && (
          <div className="flex justify-center gap-2">
            {Array.from({ length: totalPages }, (_, i) => i + 1).slice(0, 20).map(p => (
              <button key={p} onClick={() => setPage(p)} className={['px-3 py-1.5 rounded text-sm border', p === page ? 'bg-[#4472C4] text-white border-[#4472C4]' : 'border-zinc-200 text-zinc-600 hover:bg-zinc-50'].join(' ')}>{p}</button>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

function FragmentRow({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}

function LeadDetail({ lead, wa, onSaveNotes }: { lead: Lead; wa: string; onSaveNotes: (id: string, notes: string) => void }) {
  const [notes, setNotes] = useState(lead.notes ?? '')
  return (
    <div className="space-y-3">
      <div className="grid sm:grid-cols-2 gap-3 text-sm">
        <p><span className="text-zinc-500">Service:</span> <span className="text-zinc-800">{lead.services?.name || '—'}</span></p>
        <p><span className="text-zinc-500">Brand:</span> <span className="text-zinc-800">{lead.brands?.name || '—'}</span></p>
        <p><span className="text-zinc-500">Message:</span> <span className="text-zinc-800">{lead.message || '—'}</span></p>
        <p><span className="text-zinc-500">Source:</span> <span className="font-mono text-xs text-zinc-700">{lead.source_url || '—'}</span></p>
      </div>
      <div>
        <label className="text-xs font-medium text-zinc-600">Internal notes</label>
        <textarea value={notes} onChange={e => setNotes(e.target.value)} rows={2} placeholder="Add internal notes…" className="mt-1 w-full border border-zinc-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#4472C4]" />
      </div>
      <div className="flex flex-wrap gap-2">
        <AdminButton variant="outline" onClick={() => onSaveNotes(lead.id, notes)}>Save Notes</AdminButton>
        <a href={`https://wa.me/${wa}`} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium border border-[#25D366] text-[#128C7E] hover:bg-green-50"><MessageCircle size={15} /> WhatsApp</a>
        <a href={`tel:${lead.phone}`} className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium border border-zinc-300 text-zinc-700 hover:bg-zinc-50"><Phone size={15} /> Call</a>
        {lead.email && <a href={`mailto:${lead.email}`} className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium border border-zinc-300 text-zinc-700 hover:bg-zinc-50"><Mail size={15} /> Email</a>}
      </div>
    </div>
  )
}
