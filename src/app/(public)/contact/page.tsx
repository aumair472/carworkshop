import type { Metadata } from 'next'
import { ContactForm } from './ContactForm'

export const metadata: Metadata = {
  title: 'Get a Free Car Service Quote | CarWorkshop.ae',
  description: 'Book car service, repair, or maintenance in UAE. Get a free quote within 30 minutes. Certified technicians, transparent pricing.',
  alternates: { canonical: 'https://carworkshop.ae/contact' },
  openGraph: {
    title: 'Get a Free Car Service Quote | CarWorkshop.ae',
    description: 'Book car service in UAE. Get a free quote within 30 minutes.',
    type: 'website',
    url: 'https://carworkshop.ae/contact',
  },
}

export default function ContactPage() {
  return <ContactForm />
}
