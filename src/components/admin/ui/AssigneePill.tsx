interface AssigneePillProps {
  name: string
  date?: string | null
}

// Colored pill showing assigned SEO user + assignment date (ServiceMyCar style).
export function AssigneePill({ name, date }: AssigneePillProps) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded px-2 py-0.5 text-[10px] font-bold text-white uppercase whitespace-nowrap" style={{ backgroundColor: '#22C55E' }}>
      {name}
      {date && <span className="font-medium normal-case opacity-90">{new Date(date).toISOString().slice(0, 10)}</span>}
    </span>
  )
}
