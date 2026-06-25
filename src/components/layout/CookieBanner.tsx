'use client'

import { useState, useSyncExternalStore } from 'react'
import Link from 'next/link'

const COOKIE_KEY = 'cw_cookie_consent'

function subscribe(cb: () => void) {
  window.addEventListener('storage', cb)
  return () => window.removeEventListener('storage', cb)
}

function getSnapshot() {
  return localStorage.getItem(COOKIE_KEY)
}

function getServerSnapshot() {
  return null
}

export function CookieBanner() {
  const [dismissed, setDismissed] = useState(false)
  const consent = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot)

  if (dismissed || consent !== null) return null

  function accept() {
    localStorage.setItem(COOKIE_KEY, 'accepted')
    setDismissed(true)
  }

  function decline() {
    localStorage.setItem(COOKIE_KEY, 'declined')
    setDismissed(true)
  }

  return (
    <div
      role="dialog"
      aria-label="Cookie consent"
      className="fixed bottom-0 left-0 right-0 z-50 bg-[#1F2937] text-white p-4 shadow-xl"
    >
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center gap-4">
        <p className="text-sm flex-1">
          We use cookies to improve your experience.{' '}
          <Link href="/privacy" className="underline hover:text-[#93C5FD]">
            Privacy Policy
          </Link>
        </p>
        <div className="flex gap-3 shrink-0">
          <button
            onClick={decline}
            className="px-4 py-2 text-sm font-medium border border-[#6B7280] rounded-md hover:bg-[#374151] transition-colors"
          >
            Decline
          </button>
          <button
            onClick={accept}
            className="px-4 py-2 text-sm font-semibold bg-[#4472C4] rounded-md hover:bg-[#3563B0] transition-colors"
          >
            Accept
          </button>
        </div>
      </div>
    </div>
  )
}
