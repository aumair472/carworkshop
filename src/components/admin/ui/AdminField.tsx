import { useId } from 'react'
import { CharCounter } from './CharCounter'

const INPUT_BASE = 'w-full border border-zinc-300 rounded-lg px-3 py-2.5 text-sm text-zinc-900 placeholder:text-zinc-400 bg-white focus:outline-none focus:ring-2 focus:ring-[#4472C4] focus:border-transparent transition-all duration-150 disabled:bg-zinc-50 disabled:text-zinc-400'

export function AdminLabel({ children, htmlFor, required, hint }: { children: React.ReactNode; htmlFor?: string; required?: boolean; hint?: string }) {
  return (
    <label htmlFor={htmlFor} className="flex items-center justify-between text-sm font-medium text-zinc-700 mb-1.5">
      <span>{children}{required && <span className="text-red-500 ml-0.5">*</span>}</span>
      {hint && <span className="text-xs font-normal text-zinc-400">{hint}</span>}
    </label>
  )
}

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string
  required?: boolean
  maxCount?: number
  hint?: string
}

export function AdminInput({ label, required, maxCount, hint, className = '', value, id, ...rest }: InputProps) {
  const autoId = useId()
  const fieldId = id ?? autoId
  return (
    <div>
      {label && <AdminLabel htmlFor={fieldId} required={required} hint={hint}>{label}</AdminLabel>}
      <input id={fieldId} aria-label={label} className={`${INPUT_BASE} ${className}`} value={value} required={required} {...rest} />
      {maxCount != null && <CharCounter length={String(value ?? '').length} max={maxCount} />}
    </div>
  )
}

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string
  required?: boolean
  maxCount?: number
  hint?: string
}

export function AdminTextarea({ label, required, maxCount, hint, className = '', value, id, rows = 4, ...rest }: TextareaProps) {
  const autoId = useId()
  const fieldId = id ?? autoId
  return (
    <div>
      {label && <AdminLabel htmlFor={fieldId} required={required} hint={hint}>{label}</AdminLabel>}
      <textarea id={fieldId} aria-label={label} rows={rows} className={`${INPUT_BASE} min-h-[96px] resize-y ${className}`} value={value} required={required} {...rest} />
      {maxCount != null && <CharCounter length={String(value ?? '').length} max={maxCount} />}
    </div>
  )
}

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string
  required?: boolean
  options: Array<{ value: string; label: string }>
}

export function AdminSelect({ label, required, options, className = '', id, ...rest }: SelectProps) {
  return (
    <div>
      {label && <AdminLabel htmlFor={id} required={required}>{label}</AdminLabel>}
      <div className="relative">
        <select id={id} className={`${INPUT_BASE} appearance-none pr-9 ${className}`} required={required} {...rest}>
          {options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>
        <svg className="w-4 h-4 text-zinc-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
      </div>
    </div>
  )
}
