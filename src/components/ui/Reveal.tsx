'use client'

import { useEffect, useRef, type ElementType, type ReactNode } from 'react'

interface RevealProps {
  children: ReactNode
  /** Animation variant. Default fades up. */
  variant?: 'up' | 'fade' | 'left' | 'right'
  /** Stagger delay in ms. */
  delay?: number
  /** Render element. Defaults to div. */
  as?: ElementType
  className?: string
}

const VARIANT_CLASS: Record<NonNullable<RevealProps['variant']>, string> = {
  up: '',
  fade: 'reveal-fade',
  left: 'reveal-left',
  right: 'reveal-right',
}

// Lightweight scroll-reveal: adds the `.is-visible` class (via the DOM, no React
// state) when the element enters the viewport. Pure CSS handles the transition
// (see globals.css `.reveal`). No animation library; respects reduced-motion.
export function Reveal({ children, variant = 'up', delay = 0, as, className = '' }: RevealProps) {
  const Tag = (as ?? 'div') as ElementType
  const ref = useRef<HTMLElement | null>(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    if (typeof IntersectionObserver === 'undefined') { el.classList.add('is-visible'); return }
    const io = new IntersectionObserver(
      entries => {
        for (const e of entries) {
          if (e.isIntersecting) { e.target.classList.add('is-visible'); io.disconnect(); break }
        }
      },
      { threshold: 0.12, rootMargin: '0px 0px -8% 0px' }
    )
    io.observe(el)
    return () => io.disconnect()
  }, [])

  return (
    <Tag
      ref={ref}
      className={`reveal ${VARIANT_CLASS[variant]} ${className}`.trim()}
      style={delay ? { transitionDelay: `${delay}ms` } : undefined}
    >
      {children}
    </Tag>
  )
}
