import { redirect } from 'next/navigation'

// Model pages are managed in the SEO Pages module now.
export default function ModelPagesRedirect() {
  redirect('/admin/seo-pages')
}
