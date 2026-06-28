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
    <section className="py-16 lg:py-24 bg-mesh" aria-labelledby="process-heading">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 id="process-heading" className="display-tight text-balance text-3xl sm:text-4xl font-extrabold text-[#0F172A] text-center mb-14">
          {title}
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {steps.map((step, idx) => (
            <div key={step.number} className="relative text-center">
              {idx < steps.length - 1 && (
                <div className="hidden lg:block absolute top-10 left-[calc(50%+40px)] right-0 h-0.5 bg-gradient-to-r from-[#C7D9F5] to-transparent" aria-hidden="true" />
              )}
              <div className="relative z-10 w-20 h-20 mx-auto mb-5 rounded-3xl bg-white ring-1 ring-[#DCE6F6] flex items-center justify-center shadow-[var(--shadow-elevated)]">
                {step.icon ? (
                  <span className="text-3xl" role="img" aria-label={step.title}>{step.icon}</span>
                ) : (
                  <span className="text-2xl font-extrabold text-[#4472C4]">{step.number}</span>
                )}
              </div>
              <h3 className="font-bold text-[#0F172A] mb-2">{step.title}</h3>
              <p className="text-sm text-[#64748B] leading-relaxed max-w-[16rem] mx-auto">{step.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
