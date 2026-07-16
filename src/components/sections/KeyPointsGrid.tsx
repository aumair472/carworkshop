interface KeyPointsGridProps {
  points: string[]
  icons?: string[]
  title?: string
}

// 2x3 icon grid of key selling points, e.g. "Free pickup", "12-month warranty".
export function KeyPointsGrid({ points, icons, title = 'Why Book With Us' }: KeyPointsGridProps) {
  const items = points.slice(0, 6)
  if (!items.length) return null

  return (
    <section className="py-14 lg:py-20" aria-labelledby="keypoints-heading">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 id="keypoints-heading" className="display-tight text-balance text-2xl sm:text-3xl font-extrabold text-[#1F2937] text-center mb-10">
          {title}
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {items.map((point, i) => (
            <div key={i} className="flex items-center gap-3 p-4 rounded-xl bg-white border border-[#E5E7EB]">
              <span className="shrink-0 w-10 h-10 rounded-full bg-[#EEF3FB] flex items-center justify-center text-lg" aria-hidden="true">
                {icons?.[i] || '✓'}
              </span>
              <p className="text-sm font-medium text-[#374151]">{point}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
