'use client'

interface PagePreviewProps {
  brandName?: string
  modelName?: string
  serviceName?: string
  locationName?: string
  metaTitle?: string
  metaDescription?: string
  url?: string
}

export function PagePreview({ brandName, modelName, serviceName, locationName, metaTitle, metaDescription, url }: PagePreviewProps) {
  const h1Parts = [brandName, modelName, serviceName, locationName ? `in ${locationName}` : 'in UAE'].filter(Boolean)
  const displayTitle = metaTitle ?? h1Parts.join(' ')
  const displayDesc = metaDescription ?? `Expert ${h1Parts.slice(0, -1).join(' ')} service. Certified technicians, transparent pricing.`
  const displayUrl = url ?? 'https://carworkshop.ae/brands/...'

  return (
    <div className="border border-[#E5E7EB] rounded-lg p-4 bg-white">
      <p className="text-xs text-[#6B7280] mb-3 font-medium uppercase tracking-wide">Search Result Preview</p>
      <div className="space-y-1">
        <p className="text-sm text-[#6B7280] truncate">{displayUrl}</p>
        <p className="text-[#1A0DAB] text-lg font-medium leading-tight hover:underline cursor-default truncate">{displayTitle}</p>
        <p className="text-[#4D5156] text-sm line-clamp-2">{displayDesc}</p>
      </div>
    </div>
  )
}
