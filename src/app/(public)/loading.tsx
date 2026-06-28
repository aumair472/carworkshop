// Streaming fallback shown while a public route's server component resolves.
// Keeps layout stable (no CLS) with a lightweight skeleton.
export default function Loading() {
  return (
    <div className="animate-pulse" aria-busy="true" aria-label="Loading">
      {/* Hero band */}
      <div className="bg-mesh border-b border-hairline">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14 lg:py-20 space-y-4">
          <div className="h-3 w-40 bg-zinc-200 rounded" />
          <div className="h-9 w-2/3 max-w-xl bg-zinc-200 rounded" />
          <div className="h-4 w-1/2 max-w-md bg-zinc-200 rounded" />
        </div>
      </div>

      {/* Card grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="rounded-lg border border-[#E5E7EB] overflow-hidden">
              <div className="h-44 bg-zinc-200" />
              <div className="p-5 space-y-3">
                <div className="h-4 w-3/4 bg-zinc-200 rounded" />
                <div className="h-3 w-full bg-zinc-100 rounded" />
                <div className="h-3 w-5/6 bg-zinc-100 rounded" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
