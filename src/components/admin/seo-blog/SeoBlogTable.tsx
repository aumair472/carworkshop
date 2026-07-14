'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import toast from 'react-hot-toast'
import { Search, RotateCcw, Plus, Trash2, ChevronDown, Pencil, Copy, Image as ImageIcon } from 'lucide-react'
import { DataTable } from '@/components/admin/DataTable'
import { ConfirmModal } from '@/components/admin/ConfirmModal'
import { ApprovalBadge } from '@/components/admin/ui/ApprovalBadge'
import { AssigneePill } from '@/components/admin/ui/AssigneePill'
import { COUNTRIES, countryFlag } from '@/lib/geo'
import { APPROVAL_STATUS_LABELS, type ApprovalStatus } from '@/types'

export interface SeoBlogRow extends Record<string, unknown> {
  id: string
  title: string
  slug: string
  seo_title: string | null
  seo_description: string | null
  meta_keyword: string | null
  status: string
  approval_status: ApprovalStatus
  assignee_id: string | null
  assigned_at: string | null
  country: string
  state: string | null
  image_png_url: string | null
  image_webp_url: string | null
  is_featured: boolean
  updated_at: string
  assignee_name: string | null
}

interface Props {
  initialRows: SeoBlogRow[]
  isApprover: boolean
}

const FILTER_INPUT = 'h-9 rounded border border-[#D1D5DB] bg-white px-2.5 text-sm text-[#374151] focus:outline-none focus:ring-2 focus:ring-[#4472C4]'

