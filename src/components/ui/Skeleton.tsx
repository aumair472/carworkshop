interface SkeletonProps {
  className?: string
  lines?: number
}

export function Skeleton({ className = '' }: SkeletonProps) {
  return (
    <div className={['animate-pulse bg-[#E5E7EB] rounded-md', className].join(' ')} aria-hidden="true" />
  )
}

export function ServiceCardSkeleton() {
  return (
    <div className="bg-white rounded-lg border border-[#E5E7EB] p-6 space-y-4">
      <Skeleton className="w-12 h-12 rounded-md" />
      <Skeleton className="h-5 w-3/4" />
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-4 w-2/3" />
      <Skeleton className="h-5 w-1/3" />
      <Skeleton className="h-10 w-full" />
    </div>
  )
}

export function TableRowSkeleton({ cols = 4 }: { cols?: number }) {
  return (
    <tr>
      {Array.from({ length: cols }).map((_, i) => (
        <td key={i} className="px-4 py-3">
          <Skeleton className="h-4 w-full" />
        </td>
      ))}
    </tr>
  )
}

export function BlogCardSkeleton() {
  return (
    <div className="bg-white rounded-lg border border-[#E5E7EB] overflow-hidden">
      <Skeleton className="h-48 w-full rounded-none" />
      <div className="p-4 space-y-3">
        <Skeleton className="h-5 w-full" />
        <Skeleton className="h-4 w-4/5" />
        <Skeleton className="h-4 w-1/2" />
      </div>
    </div>
  )
}
