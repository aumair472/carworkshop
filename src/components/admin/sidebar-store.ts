'use client'

// Shared collapse state for AdminSidebar + AdminTopbar hamburger.

const STORAGE_KEY = 'admin_sidebar_collapsed'

const collapseListeners = new Set<() => void>()

export function subscribeCollapsed(cb: () => void) {
  collapseListeners.add(cb)
  window.addEventListener('storage', cb)
  return () => {
    collapseListeners.delete(cb)
    window.removeEventListener('storage', cb)
  }
}

export function getCollapsed() {
  return typeof window !== 'undefined' && localStorage.getItem(STORAGE_KEY) === '1'
}

export function setCollapsedValue(value: boolean) {
  localStorage.setItem(STORAGE_KEY, value ? '1' : '0')
  collapseListeners.forEach(l => l())
}

export function toggleCollapsed() {
  setCollapsedValue(!getCollapsed())
}
