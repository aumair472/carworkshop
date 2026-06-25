import Link from 'next/link'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Page Not Found | CarWorkshop.ae',
  robots: { index: false },
}

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 text-center bg-[#F9FAFB]">
      <div className="max-w-md">
        <p className="text-8xl font-extrabold text-[#4472C4] mb-4">404</p>
        <h1 className="text-2xl font-bold text-[#1F2937] mb-3">Page Not Found</h1>
        <p className="text-[#6B7280] mb-8">
          The page you&apos;re looking for doesn&apos;t exist or has been moved. Try browsing our services or brands.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            href="/"
            className="px-6 py-3 rounded-md bg-[#4472C4] text-white font-semibold hover:bg-[#3563B0] transition-colors"
          >
            Go Home
          </Link>
          <Link
            href="/contact"
            className="px-6 py-3 rounded-md border-2 border-[#4472C4] text-[#4472C4] font-semibold hover:bg-[#EEF3FB] transition-colors"
          >
            Contact Us
          </Link>
        </div>
      </div>
    </div>
  )
}
