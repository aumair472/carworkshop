import type { Metadata } from 'next'
import { Breadcrumb } from '@/components/ui/Breadcrumb'

export const metadata: Metadata = {
  title: 'Privacy Policy | CarWorkshop.ae',
  description: 'How CarWorkshop.ae collects, uses, and protects your personal data in accordance with UAE data protection laws.',
  alternates: { canonical: 'https://carworkshop.ae/privacy' },
  openGraph: { title: 'Privacy Policy | CarWorkshop.ae', description: 'Our privacy policy.', type: 'website', url: 'https://carworkshop.ae/privacy' },
}

export default function PrivacyPage() {
  return (
    <div>
      <div className="bg-[#F0F4FF] py-10 border-b border-[#C7D9F5]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Breadcrumb items={[{ label: 'Home', href: '/' }, { label: 'Privacy Policy' }]} />
          <h1 className="text-3xl sm:text-4xl font-extrabold text-[#1F2937] mt-4">Privacy Policy</h1>
          <p className="text-[#6B7280] mt-2">Last updated: June 2025</p>
        </div>
      </div>

      <section className="py-14">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 prose prose-slate max-w-none">
          <h2>Information We Collect</h2>
          <p>When you request a quote or contact us, we collect your name, phone number, email address, and details about your vehicle and service needs.</p>

          <h2>How We Use Your Information</h2>
          <ul>
            <li>To respond to your service enquiry and provide quotes</li>
            <li>To schedule and confirm appointments</li>
            <li>To improve our services and website</li>
            <li>To send service reminders (with your consent)</li>
          </ul>

          <h2>Data Sharing</h2>
          <p>We never sell your personal data. We may share it with trusted service partners solely to fulfil your booking. All partners are bound by confidentiality agreements.</p>

          <h2>Cookies</h2>
          <p>We use essential cookies to operate our website and analytics cookies (with your consent) to understand how visitors use our site. You can manage cookie preferences using the banner at the bottom of the page.</p>

          <h2>Data Retention</h2>
          <p>We retain your data for up to 3 years from your last interaction, or as required by UAE law.</p>

          <h2>Your Rights</h2>
          <p>You have the right to access, correct, or delete your personal data. Email us at <a href="mailto:privacy@carworkshop.ae">privacy@carworkshop.ae</a> to exercise these rights.</p>

          <h2>Contact</h2>
          <p>CarWorkshop.ae — Dubai, UAE<br />Email: <a href="mailto:info@carworkshop.ae">info@carworkshop.ae</a></p>
        </div>
      </section>
    </div>
  )
}
