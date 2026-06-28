'use client'

interface Tab {
  id: string
  label: string
  badge?: string | number
}

interface AdminTabsProps {
  tabs: Tab[]
  active: string
  onChange: (id: string) => void
}

export function AdminTabs({ tabs, active, onChange }: AdminTabsProps) {
  return (
    <div className="flex gap-0 border-b border-zinc-200 overflow-x-auto" role="tablist">
      {tabs.map(tab => {
        const isActive = tab.id === active
        return (
          <button
            key={tab.id}
            role="tab"
            aria-selected={isActive}
            onClick={() => onChange(tab.id)}
            className={[
              'px-4 py-3 text-sm font-medium whitespace-nowrap -mb-px border-b-2 transition-colors flex items-center gap-2',
              isActive ? 'text-[#4472C4] border-[#4472C4]' : 'text-zinc-500 border-transparent hover:text-zinc-700',
            ].join(' ')}
          >
            {tab.label}
            {tab.badge != null && (
              <span className={['text-xs px-1.5 py-0.5 rounded-full', isActive ? 'bg-[#EEF3FB] text-[#4472C4]' : 'bg-zinc-100 text-zinc-500'].join(' ')}>
                {tab.badge}
              </span>
            )}
          </button>
        )
      })}
    </div>
  )
}
