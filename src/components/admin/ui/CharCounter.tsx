export function CharCounter({ length, max }: { length: number; max: number }) {
  const pct = length / max
  const color = pct > 1 ? 'text-red-600' : pct > 0.8 ? 'text-amber-600' : 'text-green-600'
  return (
    <p className={`mt-1 text-xs flex items-center gap-1 justify-end ${color}`}>
      {pct > 1 && <span aria-hidden="true">⚠️</span>}
      {length}/{max}
    </p>
  )
}
