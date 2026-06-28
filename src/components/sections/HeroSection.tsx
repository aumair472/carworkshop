import Link from 'next/link'
import { Star, ShieldCheck, Truck, ArrowRight } from 'lucide-react'

interface HeroStat { value: string; label: string }
interface HeroSectionProps {
  h1: string
  subtitle?: string
  ctaLabel?: string
  ctaHref?: string
  secondaryCtaLabel?: string
  secondaryCtaHref?: string
  badge?: string
  /** Decorative stat card cells. [0] = headline, [1..3] = grid. */
  heroStats?: HeroStat[]
}

const DEFAULT_HERO_STATS: HeroStat[] = [
  { value: 'From AED 149', label: 'Starting Price' },
  { value: '10,000+', label: 'Cars Serviced' },
  { value: '4.9★', label: 'Average Rating' },
  { value: '7 Emirates', label: 'Coverage' },
]

// Premium hero: soft mesh gradient, display headline, social-proof rating,
// dual CTA, and an inline trust strip. (Trust stats themselves render via the
// admin-editable <TrustBar/> section below the hero.)
export function HeroSection({
  h1,
  subtitle,
  ctaLabel = 'Book Now',
  ctaHref = '/contact',
  secondaryCtaLabel = 'See All Services',
  secondaryCtaHref = '/services',
  badge,
  heroStats,
}: HeroSectionProps) {
  const stats = heroStats && heroStats.length >= 4 ? heroStats : DEFAULT_HERO_STATS
  return (
    <section className="relative overflow-hidden bg-mesh border-b border-hairline">
      <div className="absolute inset-0 texture-dots opacity-60 pointer-events-none" aria-hidden="true" />
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-24">
        <div className="grid lg:grid-cols-12 gap-10 items-center">
          <div className="lg:col-span-7 max-w-2xl">
            {badge && (
              <span className="inline-flex items-center gap-1.5 mb-5 px-3 py-1 text-xs font-semibold tracking-wide rounded-full bg-white/70 text-[#274E96] ring-1 ring-[#C7D9F5] backdrop-blur">
                <span className="h-1.5 w-1.5 rounded-full bg-[#E8601C]" />
                {badge}
              </span>
            )}

            <h1 className="display-tight text-balance text-4xl sm:text-5xl lg:text-6xl font-extrabold text-[#0F172A]">
              {h1}
            </h1>

            {subtitle && (
              <p className="text-pretty text-lg sm:text-xl text-[#475569] mt-5 max-w-xl leading-relaxed">
                {subtitle}
              </p>
            )}

            {/* Social proof */}
            <div className="flex items-center gap-3 mt-6">
              <div className="flex">
                {[0, 1, 2, 3, 4].map(i => (
                  <Star key={i} size={18} className="text-[#F59E0B] fill-[#F59E0B]" />
                ))}
              </div>
              <span className="text-sm text-[#475569]"><strong className="text-[#0F172A] font-semibold">4.9/5</strong> from 2,400+ UAE drivers</span>
            </div>

            <div className="flex flex-wrap gap-3 mt-8">
              <Link
                href={ctaHref}
                className="group inline-flex items-center justify-center gap-2 px-7 py-4 rounded-xl bg-gradient-orange text-white font-bold text-base shadow-[0_8px_24px_-8px_rgba(232,96,28,0.6)] hover:shadow-[0_12px_28px_-8px_rgba(232,96,28,0.7)] hover:-translate-y-0.5 transition-all"
              >
                {ctaLabel}
                <ArrowRight size={18} className="group-hover:translate-x-0.5 transition-transform" />
              </Link>
              <Link
                href={secondaryCtaHref}
                className="inline-flex items-center justify-center px-7 py-4 rounded-xl bg-white text-[#274E96] font-semibold text-base ring-1 ring-[#C7D9F5] hover:ring-[#4472C4] hover:bg-[#F7FAFF] transition-all"
              >
                {secondaryCtaLabel}
              </Link>
            </div>

            <ul className="flex flex-wrap items-center gap-x-5 gap-y-2 mt-7 text-sm font-medium text-[#374151]">
              <li className="inline-flex items-center gap-1.5"><ShieldCheck size={16} className="text-[#4472C4]" /> 12-month warranty</li>
              <li className="inline-flex items-center gap-1.5"><Truck size={16} className="text-[#4472C4]" /> Free pickup &amp; delivery</li>
              <li className="inline-flex items-center gap-1.5"><Star size={16} className="text-[#4472C4]" /> Certified technicians</li>
            </ul>
          </div>

          {/* Decorative visual (CSS only, no assets) */}
          <div className="hidden lg:block lg:col-span-5">
            <div className="relative">
              <div className="absolute -inset-4 bg-gradient-primary opacity-10 blur-3xl rounded-[3rem]" aria-hidden="true" />
              <div className="relative card-premium p-7 rounded-3xl">
                <div className="bg-gradient-primary rounded-2xl p-6 text-white">
                  <p className="text-sm/relaxed opacity-90">{stats[0].label}</p>
                  <p className="text-2xl font-extrabold mt-1">{stats[0].value}</p>
                  <div className="mt-5 grid grid-cols-3 gap-3 text-center">
                    {stats.slice(1, 4).map(s => (
                      <div key={s.label} className="rounded-xl bg-white/10 backdrop-blur px-2 py-3">
                        <p className="text-lg font-bold leading-none">{s.value}</p>
                        <p className="text-[11px] opacity-80 mt-1">{s.label}</p>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="mt-5 flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-gradient-orange flex items-center justify-center text-white font-bold">✓</div>
                  <div>
                    <p className="text-sm font-semibold text-[#0F172A]">Transparent fixed pricing</p>
                    <p className="text-xs text-[#64748B]">No surprises. Pay after service.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
