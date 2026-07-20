'use client'

import { Suspense, useState, useSyncExternalStore } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard, HelpCircle, Languages, Files, FileText, Wrench,
  FileSearch, Search, Settings, UserCog, Users,
  Image as ImageIcon, Activity, LogOut, ChevronDown, type LucideIcon,
} from 'lucide-react'
import { subscribeCollapsed, getCollapsed } from './sidebar-store'
import type { UserRole } from '@/types'

interface NavItem { label: string; href: string; icon: LucideIcon }

// The ONLY hrefs the restricted seo_editor role may see.
const SEO_EDITOR_ALLOWED = ['/admin/seo-pages', '/admin/seo-blog', '/admin/service-content', '/admin/static-page-seo', '/admin/search-content']

// Main nav — ServiceMyCar order.
const MAIN_NAV: NavItem[] = [
  { label: 'Dashboard', href: '/admin', icon: LayoutDashboard },
  { label: "FAQ's", href: '/admin/faqs', icon: HelpCircle },
  { label: 'Language Key', href: '/admin/language-key', icon: Languages },
  { label: 'SEO Pages', href: '/admin/seo-pages', icon: Files },
  { label: 'SEO Blog', href: '/admin/seo-blog', icon: FileText },
  { label: 'Service Content', href: '/admin/service-content', icon: Wrench },
  { label: 'Static Page SEO', href: '/admin/static-page-seo', icon: FileSearch },
  { label: 'Search Content', href: '/admin/search-content', icon: Search },
  { label: 'Settings', href: '/admin/settings', icon: Settings },
  { label: 'Users', href: '/admin/users', icon: UserCog },
  { label: 'Leads', href: '/admin/leads', icon: Users },
]

// Secondary group — tools only, catalog CRUD removed.
const CATALOG_NAV: NavItem[] = [
  { label: 'Media', href: '/admin/media', icon: ImageIcon },
  { label: 'SEO Health', href: '/admin/seo', icon: Activity },
]

export function AdminSidebar({ role }: { role?: UserRole }) {
  return (
    <Suspense fallback={<aside className="w-[220px] shrink-0" style={{ backgroundColor: '#1F2937' }} />}>
      <SidebarInner role={role} />
    </Suspense>
  )
}

function SidebarInner({ role }: { role?: UserRole }) {
  const pathname = usePathname()
  const collapsed = useSyncExternalStore(subscribeCollapsed, getCollapsed, () => false)
  const [query, setQuery] = useState('')
  const [catalogOpen, setCatalogOpen] = useState(false)

  const filterRole = (items: NavItem[]) =>
    role === 'seo_editor' ? items.filter(i => SEO_EDITOR_ALLOWED.includes(i.href)) : items

  const q = query.trim().toLowerCase()
  const filterQuery = (items: NavItem[]) =>
    q ? items.filter(i => i.label.toLowerCase().includes(q)) : items

  const mainItems = filterQuery(filterRole(MAIN_NAV))
  const catalogItems = filterQuery(filterRole(CATALOG_NAV))

  function isActive(href: string) {
    if (href === '/admin') return pathname === '/admin'
    // Avoid /admin/seo matching /admin/seo-pages etc.
    return pathname === href || pathname.startsWith(href + '/')
  }

  return (
    <aside
      className={['shrink-0 flex flex-col h-screen sticky top-0 transition-[width] duration-200', collapsed ? 'w-16' : 'w-[220px]'].join(' ')}
      style={{ backgroundColor: '#1F2937' }}
    >
      {/* Logo + tagline */}
      <Link href="/admin" className="block px-3 py-3 border-b" style={{ borderColor: '#374151' }}>
        {collapsed ? (
          <span className="block text-center text-lg font-extrabold text-white">C</span>
        ) : (
          <>
            <span className="text-lg font-extrabold block leading-tight whitespace-nowrap">
              <span className="text-[#4472C4]">CAR</span><span className="text-[#E8601C]">WORKSHOP</span><span className="text-white">.AE</span>
            </span>
            <span className="text-[9px] tracking-wide text-zinc-400 font-semibold">
              WE COLLECT&nbsp;&nbsp;|&nbsp;&nbsp;WE SERVICE&nbsp;&nbsp;|&nbsp;&nbsp;WE DELIVER
            </span>
          </>
        )}
      </Link>

      {/* Search */}
      {!collapsed && (
        <div className="px-3 py-3">
          <div className="relative">
            <input
              type="text"
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder="search"
              className="w-full rounded-full bg-white text-sm text-[#1F2937] placeholder:text-[#9CA3AF] pl-4 pr-9 py-1.5 focus:outline-none focus:ring-2 focus:ring-[#4472C4]"
            />
            <Search size={15} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#6B7280]" />
          </div>
        </div>
      )}

      <nav className="flex-1 overflow-y-auto admin-scroll" aria-label="Admin navigation">
        {mainItems.map(item => {
          const Icon = item.icon
          const active = isActive(item.href)
          return (
            <Link
              key={item.href}
              href={item.href}
              title={collapsed ? item.label : undefined}
              className={[
                'flex items-center text-sm font-medium transition-colors',
                collapsed ? 'justify-center h-10' : 'gap-3 px-4 py-2.5',
                active ? 'text-white' : 'text-zinc-300 hover:text-white hover:bg-[#374151]',
              ].join(' ')}
              style={active ? { backgroundColor: '#4472C4' } : undefined}
            >
              <Icon size={16} className="shrink-0" />
              {!collapsed && <span className="truncate uppercase text-[13px] tracking-wide">{item.label}</span>}
            </Link>
          )
        })}

        {catalogItems.length > 0 && (
          <div className="mt-2 border-t pt-1" style={{ borderColor: '#374151' }}>
            {!collapsed && (
              <button
                type="button"
                onClick={() => setCatalogOpen(o => !o)}
                className="w-full flex items-center justify-between px-4 py-2 text-[11px] font-semibold uppercase tracking-widest text-zinc-500 hover:text-zinc-300"
              >
                Tools
                <ChevronDown size={14} className={catalogOpen ? 'rotate-180 transition-transform' : 'transition-transform'} />
              </button>
            )}
            {(catalogOpen || collapsed || q.length > 0) && catalogItems.map(item => {
              const Icon = item.icon
              const active = isActive(item.href)
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  title={collapsed ? item.label : undefined}
                  className={[
                    'flex items-center text-sm font-medium transition-colors',
                    collapsed ? 'justify-center h-10' : 'gap-3 px-4 py-2',
                    active ? 'text-white' : 'text-zinc-400 hover:text-white hover:bg-[#374151]',
                  ].join(' ')}
                  style={active ? { backgroundColor: '#4472C4' } : undefined}
                >
                  <Icon size={15} className="shrink-0" />
                  {!collapsed && <span className="truncate text-[13px]">{item.label}</span>}
                </Link>
              )
            })}
          </div>
        )}
      </nav>

      {/* Logout */}
      <div className="p-2 border-t" style={{ borderColor: '#374151' }}>
        <form action="/api/admin/logout" method="POST">
          <button
            type="submit"
            title="Logout"
            className={[
              'flex items-center justify-center gap-2 w-full rounded-md text-sm font-semibold text-white transition-opacity hover:opacity-90',
              collapsed ? 'h-9' : 'py-2.5',
            ].join(' ')}
            style={{ backgroundColor: '#EF4444' }}
          >
            <LogOut size={16} />
            {!collapsed && <span>Logout</span>}
          </button>
        </form>
      </div>
    </aside>
  )
}
