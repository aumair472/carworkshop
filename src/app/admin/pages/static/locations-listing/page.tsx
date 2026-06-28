'use client'

import { ListingPageEditor } from '@/components/admin/ListingPageEditor'

export default function LocationsListingEditor() {
  return (
    <ListingPageEditor
      slug="locations-listing"
      title="Locations List Page"
      viewHref="/locations"
      defaults={{
        h1: 'Car Service Locations in UAE',
        subtitle: 'Find a workshop near you or book doorstep service anywhere across UAE.',
        cta_headline: 'Ready to Book Your Car Service?',
        cta_button_text: 'Get a Free Quote',
        cta_button_link: '/contact',
      }}
    />
  )
}
