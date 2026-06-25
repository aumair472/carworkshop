'use client'

import React, { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

const NAV_LINKS = [
  { label: 'Services', href: '/services' },
  { label: 'Car Brands', href: '/brands' },
  { label: 'Locations', href: '/locations' },
  { label: 'Blog', href: '/blog' },
  { label: 'About', href: '/about' },
]

export function Header() {
  const pathname = usePathname()
  const [mobileOpen, setMobileOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 8)
    window.addEventListener('scroll', handler, { passive: true })
    return () => window.removeEventListener('scroll', handler)
  }, [])

  const prevPathname = useRef(pathname)
  useEffect(() => {
    if (prevPathname.current !== pathname) {
      prevPathname.current = pathname
      setMobileOpen(false)
    }
  }, [pathname])

  return (
    <header className={['fixed top-0 left-0 right-0 z-40 bg-white transition-shadow duration-150', scrolled ? 'shadow-md' : 'shadow-sm'].join(' ')}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 shrink-0" aria-label="CarWorkshop.ae home">
            <span className="text-2xl font-extrabold text-[#4472C4] tracking-tight">
              Car<span className="text-[#E8601C]">Workshop</span><span className="text-[#1F2937]">.ae</span>
            </span>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-6" aria-label="Main navigation">
            {NAV_LINKS.map(link => (
              <Link
                key={link.href}
                href={link.href}
                className={[
                  'text-sm font-medium transition-colors',
                  pathname.startsWith(link.href)
                    ? 'text-[#4472C4] border-b-2 border-[#4472C4] pb-0.5'
                    : 'text-[#374151] hover:text-[#4472C4]',
                ].join(' ')}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* CTA + Phone */}
          <div className="hidden md:flex items-center gap-3">
            <a
              href="tel:+971501234567"
              className="text-sm font-semibold text-[#1F2937] hover:text-[#4472C4] transition-colors"
              aria-label="Call us"
            >
              <span className="text-[#4472C4]">📞</span> +971 50 123 4567
            </a>
            <Link
              href="/contact"
              className="inline-flex items-center justify-center gap-2 rounded-md px-4 py-2 text-sm bg-[#E8601C] text-white font-semibold hover:bg-[#D15518] transition-colors"
            >
              Book Now
            </Link>
          </div>

          {/* Mobile hamburger */}
          <button
            className="md:hidden p-2 rounded-md text-[#374151] hover:text-[#4472C4] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#4472C4]"
            aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={mobileOpen}
            onClick={() => setMobileOpen(v => !v)}
          >
            {mobileOpen ? (
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            ) : (
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            )}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <nav className="md:hidden bg-white border-t border-[#E5E7EB] px-4 py-3 flex flex-col gap-1" aria-label="Mobile navigation">
          {NAV_LINKS.map(link => (
            <Link
              key={link.href}
              href={link.href}
              className={[
                'py-2.5 px-3 rounded-md text-sm font-medium transition-colors',
                pathname.startsWith(link.href)
                  ? 'bg-[#EEF3FB] text-[#4472C4]'
                  : 'text-[#374151] hover:bg-[#F9FAFB]',
              ].join(' ')}
            >
              {link.label}
            </Link>
          ))}
          <a
            href="tel:+971501234567"
            className="py-2.5 px-3 text-sm font-semibold text-[#4472C4]"
          >
            📞 +971 50 123 4567
          </a>
          <Link
            href="/contact"
            className="mt-1 py-2.5 px-3 rounded-md bg-[#E8601C] text-white text-sm font-semibold text-center"
          >
            Book Now
          </Link>
        </nav>
      )}
    </header>
  )
}
