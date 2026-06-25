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

export function HowItWorks() {
  return (
    <section className="py-14 lg:py-20 bg-[#F0F4FF]" aria-labelledby="hiw-heading">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 id="hiw-heading" className="text-2xl sm:text-3xl font-extrabold text-[#1F2937] mb-3">
            How It Works
          </h2>
          <p className="text-[#6B7280] max-w-xl mx-auto">
            Book car service in minutes. We handle everything from quote to completion.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {STEPS.map((item, i) => (
            <div key={item.step} className="relative flex flex-col items-center text-center">
              {i < STEPS.length - 1 && (
                <div className="hidden lg:block absolute top-6 left-[calc(50%+24px)] right-0 h-px bg-[#C7D9F5]" aria-hidden="true" />
              )}
              <div className="w-12 h-12 rounded-full bg-[#4472C4] text-white font-bold text-lg flex items-center justify-center mb-4 relative z-10">
                {item.step}
              </div>
              <h3 className="font-bold text-[#1F2937] mb-2">{item.title}</h3>
              <p className="text-sm text-[#6B7280] leading-relaxed">{item.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
