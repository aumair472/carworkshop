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
    <section className="py-14 lg:py-20" aria-labelledby="faq-heading">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-10">
          <h2 id="faq-heading" className="text-2xl sm:text-3xl font-extrabold text-[#1F2937] mb-3">
            {title}
          </h2>
          {subtitle && <p className="text-[#6B7280]">{subtitle}</p>}
        </div>
        <Accordion items={faqs} />
      </div>
    </section>
  )
}
