const REASONS = [
  {
    icon: (
      <svg className="w-7 h-7 text-[#4472C4]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
      </svg>
    ),
    title: 'Certified Technicians',
    description: 'Every technician is manufacturer-certified and background-verified.',
  },
  {
    icon: (
      <svg className="w-7 h-7 text-[#4472C4]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    title: 'Upfront Pricing',
    description: 'Get a fixed quote before work begins. No hidden fees, no surprises.',
  },
  {
    icon: (
      <svg className="w-7 h-7 text-[#4472C4]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    title: 'Fast Turnaround',
    description: 'Most services completed same-day. Mobile service at your doorstep.',
  },
  {
    icon: (
      <svg className="w-7 h-7 text-[#4472C4]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>
    ),
    title: '12-Month Warranty',
    description: 'All parts and labour covered by our 12-month / 20,000 km warranty.',
  },
  {
    icon: (
      <svg className="w-7 h-7 text-[#4472C4]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    ),
    title: 'UAE-Wide Coverage',
    description: 'Workshops in all 7 emirates. Doorstep service across greater UAE.',
  },
  {
    icon: (
      <svg className="w-7 h-7 text-[#4472C4]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z" />
      </svg>
    ),
    title: '24/7 Support',
    description: 'Our team is available around the clock via phone, WhatsApp, or chat.',
  },
]

export function WhyChooseUs() {
  return (
    <section className="py-14 lg:py-20" aria-labelledby="why-heading">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 id="why-heading" className="text-2xl sm:text-3xl font-extrabold text-[#1F2937] mb-3">
            Why Choose CarWorkshop.ae?
          </h2>
          <p className="text-[#6B7280] max-w-xl mx-auto">
            Trusted by over 50,000 car owners across the UAE for reliable, affordable car care.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {REASONS.map(reason => (
            <div key={reason.title} className="flex gap-4">
              <div className="shrink-0 w-12 h-12 rounded-xl bg-[#EEF3FB] flex items-center justify-center">
                {reason.icon}
              </div>
              <div>
                <h3 className="font-bold text-[#1F2937] mb-1">{reason.title}</h3>
                <p className="text-sm text-[#6B7280] leading-relaxed">{reason.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
