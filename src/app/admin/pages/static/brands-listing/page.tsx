'use client'

import { ListingPageEditor } from '@/components/admin/ListingPageEditor'

export default function BrandsListingEditor() {
  return (
    <ListingPageEditor
      slug="brands-listing"
      title="Brands List Page"
      viewHref="/brands"
      defaults={{
        h1: 'Car Brands We Service',
        subtitle: 'Expert service for all major makes. Factory-trained technicians for every brand.',
        cta_headline: 'Ready to Book Your Car Service?',
        cta_button_text: 'Get a Free Quote',
        cta_button_link: '/contact',
      }}
    />
  )
}
