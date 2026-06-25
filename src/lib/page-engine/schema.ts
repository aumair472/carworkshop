import { generateSlug } from './slugify'

const SITE_URL = 'https://carworkshop.ae'
const SITE_NAME = 'CarWorkshop.ae'
const PHONE = '+971501234567'

interface SchemaContext {
  brand?: string
  model?: string
  service?: string
  location?: string
  price?: number
  url: string
  faqs?: Array<{ question: string; answer: string }>
  breadcrumbs?: Array<{ name: string; url: string }>
}

export function generateServicePageSchema(ctx: SchemaContext): Record<string, unknown> {
  const graph: Record<string, unknown>[] = []

  const name = [ctx.brand, ctx.model, ctx.service].filter(Boolean).join(' ')
  const description = [
    'Professional',
    ctx.brand,
    ctx.model,
    ctx.service,
    ctx.location ? `in ${ctx.location}` : 'in UAE',
  ].filter(Boolean).join(' ')

  graph.push({
    '@type': 'Service',
    name,
    description,
    provider: {
      '@type': 'AutoRepair',
      name: SITE_NAME,
      url: SITE_URL,
      telephone: PHONE,
      areaServed: 'AE',
    },
    areaServed: ctx.location ?? 'UAE',
    ...(ctx.price !== undefined
      ? {
          offers: {
            '@type': 'Offer',
            price: ctx.price.toString(),
            priceCurrency: 'AED',
            availability: 'https://schema.org/InStock',
          },
        }
      : {}),
    url: ctx.url,
  })

  const breadcrumbItems: Array<{ '@type': string; position: number; name: string; item: string }> = [
    { '@type': 'ListItem', position: 1, name: 'Home', item: SITE_URL },
  ]
  if (ctx.brand) {
    breadcrumbItems.push({ '@type': 'ListItem', position: 2, name: ctx.brand, item: `${SITE_URL}/${generateSlug(ctx.brand)}` })
  }
  if (ctx.model) {
    breadcrumbItems.push({ '@type': 'ListItem', position: breadcrumbItems.length + 1, name: ctx.model, item: `${SITE_URL}/${generateSlug(ctx.brand ?? '')}/${generateSlug(ctx.model)}` })
  }
  if (ctx.service) {
    breadcrumbItems.push({ '@type': 'ListItem', position: breadcrumbItems.length + 1, name: ctx.service, item: ctx.url })
  }

  graph.push({
    '@type': 'BreadcrumbList',
    itemListElement: breadcrumbItems,
  })

  if (ctx.faqs && ctx.faqs.length > 0) {
    graph.push({
      '@type': 'FAQPage',
      mainEntity: ctx.faqs.map(faq => ({
        '@type': 'Question',
        name: faq.question,
        acceptedAnswer: {
          '@type': 'Answer',
          text: faq.answer,
        },
      })),
    })
  }

  return {
    '@context': 'https://schema.org',
    '@graph': graph,
  }
}

export function generateOrganizationSchema(): Record<string, unknown> {
  return {
    '@context': 'https://schema.org',
    '@type': 'AutoRepair',
    name: SITE_NAME,
    url: SITE_URL,
    telephone: PHONE,
    areaServed: 'AE',
    priceRange: 'AED 149 - AED 2000',
    openingHours: 'Mo-Su 08:00-20:00',
    image: `${SITE_URL}/og-default.jpg`,
  }
}

export function generateLocalBusinessSchema(location: { name: string; address?: string | null; lat?: number | null; lng?: number | null }): Record<string, unknown> {
  return {
    '@context': 'https://schema.org',
    '@type': 'AutoRepair',
    name: `${SITE_NAME} — ${location.name}`,
    url: `${SITE_URL}/locations/${generateSlug(location.name)}`,
    telephone: PHONE,
    address: {
      '@type': 'PostalAddress',
      addressLocality: location.name,
      addressCountry: 'AE',
      streetAddress: location.address ?? '',
    },
    ...(location.lat && location.lng
      ? {
          geo: {
            '@type': 'GeoCoordinates',
            latitude: location.lat,
            longitude: location.lng,
          },
        }
      : {}),
    openingHours: 'Mo-Su 08:00-20:00',
  }
}
