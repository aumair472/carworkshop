'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import toast from 'react-hot-toast'
import {
  Search, RotateCcw, Plus, Trash2, ChevronDown, Pencil, Copy,
  Image as ImageIcon, Link as LinkIcon, Eye,
} from 'lucide-react'
import { DataTable } from '@/components/admin/DataTable'
import { ConfirmModal } from '@/components/admin/ConfirmModal'
import { PillToggle } from '@/components/admin/ui/PillToggle'
import { ApprovalBadge } from '@/components/admin/ui/ApprovalBadge'
import { AssigneePill } from '@/components/admin/ui/AssigneePill'
import { COUNTRIES, STATES_BY_COUNTRY, countryFlag } from '@/lib/geo'
import { APPROVAL_STATUS_LABELS, type ApprovalStatus } from '@/types'

export interface SeoPageRow extends Record<string, unknown> {
  id: string
  page_type: string
  brand_id: string | null
  model_id: string | null
  slug: string
  h1: string
  meta_title: string
  meta_keyword: string | null
  status: string
  approval_status: ApprovalStatus
  assignee_id: string | null
  assigned_at: string | null
  created_by: string | null
  country: string
  state: string | null
  image_png_url: string | null
  image_webp_url: string | null
  updated_at: string
  generated_at: string
  brand_name: string | null
  model_name: string | null
  assignee_name: string | null
  created_by_name: string | null
}

interface UserOption { id: string; full_name: string; role: string }

interface Props {
  initialRows: SeoPageRow[]
  brands: Array<{ id: string; name: string }>
  users: UserOption[]
  isApprover: boolean
}

const FILTER_INPUT = 'h-9 rounded border border-[#D1D5DB] bg-white px-2.5 text-sm text-[#374151] focus:outline-none focus:ring-2 focus:ring-[#4472C4]'

