import Link from 'next/link'

const SERVICES = [
  { label: 'Oil Change', href: '/services/oil-change' },
  { label: 'Brake Service', href: '/services/brake-service' },
  { label: 'Car AC Repair', href: '/services/car-ac-repair' },
  { label: 'Engine Diagnostics', href: '/services/engine-diagnostics' },
  { label: 'Tyre Change', href: '/services/tyre-change' },
]

const LOCATIONS = [
  { label: 'Dubai', href: '/locations/dubai' },
  { label: 'Abu Dhabi', href: '/locations/abu-dhabi' },
  { label: 'Sharjah', href: '/locations/sharjah' },
  { label: 'Ajman', href: '/locations/ajman' },
  { label: 'Ras Al Khaimah', href: '/locations/ras-al-khaimah' },
]

const COMPANY = [
  { label: 'About Us', href: '/about' },
  { label: 'Blog', href: '/blog' },
  { label: 'Contact', href: '/contact' },
  { label: 'Privacy Policy', href: '/privacy' },
  { label: 'Terms of Service', href: '/terms' },
  { label: 'Sitemap', href: '/sitemap.xml' },
]

export function Footer() {
  const year = new Date().getFullYear()

  return (
    <footer className="bg-[#1F2937] text-[#D1D5DB]" role="contentinfo">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10">
          {/* Brand column */}
          <div className="lg:col-span-1">
            <Link href="/" className="inline-block mb-4" aria-label="CarWorkshop.ae home">
              <span className="text-2xl font-extrabold tracking-tight">
                <span className="text-[#4472C4]">Car</span>
                <span className="text-[#E8601C]">Workshop</span>
                <span className="text-white">.ae</span>
              </span>
            </Link>
            <p className="text-sm leading-relaxed mb-4">
              UAE&apos;s trusted car repair platform. Expert technicians, transparent pricing, doorstep service.
            </p>
            <div className="space-y-1 text-sm">
              <a href="tel:+971501234567" className="flex items-center gap-2 hover:text-white transition-colors">
                <span>📞</span> +971 50 123 4567
              </a>
              <a href="mailto:info@carworkshop.ae" className="flex items-center gap-2 hover:text-white transition-colors">
                <span>✉️</span> info@carworkshop.ae
              </a>
            </div>
          </div>

          {/* Services */}
          <div>
            <h3 className="text-white font-semibold text-sm uppercase tracking-wide mb-4">Services</h3>
            <ul className="space-y-2 text-sm">
              {SERVICES.map(s => (
                <li key={s.href}>
                  <Link href={s.href} className="hover:text-white transition-colors">{s.label}</Link>
                </li>
              ))}
              <li>
                <Link href="/services" className="text-[#4472C4] hover:text-[#6891D6] transition-colors font-medium">
                  All Services →
                </Link>
              </li>
            </ul>
          </div>

          {/* Locations */}
          <div>
            <h3 className="text-white font-semibold text-sm uppercase tracking-wide mb-4">Locations</h3>
            <ul className="space-y-2 text-sm">
              {LOCATIONS.map(l => (
                <li key={l.href}>
                  <Link href={l.href} className="hover:text-white transition-colors">{l.label}</Link>
                </li>
              ))}
              <li>
                <Link href="/locations" className="text-[#4472C4] hover:text-[#6891D6] transition-colors font-medium">
                  All Locations →
                </Link>
              </li>
            </ul>
          </div>

          {/* Company */}
          <div>
            <h3 className="text-white font-semibold text-sm uppercase tracking-wide mb-4">Company</h3>
            <ul className="space-y-2 text-sm">
              {COMPANY.map(c => (
                <li key={c.href}>
                  <Link href={c.href} className="hover:text-white transition-colors">{c.label}</Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-6 border-t border-[#374151] flex flex-col sm:flex-row justify-between items-center gap-4 text-xs text-[#9CA3AF]">
          <p>© {year} CarWorkshop.ae — All rights reserved.</p>
          <p className="flex gap-4">
            <Link href="/privacy" className="hover:text-white transition-colors">Privacy</Link>
            <Link href="/terms" className="hover:text-white transition-colors">Terms</Link>
          </p>
        </div>
      </div>
    </footer>
  )
}
