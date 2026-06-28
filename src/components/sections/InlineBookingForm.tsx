'use client'

import { useState } from 'react'

interface InlineBookingFormProps {
  sourcePageSlug: string
  prefillMessage?: string
  heading?: string
}

// Compact lead-capture form used in the hero of model+service pages.
export function InlineBookingForm({ sourcePageSlug, prefillMessage, heading = 'Get a Free Quote' }: InlineBookingFormProps) {
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [message, setMessage] = useState(prefillMessage ?? '')
  const [status, setStatus] = useState<'idle' | 'sending' | 'done' | 'error'>('idle')
  const [error, setError] = useState('')

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    setStatus('sending'); setError('')
    try {
      const res = await fetch('/api/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, phone, message, honeypot: '', source_page_slug: sourcePageSlug }),
      })
      if (!res.ok) {
        const d = await res.json().catch(() => ({})) as { error?: string }
        setError(d.error ?? 'Something went wrong. Please try again.'); setStatus('error'); return
      }
      setStatus('done')
    } catch {
      setError('Network error. Please try again.'); setStatus('error')
    }
  }

  if (status === 'done') {
    return (
      <div className="card-premium p-7 rounded-2xl">
        <p className="text-[#059669] text-lg font-bold mb-1">✓ Request received</p>
        <p className="text-[#64748B] text-sm">Our team will call you within 30 minutes during business hours.</p>
      </div>
    )
  }

  const inputCls = 'w-full px-3.5 py-3 rounded-xl border border-hairline bg-white text-sm focus:outline-none focus:ring-2 focus:ring-[#4472C4] focus:border-transparent transition-all'

  return (
    <form onSubmit={submit} className="card-premium p-7 rounded-2xl">
      <h2 className="text-xl font-extrabold text-[#0F172A] mb-1">{heading}</h2>
      <p className="text-sm text-[#64748B] mb-5">Fixed price. We&apos;ll call you back fast.</p>
      <div className="space-y-3">
        <input type="text" required placeholder="Your name" value={name} onChange={e => setName(e.target.value)} className={inputCls} />
        <input type="tel" required placeholder="Phone (+9715…)" value={phone} onChange={e => setPhone(e.target.value)} className={inputCls} />
        <textarea rows={2} placeholder="What do you need?" value={message} onChange={e => setMessage(e.target.value)} className={inputCls} />
        {error && <p className="text-[#DC2626] text-xs">{error}</p>}
        <button
          type="submit" disabled={status === 'sending'}
          className="w-full inline-flex items-center justify-center px-6 py-3.5 rounded-xl bg-gradient-orange text-white font-bold shadow-[0_8px_24px_-8px_rgba(232,96,28,0.6)] hover:-translate-y-0.5 transition-all disabled:opacity-60 disabled:translate-y-0"
        >
          {status === 'sending' ? 'Sending…' : 'Book Now →'}
        </button>
        <p className="text-[#94A3B8] text-xs text-center">Free quote · No obligation · 12-month warranty</p>
      </div>
    </form>
  )
}
