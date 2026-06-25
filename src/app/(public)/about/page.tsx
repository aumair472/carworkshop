import type { Metadata } from 'next'
import { WhyChooseUs } from '@/components/sections/WhyChooseUs'
import { CTABanner } from '@/components/sections/CTABanner'
import { TrustBar } from '@/components/sections/TrustBar'
import { Breadcrumb } from '@/components/ui/Breadcrumb'
import { generateOrganizationSchema } from '@/lib/page-engine/schema'

export const metadata: Metadata = {
  title: 'About CarWorkshop.ae | Trusted Car Service in UAE',
  description: 'CarWorkshop.ae is UAE\'s trusted car repair platform connecting drivers with certified technicians for fast, transparent, and affordable car care.',
  alternates: { canonical: 'https://carworkshop.ae/about' },
  openGraph: { title: 'About CarWorkshop.ae | Trusted Car Service in UAE', description: 'CarWorkshop.ae is UAE\'s trusted car repair platform.', type: 'website', url: 'https://carworkshop.ae/about' },
}

export default function AboutPage() {
  const schema = generateOrganizationSchema()
  return (
    <div>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />
      <div className="bg-[#F0F4FF] py-10 border-b border-[#C7D9F5]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Breadcrumb items={[{ label: 'Home', href: '/' }, { label: 'About' }]} />
          <h1 className="text-3xl sm:text-4xl font-extrabold text-[#1F2937] mt-4">
            About CarWorkshop.ae
          </h1>
          <p className="text-[#6B7280] mt-2 max-w-xl">
            UAE&apos;s trusted platform for transparent, reliable car repair and maintenance.
          </p>
        </div>
      </div>

      <TrustBar />

      <section className="py-14">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 prose prose-slate max-w-none">
          <h2>Our Mission</h2>
          <p>
            CarWorkshop.ae was founded with one goal: make car repair honest, convenient, and accessible for every driver in the UAE.
            We partner with the best certified workshops and mobile technicians across all seven emirates to deliver transparent pricing, quality parts, and guaranteed workmanship.
          </p>

          <h2>What We Do</h2>
          <p>
            From routine oil changes and brake inspections to complex engine diagnostics and AC repairs, CarWorkshop.ae covers every aspect of car care.
            Our platform lets you book online in minutes, get a fixed quote upfront, and choose between workshop drop-off or convenient doorstep service.
          </p>

          <h2>Our Standards</h2>
          <ul>
            <li>Every technician is manufacturer-certified and background-verified</li>
            <li>Genuine or OEM-equivalent parts used on every job</li>
            <li>12-month / 20,000 km warranty on all parts and labour</li>
            <li>Upfront fixed pricing — no hidden fees, ever</li>
            <li>Real-time updates on your service status</li>
          </ul>

          <h2>Serving All of UAE</h2>
          <p>
            We operate across Dubai, Abu Dhabi, Sharjah, Ajman, Ras Al Khaimah, Fujairah, and Umm Al Quwain.
            Whether you&apos;re at home, at work, or at the roadside — we come to you.
          </p>
        </div>
      </section>

      <WhyChooseUs />
      <CTABanner />
    </div>
  )
}
