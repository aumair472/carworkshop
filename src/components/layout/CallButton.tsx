import type { SiteSettings } from '@/types/settings'

interface CallButtonProps {
  settings: Pick<SiteSettings, 'call_enabled' | 'call_number' | 'call_position' | 'whatsapp_enabled' | 'whatsapp_position'>
}

export function CallButton({ settings }: CallButtonProps) {
  if (!settings.call_enabled) return null

  const number = settings.call_number.replace(/[^0-9+]/g, '')
  const side = settings.call_position === 'bottom-left' ? 'left-6' : 'right-6'

  // If WhatsApp is enabled and sits on the same side, lift the Call button above it
  // so the two floating buttons never overlap.
  const sameSide = settings.whatsapp_enabled && settings.whatsapp_position === settings.call_position
  const bottom = sameSide ? 'bottom-24' : 'bottom-6'

  return (
    <a
      href={`tel:${number}`}
      aria-label="Call us"
      title="Call Us"
      className={`group fixed ${bottom} ${side} z-50 hidden sm:flex items-center justify-center w-14 h-14 bg-[#4472C4] rounded-full shadow-lg hover:bg-[#3560B0] hover:scale-110 transition-all duration-150`}
    >
      <svg viewBox="0 0 24 24" className="w-6 h-6 fill-white" aria-hidden="true">
        <path d="M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z" />
      </svg>
      <span className={`absolute ${settings.call_position === 'bottom-left' ? 'left-full ml-3' : 'right-full mr-3'} px-2 py-1 rounded bg-[#1F2937] text-white text-xs whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none`}>Call Us</span>
    </a>
  )
}
