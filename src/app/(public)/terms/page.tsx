import type { Metadata } from 'next'
import { Breadcrumb } from '@/components/ui/Breadcrumb'

export const metadata: Metadata = {
  title: 'Terms & Conditions | CarWorkshop.ae',
  description: 'Terms and conditions for using CarWorkshop.ae car service platform in the UAE.',
  alternates: { canonical: 'https://carworkshop.ae/terms' },
  openGraph: { title: 'Terms & Conditions | CarWorkshop.ae', description: 'Our terms and conditions.', type: 'website', url: 'https://carworkshop.ae/terms' },
}

export default function TermsPage() {
  return (
    <div>
      <div className="bg-[#F0F4FF] py-10 border-b border-[#C7D9F5]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Breadcrumb items={[{ label: 'Home', href: '/' }, { label: 'Terms & Conditions' }]} />
          <h1 className="text-3xl sm:text-4xl font-extrabold text-[#1F2937] mt-4">Terms & Conditions</h1>
          <p className="text-[#6B7280] mt-2">Last updated: June 2025</p>
        </div>
      </div>

      <section className="py-14">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 prose prose-slate max-w-none">
          <h2>Acceptance of Terms</h2>
          <p>By using CarWorkshop.ae you agree to these terms. If you do not agree, please do not use our services.</p>

          <h2>Services</h2>
          <p>CarWorkshop.ae connects customers with certified car service technicians in the UAE. All prices are in AED and include VAT.</p>

          <h2>Booking & Payments</h2>
          <ul>
            <li>A booking is confirmed once you receive a confirmation call or message from our team.</li>
            <li>Payment is due upon completion of service.</li>
            <li>We reserve the right to adjust quotes if the vehicle condition differs materially from what was described.</li>
          </ul>

          <h2>Warranty</h2>
          <p>All services carry a 12-month or 20,000 km warranty on parts and labour. This warranty is void if the vehicle is serviced by a third party after our work.</p>

          <h2>Cancellation Policy</h2>
          <p>Cancellations must be made at least 2 hours before the scheduled appointment. Late cancellations or no-shows may incur a AED 50 fee.</p>

          <h2>Liability</h2>
          <p>CarWorkshop.ae is not liable for pre-existing vehicle conditions not disclosed at the time of booking. Our liability is limited to the cost of the service performed.</p>

          <h2>Governing Law</h2>
          <p>These terms are governed by UAE law. Any disputes shall be subject to the jurisdiction of Dubai courts.</p>

          <h2>Contact</h2>
          <p>CarWorkshop.ae — Dubai, UAE<br />Email: <a href="mailto:info@carworkshop.ae">info@carworkshop.ae</a></p>
        </div>
      </section>
    </div>
  )
}
