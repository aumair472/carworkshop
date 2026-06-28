import Link from 'next/link'
import Image from 'next/image'
import { MapPin, Phone, Mail, ArrowRight } from 'lucide-react'
import type { SiteSettings } from '@/types/settings'

interface NamedSlug { name: string; slug: string }

interface FooterProps {
  settings: SiteSettings
  services: NamedSlug[]
  brands: NamedSlug[]
  locations: NamedSlug[]
}

// Inline brand glyphs (lucide v1 dropped brand icons). Single-path, 24×24.
const SOCIALS: Array<{ key: keyof SiteSettings; label: string; path: string }> = [
  { key: 'social_instagram_url', label: 'Instagram', path: 'M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z' },
  { key: 'social_facebook_url', label: 'Facebook', path: 'M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z' },
  { key: 'social_linkedin_url', label: 'LinkedIn', path: 'M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z' },
  { key: 'social_youtube_url', label: 'YouTube', path: 'M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z' },
  { key: 'social_tiktok_url', label: 'TikTok', path: 'M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z' },
  { key: 'social_twitter_url', label: 'X', path: 'M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zM17.083 19.77h1.833L7.084 4.126H5.117z' },
]

export function Footer({ settings, services, brands, locations }: FooterProps) {
  const quickLinks = [...settings.footer_custom_links].filter(l => l.column === 1).sort((a, b) => a.order - b.order)
  const socials = SOCIALS.map(s => ({ ...s, url: settings[s.key] as string | null })).filter(s => s.url)
  const extraBrands = (settings.footer_extra_brands ?? []).filter(b => b.label && b.link)
  const text = settings.footer_text_color
  const phoneTel = settings.footer_business_phone.replace(/[^0-9+]/g, '')

  return (
    <footer style={{ backgroundColor: settings.footer_background_color, color: text }} role="contentinfo" className="relative overflow-hidden">
      <div className="absolute inset-0 texture-dots opacity-[0.05] pointer-events-none" aria-hidden="true" />
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14 lg:py-16">

        {/* Brands We Service — wide (auto DB brands + optional extra links) */}
        {settings.footer_show_brands_column && (brands.length > 0 || extraBrands.length > 0) && (
          <div className="pb-12 mb-12 border-b border-white/10">
            <FooterHeading>{settings.footer_column3_title || 'Brands We Service'}</FooterHeading>
            <ul className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-x-6 gap-y-2.5 mt-5">
              {brands.map(b => (
                <li key={b.slug}><Link href={`/brands/${b.slug}`} className="text-sm opacity-80 hover:opacity-100 hover:text-[#9DBBEB] transition-all">{b.name} Service</Link></li>
              ))}
              {extraBrands.map((b, i) => (
                <li key={`x-${i}`}><Link href={b.link} className="text-sm opacity-80 hover:opacity-100 hover:text-[#9DBBEB] transition-all">{b.label}</Link></li>
              ))}
              <li><Link href="/brands" className="inline-flex items-center gap-1 text-sm font-semibold text-[#9DBBEB] hover:gap-2 transition-all">All Brands <ArrowRight size={14} /></Link></li>
            </ul>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10">
          {/* Brand identity */}
          <div className="sm:col-span-2 lg:col-span-1">
            <Link href="/" className="inline-block mb-4" aria-label={`${settings.site_name} home`}>
              {settings.footer_logo_url ? (
                <Image src={settings.footer_logo_url} alt={`${settings.site_name} logo`} width={160} height={40} className="h-9 w-auto object-contain" />
              ) : (
                <span className="text-2xl font-extrabold tracking-tight">
                  <span className="text-[#6891D6]">Car</span><span className="text-[#E8601C]">Workshop</span><span style={{ color: text }}>.ae</span>
                </span>
              )}
            </Link>
            <p className="text-sm leading-relaxed opacity-80 max-w-xs">{settings.footer_tagline}</p>
          </div>

          {/* Business Information */}
          {settings.footer_show_business_info && (
            <div>
              <FooterHeading>{settings.footer_business_title}</FooterHeading>
              <ul className="mt-5 space-y-3 text-sm">
                {settings.footer_business_address && (
                  <li className="flex gap-2.5 opacity-85"><MapPin size={17} className="shrink-0 mt-0.5 text-[#6891D6]" /><span>{settings.footer_business_address}</span></li>
                )}
                {settings.footer_business_phone && (
                  <li><a href={`tel:${phoneTel}`} className="flex items-center gap-2.5 opacity-85 hover:opacity-100 transition-opacity"><Phone size={17} className="shrink-0 text-[#6891D6]" />{settings.footer_business_phone}</a></li>
                )}
                {settings.footer_business_phone2 && (
                  <li><a href={`tel:${settings.footer_business_phone2.replace(/[^0-9+]/g, '')}`} className="flex items-center gap-2.5 opacity-85 hover:opacity-100 transition-opacity"><Phone size={17} className="shrink-0 text-[#6891D6]" />{settings.footer_business_phone2}</a></li>
                )}
                {settings.footer_business_email && (
                  <li><a href={`mailto:${settings.footer_business_email}`} className="flex items-center gap-2.5 opacity-85 hover:opacity-100 transition-opacity"><Mail size={17} className="shrink-0 text-[#6891D6]" />{settings.footer_business_email}</a></li>
                )}
              </ul>
            </div>
          )}

          {/* Quick Navigation */}
          {settings.footer_show_quick_nav && quickLinks.length > 0 && (
            <div>
              <FooterHeading>{settings.footer_quick_nav_title}</FooterHeading>
              <ul className="mt-5 space-y-2.5 text-sm">
                {quickLinks.map(l => <li key={l.link}><Link href={l.link} className="opacity-80 hover:opacity-100 hover:text-[#9DBBEB] transition-all">{l.label}</Link></li>)}
              </ul>
            </div>
          )}

          {/* Services */}
          {settings.footer_show_services_column && services.length > 0 && (
            <div>
              <FooterHeading>{settings.footer_column2_title}</FooterHeading>
              <ul className="mt-5 space-y-2.5 text-sm">
                {services.map(s => <li key={s.slug}><Link href={`/services/${s.slug}`} className="opacity-80 hover:opacity-100 hover:text-[#9DBBEB] transition-all">{s.name}</Link></li>)}
                <li><Link href="/services" className="inline-flex items-center gap-1 font-semibold text-[#9DBBEB]">All Services <ArrowRight size={14} /></Link></li>
              </ul>
            </div>
          )}

          {/* Locations */}
          {settings.footer_show_locations_column && locations.length > 0 && (
            <div>
              <FooterHeading>{settings.footer_column4_title}</FooterHeading>
              <ul className="mt-5 space-y-2.5 text-sm">
                {locations.map(l => <li key={l.slug}><Link href={`/locations/${l.slug}`} className="opacity-80 hover:opacity-100 hover:text-[#9DBBEB] transition-all">{l.name}</Link></li>)}
                <li><Link href="/locations" className="inline-flex items-center gap-1 font-semibold text-[#9DBBEB]">All Locations <ArrowRight size={14} /></Link></li>
              </ul>
            </div>
          )}

          {/* Connect With Us */}
          {settings.footer_show_social && socials.length > 0 && (
            <div>
              <FooterHeading>{settings.footer_social_title}</FooterHeading>
              <div className="flex flex-wrap gap-2.5 mt-5">
                {socials.map(({ key, label, path, url }) => (
                  <a key={key} href={url ?? '#'} target="_blank" rel="noopener noreferrer" aria-label={label}
                    className="h-10 w-10 rounded-xl flex items-center justify-center bg-white/10 ring-1 ring-white/15 hover:bg-[#4472C4] hover:ring-transparent transition-all">
                    <svg viewBox="0 0 24 24" className="w-[18px] h-[18px] fill-current" aria-hidden="true"><path d={path} /></svg>
                  </a>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Bottom bar */}
        <div className="mt-12 pt-6 border-t border-white/10 flex flex-col sm:flex-row justify-between items-center gap-4 text-xs opacity-75">
          <p>{settings.footer_copyright_text}</p>
          <p className="flex gap-4">
            <Link href="/privacy" className="hover:opacity-100 hover:text-white">Privacy</Link>
            <Link href="/terms" className="hover:opacity-100 hover:text-white">Terms</Link>
          </p>
        </div>
      </div>
    </footer>
  )
}

function FooterHeading({ children }: { children: React.ReactNode }) {
  return (
    <h3 className="relative font-bold text-sm uppercase tracking-wider pb-2.5 after:absolute after:left-0 after:bottom-0 after:h-0.5 after:w-10 after:rounded-full after:bg-[#E8601C]">
      {children}
    </h3>
  )
}
