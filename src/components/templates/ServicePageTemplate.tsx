import { sanitizeHTML } from '@/lib/sanitize'
import { InlineBookingForm } from '@/components/sections/InlineBookingForm'
import { PackageCards } from '@/components/sections/PackageCards'
import { HowItWorksThreeStep } from '@/components/sections/HowItWorksThreeStep'
import { MidContentBlock } from '@/components/sections/MidContentBlock'
import { ServiceSectionWithImage } from '@/components/sections/ServiceSectionWithImage'
import { KeyPointsGrid } from '@/components/sections/KeyPointsGrid'
import { ContactCtaBar } from '@/components/sections/ContactCtaBar'
import { WhyChooseUs } from '@/components/sections/WhyChooseUs'
import { ReviewsCarousel } from '@/components/sections/ReviewsCarousel'
import { LocationPills } from '@/components/sections/LocationPills'
import { RelatedServices } from '@/components/sections/RelatedServices'
import { BrandsGrid } from '@/components/sections/BrandsGrid'
import { CTABanner } from '@/components/sections/CTABanner'
import type { Brand, Location, ServiceWithPrice, PageContent } from '@/types'

// Minimal shape of the generated_pages flat columns this template consumes.
// Kept independent from the (not-yet-regenerated) Database['generated_pages']
// type so this template doesn't require a schema/types sync to compile.
export interface ServicePageRow {
  h1: string
  highlight_text?: string | null
  key_points?: string | null
  icon_image_png_url?: string | null
  icon_image_webp_url?: string | null
  icon_image_alt?: string | null
  image_png_url?: string | null
  image_webp_url?: string | null
  image_alt?: string | null
  image_bottom_png_url?: string | null
  image_bottom_webp_url?: string | null
  image_bottom_alt?: string | null
  image_large_url?: string | null
  image_mobile_url?: string | null
  short_description?: string | null
  mid_category_title?: string | null
}

interface ServicePageTemplateProps {
  page: ServicePageRow
  content: PageContent | null
  mainContentHtml?: string | null
  sourcePageSlug: string
  brands?: Brand[]
  locations?: Location[]
  relatedServices?: ServiceWithPrice[]
  currentServiceId?: string
  brandSlug?: string
  modelSlug?: string
  serviceSlug?: string
}

