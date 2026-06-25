interface Step {
  number: number
  title: string
  description: string
  icon?: string
}

interface ProcessStepsProps {
  title?: string
  steps?: Step[]
}

const DEFAULT_STEPS: Step[] = [
  { number: 1, title: 'Request a Quote', description: 'Fill in your car details and choose a service. We respond within 30 minutes.', icon: '📋' },
  { number: 2, title: 'Confirm Booking', description: 'Our team calls to confirm timing, location, and pricing — no hidden fees.', icon: '✅' },
  { number: 3, title: 'We Come to You', description: 'A certified technician arrives at your home or office with all tools and parts.', icon: '🚗' },
  { number: 4, title: 'Drive Away Happy', description: 'Service complete. We issue a 12-month warranty and full digital receipt.', icon: '⭐' },
]

export function ProcessSteps({ title = 'How It Works', steps = DEFAULT_STEPS }: ProcessStepsProps) {
  return (
    <section className="py-14 lg:py-20 bg-[#F0F4FF]" aria-labelledby="process-heading">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 id="process-heading" className="text-2xl sm:text-3xl font-extrabold text-[#1F2937] text-center mb-12">
          {title}
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {steps.map((step, idx) => (
            <div key={step.number} className="relative text-center">
              {idx < steps.length - 1 && (
                <div className="hidden lg:block absolute top-10 left-1/2 w-full h-0.5 bg-[#C7D9F5]" aria-hidden="true" />
              )}
              <div className="relative z-10 w-20 h-20 mx-auto mb-4 rounded-full bg-white border-2 border-[#4472C4] flex items-center justify-center shadow-sm">
                {step.icon ? (
                  <span className="text-3xl" role="img" aria-label={step.title}>{step.icon}</span>
                ) : (
                  <span className="text-2xl font-extrabold text-[#4472C4]">{step.number}</span>
                )}
              </div>
              <h3 className="font-bold text-[#1F2937] mb-2">{step.title}</h3>
              <p className="text-sm text-[#6B7280] leading-relaxed">{step.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
