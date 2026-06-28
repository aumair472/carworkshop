// Skeleton for the CORE programmatic page (hero + content + sidebar), shown
// while the on-demand ISR render resolves on a cache miss. Matches the real
// layout to avoid layout shift.
export default function Loading() {
  return (
    <div className="animate-pulse" aria-busy="true" aria-label="Loading">
      <div className="bg-mesh border-b border-hairline">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14 lg:py-20 space-y-4">
          <div className="h-3 w-56 bg-zinc-200 rounded" />
          <div className="h-10 w-3/4 max-w-2xl bg-zinc-200 rounded" />
          <div className="h-4 w-1/2 max-w-md bg-zinc-200 rounded" />
          <div className="h-11 w-40 bg-zinc-200 rounded-lg mt-2" />
        </div>
      </div>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-4 bg-zinc-100 rounded" style={{ width: `${90 - i * 7}%` }} />
          ))}
          <div className="h-40 bg-zinc-100 rounded-lg mt-4" />
        </div>
        <div className="space-y-4">
          <div className="h-48 bg-zinc-100 rounded-lg" />
          <div className="h-32 bg-zinc-100 rounded-lg" />
        </div>
      </div>
    </div>
  )
}
