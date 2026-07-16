import Link from 'next/link'
import { sanitizeHTML } from '@/lib/sanitize'
import { InlineBookingForm } from '@/components/sections/InlineBookingForm'
import { HowItWorks } from '@/components/sections/HowItWorks'
import { ServiceCardsSection } from '@/components/sections/ServiceCardsSection'
import { WarrantyTabs } from '@/components/sections/WarrantyTabs'
import { PackagePricingTable } from '@/components/sections/PackagePricingTable'
import { FAQSection } from '@/components/sections/FAQSection'
import { LocationPills } from '@/components/sections/LocationPills'
import { CountdownTimer } from '@/components/sections/CountdownTimer'
import type { FAQItem, Location, PageContent, ServiceWithPrice } from '@/types'

export interface BrandPageRow {
  h1: string
  highlight_text?: string | null
  image_png_url?: string | null
  image_webp_url?: string | null
  image_alt?: string | null
  short_description?: string | null
}

interface BrandPageTemplateProps {
  page: BrandPageRow
  content: PageContent | null
  mainContentHtml?: string | null
  sourcePageSlug: string
  services?: ServiceWithPrice[]
  locations?: Location[]
  faqs?: FAQItem[]
  brandSlug?: string
}

// SMC-style "Brand Page" template (generated_pages.template === 'template_2' /
// unset), reskinned in CarWorkshop.ae colors. All rich-HTML content_json/DB
// fields are sanitized before dangerouslySetInnerHTML.
export function BrandPageTemplate({
  page,
  content,
  mainContentHtml,
  sourcePageSlug,
  services = [],
  locations = [],
  faqs = [],
  brandSlug,
}: BrandPageTemplateProps) {
  const heroImage = page.image_webp_url || page.image_png_url

  return (
    <>
      {/* Hero with offer + countdown + lead form */}
      <section className="relative overflow-hidden bg-mesh-dark border-b border-hairline">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14 lg:py-20 grid lg:grid-cols-2 gap-10 items-center">
          <div>
            {page.highlight_text && (
              <span className="inline-flex items-center gap-1.5 mb-4 px-3 py-1 text-xs font-semibold tracking-wide rounded-full bg-white/10 text-white ring-1 ring-white/20">
                {page.highlight_text}
              </span>
            )}
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white leading-tight mb-4">
              {content?.hero?.h1 || page.h1}
            </h1>
            {(content?.hero?.subheadline || page.short_description) && (
              <p className="text-lg text-[#D6E4F7] mb-6 max-w-xl">
                {content?.hero?.subheadline || page.short_description}
              </p>
            )}
            <CountdownTimer />
          </div>
          <div>
            {/* TODO(lead-form): posts to existing /api/leads route via InlineBookingForm
                ({ name, phone, message, honeypot, source_page_slug }). If a brand_id
                field is later added to CreateLeadSchema, wire the brand's id through
                as an extra hidden field here. */}
            <InlineBookingForm
              sourcePageSlug={sourcePageSlug}
              prefillMessage={`I'd like to book a service for my ${page.h1}.`}
              heading={`Book ${page.h1} Service`}
            />
          </div>
        </div>
      </section>

      {/* Quick service link cards */}
      {content?.quick_service_links && content.quick_service_links.length > 0 && (
        <section className="py-12" aria-labelledby="quick-links-heading">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 id="quick-links-heading" className="text-2xl font-extrabold text-[#1F2937] text-center mb-8">Quick Services</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              {content.quick_service_links.map((link, i) => (
                <Link key={i} href={link.href} className="group card-premium flex flex-col items-center gap-2 p-5 text-center">
                  <span className="text-2xl" aria-hidden="true">{link.icon || '🔧'}</span>
                  <span className="text-sm font-semibold text-[#1F2937] group-hover:text-[#4472C4] transition-colors">{link.label}</span>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* 4-step how it works */}
      {content?.how_it_works && (
        <HowItWorks
          steps={[1, 2, 3, 4].flatMap(n => {
            const title = content.how_it_works?.[`step${n}_title` as keyof typeof content.how_it_works]
            const description = content.how_it_works?.[`step${n}_desc` as keyof typeof content.how_it_works]
            return title && description ? [{ title, description }] : []
          })}
        />
      )}

      {/* Price guarantee banner */}
      {content?.price_guarantee_text && (
        <section className="py-4 bg-[#4472C4]" aria-label="Price guarantee">
          <p className="text-center text-white font-semibold text-sm sm:text-base px-4">{content.price_guarantee_text}</p>
        </section>
      )}

      {/* App section */}
      {content?.app_section?.show && (
        <section className="py-14 bg-[#1F2937]" aria-labelledby="app-heading">
          <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 id="app-heading" className="text-2xl sm:text-3xl font-extrabold text-white mb-6">
              {content.app_section.title || 'Book Faster With Our App'}
            </h2>
            {content.app_section.steps && content.app_section.steps.length > 0 && (
              <ol className="space-y-2 text-left max-w-md mx-auto">
                {content.app_section.steps.map((step, i) => (
                  <li key={i} className="flex items-start gap-3 text-[#D6E4F7]">
                    <span className="shrink-0 w-6 h-6 rounded-full bg-[#4472C4] text-white text-xs font-bold flex items-center justify-center">{i + 1}</span>
                    {step}
                  </li>
                ))}
              </ol>
            )}
          </div>
        </section>
      )}

      {/* Brand description */}
      {(mainContentHtml || heroImage) && (
        <section className="py-14 lg:py-20" aria-labelledby="brand-desc-heading">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid lg:grid-cols-2 gap-10 items-center">
            {heroImage && (
              <div className="relative w-full aspect-[4/3] rounded-2xl overflow-hidden bg-[#F9FAFB]">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={heroImage} alt={page.image_alt || page.h1} className="w-full h-full object-cover" />
              </div>
            )}
            {mainContentHtml && (
              <div className="rich-content" dangerouslySetInnerHTML={{ __html: sanitizeHTML(mainContentHtml) }} />
            )}
          </div>
        </section>
      )}

      {/* Services grid */}
      {services.length > 0 && (
        <ServiceCardsSection services={services} title={`${page.h1} Services`} brandSlug={brandSlug} />
      )}

      {/* Warranty policy tabs */}
      {content?.warranty_policy && <WarrantyTabs policy={content.warranty_policy} />}

      {/* Package pricing table */}
      {content?.service_packages && content.service_packages.length > 0 && (
        <PackagePricingTable packages={content.service_packages} />
      )}

      {/* Cost description / why important / why choose us (brand) */}
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

      {/* FAQ accordion (native details/summary via existing Accordion) */}
      {faqs.length > 0 && <FAQSection faqs={faqs} title={`${page.h1} — FAQ`} />}

      {/* Other locations */}
      {locations.length > 0 && <LocationPills locations={locations} brandSlug={brandSlug} />}
    </>
  )
}
