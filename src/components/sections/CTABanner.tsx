import Link from 'next/link'

interface CTABannerProps {
  title?: string
  subtitle?: string
  ctaLabel?: string
  ctaHref?: string
  secondaryLabel?: string
  secondaryHref?: string
}

export function CTABanner({
  title = 'Ready to Book Your Car Service?',
  subtitle = 'Get an instant quote. Certified technicians. Doorstep service available across UAE.',
  ctaLabel = 'Get a Free Quote',
  ctaHref = '/contact',
  secondaryLabel = 'Call Us Now',
  secondaryHref = 'tel:+971501234567',
}: CTABannerProps) {
  return (
    <section className="py-14 bg-[#4472C4]" aria-labelledby="cta-heading">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h2 id="cta-heading" className="text-2xl sm:text-3xl font-extrabold text-white mb-3">
          {title}
        </h2>
        <p className="text-[#C7D9F5] mb-8 max-w-xl mx-auto">
          {subtitle}
        </p>
        <div className="flex flex-wrap justify-center gap-4">
          <Link
            href={ctaHref}
            className="inline-flex items-center justify-center px-8 py-4 rounded-md bg-[#E8601C] text-white font-bold hover:bg-[#D15518] transition-colors shadow-lg text-base"
          >
            {ctaLabel}
          </Link>
          <a
            href={secondaryHref}
            className="inline-flex items-center justify-center px-8 py-4 rounded-md border-2 border-white text-white font-semibold hover:bg-white/10 transition-colors text-base"
          >
            {secondaryLabel}
          </a>
        </div>
      </div>
    </section>
  )
}
