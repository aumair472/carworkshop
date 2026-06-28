import Script from 'next/script'
import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'
import { WhatsAppButton } from '@/components/layout/WhatsAppButton'
import { CallButton } from '@/components/layout/CallButton'
import { AnnouncementBar } from '@/components/layout/AnnouncementBar'
import { MobileCtaBar } from '@/components/layout/MobileCtaBar'
import { CookieBanner } from '@/components/layout/CookieBanner'
import { getSettings } from '@/lib/hooks/useSettings'
import { createPublicSupabase } from '@/lib/supabase/public'

export default async function PublicLayout({ children }: { children: React.ReactNode }) {
  const settings = await getSettings()

  const supabase = await createPublicSupabase()
  const [{ data: services }, { data: brands }, { data: locations }, { data: footerBrands }] = await Promise.all([
    supabase.from('services').select('name, slug, starting_price').eq('status', 'published').order('sort_order').limit(8),
    supabase.from('brands').select('name, slug, logo_url').eq('status', 'published').order('sort_order').limit(12),
    supabase.from('locations').select('name, slug').eq('status', 'published').order('sort_order').limit(8),
    supabase.from('brands').select('name, slug').eq('status', 'published').order('sort_order'),
  ])

  const ga4 = settings.ga4_id?.trim()
  const gtm = settings.gtm_id?.trim()
  const gscContent = settings.gsc_meta?.match(/content=["']([^"']+)["']/)?.[1] ?? (settings.gsc_meta?.includes('<') ? '' : settings.gsc_meta?.trim())

  return (
    <>
      {/* Reveal-on-scroll safety: if JS is disabled, show all content immediately. */}
      <noscript>
        <style>{`.reveal{opacity:1 !important;transform:none !important}`}</style>
      </noscript>
      {gscContent ? <meta name="google-site-verification" content={gscContent} /> : null}
      {ga4 && (
        <>
          <Script src={`https://www.googletagmanager.com/gtag/js?id=${ga4}`} strategy="afterInteractive" />
          <Script id="ga4-init" strategy="afterInteractive">{`window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag('js',new Date());gtag('config','${ga4}');`}</Script>
        </>
      )}
      {gtm && (
        <Script id="gtm-init" strategy="afterInteractive">{`(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src='https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);})(window,document,'script','dataLayer','${gtm}');`}</Script>
      )}
      <AnnouncementBar settings={settings} />
      <Header
        settings={settings}
        services={(services ?? []).map(s => ({ name: s.name, slug: s.slug, starting_price: s.starting_price ?? null }))}
        brands={(brands ?? []).map(b => ({ name: b.name, slug: b.slug, logo_url: b.logo_url ?? null }))}
      />
      <main className={settings.header_sticky ? 'pt-16' : ''}>{children}</main>
      <Footer
        settings={settings}
        services={services ?? []}
        brands={footerBrands ?? []}
        locations={locations ?? []}
      />
      <WhatsAppButton settings={settings} />
      <CallButton settings={settings} />
      <MobileCtaBar settings={settings} />
      <CookieBanner />
    </>
  )
}