// SMC-style "Service Page" template (generated_pages.template === 'template_1'),
// reskinned in CarWorkshop.ae colors. Every rich-HTML field is sanitized before
// being rendered via dangerouslySetInnerHTML.
export function ServicePageTemplate({
  page,
  content,
  mainContentHtml,
  sourcePageSlug,
  brands = [],
  locations = [],
  relatedServices = [],
  currentServiceId,
  brandSlug,
  modelSlug,
  serviceSlug,
}: ServicePageTemplateProps) {
  const keyPoints = (page.key_points ?? '').split(';').map(s => s.trim()).filter(Boolean)
  const heroImage = page.image_webp_url || page.image_png_url || content?.hero?.image_url || undefined

  return (
    <>
      {/* 1. Hero: H1 + key points checklist + inline booking form + hero image */}
      <section className="bg-[#F9FAFB] border-b border-[#E5E7EB]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16 grid lg:grid-cols-2 gap-10 items-start">
          <div>
            <h1 className="text-3xl sm:text-4xl font-extrabold uppercase text-[#1F2937] leading-tight mb-4">
              {content?.hero?.h1 || page.h1}
            </h1>
            {(content?.hero?.subheadline || page.highlight_text) && (
              <p className="text-lg text-[#6B7280] mb-6 max-w-xl">
                {content?.hero?.subheadline || page.highlight_text}
              </p>
            )}
            {keyPoints.length > 0 && (
              <ul className="space-y-2.5 mb-6">
                {keyPoints.map((point, i) => (
                  <li key={i} className="flex items-center gap-2 text-[#374151] font-medium">
                    <span className="text-[#4472C4]">✓</span>{point}
                  </li>
                ))}
              </ul>
            )}
            {heroImage && (
              <div className="relative w-full aspect-video rounded-2xl overflow-hidden mt-6 hidden sm:block">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={heroImage} alt={page.image_alt || page.h1} className="w-full h-full object-cover" />
              </div>
            )}
          </div>
          <div className="lg:pl-6">
            <InlineBookingForm
              sourcePageSlug={sourcePageSlug}
              prefillMessage={`I'd like to book ${page.h1}.`}
              heading="Get a Free Quote"
            />
          </div>
        </div>
      </section>

      {/* 2. Service package cards */}
      {content?.service_packages && content.service_packages.length > 0 && (
        <PackageCards packages={content.service_packages} />
      )}

      {/* 3. How It Works (3 steps) */}
      <HowItWorksThreeStep />

      {/* 4. Mid content block */}
      <MidContentBlock
        title={page.mid_category_title}
        description={page.short_description}
        imageBottom={page.image_bottom_webp_url || page.image_bottom_png_url}
        imageAlt={page.image_bottom_alt}
      />

      {/* 5. Service section with image */}
      <ServiceSectionWithImage
        title={content?.service_section?.title}
        description={content?.service_section?.description}
        imageDesktop={page.image_large_url}
        imageMobile={page.image_mobile_url}
      />

      {/* 6. Key points icon grid */}
      <KeyPointsGrid points={keyPoints} icons={content?.key_points_icons} />

      {/* 7. Contact CTA bar */}
      <ContactCtaBar />

      {/* 8. Complete description (sanitized rich HTML) */}
      {mainContentHtml && (
        <section className="py-12">
          <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 rich-content" dangerouslySetInnerHTML={{ __html: sanitizeHTML(mainContentHtml) }} />
        </section>
      )}

      {/* 8b. Cost description / why important / why choose us (brand) — same
          content_json fields BrandPageTemplate renders, now also on this template. */}
      {(content?.cost_description || content?.why_important || content?.why_choose_us_brand) && (
        <section className="py-12 bg-[#F9FAFB]">
          <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
            {content.cost_description && (
              <div className="rich-content" dangerouslySetInnerHTML={{ __html: sanitizeHTML(content.cost_description) }} />
            )}
            {content.why_important && (
              <div className="rich-content" dangerouslySetInnerHTML={{ __html: sanitizeHTML(content.why_important) }} />
            )}
            {content.why_choose_us_brand && (
              <div className="rich-content" dangerouslySetInnerHTML={{ __html: sanitizeHTML(content.why_choose_us_brand) }} />
            )}
          </div>
        </section>
      )}

      {/* 9. Why Choose Us */}
      <WhyChooseUs heading={content?.why_choose_us?.heading} items={content?.why_choose_us?.items} />

      {/* 10. Reviews carousel */}
      <ReviewsCarousel
        reviews={content?.reviews?.map(r => ({ name: r.name, rating: r.rating, text: r.text, service: page.h1 }))}
      />

      {/* 11. Popular Locations pills */}
      {locations.length > 0 && (
        <LocationPills locations={locations} brandSlug={brandSlug} modelSlug={modelSlug} serviceSlug={serviceSlug} />
      )}

      {/* 12. Popular Services links */}
      {relatedServices.length > 0 && (
        <RelatedServices services={relatedServices} brandSlug={brandSlug} modelSlug={modelSlug} currentServiceId={currentServiceId} />
      )}

      {/* 13. Find Your Car Make grid */}
      {brands.length > 0 && <BrandsGrid brands={brands} title="Find Your Car Make" />}

      {/* 14. Footer CTA bar */}
      <CTABanner
        title={content?.cta?.headline || `Book ${page.h1} Today`}
        {...(content?.cta?.button_text ? { ctaLabel: content.cta.button_text } : {})}
        {...(content?.cta?.button_link ? { ctaHref: content.cta.button_link } : {})}
      />
    </>
  )
}
