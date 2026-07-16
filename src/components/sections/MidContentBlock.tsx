import Image from 'next/image'

interface MidContentBlockProps {
  title?: string | null
  description?: string | null
  imageBottom?: string | null
  imageAlt?: string | null
}

// Mid-page content block: bottom image + category title + short description.
export function MidContentBlock({ title, description, imageBottom, imageAlt }: MidContentBlockProps) {
  if (!title && !description && !imageBottom) return null

  return (
    <section className="py-12 lg:py-16 bg-[#F9FAFB]" aria-labelledby="mid-content-heading">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid lg:grid-cols-2 gap-10 items-center">
        {imageBottom && (
          <div className="relative w-full aspect-[4/3] rounded-2xl overflow-hidden bg-white order-2 lg:order-1">
            <Image src={imageBottom} alt={imageAlt || title || ''} fill className="object-cover" sizes="(min-width: 1024px) 50vw, 100vw" />
          </div>
        )}
        <div className="order-1 lg:order-2">
          {title && (
            <h2 id="mid-content-heading" className="display-tight text-balance text-2xl sm:text-3xl font-extrabold text-[#1F2937] mb-4">
              {title}
            </h2>
          )}
          {description && <p className="text-[#6B7280] leading-relaxed">{description}</p>}
        </div>
      </div>
    </section>
  )
}
