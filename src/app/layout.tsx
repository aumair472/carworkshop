import type { Metadata, Viewport } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
})

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#4472C4',
}

export const metadata: Metadata = {
  metadataBase: new URL('https://carworkshop.ae'),
  title: {
    default: 'CarWorkshop.ae — Trusted Car Repair & Service in UAE',
    template: '%s | CarWorkshop.ae',
  },
  description: 'Book expert car repair, servicing, and maintenance across UAE. Certified technicians, transparent pricing, doorstep service available.',
  keywords: ['car repair UAE', 'car service Dubai', 'auto repair Abu Dhabi', 'car maintenance UAE', 'CarWorkshop'],
  authors: [{ name: 'CarWorkshop.ae', url: 'https://carworkshop.ae' }],
  creator: 'CarWorkshop.ae',
  publisher: 'CarWorkshop.ae',
  openGraph: {
    type: 'website',
    locale: 'en_AE',
    url: 'https://carworkshop.ae',
    siteName: 'CarWorkshop.ae',
    title: 'CarWorkshop.ae — Trusted Car Repair & Service in UAE',
    description: 'Book expert car repair, servicing, and maintenance across UAE.',
    images: [{ url: '/og-default.jpg', width: 1200, height: 630, alt: 'CarWorkshop.ae' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'CarWorkshop.ae — Trusted Car Repair & Service in UAE',
    description: 'Book expert car repair, servicing, and maintenance across UAE.',
    images: ['/og-default.jpg'],
  },
  robots: { index: true, follow: true },
  alternates: { canonical: 'https://carworkshop.ae' },
  manifest: '/manifest.json',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${inter.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col font-sans" suppressHydrationWarning>{children}</body>
    </html>
  )
}