export function SeoPagesTable({ initialRows, brands, users, isApprover }: Props) {
  const router = useRouter()
  const [rows, setRows] = useState(initialRows)
  const [selected, setSelected] = useState<string[]>([])
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(30)
  const [approveOpen, setApproveOpen] = useState(false)
  const [assignOpen, setAssignOpen] = useState(false)
  const [assignUser, setAssignUser] = useState('')
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [busy, setBusy] = useState(false)

  // Filters
  const [fCountry, setFCountry] = useState('')
  const [fState, setFState] = useState('')
  const [fName, setFName] = useState('')
  const [fKeyword, setFKeyword] = useState('')
  const [fBrand, setFBrand] = useState('')
  const [fApproval, setFApproval] = useState('')
  const [fUser, setFUser] = useState('')
  // Applied copies (Search button applies)
  const [applied, setApplied] = useState({ country: '', state: '', name: '', keyword: '', brand: '', approval: '', user: '' })

  const filtered = useMemo(() => rows.filter(r => {
    if (applied.country && r.country !== applied.country) return false
    if (applied.state && r.state !== applied.state) return false
    if (applied.name && !r.h1.toLowerCase().includes(applied.name.toLowerCase())) return false
    if (applied.keyword && !(r.meta_keyword ?? '').toLowerCase().includes(applied.keyword.toLowerCase())) return false
    if (applied.brand && r.brand_id !== applied.brand) return false
    if (applied.approval && r.approval_status !== applied.approval) return false
    if (applied.user && r.assignee_id !== applied.user) return false
    return true
  }), [rows, applied])

  const pageCount = Math.max(1, Math.ceil(filtered.length / pageSize))
  const pageRows = filtered.slice((page - 1) * pageSize, page * pageSize)

  function applyFilters() {
    setApplied({ country: fCountry, state: fState, name: fName, keyword: fKeyword, brand: fBrand, approval: fApproval, user: fUser })
    setPage(1)
  }

  function resetFilters() {
    setFCountry(''); setFState(''); setFName(''); setFKeyword(''); setFBrand(''); setFApproval(''); setFUser('')
    setApplied({ country: '', state: '', name: '', keyword: '', brand: '', approval: '', user: '' })
    setPage(1)
  }

  async function togglePublish(row: SeoPageRow) {
    const next = row.status === 'published' ? 'draft' : 'published'
    const res = await fetch(`/api/admin/seo-pages/${row.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: next }),
    })
    if (res.ok) {
      setRows(rs => rs.map(r => r.id === row.id ? { ...r, status: next } : r))
      toast.success(next === 'published' ? 'Published' : 'Unpublished')
    } else toast.error('Update failed')
  }

  async function bulkApproval(action: 'approve' | 'reject' | 'resubmission_required') {
    if (selected.length === 0) { toast.error('Select rows first'); return }
    setBusy(true)
    const url = action === 'approve' ? '/api/admin/seo-pages/bulk-approve' : '/api/admin/seo-pages/bulk-reject'
    const body = action === 'approve' ? { ids: selected } : { ids: selected, action: action === 'reject' ? 'reject' : 'resubmission_required' }
    const res = await fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) })
    setBusy(false)
    setApproveOpen(false)
    if (res.ok) {
      const status: ApprovalStatus = action === 'approve' ? 'approved' : action === 'reject' ? 'rejected' : 'resubmission_required'
      setRows(rs => rs.map(r => selected.includes(r.id) ? { ...r, approval_status: status } : r))
      setSelected([])
      toast.success(`${APPROVAL_STATUS_LABELS[status]} — ${selected.length} page(s)`)
    } else toast.error('Action failed')
  }

  async function assignSelected(grant: boolean) {
    if (selected.length === 0) { toast.error('Select rows first'); return }
    if (grant && !assignUser) { toast.error('Select a user'); return }
    setBusy(true)
    const results = await Promise.all(selected.map(id =>
      fetch(`/api/admin/seo-pages/${id}/assign`, {
        method: grant ? 'POST' : 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        ...(grant ? { body: JSON.stringify({ user_id: assignUser }) } : {}),
      })
    ))
    setBusy(false)
    setAssignOpen(false)
    if (results.every(r => r.ok)) {
      const name = users.find(u => u.id === assignUser)?.full_name ?? null
      const now = new Date().toISOString()
      setRows(rs => rs.map(r => selected.includes(r.id)
        ? { ...r, assignee_id: grant ? assignUser : null, assignee_name: grant ? name : null, assigned_at: grant ? now : null }
        : r))
      setSelected([])
      toast.success(grant ? 'Access granted' : 'Access revoked')
    } else toast.error('Some assignments failed')
  }

  async function deleteSelected() {
    setBusy(true)
    const results = await Promise.all(selected.map(id => fetch(`/api/admin/seo-pages/${id}`, { method: 'DELETE' })))
    setBusy(false)
    setDeleteOpen(false)
    if (results.every(r => r.ok)) {
      setRows(rs => rs.filter(r => !selected.includes(r.id)))
      setSelected([])
      toast.success('Deleted')
    } else toast.error('Some deletes failed')
  }

  return (
    <div className="space-y-4">
      {/* Filter bar */}
      <div className="bg-[#F3F4F6] border border-[#E5E7EB] rounded-lg p-3 flex flex-wrap items-center gap-2">
        <select value={fCountry} onChange={e => setFCountry(e.target.value)} className={FILTER_INPUT} aria-label="Country">
          <option value="">Select Country</option>
          {COUNTRIES.map(c => <option key={c.code} value={c.code}>{c.name}</option>)}
        </select>
        <select value={fState} onChange={e => setFState(e.target.value)} className={FILTER_INPUT} aria-label="State">
          <option value="">Select State</option>
          {(STATES_BY_COUNTRY[fCountry || 'AE'] ?? []).map(s => <option key={s} value={s}>{s}</option>)}
        </select>
        <input value={fName} onChange={e => setFName(e.target.value)} placeholder="Page Name" className={FILTER_INPUT} />
        <input value={fKeyword} onChange={e => setFKeyword(e.target.value)} placeholder="Key Word" className={FILTER_INPUT} />
        <select value={fBrand} onChange={e => setFBrand(e.target.value)} className={FILTER_INPUT} aria-label="Car Make">
          <option value="">Car Make / Model</option>
          {brands.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
        </select>
        <select value={fApproval} onChange={e => setFApproval(e.target.value)} className={FILTER_INPUT} aria-label="Approval Status">
          <option value="">Approval Status</option>
          {(Object.keys(APPROVAL_STATUS_LABELS) as ApprovalStatus[]).map(s => <option key={s} value={s}>{APPROVAL_STATUS_LABELS[s]}</option>)}
        </select>
        <select value={fUser} onChange={e => setFUser(e.target.value)} className={FILTER_INPUT} aria-label="SEO User">
          <option value="">SEO User</option>
          {users.map(u => <option key={u.id} value={u.id}>{u.full_name}</option>)}
        </select>
        <button type="button" onClick={applyFilters} className="h-9 inline-flex items-center gap-1.5 rounded bg-[#22C55E] text-white text-sm font-semibold px-3 hover:bg-[#16A34A]">
          <Search size={15} /> Search
        </button>
        <button type="button" onClick={resetFilters} aria-label="Reset filters" className="h-9 w-9 inline-flex items-center justify-center rounded bg-[#22C55E] text-white hover:bg-[#16A34A]">
          <RotateCcw size={15} />
        </button>
      </div>

      {/* Action bar */}
      <div className="flex flex-wrap items-center gap-2">
        <select
          value={pageSize}
          onChange={e => { setPageSize(Number(e.target.value)); setPage(1) }}
          className={FILTER_INPUT}
          aria-label="Rows per page"
        >
          {[10, 30, 50, 100].map(n => <option key={n} value={n}>Display - {n}</option>)}
        </select>
        <button type="button" onClick={() => router.refresh()} className="h-9 rounded bg-[#22C55E] text-white text-sm font-semibold px-4 hover:bg-[#16A34A]">
          Refresh
        </button>
        <div className="flex-1" />
        {isApprover && (
          <div className="relative">
            <button type="button" onClick={() => setApproveOpen(o => !o)} className="h-9 inline-flex items-center gap-1 rounded bg-[#4472C4] text-white text-sm font-semibold px-3 hover:bg-[#3560B0]">
              Approve / Reject <ChevronDown size={14} />
            </button>
            {approveOpen && (
              <div className="absolute right-0 top-full mt-1 w-56 bg-white border border-[#E5E7EB] rounded-md shadow-lg py-1 z-40">
                <button type="button" disabled={busy} onClick={() => void bulkApproval('approve')} className="block w-full text-left px-3 py-2 text-sm text-[#22C55E] hover:bg-[#F9FAFB]">Approve Selected</button>
                <button type="button" disabled={busy} onClick={() => void bulkApproval('reject')} className="block w-full text-left px-3 py-2 text-sm text-[#6B7280] hover:bg-[#F9FAFB]">Reject Selected</button>
                <button type="button" disabled={busy} onClick={() => void bulkApproval('resubmission_required')} className="block w-full text-left px-3 py-2 text-sm text-[#EF4444] hover:bg-[#F9FAFB]">Mark as Resubmission Required</button>
              </div>
            )}
          </div>
        )}
        {isApprover && (
          <button type="button" onClick={() => setAssignOpen(true)} className="h-9 rounded bg-[#EAB308] text-white text-sm font-semibold px-3 hover:bg-[#CA8A04]">
            Grant / Revoke User Access
          </button>
        )}
        <Link href="/admin/seo-pages/new" className="h-9 inline-flex items-center gap-1 rounded bg-[#E8601C] text-white text-sm font-bold px-3 hover:bg-[#D15518]">
          <Plus size={15} /> ADD NEW
        </Link>
        {isApprover && (
          <button type="button" onClick={() => selected.length ? setDeleteOpen(true) : toast.error('Select rows first')} className="h-9 inline-flex items-center gap-1 rounded bg-[#EF4444] text-white text-sm font-semibold px-3 hover:bg-[#DC2626]">
            <Trash2 size={14} /> Delete
          </button>
        )}
      </div>

      <p className="text-xs text-[#6B7280]">{filtered.length} Total Results</p>

      <div className="bg-white border border-[#E5E7EB] rounded-lg overflow-hidden">
        <DataTable<SeoPageRow>
          columns={[
            { key: 'country', header: 'Country', render: r => <span className="text-lg" title={r.country}>{countryFlag(r.country)}</span> },
            { key: 'state', header: 'State', render: r => <span className="text-xs">{r.state ?? '—'}</span> },
            { key: 'h1', header: 'Page name', render: r => <span className="font-semibold text-[#1F2937] text-xs">{r.h1}</span>, className: 'min-w-[160px]' },
            {
              key: 'slug', header: 'Slug URL', render: r => (
                <span className="inline-flex items-center gap-1 text-xs text-[#4472C4]">
                  {r.slug}
                  <a href={`/brands/${r.slug}`} target="_blank" rel="noreferrer" aria-label="Open page"><LinkIcon size={12} /></a>
                </span>
              ), className: 'min-w-[140px]',
            },
            { key: 'meta_title', header: 'Meta Title', render: r => <span className="text-xs">{r.meta_title}</span>, className: 'min-w-[160px]' },
            {
              key: 'make', header: 'Car Make / Model', render: r => (
                <span className="text-xs lowercase">{[r.brand_name, r.model_name].filter(Boolean).join(' / ') || '—'}</span>
              ),
            },
            {
              key: 'png', header: 'PNG IMAGE', render: r => r.image_png_url
                ? <a href={r.image_png_url} target="_blank" rel="noreferrer" className="text-[#EF4444]" aria-label="PNG image"><ImageIcon size={18} /></a>
                : <span className="text-[#D1D5DB]"><ImageIcon size={18} /></span>,
            },
            {
              key: 'webp', header: 'WEBP IMAGE', render: r => r.image_webp_url
                ? <a href={r.image_webp_url} target="_blank" rel="noreferrer" className="text-[#EF4444]" aria-label="WEBP image"><ImageIcon size={18} /></a>
                : <span className="text-[#D1D5DB]"><ImageIcon size={18} /></span>,
            },
            { key: 'approval_status', header: 'Approval Status', render: r => <ApprovalBadge status={r.approval_status} /> },
            {
              key: 'assignee', header: 'Assignees', render: r => r.assignee_name
                ? <AssigneePill name={r.assignee_name} date={r.assigned_at} />
                : <span className="text-xs text-[#9CA3AF]">—</span>,
            },
            {
              key: 'created_by', header: 'Created By', render: r => (
                <span className="text-[10px] text-[#6B7280] leading-tight block">
                  <span className="font-semibold text-[#374151]">{r.created_by_name ?? 'System'}</span><br />
                  Date: {new Date(r.generated_at).toISOString().slice(0, 16).replace('T', ' ')}
                </span>
              ),
            },
            {
              key: 'faqs', header: "FAQ's", render: r => (
                <span className="inline-flex gap-1">
                  <Link href={`/admin/seo-pages/${r.id}#faqs`} aria-label="Add FAQ" className="h-6 w-6 inline-flex items-center justify-center rounded bg-[#4472C4] text-white"><Plus size={13} /></Link>
                  <Link href={`/admin/seo-pages/${r.id}#faqs`} aria-label="View FAQs" className="h-6 w-6 inline-flex items-center justify-center rounded bg-[#EF4444] text-white"><Eye size={13} /></Link>
                </span>
              ),
            },
            {
              key: 'status', header: 'Publish', render: r => (
                <PillToggle value={r.status === 'published'} onChange={() => void togglePublish(r)} onLabel="YES" offLabel="NO" />
              ),
            },
            {
              key: 'actions', header: 'Action', render: r => (
                <span className="inline-flex gap-1">
                  <Link href={`/admin/seo-pages/${r.id}`} aria-label="Edit" className="h-7 w-7 inline-flex items-center justify-center rounded border border-[#EF4444] text-[#EF4444] hover:bg-red-50"><Pencil size={13} /></Link>
                  <button
                    type="button"
                    aria-label="Copy slug"
                    onClick={() => { void navigator.clipboard.writeText(r.slug); toast.success('Slug copied') }}
                    className="h-7 w-7 inline-flex items-center justify-center rounded border border-[#EF4444] text-[#EF4444] hover:bg-red-50"
                  >
                    <Copy size={13} />
                  </button>
                </span>
              ),
            },
          ]}
          data={pageRows}
          keyField="id"
          selectedIds={selected}
          onSelectionChange={setSelected}
          page={page}
          pageCount={pageCount}
          onPageChange={setPage}
          totalResults={filtered.length}
        />
      </div>

      {/* Grant/Revoke access modal */}
      {assignOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" role="dialog" aria-modal="true">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md p-5 space-y-4">
            <h3 className="text-base font-bold text-[#1F2937]">Grant / Revoke User Access</h3>
            <p className="text-xs text-[#6B7280]">{selected.length} page(s) selected</p>
            <select value={assignUser} onChange={e => setAssignUser(e.target.value)} className={`${FILTER_INPUT} w-full`} aria-label="Select user">
              <option value="">Select user…</option>
              {users.map(u => <option key={u.id} value={u.id}>{u.full_name} ({u.role})</option>)}
            </select>
            <div className="flex justify-end gap-2">
              <button type="button" disabled={busy} onClick={() => void assignSelected(true)} className="h-9 rounded bg-[#22C55E] text-white text-sm font-semibold px-4 hover:bg-[#16A34A] disabled:opacity-50">Grant</button>
              <button type="button" disabled={busy} onClick={() => void assignSelected(false)} className="h-9 rounded bg-[#EAB308] text-white text-sm font-semibold px-4 hover:bg-[#CA8A04] disabled:opacity-50">Revoke</button>
              <button type="button" onClick={() => setAssignOpen(false)} className="h-9 rounded border border-[#D1D5DB] text-sm px-4 text-[#374151] hover:bg-[#F9FAFB]">Cancel</button>
            </div>
          </div>
        </div>
      )}

      <ConfirmModal
        open={deleteOpen}
        title="Delete pages"
        message={`Delete ${selected.length} selected page(s)? This cannot be undone.`}
        confirmLabel="Delete"
        variant="danger"
        loading={busy}
        onConfirm={() => void deleteSelected()}
        onCancel={() => setDeleteOpen(false)}
      />
    </div>
  )
}
