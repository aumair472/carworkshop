'use client'

export const inputCls = 'w-full border border-zinc-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#4472C4]'

interface NamedRow { id: string; name: string }

export function Repeater<T>({ items, max, addLabel, blank, onChange, render }: {
  items: T[]; max: number; addLabel: string; blank: T; onChange: (items: T[]) => void; render: (item: T, update: (p: Partial<T>) => void) => React.ReactNode
}) {
  return (
    <div className="space-y-2">
      {items.map((it, i) => (
        <div key={i} className="flex items-start gap-2">
          <span className="text-zinc-300 pt-2 select-none" aria-hidden="true">≡</span>
          {render(it, p => onChange(items.map((x, j) => j === i ? { ...x, ...p } : x)))}
          <button type="button" onClick={() => onChange(items.filter((_, j) => j !== i))} className="h-9 w-9 shrink-0 rounded-md text-zinc-400 hover:bg-red-50 hover:text-red-500" aria-label="Remove">×</button>
        </div>
      ))}
      {items.length < max && (
        <button type="button" onClick={() => onChange([...items, blank])} className="w-full text-sm text-zinc-500 border border-dashed border-zinc-300 rounded-lg py-2 hover:border-[#4472C4] hover:text-[#4472C4]">{addLabel}</button>
      )}
    </div>
  )
}

export function MultiSelect({ label, options, selected, onChange }: { label: string; options: NamedRow[]; selected: string[]; onChange: (v: string[]) => void }) {
  function toggle(id: string) { onChange(selected.includes(id) ? selected.filter(s => s !== id) : [...selected, id]) }
  return (
    <div>
      <label className="flex items-center text-sm font-medium text-zinc-700 mb-1.5">{label} ({selected.length})</label>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
        {options.map(o => {
          const on = selected.includes(o.id)
          return (
            <button key={o.id} type="button" onClick={() => toggle(o.id)} className={['flex items-center gap-2 text-sm px-3 py-2 rounded-lg border text-left', on ? 'border-[#4472C4] bg-[#EEF3FB] text-[#274E96]' : 'border-zinc-200 text-zinc-600 hover:bg-zinc-50'].join(' ')}>
              <span className={['h-4 w-4 rounded flex items-center justify-center text-[10px] text-white shrink-0', on ? 'bg-[#4472C4]' : 'bg-zinc-300'].join(' ')}>{on ? '✓' : ''}</span>
              {o.name}
            </button>
          )
        })}
        {options.length === 0 && <span className="text-sm text-zinc-400">None available.</span>}
      </div>
    </div>
  )
}
