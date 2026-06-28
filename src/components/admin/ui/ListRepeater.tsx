'use client'

interface ListRepeaterProps {
  items: string[]
  onChange: (items: string[]) => void
  placeholder?: string
  addLabel?: string
}

export function ListRepeater({ items, onChange, placeholder = 'Item', addLabel = '+ Add item' }: ListRepeaterProps) {
  return (
    <div>
      <div className="space-y-2">
        {items.map((it, i) => (
          <div key={i} className="flex gap-2 items-center">
            <span className="text-zinc-300 cursor-default select-none" aria-hidden="true">≡</span>
            <input
              value={it}
              onChange={e => { const n = [...items]; n[i] = e.target.value; onChange(n) }}
              placeholder={placeholder}
              className="flex-1 border border-zinc-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#4472C4]"
            />
            <button type="button" onClick={() => onChange(items.filter((_, j) => j !== i))} className="h-8 w-8 shrink-0 rounded-md text-zinc-400 hover:bg-red-50 hover:text-red-500" aria-label="Remove item">×</button>
          </div>
        ))}
      </div>
      <button type="button" onClick={() => onChange([...items, ''])} className="mt-2 w-full text-sm text-zinc-500 border border-dashed border-zinc-300 rounded-lg py-2 hover:border-[#4472C4] hover:text-[#4472C4] transition-colors">
        {addLabel}
      </button>
    </div>
  )
}
