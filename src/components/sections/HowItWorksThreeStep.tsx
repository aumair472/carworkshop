const STEPS = [
  { step: '01', title: 'Get a Quote', description: 'Tell us your car and service. Get an instant fixed-price quote online.' },
  { step: '02', title: 'Make a Booking', description: 'Pick a time that suits you. Free pickup & delivery or drop by a workshop.' },
  { step: '03', title: 'We Repair', description: 'Certified technicians complete the job with genuine parts and a 12-month warranty.' },
]

// Static 3-step "how it works" strip used on service pages (template_1).
export function HowItWorksThreeStep() {
  return (
    <section className="py-14 lg:py-20 bg-[#F9FAFB]" aria-labelledby="hiw3-heading">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 id="hiw3-heading" className="display-tight text-balance text-2xl sm:text-3xl font-extrabold text-[#1F2937] text-center mb-10">
          How It Works
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          {STEPS.map(item => (
            <div key={item.step} className="flex flex-col items-center text-center">
              <div className="w-14 h-14 rounded-2xl bg-[#4472C4] text-white font-extrabold text-lg flex items-center justify-center mb-4">
                {item.step}
              </div>
              <h3 className="font-bold text-[#1F2937] mb-2">{item.title}</h3>
              <p className="text-sm text-[#6B7280] leading-relaxed max-w-[16rem]">{item.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
