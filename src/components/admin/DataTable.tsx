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
}

export function DataTable<T extends Record<string, unknown>>({
  columns,
  data,
  keyField,
  emptyMessage = 'No records found.',
  loading = false,
  selectedIds,
  onSelectionChange,
}: DataTableProps<T>) {
  const hasSelection = !!onSelectionChange

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
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-[#E5E7EB] bg-[#F9FAFB]">
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
              <th key={String(col.key)} className={`px-4 py-3 text-left font-semibold text-[#374151] ${col.className ?? ''}`}>
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
              <tr key={id} className={`border-b border-[#F3F4F6] hover:bg-[#F9FAFB] ${isSelected ? 'bg-[#EEF3FB]' : ''}`}>
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
  )
}
