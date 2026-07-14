'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import toast from 'react-hot-toast'
import { Search, RotateCcw, Plus, ChevronDown, Pencil, Link as LinkIcon } from 'lucide-react'
import { DataTable } from '@/components/admin/DataTable'
import { PillToggle } from '@/components/admin/ui/PillToggle'
import { ApprovalBadge } from '@/components/admin/ui/ApprovalBadge'
import { AssigneePill } from '@/components/admin/ui/AssigneePill'
import { countryName } from '@/lib/geo'
import { APPROVAL_STATUS_LABELS, type ApprovalStatus } from '@/types'

export interface ServiceContentRow extends Record<string, unknown> {
  id: string
  page_type: string
  brand_id: string | null
  slug: string
  h1: string
  status: string
  approval_status: ApprovalStatus
  assignee_id: string | null
  assigned_at: string | null
  created_by: string | null
  country: string
  state: string | null
  updated_at: string
  generated_at: string
  brand_name: string | null
  assignee_name: string | null
  created_by_name: string | null
}

interface Props {
  initialRows: ServiceContentRow[]
  isApprover: boolean
}

const FILTER_INPUT = 'h-9 rounded border border-[#D1D5DB] bg-white px-2.5 text-sm text-[#374151] focus:outline-none focus:ring-2 focus:ring-[#4472C4]'

// Colored page-type pills: Service gray, Brand blue (+make), Location green.
function PageTypeBadge({ row }: { row: ServiceContentRow }) {
  const isLocation = ['location', 'brand_location', 'model_location'].includes(row.page_type)
  const isBrand = !!row.brand_name && !isLocation
  const bg = isLocation ? '#22C55E' : isBrand ? '#4472C4' : '#6B7280'
  const label = isLocation ? 'Location Page' : isBrand ? 'Brand Page' : 'Service Page'
  return (
    <span className="inline-flex flex-col items-center gap-0.5">
      <span className="rounded-full px-2 py-0.5 text-[10px] font-bold text-white whitespace-nowrap" style={{ backgroundColor: bg }}>{label}</span>
      {isBrand && <span className="text-[10px] text-[#374151] border border-[#D1D5DB] rounded px-1.5">{row.brand_name}</span>}
    </span>
  )
}

