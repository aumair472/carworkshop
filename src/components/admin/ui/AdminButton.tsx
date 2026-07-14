import Link from 'next/link'

type Variant = 'primary' | 'orange' | 'outline' | 'danger' | 'ghost' | 'success'

const VARIANTS: Record<Variant, string> = {
  primary: 'bg-[#4472C4] text-white hover:bg-[#3560B0]',
  orange: 'bg-[#E8601C] text-white hover:bg-[#D15518]',
  outline: 'border border-zinc-300 text-zinc-700 bg-white hover:bg-zinc-50',
  danger: 'bg-red-500 text-white hover:bg-red-600',
  ghost: 'text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100',
  success: 'bg-[#22C55E] text-white hover:bg-[#16A34A]',
}

const BASE = 'inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-150 disabled:opacity-50 disabled:cursor-not-allowed'

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant
  loading?: boolean
}

export function AdminButton({ variant = 'primary', loading = false, className = '', children, disabled, ...rest }: ButtonProps) {
  return (
    <button className={`${BASE} ${VARIANTS[variant]} ${className}`} disabled={disabled || loading} {...rest}>
      {loading && <span className="h-3.5 w-3.5 rounded-full border-2 border-current border-t-transparent animate-spin" aria-hidden="true" />}
      {children}
    </button>
  )
}

interface LinkButtonProps {
  href: string
  variant?: Variant
  className?: string
  target?: string
  rel?: string
  children: React.ReactNode
}

export function AdminLinkButton({ href, variant = 'outline', className = '', children, ...rest }: LinkButtonProps) {
  return (
    <Link href={href} className={`${BASE} ${VARIANTS[variant]} ${className}`} {...rest}>
      {children}
    </Link>
  )
}
