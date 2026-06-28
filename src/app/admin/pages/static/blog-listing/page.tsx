'use client'

import { ListingPageEditor } from '@/components/admin/ListingPageEditor'

export default function BlogListingEditor() {
  return (
    <ListingPageEditor
      slug="blog-listing"
      title="Blog List Page"
      viewHref="/blog"
      defaults={{
        h1: 'Car Care Blog',
        subtitle: 'Expert tips, maintenance guides, and automotive news for UAE drivers.',
        cta_headline: 'Ready to Book Your Car Service?',
        cta_button_text: 'Get a Free Quote',
        cta_button_link: '/contact',
      }}
    />
  )
}
