'use client'

import { Suspense, useSyncExternalStore } from 'react'
import Link from 'next/link'
import { usePathname, useSearchParams } from 'next/navigation'
import {
  LayoutDashboard, Car, Wrench, MapPin, FileText, Files, Home, Info, Phone,
  HelpCircle, Lock, Zap, Users, Image as ImageIcon, Settings, UserCog,
  Globe, LogOut, ChevronsLeft, Search, type LucideIcon,
} from 'lucide-react'
import type { UserRole } from '@/types'

interface NavItem { label: string; href: string; icon: LucideIcon }
interface NavSection { label: string; items: NavItem[] }

// Hrefs that the restricted seo_editor role may NOT see.
const SEO_EDITOR_HIDDEN = ['/admin/pages/generate', '/admin/media', '/admin/settings', '/admin/users']

const NAV_SECTIONS: NavSection[] = [
  { label: 'Overview', items: [{ label: 'Dashboard', href: '/admin', icon: LayoutDashboard }] },
  {
    label: 'Content',
    items: [
      { label: 'Brands', href: '/admin/brands', icon: Car },
      { label: 'Services', href: '/admin/services', icon: Wrench },
      { label: 'Locations', href: '/admin/locations', icon: MapPin },
      { label: 'Blog Posts', href: '/admin/blog', icon: FileText },
    ],
  },
  {
    label: 'Pages',
    items: [
      { label: 'All Pages', href: '/admin/pages', icon: Files },
      { label: 'SEO Health', href: '/admin/seo', icon: Search },
      { label: 'Model Pages', href: '/admin/pages/models', icon: Car },
      { label: 'Home', href: '/admin/pages/static/home', icon: Home },
      { label: 'About', href: '/admin/pages/static/about', icon: Info },
      { label: 'Contact', href: '/admin/pages/static/contact', icon: Phone },
      { label: 'FAQ', href: '/admin/pages/static/faq', icon: HelpCircle },
      { label: 'Privacy & Terms', href: '/admin/pages/static/privacy', icon: Lock },
      { label: 'Services List Page', href: '/admin/pages/static/services-listing', icon: Wrench },
      { label: 'Brands List Page', href: '/admin/pages/static/brands-listing', icon: Car },
      { label: 'Locations List Page', href: '/admin/pages/static/locations-listing', icon: MapPin },
      { label: 'Blog List Page', href: '/admin/pages/static/blog-listing', icon: FileText },
    ],
  },
  {
    label: 'Operations',
    items: [
      { label: 'Generate Pages', href: '/admin/pages/generate', icon: Zap },
      { label: 'Leads', href: '/admin/leads', icon: Users },
      { label: 'Media', href: '/admin/media', icon: ImageIcon },
    ],
  },
  {
    label: 'System',
    items: [
      { label: 'Settings', href: '/admin/settings', icon: Settings },
      { label: 'Users', href: '/admin/users', icon: UserCog },
    ],
  },
]

const STORAGE_KEY = 'admin_sidebar_collapsed'

const collapseListeners = new Set<() => void>()
function subscribeCollapsed(cb: () => void) {
  collapseListeners.add(cb)
  window.addEventListener('storage', cb)
  return () => { collapseListeners.delete(cb); window.removeEventListener('storage', cb) }
}
function getCollapsed() {
  return typeof window !== 'undefined' && localStorage.getItem(STORAGE_KEY) === '1'
}
function setCollapsedValue(value: boolean) {
  localStorage.setItem(STORAGE_KEY, value ? '1' : '0')
  collapseListeners.forEach(l => l())
}

export function AdminSidebar({ role }: { role?: UserRole }) {
  return (
    <Suspense fallback={<aside className="w-60 shrink-0" style={{ backgroundColor: '#0F1117' }} />}>
      <SidebarInner role={role} />
    </Suspense>
  )
}

