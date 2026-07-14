import { redirect } from 'next/navigation'

// The generated pages list moved to the SEO Pages module.
// Subroutes (generate/, models/, static/, [id]/edit) remain in place.
export default function LegacyPagesRedirect() {
  redirect('/admin/seo-pages')
}
