'use client'

import { ListingPageEditor } from '@/components/admin/ListingPageEditor'

export default function ServicesListingEditor() {
  return (
    <ListingPageEditor
      slug="services-listing"
      title="Services List Page"
      viewHref="/services"
      defaults={{
        h1: 'Car Services in UAE',
        subtitle: 'From routine oil changes to complex engine repairs — certified technicians, transparent pricing.',
        cta_headline: 'Ready to Book Your Car Service?',
        cta_button_text: 'Get a Free Quote',
        cta_button_link: '/contact',
      }}
    />
  )
}
