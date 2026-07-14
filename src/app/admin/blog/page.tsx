import { redirect } from 'next/navigation'

// Blog management moved to the SEO Blog module.
export default function LegacyBlogRedirect() {
  redirect('/admin/seo-blog')
}
