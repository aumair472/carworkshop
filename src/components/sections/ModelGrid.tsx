import Link from 'next/link'
import type { BrandModel } from '@/types'

interface ModelGridProps {
  models: BrandModel[]
  brandSlug: string
  title?: string
}

export function ModelGrid({ models, brandSlug, title }: ModelGridProps) {
  return (
    <section className="py-14" aria-labelledby="models-heading">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {title && (
          <h2 id="models-heading" className="text-2xl sm:text-3xl font-extrabold text-[#1F2937] text-center mb-10">
            {title}
          </h2>
        )}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {models.map(model => (
            <Link
              key={model.id}
              href={`/brands/${brandSlug}/${model.slug}`}
              className="group flex flex-col items-center gap-2 p-4 bg-white rounded-lg border border-[#E5E7EB] hover:border-[#4472C4] hover:shadow-md transition-all duration-150 text-center"
            >
              <span className="text-sm font-semibold text-[#1F2937] group-hover:text-[#4472C4] transition-colors">
                {model.name}
              </span>
              {model.year_from && (
                <span className="text-xs text-[#9CA3AF]">
                  {model.year_from}{model.year_to ? `–${model.year_to}` : '+'}
                </span>
              )}
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}
