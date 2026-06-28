import Link from 'next/link'
import type { BrandModel } from '@/types'

interface ModelGridProps {
  models: BrandModel[]
  brandSlug: string
  title?: string
  // When provided, each model links to /brands/[brand]/[model]/[service]
  // instead of /brands/[brand]/[model].
  serviceSlug?: string
}

export function ModelGrid({ models, brandSlug, title, serviceSlug }: ModelGridProps) {
  return (
    <section className="py-16 lg:py-20" aria-labelledby="models-heading">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {title && (
          <h2 id="models-heading" className="display-tight text-balance text-3xl sm:text-4xl font-extrabold text-[#0F172A] text-center mb-12">
            {title}
          </h2>
        )}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-4">
          {models.map(model => (
            <Link
              key={model.id}
              href={serviceSlug ? `/brands/${brandSlug}/${model.slug}/${serviceSlug}` : `/brands/${brandSlug}/${model.slug}`}
              className="group card-premium flex flex-col items-center gap-1 p-5 text-center"
            >
              <span className="text-sm font-bold text-[#0F172A] group-hover:text-[#274E96] transition-colors">
                {model.name}
              </span>
              {model.year_from && (
                <span className="text-xs text-[#94A3B8]">
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
