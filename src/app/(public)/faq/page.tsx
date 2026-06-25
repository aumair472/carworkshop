import type { Metadata } from 'next'
import { Breadcrumb } from '@/components/ui/Breadcrumb'
import { Accordion } from '@/components/ui/Accordion'
import { CTABanner } from '@/components/sections/CTABanner'

export const metadata: Metadata = {
  title: 'Frequently Asked Questions | CarWorkshop.ae',
  description: 'Answers to the most common questions about car service, booking, pricing, and warranties at CarWorkshop.ae.',
  alternates: { canonical: 'https://carworkshop.ae/faq' },
  openGraph: { title: 'FAQ | CarWorkshop.ae', description: 'Common questions about car service in UAE.', type: 'website', url: 'https://carworkshop.ae/faq' },
}

const FAQS = [
  { question: 'How do I book a car service?', answer: 'Fill out the quote form on our website or call/WhatsApp us at +971 50 123 4567. We respond within 30 minutes during business hours.' },
  { question: 'Do you offer doorstep or mobile car service?', answer: 'Yes! We offer doorstep car service across Dubai, Abu Dhabi, Sharjah, and other UAE locations. A certified technician comes to your home or office.' },
  { question: 'How much does car service cost in UAE?', answer: 'Basic oil service starts from AED 149. Prices vary by car make, model, and service type. You can request a free, no-obligation quote before booking.' },
  { question: 'Are your technicians certified?', answer: 'All our technicians are factory-trained and certified for the brands they service. We only use OEM or approved parts.' },
  { question: 'What warranty do you offer?', answer: 'We provide a 12-month or 20,000 km warranty (whichever comes first) on all parts and labour.' },
  { question: 'Do you service all car brands?', answer: 'Yes, we service all major car brands including BMW, Mercedes-Benz, Audi, Toyota, Nissan, Honda, Hyundai, Kia, Ford, and more.' },
  { question: 'How long does a car service take?', answer: 'Most services are completed within 2–4 hours. Major repairs may take longer. We keep you informed at every step.' },
  { question: 'What payment methods do you accept?', answer: 'We accept cash, card (Visa/Mastercard), and bank transfer. Payment is due upon completion of the service.' },
]

export default function FAQPage() {
  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: FAQS.map(faq => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: { '@type': 'Answer', text: faq.answer },
    })),
  }

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
      <div className="bg-[#F0F4FF] py-10 border-b border-[#C7D9F5]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Breadcrumb items={[{ label: 'Home', href: '/' }, { label: 'FAQ' }]} />
          <h1 className="text-3xl sm:text-4xl font-extrabold text-[#1F2937] mt-4">Frequently Asked Questions</h1>
          <p className="text-[#6B7280] mt-2">Everything you need to know about car service at CarWorkshop.ae.</p>
        </div>
      </div>

      <section className="py-14">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <Accordion items={FAQS} />
        </div>
      </section>

      <CTABanner title="Still have questions? Talk to our team" ctaLabel="Contact Us" ctaHref="/contact" />
    </>
  )
}
