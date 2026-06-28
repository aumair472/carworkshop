import { Accordion } from '@/components/ui/Accordion'
import type { FAQItem } from '@/types'

interface FAQSectionProps {
  faqs: FAQItem[]
  title?: string
  subtitle?: string
}

export function FAQSection({ faqs, title = 'Frequently Asked Questions', subtitle }: FAQSectionProps) {
  if (!faqs.length) return null

  return (
    <section className="py-16 lg:py-24" aria-labelledby="faq-heading">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-10">
          <h2 id="faq-heading" className="display-tight text-balance text-3xl sm:text-4xl font-extrabold text-[#0F172A] mb-3">
            {title}
          </h2>
          {subtitle && <p className="text-pretty text-[#64748B] text-lg">{subtitle}</p>}
        </div>
        <Accordion items={faqs} />
      </div>
    </section>
  )
}
