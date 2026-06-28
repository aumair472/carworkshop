import { Phone, MessageCircle, CalendarCheck } from 'lucide-react'
import type { SiteSettings } from '@/types/settings'

interface MobileCtaBarProps {
  settings: Pick<SiteSettings,
    'header_phone_number' | 'whatsapp_enabled' | 'whatsapp_number' | 'whatsapp_message' | 'call_enabled' | 'call_number'>
}

// Sticky bottom conversion bar shown on mobile only (floating WhatsApp/Call
// buttons are hidden < sm so they never overlap). Book / Call / WhatsApp.
export function MobileCtaBar({ settings }: MobileCtaBarProps) {
  const phone = (settings.call_enabled ? settings.call_number : settings.header_phone_number)?.replace(/[^0-9+]/g, '')
  const wa = settings.whatsapp_enabled ? settings.whatsapp_number?.replace(/[^0-9]/g, '') : ''
  const waMsg = encodeURIComponent(settings.whatsapp_message ?? '')

  return (
    <>
      <div className="h-16 sm:hidden" aria-hidden="true" />
      <nav className="sm:hidden fixed bottom-0 inset-x-0 z-50 border-t border-hairline bg-white/95 backdrop-blur shadow-[0_-8px_24px_-12px_rgba(16,24,40,0.18)]" aria-label="Quick actions">
        <div className="grid grid-cols-3 gap-2 px-3 py-2.5">
          <a href="/contact" className="flex items-center justify-center gap-1.5 rounded-xl bg-gradient-orange text-white text-sm font-bold py-3 shadow-[0_6px_18px_-8px_rgba(232,96,28,0.6)]">
            <CalendarCheck size={17} /> Book
          </a>
          {phone ? (
            <a href={`tel:${phone}`} className="flex items-center justify-center gap-1.5 rounded-xl bg-[#EEF3FB] text-[#274E96] text-sm font-semibold py-3 ring-1 ring-[#DCE6F6]">
              <Phone size={17} /> Call
            </a>
          ) : <span />}
          {wa ? (
            <a href={`https://wa.me/${wa}?text=${waMsg}`} target="_blank" rel="noopener noreferrer" className="flex items-center justify-center gap-1.5 rounded-xl bg-[#E7F8EE] text-[#128C7E] text-sm font-semibold py-3 ring-1 ring-[#C7EBD6]">
              <MessageCircle size={17} /> WhatsApp
            </a>
          ) : <span />}
        </div>
      </nav>
    </>
  )
}
