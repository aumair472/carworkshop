'use client'

import { useEffect, useState } from 'react'
import type { UserRole } from '@/types'

// Fetches the current admin role client-side (used by editors to gate UI).
export function useActingRole(): { role: UserRole | null; isSEOEditor: boolean } {
  const [role, setRole] = useState<UserRole | null>(null)
  useEffect(() => {
    let cancelled = false
    void (async () => {
      try {
        const res = await fetch('/api/admin/me')
        if (!res.ok || cancelled) return
        const d = await res.json() as { role?: UserRole }
        if (!cancelled && d.role) setRole(d.role)
      } catch { /* ignore */ }
    })()
    return () => { cancelled = true }
  }, [])
  return { role, isSEOEditor: role === 'seo_editor' }
}

export function SeoEditorBanner() {
  return (
    <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
      <p className="text-blue-700 text-sm font-medium">SEO Editor Mode — You can only edit SEO fields on this page.</p>
    </div>
  )
}
