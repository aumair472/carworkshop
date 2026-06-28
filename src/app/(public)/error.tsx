'use client'

import { useEffect } from 'react'
import Link from 'next/link'
import * as Sentry from '@sentry/nextjs'

// Route-group error boundary for public pages. Catches render/data errors so a
// single failing section never blanks the whole site.
export default function Error({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    Sentry.captureException(error)
  }, [error])

  return (
    <div className="max-w-2xl mx-auto px-4 py-24 text-center">
      <p className="text-sm font-semibold text-[#E8601C]">Something went wrong</p>
      <h1 className="mt-2 text-2xl sm:text-3xl font-extrabold text-[#1F2937]">We couldn&apos;t load this page</h1>
      <p className="mt-3 text-[#6B7280]">An unexpected error occurred. Please try again, or head back to the homepage.</p>
      <div className="mt-6 flex items-center justify-center gap-3">
        <button
          onClick={reset}
          className="px-4 py-2 rounded-lg bg-[#4472C4] text-white text-sm font-semibold hover:bg-[#395ba3] transition-colors"
        >
          Try again
        </button>
        <Link href="/" className="px-4 py-2 rounded-lg border border-[#D1D5DB] text-sm font-semibold text-[#374151] hover:bg-[#F9FAFB] transition-colors">
          Go home
        </Link>
      </div>
    </div>
  )
}
