const STEPS = [
  {
    step: '01',
    title: 'Choose Your Service',
    description: 'Select from our wide range of car repair and maintenance services.',
  },
  {
    step: '02',
    title: 'Pick Your Location',
    description: 'Find a workshop near you or request doorstep service anywhere in UAE.',
  },
  {
    step: '03',
    title: 'Book & Confirm',
    description: 'Get an instant quote. Book online or call us — no deposit needed.',
  },
  {
    step: '04',
    title: 'Get Your Car Fixed',
    description: 'Our certified technician completes the job. Drive away with confidence.',
  },
]

interface HowItWorksProps {
  heading?: string
  steps?: Array<{ icon?: string; title: string; description: string }>
}

export function HowItWorks({ heading, steps }: HowItWorksProps = {}) {
  const items = steps && steps.length > 0
    ? steps.map((s, i) => ({ step: s.icon || String(i + 1).padStart(2, '0'), title: s.title, description: s.description }))
    : STEPS
  return (
    <section className="py-16 lg:py-24 bg-mesh" aria-labelledby="hiw-heading">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12 max-w-2xl mx-auto">
          <h2 id="hiw-heading" className="display-tight text-balance text-3xl sm:text-4xl font-extrabold text-[#0F172A] mb-3">
            {heading || 'How It Works'}
          </h2>
          <p className="text-pretty text-[#64748B] text-lg">
            Book car service in minutes. We handle everything from quote to completion.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {items.map((item, i) => (
            <div key={i} className="relative flex flex-col items-center text-center">
              {i < items.length - 1 && (
                <div className="hidden lg:block absolute top-8 left-[calc(50%+32px)] right-0 h-0.5 bg-gradient-to-r from-[#C7D9F5] to-transparent" aria-hidden="true" />
              )}
              <div className="w-16 h-16 rounded-2xl bg-gradient-primary text-white font-extrabold text-xl flex items-center justify-center mb-5 relative z-10 shadow-[0_10px_24px_-8px_rgba(68,114,196,0.6)]">
                {item.step}
              </div>
              <h3 className="font-bold text-[#0F172A] mb-2">{item.title}</h3>
              <p className="text-sm text-[#64748B] leading-relaxed max-w-[16rem]">{item.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
