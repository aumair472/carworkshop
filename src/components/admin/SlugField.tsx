'use client'

import { useState, useEffect } from 'react'
import { Input } from '@/components/ui/Input'

interface SlugFieldProps {
  name: string
  value: string
  sourceValue?: string
  onChange: (slug: string) => void
  disabled?: boolean
}

function toSlug(str: string): string {
  return str
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
}

export function SlugField({ name, value, sourceValue, onChange, disabled }: SlugFieldProps) {
  const [locked, setLocked] = useState(!!value)

  useEffect(() => {
    if (!locked && sourceValue) {
      onChange(toSlug(sourceValue))
    }
  }, [sourceValue, locked, onChange])

  return (
    <div className="space-y-1">
      <div className="flex items-center gap-2">
        <Input
          label="Slug"
          name={name}
          value={value}
          onChange={e => onChange(e.target.value)}
          disabled={disabled}
          placeholder="auto-generated-from-name"
          className="font-mono text-sm"
        />
        <button
          type="button"
          onClick={() => {
            setLocked(!locked)
            if (locked && sourceValue) onChange(toSlug(sourceValue))
          }}
          className="mt-6 px-3 py-2 text-xs border border-[#D1D5DB] rounded-md hover:bg-[#F9FAFB] text-[#6B7280]"
          title={locked ? 'Unlock to auto-generate' : 'Lock to prevent overwrite'}
        >
          {locked ? '🔒' : '🔓'}
        </button>
      </div>
      {!locked && <p className="text-xs text-[#9CA3AF]">Auto-generated from name. Click 🔒 to edit manually.</p>}
    </div>
  )
}
