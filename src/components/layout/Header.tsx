'use client'

import React, { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import { ChevronDown, Phone, MessageCircle, Menu, X } from 'lucide-react'
import type { SiteSettings, NavItem } from '@/types/settings'

interface HeaderProps {
  settings: SiteSettings
}

export function Header({ settings }: HeaderProps) {
  const pathname = usePathname()
  const [mobileOpen, setMobileOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const [openMenu, setOpenMenu] = useState<string | null>(null)
  const [mobileExpanded, setMobileExpanded] = useState<string | null>(null)

  const openTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

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
      setOpenMenu(null)
    }
  }, [pathname])

  useEffect(() => {
    if (!mobileOpen) return
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setMobileOpen(false) }
    window.addEventListener('keydown', onKey)
    const prevOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => { window.removeEventListener('keydown', onKey); document.body.style.overflow = prevOverflow }
  }, [mobileOpen])

  useEffect(() => () => {
    if (openTimer.current) clearTimeout(openTimer.current)
    if (closeTimer.current) clearTimeout(closeTimer.current)
  }, [])

  function hoverOpen(key: string) {
    if (closeTimer.current) clearTimeout(closeTimer.current)
    openTimer.current = setTimeout(() => setOpenMenu(key), 120)
  }
  function hoverClose() {
    if (openTimer.current) clearTimeout(openTimer.current)
    closeTimer.current = setTimeout(() => setOpenMenu(null), 180)
  }

  const navItems = [...settings.nav_items].filter(n => n.visible).sort((a, b) => a.order - b.order)
  const phone = settings.header_phone_number
  const phoneTel = phone.replace(/[^0-9+]/g, '')
  const waNumber = settings.whatsapp_number.replace(/[^0-9]/g, '')

  const positionClass = settings.header_sticky ? 'fixed top-0 left-0 right-0' : 'relative'
  const isActive = (link: string) => link !== '/' ? pathname.startsWith(link) : pathname === '/'

  // A nav item shows a dropdown only if it has custom children.
  function children(item: NavItem) { return item.children?.filter(c => c.label && c.link) ?? [] }
  function hasDropdown(item: NavItem) { return children(item).length > 0 }

  return (
    <header
      className={[positionClass, 'z-50 transition-all duration-200 border-b', scrolled ? 'shadow-[0_8px_24px_-16px_rgba(16,24,40,0.35)] border-hairline' : 'border-transparent shadow-sm'].join(' ')}
      style={{ backgroundColor: scrolled ? 'rgba(255,255,255,0.85)' : settings.header_background_color, backdropFilter: scrolled ? 'saturate(180%) blur(10px)' : undefined }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link href="/" className="flex items-center gap-2 shrink-0" aria-label={`${settings.site_name} home`}>
            {settings.header_logo_url ? (
              <Image src={settings.header_logo_url} alt={`${settings.site_name} logo`} width={150} height={40} className="h-9 w-auto object-contain" />
            ) : (
              <span className="text-2xl font-extrabold tracking-tight">
                <span className="text-[#4472C4]">Car</span><span className="text-[#E8601C]">Workshop</span><span style={{ color: settings.header_text_color }}>.ae</span>
              </span>
            )}
          </Link>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-0.5" aria-label="Main navigation">
            {navItems.map(item => {
              const active = isActive(item.link)
              const baseCls = ['inline-flex items-center gap-1 px-3.5 py-2 text-sm font-semibold rounded-lg transition-colors', active ? 'text-[#274E96] bg-[#EEF3FB]' : 'hover:text-[#274E96] hover:bg-[#F5F8FD]'].join(' ')
              if (!hasDropdown(item)) {
                return (
                  <Link key={item.id} href={item.link} className={baseCls} style={active ? undefined : { color: settings.header_text_color }}>
                    {item.label}
                  </Link>
                )
              }
              const key = item.id
              const kids = children(item)
              return (
                <div key={item.id} className="relative" onMouseEnter={() => hoverOpen(key)} onMouseLeave={hoverClose}>
                  <Link href={item.link} className={baseCls} style={active ? undefined : { color: settings.header_text_color }} aria-expanded={openMenu === key} aria-haspopup="true">
                    {item.label}
                    <ChevronDown size={15} className={['transition-transform', openMenu === key ? 'rotate-180' : ''].join(' ')} />
                  </Link>

                  {openMenu === key && kids.length > 0 && (
                    <div className="absolute left-0 top-full pt-2 z-50">
                      <div className="w-64 bg-white rounded-2xl shadow-[var(--shadow-hover)] border border-hairline p-2">
                        {kids.map((c, i) => (
                          <Link key={i} href={c.link} className="block px-3 py-2.5 rounded-xl text-sm font-medium text-[#1F2937] hover:bg-[#EEF3FB] hover:text-[#274E96] transition-colors">{c.label}</Link>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )
            })}
          </nav>

          <div className="hidden md:flex items-center gap-2.5">
            {settings.header_phone_visible && (
              <a href={`tel:${phoneTel}`} className="inline-flex items-center gap-1.5 text-sm font-semibold hover:text-[#274E96] transition-colors" style={{ color: settings.header_text_color }} aria-label="Call us">
                <Phone size={16} className="text-[#4472C4]" /> {phone}
              </a>
            )}
            {settings.header_whatsapp_visible && (
              <a href={`https://wa.me/${waNumber}`} target="_blank" rel="noopener noreferrer" className="inline-flex items-center justify-center gap-1.5 rounded-xl px-3 py-2 text-sm ring-1 ring-[#25D366] text-[#128C7E] font-semibold hover:bg-[#25D366]/10 transition-colors" aria-label="WhatsApp us">
                <MessageCircle size={16} /> WhatsApp
              </a>
            )}
            {settings.header_cta_visible && (
              <Link href={settings.header_cta_link} className="inline-flex items-center justify-center gap-2 rounded-xl px-5 py-2.5 text-sm bg-gradient-orange text-white font-bold shadow-[0_8px_20px_-8px_rgba(232,96,28,0.6)] hover:-translate-y-0.5 transition-all">
                {settings.header_cta_text}
              </Link>
            )}
          </div>

          <button
            className="md:hidden p-2 rounded-lg hover:bg-[#F5F8FD] hover:text-[#274E96] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#4472C4]"
            style={{ color: settings.header_text_color }}
            aria-label="Open menu" aria-expanded={mobileOpen}
            onClick={() => setMobileOpen(true)}
          >
            <Menu size={24} />
          </button>
        </div>
      </div>

      {/* Mobile drawer */}
      {mobileOpen && (
        <div className="md:hidden fixed inset-0 z-50">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setMobileOpen(false)} aria-hidden="true" />
          <div className="absolute right-0 top-0 h-full w-[85%] max-w-sm bg-white shadow-elevated flex flex-col" role="dialog" aria-modal="true" aria-label="Navigation menu">
            <div className="flex items-center justify-between h-16 px-4 border-b border-hairline shrink-0">
              <span className="text-lg font-extrabold"><span className="text-[#4472C4]">Car</span><span className="text-[#E8601C]">Workshop</span><span className="text-[#1F2937]">.ae</span></span>
              <button onClick={() => setMobileOpen(false)} className="p-2 rounded-lg text-[#374151] hover:bg-[#F5F8FD]" aria-label="Close menu">
                <X size={24} />
              </button>
            </div>

            <nav className="flex-1 overflow-y-auto px-3 py-3" aria-label="Mobile navigation">
              {navItems.map(item => {
                const active = isActive(item.link)
                if (!hasDropdown(item)) {
                  return (
                    <Link key={item.id} href={item.link} className={['flex items-center min-h-[48px] px-3 rounded-xl text-base font-medium transition-colors', active ? 'bg-[#EEF3FB] text-[#274E96] font-semibold' : 'text-[#374151] hover:bg-[#F5F8FD]'].join(' ')}>
                      {item.label}
                    </Link>
                  )
                }
                const key = item.id
                const expanded = mobileExpanded === key
                const kids = children(item)
                return (
                  <div key={item.id}>
                    <button onClick={() => setMobileExpanded(expanded ? null : key)} className={['w-full flex items-center justify-between min-h-[48px] px-3 rounded-xl text-base font-medium transition-colors', active ? 'text-[#274E96] font-semibold' : 'text-[#374151] hover:bg-[#F5F8FD]'].join(' ')} aria-expanded={expanded}>
                      {item.label}
                      <ChevronDown size={18} className={['transition-transform', expanded ? 'rotate-180' : ''].join(' ')} />
                    </button>
                    {expanded && (
                      <div className="pl-3 pb-1">
                        {kids.map((c, i) => <Link key={i} href={c.link} className="flex items-center min-h-[44px] px-3 rounded-xl text-sm text-[#374151] hover:bg-[#F5F8FD]">{c.label}</Link>)}
                      </div>
                    )}
                  </div>
                )
              })}
            </nav>

            <div className="shrink-0 border-t border-hairline p-3 flex flex-col gap-2">
              {settings.header_whatsapp_visible && (
                <a href={`https://wa.me/${waNumber}`} target="_blank" rel="noopener noreferrer" className="flex items-center justify-center gap-2 min-h-[48px] rounded-xl bg-[#25D366] text-white font-semibold">
                  <MessageCircle size={18} /> WhatsApp
                </a>
              )}
              {settings.header_phone_visible && (
                <a href={`tel:${phoneTel}`} className="flex items-center justify-center gap-2 min-h-[48px] rounded-xl ring-1 ring-[#4472C4] text-[#4472C4] font-semibold">
                  <Phone size={18} /> Call {phone}
                </a>
              )}
              {settings.header_cta_visible && (
                <Link href={settings.header_cta_link} className="flex items-center justify-center min-h-[48px] rounded-xl bg-gradient-orange text-white font-bold">
                  {settings.header_cta_text}
                </Link>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  )
}
