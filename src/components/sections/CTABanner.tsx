import Link from 'next/link'
import { ArrowRight, Phone } from 'lucide-react'

interface CTABannerProps {
  title?: string
  subtitle?: string
  ctaLabel?: string
  ctaHref?: string
  secondaryLabel?: string
  secondaryHref?: string
  bgColor?: string
}

// Premium conversion band: gradient mesh, depth, dual CTA. `bgColor` (admin
// override) still wins when set; otherwise a rich primary gradient is used.
export function CTABanner({
  title = 'Ready to Book Your Car Service?',
  subtitle = 'Get an instant quote. Certified technicians. Doorstep service available across UAE.',
  ctaLabel = 'Get a Free Quote',
  ctaHref = '/contact',
  secondaryLabel = 'Call Us Now',
  secondaryHref = 'tel:+971501234567',
  bgColor,
}: CTABannerProps) {
  return (
    <section className="py-14 lg:py-16 px-4 sm:px-6 lg:px-8" aria-labelledby="cta-heading">
      <div
        className={`relative overflow-hidden max-w-7xl mx-auto rounded-3xl px-6 py-12 sm:px-12 sm:py-14 text-center ${bgColor ? '' : 'bg-mesh-dark'}`}
        style={bgColor ? { backgroundColor: bgColor } : undefined}
      >
        <div className="absolute inset-0 texture-dots opacity-[0.15] pointer-events-none" aria-hidden="true" />
        <div className="relative">
          <h2 id="cta-heading" className="display-tight text-balance text-2xl sm:text-4xl font-extrabold text-white">
            {title}
          </h2>
          <p className="text-pretty text-[#D6E4F7] mt-4 max-w-2xl mx-auto text-base sm:text-lg">
            {subtitle}
          </p>
          <div className="flex flex-wrap justify-center gap-3 mt-8">
            <Link
              href={ctaHref}
              className="group inline-flex items-center justify-center gap-2 px-8 py-4 rounded-xl bg-gradient-orange text-white font-bold shadow-[0_10px_28px_-8px_rgba(232,96,28,0.7)] hover:-translate-y-0.5 transition-all text-base"
            >
              {ctaLabel}
              <ArrowRight size={18} className="group-hover:translate-x-0.5 transition-transform" />
            </Link>
            <a
              href={secondaryHref}
              className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-xl bg-white/10 text-white font-semibold ring-1 ring-white/30 hover:bg-white/20 backdrop-blur transition-all text-base"
            >
              <Phone size={18} />
              {secondaryLabel}
            </a>
          </div>
        </div>
      </div>
    </section>
  )
}
