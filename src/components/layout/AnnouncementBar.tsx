'use client'

import { useState, useSyncExternalStore } from 'react'
import Link from 'next/link'
import type { SiteSettings } from '@/types/settings'

const KEY = 'cw_announcement_dismissed'

function subscribe(cb: () => void) {
  window.addEventListener('storage', cb)
  return () => window.removeEventListener('storage', cb)
}
function getSnapshot() { return localStorage.getItem(KEY) }
function getServerSnapshot() { return null }

interface AnnouncementBarProps {
  settings: Pick<SiteSettings, 'announcement_bar_enabled' | 'announcement_bar_text' | 'announcement_bar_bg_color' | 'announcement_bar_text_color' | 'announcement_bar_link'>
}

export function AnnouncementBar({ settings }: AnnouncementBarProps) {
  const [dismissedNow, setDismissedNow] = useState(false)
  // Dismissal is keyed by the current text so a new announcement re-appears.
  const stored = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot)

  if (!settings.announcement_bar_enabled) return null
  if (dismissedNow || stored === settings.announcement_bar_text) return null

  function dismiss() {
    localStorage.setItem(KEY, settings.announcement_bar_text)
    setDismissedNow(true)
  }

  const inner = (
    <span className="text-sm font-medium">{settings.announcement_bar_text}</span>
  )

  return (
    <div
      className="relative w-full"
      style={{ backgroundColor: settings.announcement_bar_bg_color, color: settings.announcement_bar_text_color }}
      role="region"
      aria-label="Announcement"
    >
      <div className="max-w-7xl mx-auto px-10 py-2 text-center">
        {settings.announcement_bar_link
          ? <Link href={settings.announcement_bar_link} className="hover:underline">{inner}</Link>
          : inner}
      </div>
      <button
        onClick={dismiss}
        aria-label="Dismiss announcement"
        className="absolute top-1/2 right-3 -translate-y-1/2 text-current opacity-80 hover:opacity-100"
        style={{ color: settings.announcement_bar_text_color }}
      >
        ✕
      </button>
    </div>
  )
}
