import Link from 'next/link'
import { Phone, MessageCircle, Calendar } from 'lucide-react'

interface ContactCtaBarProps {
  phone?: string
  whatsapp?: string
  bookHref?: string
}

// Sticky-style conversion bar: Call / WhatsApp / Book Online. Used both mid-page
// and as the footer CTA on the service page template.
export function ContactCtaBar({ phone = '+971501234567', whatsapp = '971501234567', bookHref = '/contact' }: ContactCtaBarProps) {
  return (
    <section className="py-10 px-4 sm:px-6 lg:px-8" aria-label="Contact options">
      <div className="max-w-4xl mx-auto rounded-2xl bg-[#1F2937] px-6 py-8 sm:px-10 grid grid-cols-1 sm:grid-cols-3 gap-4">
        <a href={`tel:${phone}`} className="inline-flex items-center justify-center gap-2 px-5 py-3.5 rounded-xl bg-white/10 text-white font-semibold ring-1 ring-white/20 hover:bg-white/20 transition-all">
          <Phone size={18} /> Call Us
        </a>
        <a href={`https://wa.me/${whatsapp}`} target="_blank" rel="noopener noreferrer" className="inline-flex items-center justify-center gap-2 px-5 py-3.5 rounded-xl bg-[#22C55E] text-white font-semibold hover:brightness-110 transition-all">
          <MessageCircle size={18} /> WhatsApp
        </a>
        <Link href={bookHref} className="inline-flex items-center justify-center gap-2 px-5 py-3.5 rounded-xl bg-gradient-orange text-white font-bold hover:-translate-y-0.5 transition-all">
          <Calendar size={18} /> Book Online
        </Link>
      </div>
    </section>
  )
}
