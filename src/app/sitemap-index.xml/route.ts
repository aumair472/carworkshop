import { getShardCount } from '@/app/sitemap'

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://carworkshop.ae'

// Next's generateSitemaps emits /sitemap/0.xml, /sitemap/1.xml, … but no index
// file. Search engines need one entry point, so we build the <sitemapindex>
// ourselves and point robots.txt here.
export const revalidate = 21600

export async function GET() {
  const shards = await getShardCount()
  const now = new Date().toISOString()
  const entries = Array.from({ length: shards }, (_, i) =>
    `  <sitemap><loc>${BASE_URL}/sitemap/${i}.xml</loc><lastmod>${now}</lastmod></sitemap>`,
  ).join('\n')

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${entries}
</sitemapindex>`

  return new Response(xml, {
    headers: { 'Content-Type': 'application/xml', 'Cache-Control': 'public, max-age=21600, s-maxage=21600' },
  })
}
