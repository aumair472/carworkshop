'use client'

interface Column<T> {
  key: keyof T | string
  header: string
  render?: (row: T) => React.ReactNode
  className?: string
}

interface DataTableProps<T extends Record<string, unknown>> {
  columns: Column<T>[]
  data: T[]
  keyField: keyof T
  emptyMessage?: string
  loading?: boolean
  selectedIds?: string[]
  onSelectionChange?: (ids: string[]) => void
  /** Optional numbered pagination with NEXT button (ServiceMyCar style). */
  page?: number
  pageCount?: number
  onPageChange?: (page: number) => void
  totalResults?: number
}

export function DataTable<T extends Record<string, unknown>>({
  columns,
  data,
  keyField,
  emptyMessage = 'No records found.',
  loading = false,
  selectedIds,
  onSelectionChange,
  page,
  pageCount,
  onPageChange,
  totalResults,
}: DataTableProps<T>) {
  const hasSelection = !!onSelectionChange
  const hasPagination = !!onPageChange && !!page && !!pageCount && pageCount > 1

  function toggleAll() {
    if (!onSelectionChange) return
    const allIds = data.map(row => String(row[keyField]))
    const allSelected = allIds.every(id => selectedIds?.includes(id))
    onSelectionChange(allSelected ? [] : allIds)
  }

  function toggleRow(id: string) {
    if (!onSelectionChange || !selectedIds) return
    const next = selectedIds.includes(id) ? selectedIds.filter(x => x !== id) : [...selectedIds, id]
    onSelectionChange(next)
  }

  if (loading) {
    return (
      <div className="text-center py-12 text-[#9CA3AF] text-sm">Loading...</div>
    )
  }

  if (data.length === 0) {
    return (
      <div className="text-center py-12 text-[#9CA3AF] text-sm">{emptyMessage}</div>
    )
  }

  return (
    <div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr style={{ backgroundColor: '#1F2937' }}>
              {hasSelection && (
                <th className="w-10 px-4 py-3 text-left">
                  <input
                    type="checkbox"
                    className="rounded border-[#D1D5DB]"
                    checked={data.length > 0 && data.every(row => selectedIds?.includes(String(row[keyField])))}
                    onChange={toggleAll}
                    aria-label="Select all"
                  />
                </th>
              )}
              {columns.map(col => (
                <th key={String(col.key)} className={`px-4 py-3 text-left font-semibold text-white ${col.className ?? ''}`}>
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.map(row => {
              const id = String(row[keyField])
              const isSelected = selectedIds?.includes(id) ?? false
              return (
                <tr key={id} className={`border-b border-[#E5E7EB] bg-white hover:bg-[#F9FAFB] ${isSelected ? 'bg-[#EEF3FB]' : ''}`}>
                  {hasSelection && (
                    <td className="px-4 py-3">
                      <input
                        type="checkbox"
                        className="rounded border-[#D1D5DB]"
                        checked={isSelected}
                        onChange={() => toggleRow(id)}
                        aria-label={`Select row ${id}`}
                      />
                    </td>
                  )}
                  {columns.map(col => (
                    <td key={String(col.key)} className={`px-4 py-3 text-[#374151] ${col.className ?? ''}`}>
                      {col.render ? col.render(row) : String(row[col.key as keyof T] ?? '')}
                    </td>
                  ))}
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
      {hasPagination && (
        <div className="flex items-center justify-end gap-2 px-4 py-3 border-t border-[#E5E7EB]">
          {typeof totalResults === 'number' && (
            <span className="text-xs text-[#6B7280] mr-2">
              Page {page} of {pageCount} — {totalResults} Total Results
            </span>
          )}
          {Array.from({ length: pageCount }, (_, i) => i + 1)
            .filter(p => p === 1 || p === pageCount || Math.abs(p - page) <= 2)
            .map((p, idx, arr) => (
              <span key={p} className="flex items-center gap-2">
                {idx > 0 && arr[idx - 1] !== p - 1 && <span className="text-[#9CA3AF]">…</span>}
                <button
                  type="button"
                  onClick={() => onPageChange(p)}
                  className={[
                    'min-w-[30px] h-[30px] px-2 text-xs font-semibold rounded',
                    p === page ? 'bg-[#1F2937] text-white' : 'bg-white border border-[#E5E7EB] text-[#374151] hover:bg-[#F9FAFB]',
                  ].join(' ')}
                >
                  {p}
                </button>
              </span>
            ))}
          <button
            type="button"
            disabled={page >= pageCount}
            onClick={() => onPageChange(page + 1)}
            className="h-[30px] px-3 text-xs font-bold rounded bg-[#1F2937] text-white disabled:opacity-40"
          >
            NEXT ▸
          </button>
        </div>
      )}
    </div>
  )
}
