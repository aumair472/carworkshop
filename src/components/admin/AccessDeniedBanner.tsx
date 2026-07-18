'use client'

import { Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { AlertTriangle } from 'lucide-react'

function AccessDeniedBannerInner() {
  const searchParams = useSearchParams()
  if (searchParams.get('error') !== 'access_denied') return null

  return (
    <div className="bg-amber-50 border border-amber-200 rounded-lg px-4 py-3 mb-4 flex items-center gap-2">
      <AlertTriangle className="text-amber-500 w-4 h-4 shrink-0" />
      <p className="text-amber-700 text-sm">
        You don&apos;t have permission to access that page. You have been redirected to SEO Pages.
      </p>
    </div>
  )
}

export function AccessDeniedBanner() {
  return (
    <Suspense fallback={null}>
      <AccessDeniedBannerInner />
    </Suspense>
  )
}
