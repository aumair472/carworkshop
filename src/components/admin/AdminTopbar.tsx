'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { Menu, Maximize, Minimize, ChevronDown, Car, LogOut, Globe } from 'lucide-react'
import { toggleCollapsed } from './sidebar-store'

interface AdminTopbarProps {
  title: string
  actions?: React.ReactNode
}

export function AdminTopbar({ title, actions }: AdminTopbarProps) {
  const [userName, setUserName] = useState<string | null>(null)
  const [menuOpen, setMenuOpen] = useState(false)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    let cancelled = false
    fetch('/api/admin/me')
      .then(r => (r.ok ? r.json() : null))
      .then(data => {
        if (!cancelled && data) setUserName(data.full_name ?? data.user?.full_name ?? data.email ?? null)
      })
      .catch(() => {})
    return () => { cancelled = true }
  }, [])

  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setMenuOpen(false)
    }
    document.addEventListener('mousedown', onClick)
    return () => document.removeEventListener('mousedown', onClick)
  }, [])

  useEffect(() => {
    const onChange = () => setIsFullscreen(!!document.fullscreenElement)
    document.addEventListener('fullscreenchange', onChange)
    return () => document.removeEventListener('fullscreenchange', onChange)
  }, [])

  function toggleFullscreen() {
    if (document.fullscreenElement) void document.exitFullscreen()
    else void document.documentElement.requestFullscreen()
  }

  return (
    <div className="h-[50px] bg-white border-b border-[#E5E7EB] shadow-sm flex items-center justify-between px-4 shrink-0">
      <div className="flex items-center gap-3 min-w-0">
        <button
          type="button"
          onClick={toggleCollapsed}
          aria-label="Toggle sidebar"
          className="flex items-center justify-center h-9 w-9 rounded-md border border-[#E5E7EB] text-[#374151] hover:bg-[#F9FAFB]"
        >
          <Menu size={18} />
        </button>
        <h1 className="text-base font-bold text-[#1F2937] truncate">{title}</h1>
      </div>

      <div className="flex items-center gap-3">
        {actions && <div className="flex items-center gap-3">{actions}</div>}
        <button
          type="button"
          onClick={toggleFullscreen}
          aria-label="Toggle fullscreen"
          className="flex items-center justify-center h-9 w-9 rounded-md text-[#374151] hover:bg-[#F9FAFB]"
        >
          {isFullscreen ? <Minimize size={17} /> : <Maximize size={17} />}
        </button>
        <div className="relative" ref={menuRef}>
          <button
            type="button"
            onClick={() => setMenuOpen(o => !o)}
            className="flex items-center gap-2 h-9 px-2 rounded-md text-sm font-semibold text-[#1F2937] hover:bg-[#F9FAFB]"
          >
            <ChevronDown size={14} className="text-[#6B7280]" />
            <span className="max-w-[140px] truncate">{userName ?? 'Admin'}</span>
            <span className="h-8 w-8 rounded-full bg-[#4472C4] text-white flex items-center justify-center">
              <Car size={16} />
            </span>
          </button>
          {menuOpen && (
            <div className="absolute right-0 top-full mt-1 w-44 bg-white border border-[#E5E7EB] rounded-md shadow-lg py-1 z-50">
              <Link href="/" className="flex items-center gap-2 px-3 py-2 text-sm text-[#374151] hover:bg-[#F9FAFB]">
                <Globe size={15} /> View Site
              </Link>
              <form action="/api/admin/logout" method="POST">
                <button type="submit" className="flex items-center gap-2 w-full px-3 py-2 text-sm text-[#EF4444] hover:bg-[#F9FAFB]">
                  <LogOut size={15} /> Logout
                </button>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