export function SeoBlogTable({ initialRows, isApprover }: Props) {
  const router = useRouter()
  const [rows, setRows] = useState(initialRows)
  const [selected, setSelected] = useState<string[]>([])
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(30)
  const [approveOpen, setApproveOpen] = useState(false)
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [busy, setBusy] = useState(false)

  const [fCountry, setFCountry] = useState('')
  const [fName, setFName] = useState('')
  const [fApproval, setFApproval] = useState('')
  const [applied, setApplied] = useState({ country: '', name: '', approval: '' })

  const filtered = useMemo(() => rows.filter(r => {
    if (applied.country && r.country !== applied.country) return false
    if (applied.name && !r.title.toLowerCase().includes(applied.name.toLowerCase())) return false
    if (applied.approval && r.approval_status !== applied.approval) return false
    return true
  }), [rows, applied])

  const pageCount = Math.max(1, Math.ceil(filtered.length / pageSize))
  const pageRows = filtered.slice((page - 1) * pageSize, page * pageSize)

  async function bulkApproval(action: 'approve' | 'reject' | 'resubmission_required') {
    if (selected.length === 0) { toast.error('Select rows first'); return }
    setBusy(true)
    const results = await Promise.all(selected.map(id =>
      fetch(`/api/admin/seo-blog/${id}/approve`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action }),
      })
    ))
    setBusy(false)
    setApproveOpen(false)
    if (results.every(r => r.ok)) {
      const status: ApprovalStatus = action === 'approve' ? 'approved' : action === 'reject' ? 'rejected' : 'resubmission_required'
      setRows(rs => rs.map(r => selected.includes(r.id) ? { ...r, approval_status: status } : r))
      setSelected([])
      toast.success(`${APPROVAL_STATUS_LABELS[status]} — ${selected.length} post(s)`)
    } else toast.error('Action failed')
  }

  async function deleteSelected() {
    setBusy(true)
    const results = await Promise.all(selected.map(id => fetch(`/api/admin/seo-blog/${id}`, { method: 'DELETE' })))
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
      <div className="bg-[#F3F4F6] border border-[#E5E7EB] rounded-lg p-3 flex flex-wrap items-center gap-2">
        <select value={fCountry} onChange={e => setFCountry(e.target.value)} className={FILTER_INPUT} aria-label="Country">
          <option value="">Select Country</option>
          {COUNTRIES.map(c => <option key={c.code} value={c.code}>{c.name}</option>)}
        </select>
        <input value={fName} onChange={e => setFName(e.target.value)} placeholder="Blog Title" className={FILTER_INPUT} />
        <select value={fApproval} onChange={e => setFApproval(e.target.value)} className={FILTER_INPUT} aria-label="Approval Status">
          <option value="">Approval Status</option>
          {(Object.keys(APPROVAL_STATUS_LABELS) as ApprovalStatus[]).map(s => <option key={s} value={s}>{APPROVAL_STATUS_LABELS[s]}</option>)}
        </select>
        <button type="button" onClick={() => { setApplied({ country: fCountry, name: fName, approval: fApproval }); setPage(1) }} className="h-9 inline-flex items-center gap-1.5 rounded bg-[#22C55E] text-white text-sm font-semibold px-3 hover:bg-[#16A34A]">
          <Search size={15} /> Search
        </button>
        <button type="button" onClick={() => { setFCountry(''); setFName(''); setFApproval(''); setApplied({ country: '', name: '', approval: '' }); setPage(1) }} aria-label="Reset" className="h-9 w-9 inline-flex items-center justify-center rounded bg-[#22C55E] text-white hover:bg-[#16A34A]">
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
        <Link href="/admin/seo-blog/new" className="h-9 inline-flex items-center gap-1 rounded bg-[#E8601C] text-white text-sm font-bold px-3 hover:bg-[#D15518]">
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
        <DataTable<SeoBlogRow>
          columns={[
            { key: 'country', header: 'Country', render: r => <span className="text-lg">{countryFlag(r.country)}</span> },
            { key: 'state', header: 'State', render: r => <span className="text-xs">{r.state ?? '—'}</span> },
            { key: 'title', header: 'Blog Title', render: r => <span className="font-semibold text-[#1F2937] text-xs">{r.title}</span>, className: 'min-w-[180px]' },
            { key: 'slug', header: 'Slug URL', render: r => <span className="text-xs text-[#4472C4]">{r.slug}</span>, className: 'min-w-[140px]' },
            { key: 'seo_title', header: 'Meta Title', render: r => <span className="text-xs">{r.seo_title ?? '—'}</span>, className: 'min-w-[140px]' },
            { key: 'seo_description', header: 'Meta Desc', render: r => <span className="text-xs">{r.seo_description ?? '—'}</span>, className: 'min-w-[160px]' },
            { key: 'meta_keyword', header: 'Meta Keyword', render: r => <span className="text-xs">{r.meta_keyword ?? '—'}</span>, className: 'min-w-[140px]' },
            {
              key: 'png', header: 'PNG IMAGE', render: r => r.image_png_url
                ? <a href={r.image_png_url} target="_blank" rel="noreferrer" className="text-[#EF4444]" aria-label="PNG"><ImageIcon size={18} /></a>
                : <span className="text-[#D1D5DB]"><ImageIcon size={18} /></span>,
            },
            {
              key: 'webp', header: 'WEBP IMAGE', render: r => r.image_webp_url
                ? <a href={r.image_webp_url} target="_blank" rel="noreferrer" className="text-[#EF4444]" aria-label="WEBP"><ImageIcon size={18} /></a>
                : <span className="text-[#D1D5DB]"><ImageIcon size={18} /></span>,
            },
            { key: 'approval_status', header: 'Approval Status', render: r => <ApprovalBadge status={r.approval_status} /> },
            {
              key: 'assignee', header: 'Assignees', render: r => r.assignee_name
                ? <AssigneePill name={r.assignee_name} date={r.assigned_at} />
                : <span className="text-xs text-[#9CA3AF]">—</span>,
            },
            {
              key: 'status', header: 'Publish', render: r => (
                <span className={`text-xs font-semibold ${r.status === 'published' ? 'text-[#22C55E]' : 'text-[#6B7280]'}`}>
                  {r.status === 'published' ? 'Active' : 'Inactive'}
                </span>
              ),
            },
            {
              key: 'actions', header: 'Action', render: r => (
                <span className="inline-flex gap-1">
                  <Link href={`/admin/seo-blog/${r.id}`} aria-label="Edit" className="h-7 w-7 inline-flex items-center justify-center rounded border border-[#EF4444] text-[#EF4444] hover:bg-red-50"><Pencil size={13} /></Link>
                  <button type="button" aria-label="Copy slug" onClick={() => { void navigator.clipboard.writeText(r.slug); toast.success('Slug copied') }} className="h-7 w-7 inline-flex items-center justify-center rounded border border-[#EF4444] text-[#EF4444] hover:bg-red-50"><Copy size={13} /></button>
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

      <ConfirmModal
        open={deleteOpen}
        title="Delete posts"
        message={`Delete ${selected.length} selected post(s)? This cannot be undone.`}
        confirmLabel="Delete"
        variant="danger"
        loading={busy}
        onConfirm={() => void deleteSelected()}
        onCancel={() => setDeleteOpen(false)}
      />
    </div>
  )
}