export function ServiceContentTable({ initialRows, isApprover }: Props) {
  const router = useRouter()
  const [rows, setRows] = useState(initialRows)
  const [selected, setSelected] = useState<string[]>([])
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(30)
  const [approveOpen, setApproveOpen] = useState(false)
  const [busy, setBusy] = useState(false)

  const [fName, setFName] = useState('')
  const [fApproval, setFApproval] = useState('')
  const [applied, setApplied] = useState({ name: '', approval: '' })

  const filtered = useMemo(() => rows.filter(r => {
    if (applied.name && !r.h1.toLowerCase().includes(applied.name.toLowerCase())) return false
    if (applied.approval && r.approval_status !== applied.approval) return false
    return true
  }), [rows, applied])

  const pageCount = Math.max(1, Math.ceil(filtered.length / pageSize))
  const pageRows = filtered.slice((page - 1) * pageSize, page * pageSize)

  async function togglePublish(row: ServiceContentRow) {
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
    const body = action === 'approve' ? { ids: selected } : { ids: selected, action }
    const res = await fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) })
    setBusy(false)
    setApproveOpen(false)
    if (res.ok) {
      const status: ApprovalStatus = action === 'approve' ? 'approved' : action === 'reject' ? 'rejected' : 'resubmission_required'
      setRows(rs => rs.map(r => selected.includes(r.id) ? { ...r, approval_status: status } : r))
      setSelected([])
      toast.success('Updated')
    } else toast.error('Action failed')
  }

  return (
    <div className="space-y-4">
      <div className="bg-[#F3F4F6] border border-[#E5E7EB] rounded-lg p-3 flex flex-wrap items-center gap-2">
        <input value={fName} onChange={e => setFName(e.target.value)} placeholder="Service Title" className={FILTER_INPUT} />
        <select value={fApproval} onChange={e => setFApproval(e.target.value)} className={FILTER_INPUT} aria-label="Approval Status">
          <option value="">Approval Status</option>
          {(Object.keys(APPROVAL_STATUS_LABELS) as ApprovalStatus[]).map(s => <option key={s} value={s}>{APPROVAL_STATUS_LABELS[s]}</option>)}
        </select>
        <button type="button" onClick={() => { setApplied({ name: fName, approval: fApproval }); setPage(1) }} className="h-9 inline-flex items-center gap-1.5 rounded bg-[#22C55E] text-white text-sm font-semibold px-3 hover:bg-[#16A34A]">
          <Search size={15} /> Search
        </button>
        <button type="button" onClick={() => { setFName(''); setFApproval(''); setApplied({ name: '', approval: '' }); setPage(1) }} aria-label="Reset" className="h-9 w-9 inline-flex items-center justify-center rounded bg-[#22C55E] text-white hover:bg-[#16A34A]">
          <RotateCcw size={15} />
        </button>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <select value={pageSize} onChange={e => { setPageSize(Number(e.target.value)); setPage(1) }} className={FILTER_INPUT} aria-label="Rows per page">
          {[10, 30, 50, 100].map(n => <option key={n} value={n}>Display - {n}</option>)}
        </select>
        <button type="button" onClick={() => router.refresh()} className="h-9 rounded bg-[#22C55E] text-white text-sm font-semibold px-4 hover:bg-[#16A34A]">Refresh</button>
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
        <Link href="/admin/seo-pages/new" className="h-9 inline-flex items-center gap-1 rounded bg-[#E8601C] text-white text-sm font-bold px-3 hover:bg-[#D15518]">
          <Plus size={15} /> ADD NEW
        </Link>
      </div>

      <p className="text-xs text-[#6B7280]">{filtered.length} Total Results</p>

      <div className="bg-white border border-[#E5E7EB] rounded-lg overflow-hidden">
        <DataTable<ServiceContentRow>
          columns={[
            { key: 'country', header: 'Country', render: r => <span className="text-xs">{countryName(r.country)}</span> },
            { key: 'state', header: 'State', render: r => <span className="text-xs">{r.state ?? '—'}</span> },
            { key: 'language', header: 'Language', render: () => <span className="text-xs font-semibold">EN</span> },
            { key: 'page_type', header: 'Page Type', render: r => <PageTypeBadge row={r} /> },
            { key: 'h1', header: 'Page Title', render: r => <span className="font-semibold text-[#1F2937] text-xs">{r.h1}</span>, className: 'min-w-[180px]' },
            {
              key: 'slug', header: 'Slug URL', render: r => (
                <span className="inline-flex items-center gap-1 text-xs text-[#4472C4]">
                  {r.slug}
                  <a href={`/brands/${r.slug}`} target="_blank" rel="noreferrer" aria-label="Open page"><LinkIcon size={12} /></a>
                </span>
              ), className: 'min-w-[140px]',
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
                  Date: {new Date(r.generated_at).toISOString().slice(0, 10)}
                </span>
              ),
            },
            { key: 'updated_at', header: 'Last Modified', render: r => <span className="text-[10px] text-[#6B7280]">{new Date(r.updated_at).toISOString().slice(0, 16).replace('T', ' ')}</span> },
            {
              key: 'status', header: 'Publish', render: r => (
                <PillToggle value={r.status === 'published'} onChange={() => void togglePublish(r)} onLabel="YES" offLabel="NO" />
              ),
            },
            {
              key: 'actions', header: 'Action', render: r => (
                <Link href={`/admin/seo-pages/${r.id}`} aria-label="Edit" className="h-7 w-7 inline-flex items-center justify-center rounded border border-[#EF4444] text-[#EF4444] hover:bg-red-50"><Pencil size={13} /></Link>
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
    </div>
  )
}