function SidebarInner({ role }: { role?: UserRole }) {
  const pathname = usePathname()
  const tab = useSearchParams().get('tab')
  const collapsed = useSyncExternalStore(subscribeCollapsed, getCollapsed, () => false)

  const sections = role === 'seo_editor'
    ? NAV_SECTIONS.map(s => ({ ...s, items: s.items.filter(i => !SEO_EDITOR_HIDDEN.includes(i.href)) })).filter(s => s.items.length > 0)
    : NAV_SECTIONS

  return (
    <aside
      className={['shrink-0 text-zinc-400 flex flex-col h-screen sticky top-0 transition-[width] duration-200 border-r', collapsed ? 'w-16' : 'w-60'].join(' ')}
      style={{ backgroundColor: '#0F1117', borderColor: '#27272A' }}
    >
      {/* Brand + collapse toggle */}
      <div className="flex items-center gap-2 px-3 h-14 border-b" style={{ borderColor: '#27272A' }}>
        {!collapsed && (
          <Link href="/admin" className="flex-1 min-w-0 leading-tight">
            <span className="text-base font-extrabold block truncate text-white">
              <span className="text-[#4472C4]">Car</span><span className="text-[#E8601C]">Workshop</span><span className="text-zinc-300">.ae</span>
            </span>
            <span className="text-[10px] text-zinc-500">Admin Panel</span>
          </Link>
        )}
        <button
          type="button"
          onClick={() => setCollapsedValue(!collapsed)}
          aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          title={collapsed ? 'Expand' : 'Collapse'}
          className={['flex items-center justify-center h-8 w-8 rounded-md text-zinc-400 hover:bg-[#1A1A2E] hover:text-white transition-colors', collapsed ? 'mx-auto' : ''].join(' ')}
        >
          <ChevronsLeft size={18} className={collapsed ? 'rotate-180 transition-transform' : 'transition-transform'} />
        </button>
      </div>

      <nav className="flex-1 overflow-y-auto py-2 px-2 admin-scroll" aria-label="Admin navigation">
        {sections.map(section => (
          <div key={section.label} className="mb-1">
            {collapsed
              ? <div className="my-2 mx-2 border-t" style={{ borderColor: '#27272A' }} />
              : <p className="px-3 pt-3 pb-1 text-[10px] font-semibold uppercase tracking-widest" style={{ color: '#52525B' }}>{section.label}</p>}
            {section.items.map(item => {
              const Icon = item.icon
              const isActive = item.href === '/admin'
                ? pathname === '/admin'
                : item.href === '/admin/settings'
                  ? pathname === '/admin/settings' && !tab
                  : pathname.startsWith(item.href) && pathname !== '/admin/settings'
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  title={collapsed ? item.label : undefined}
                  className={[
                    'relative flex items-center rounded-md text-sm font-medium transition-colors',
                    collapsed ? 'justify-center h-9 w-9 mx-auto' : 'gap-2.5 px-3 py-2',
                    isActive ? 'text-white' : 'text-zinc-400 hover:text-white hover:bg-[#1A1A2E]',
                  ].join(' ')}
                  style={isActive ? { backgroundColor: '#1E1E2E' } : undefined}
                >
                  {isActive && !collapsed && <span className="absolute left-0 top-1.5 bottom-1.5 w-0.5 rounded-full bg-[#4472C4]" />}
                  <Icon size={16} className="shrink-0" />
                  {!collapsed && <span className="truncate">{item.label}</span>}
                </Link>
              )
            })}
          </div>
        ))}
      </nav>

      {/* User footer */}
      <div className="border-t p-2" style={{ borderColor: '#27272A' }}>
        {!collapsed && (
          <div className="flex items-center gap-2.5 px-2 py-2 mb-1">
            <span className="h-8 w-8 shrink-0 rounded-full bg-[#4472C4] text-white flex items-center justify-center text-sm font-bold">A</span>
            <div className="min-w-0">
              <p className="text-sm font-medium text-white leading-tight truncate">Admin</p>
              <p className="text-[11px] text-zinc-500 truncate">CarWorkshop.ae</p>
            </div>
          </div>
        )}
        <div className={collapsed ? 'space-y-1' : 'flex gap-1'}>
          <Link href="/" title="View Site" className={['flex items-center justify-center rounded-md text-sm text-zinc-400 hover:text-white hover:bg-[#1A1A2E] transition-colors', collapsed ? 'h-9 w-9 mx-auto' : 'flex-1 gap-2 py-2'].join(' ')}>
            <Globe size={16} />{!collapsed && <span className="text-xs">View Site</span>}
          </Link>
          <form action="/api/admin/logout" method="POST" className={collapsed ? '' : 'flex-1'}>
            <button type="submit" title="Sign Out" className={['flex items-center justify-center rounded-md text-sm text-zinc-400 hover:text-white hover:bg-[#1A1A2E] transition-colors w-full', collapsed ? 'h-9 w-9 mx-auto' : 'gap-2 py-2'].join(' ')}>
              <LogOut size={16} />{!collapsed && <span className="text-xs">Sign Out</span>}
            </button>
          </form>
        </div>
      </div>
    </aside>
  )
}
