'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

const NAV_SECTIONS = [
  {
    label: 'Overview',
    items: [{ label: 'Dashboard', href: '/admin', icon: '📊' }],
  },
  {
    label: 'Content',
    items: [
      { label: 'Brands', href: '/admin/brands', icon: '🚗' },
      { label: 'Services', href: '/admin/services', icon: '🔧' },
      { label: 'Locations', href: '/admin/locations', icon: '📍' },
      { label: 'Blog Posts', href: '/admin/blog', icon: '📝' },
      { label: 'Generated Pages', href: '/admin/pages', icon: '⚡' },
    ],
  },
  {
    label: 'Operations',
    items: [
      { label: 'Leads', href: '/admin/leads', icon: '📋' },
      { label: 'Media', href: '/admin/media', icon: '🖼️' },
    ],
  },
  {
    label: 'System',
    items: [
      { label: 'Users', href: '/admin/users', icon: '👥' },
      { label: 'Settings', href: '/admin/settings', icon: '⚙️' },
    ],
  },
]

export function AdminSidebar() {
  const pathname = usePathname()

  return (
    <aside className="w-60 shrink-0 bg-[#1F2937] text-white flex flex-col h-screen sticky top-0">
      <div className="px-5 py-4 border-b border-[#374151]">
        <span className="text-lg font-extrabold">
          <span className="text-[#4472C4]">Car</span>
          <span className="text-[#E8601C]">Workshop</span>
          <span className="text-[#D1D5DB]">.ae</span>
        </span>
        <p className="text-xs text-[#9CA3AF] mt-0.5">Admin Panel</p>
      </div>

      <nav className="flex-1 overflow-y-auto py-3 px-2" aria-label="Admin navigation">
        {NAV_SECTIONS.map(section => (
          <div key={section.label} className="mb-4">
            <p className="px-3 py-1 text-xs font-semibold text-[#6B7280] uppercase tracking-wider">
              {section.label}
            </p>
            {section.items.map(item => {
              const isActive = item.href === '/admin'
                ? pathname === '/admin'
                : pathname.startsWith(item.href)
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={[
                    'flex items-center gap-2.5 px-3 py-2 rounded-md text-sm font-medium transition-colors',
                    isActive
                      ? 'bg-[#4472C4] text-white'
                      : 'text-[#D1D5DB] hover:bg-[#374151] hover:text-white',
                  ].join(' ')}
                >
                  <span>{item.icon}</span>
                  {item.label}
                </Link>
              )
            })}
          </div>
        ))}
      </nav>

      <div className="px-2 py-3 border-t border-[#374151]">
        <Link
          href="/"
          className="flex items-center gap-2.5 px-3 py-2 rounded-md text-sm text-[#9CA3AF] hover:text-white hover:bg-[#374151] transition-colors"
        >
          <span>🌐</span> View Site
        </Link>
        <form action="/api/admin/logout" method="POST">
          <button
            type="submit"
            className="w-full flex items-center gap-2.5 px-3 py-2 rounded-md text-sm text-[#9CA3AF] hover:text-white hover:bg-[#374151] transition-colors text-left"
          >
            <span>🚪</span> Sign Out
          </button>
        </form>
      </div>
    </aside>
  )
}
