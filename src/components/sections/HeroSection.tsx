import Link from 'next/link'

interface HeroSectionProps {
  h1: string
  subtitle?: string
  ctaLabel?: string
  ctaHref?: string
  secondaryCtaLabel?: string
  secondaryCtaHref?: string
  badge?: string
}

export function HeroSection({
  h1,
  subtitle,
  ctaLabel = 'Get a Free Quote',
  ctaHref = '/contact',
  secondaryCtaLabel = 'See All Services',
  secondaryCtaHref = '/services',
  badge,
}: HeroSectionProps) {
  return (
    <section className="relative bg-gradient-to-br from-[#1B2B4B] via-[#1F3A6E] to-[#4472C4] text-white overflow-hidden">
      {/* Background pattern */}
      <div className="absolute inset-0 opacity-10" aria-hidden="true">
        <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M 40 0 L 0 0 0 40" fill="none" stroke="white" strokeWidth="1" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid)" />
        </svg>
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-28">
        <div className="max-w-3xl">
          {badge && (
            <span className="inline-block mb-4 px-3 py-1 text-xs font-semibold rounded-full bg-[#E8601C]/20 text-[#FDBA74] border border-[#E8601C]/30">
              {badge}
            </span>
          )}

          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold leading-tight mb-6">
            {h1}
          </h1>

          {subtitle && (
            <p className="text-lg text-[#CBD5E1] mb-8 max-w-xl leading-relaxed">
              {subtitle}
            </p>
          )}

          <div className="flex flex-wrap gap-4">
            <Link
              href={ctaHref}
              className="inline-flex items-center justify-center px-8 py-4 rounded-md bg-[#E8601C] text-white font-bold text-base hover:bg-[#D15518] transition-colors shadow-lg"
            >
              {ctaLabel}
            </Link>
            <Link
              href={secondaryCtaHref}
              className="inline-flex items-center justify-center px-8 py-4 rounded-md border-2 border-white text-white font-semibold text-base hover:bg-white/10 transition-colors"
            >
              {secondaryCtaLabel}
            </Link>
          </div>

          {/* Trust signals */}
          <div className="mt-10 flex flex-wrap gap-6 text-sm text-[#94A3B8]">
            <span className="flex items-center gap-2">
              <svg className="w-4 h-4 text-[#4ADE80]" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              Certified Technicians
            </span>
            <span className="flex items-center gap-2">
              <svg className="w-4 h-4 text-[#4ADE80]" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              Transparent Pricing
            </span>
            <span className="flex items-center gap-2">
              <svg className="w-4 h-4 text-[#4ADE80]" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              Doorstep Service Available
            </span>
          </div>
        </div>
      </div>
    </section>
  )
}
