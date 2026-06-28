import { Breadcrumb } from '@/components/ui/Breadcrumb'
import { Star, ShieldCheck, Truck } from 'lucide-react'

interface BreadcrumbItem { label: string; href?: string }
interface PageHeaderProps {
  breadcrumb: BreadcrumbItem[]
  title: string
  subtitle?: string | null
  /** Show the inline trust chips (rating / warranty / pickup). Default true. */
  showTrust?: boolean
  /** Optional eyebrow label above the H1. */
  eyebrow?: string
}

const TRUST = [
  { icon: Star, label: '4.9/5 rating' },
  { icon: ShieldCheck, label: '12-month warranty' },
  { icon: Truck, label: 'Free pickup & delivery' },
]

// Premium gradient/mesh page header that replaces the old flat #F0F4FF
// breadcrumb block used across detail/listing pages. Visual-only — same data.
export function PageHeader({ breadcrumb, title, subtitle, showTrust = true, eyebrow }: PageHeaderProps) {
  return (
    <section className="relative overflow-hidden bg-mesh border-b border-hairline">
      <div className="absolute inset-0 texture-dots opacity-60 pointer-events-none" aria-hidden="true" />
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
        <Breadcrumb items={breadcrumb} />
        {eyebrow && (
          <span className="inline-block mt-5 mb-3 px-3 py-1 text-xs font-semibold tracking-wide rounded-full bg-white/70 text-[#274E96] ring-1 ring-[#C7D9F5] backdrop-blur">
            {eyebrow}
          </span>
        )}
        <h1 className="display-tight text-balance text-3xl sm:text-4xl lg:text-5xl font-extrabold text-[#111827] mt-4 max-w-3xl">
          {title}
        </h1>
        {subtitle && (
          <p className="text-pretty text-[#4B5563] mt-3 max-w-2xl text-base sm:text-lg leading-relaxed">
            {subtitle}
          </p>
        )}
        {showTrust && (
          <ul className="flex flex-wrap items-center gap-x-5 gap-y-2 mt-6">
            {TRUST.map(t => {
              const Icon = t.icon
              return (
                <li key={t.label} className="inline-flex items-center gap-1.5 text-sm font-medium text-[#374151]">
                  <Icon size={16} className="text-[#4472C4]" />
                  {t.label}
                </li>
              )
            })}
          </ul>
        )}
      </div>
    </section>
  )
}
