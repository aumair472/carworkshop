import Image from 'next/image'

interface ServiceSectionWithImageProps {
  title?: string
  description?: string
  imageDesktop?: string | null
  imageMobile?: string | null
}

// Text block paired with a large desktop image (swapped for a mobile-optimised
// image below the `sm` breakpoint).
export function ServiceSectionWithImage({ title, description, imageDesktop, imageMobile }: ServiceSectionWithImageProps) {
  if (!title && !description && !imageDesktop) return null

  return (
    <section className="py-14 lg:py-20 bg-white" aria-labelledby="service-section-heading">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid lg:grid-cols-2 gap-10 items-center">
        <div>
          {title && (
            <h2 id="service-section-heading" className="display-tight text-balance text-2xl sm:text-3xl font-extrabold text-[#1F2937] mb-4">
              {title}
            </h2>
          )}
          {description && <p className="text-[#6B7280] leading-relaxed">{description}</p>}
        </div>
        {(imageDesktop || imageMobile) && (
          <div className="relative w-full aspect-[4/3] rounded-2xl overflow-hidden bg-[#F9FAFB]">
            {imageDesktop && (
              <Image src={imageDesktop} alt={title || ''} fill className={`object-cover ${imageMobile ? 'hidden sm:block' : ''}`} sizes="(min-width: 1024px) 50vw, 100vw" />
            )}
            {imageMobile && (
              <Image src={imageMobile} alt={title || ''} fill className="object-cover sm:hidden" sizes="100vw" />
            )}
          </div>
        )}
      </div>
    </section>
  )
}
