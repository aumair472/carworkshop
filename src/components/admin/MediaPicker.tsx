'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import { Button } from '@/components/ui/Button'

interface MediaItem {
  id: string
  url: string
  filename: string
  original_name: string
  mime_type: string
}

interface MediaPickerProps {
  value: string | null
  onChange: (url: string | null) => void
  label?: string
}

export function MediaPicker({ value, onChange, label = 'Image' }: MediaPickerProps) {
  const [open, setOpen] = useState(false)
  const [media, setMedia] = useState<MediaItem[]>([])
  const [loaded, setLoaded] = useState(false)
  const [uploading, setUploading] = useState(false)

  useEffect(() => {
    if (!open || loaded) return
    const controller = new AbortController()
    fetch('/api/admin/media', { signal: controller.signal })
      .then(r => r.ok ? r.json() : null)
      .then((data: { media: MediaItem[] } | null) => {
        setMedia(data?.media ?? [])
        setLoaded(true)
      })
      .catch(() => setLoaded(true))
    return () => controller.abort()
  }, [open, loaded])

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    try {
      const form = new FormData()
      form.append('file', file)
      const res = await fetch('/api/admin/media', { method: 'POST', body: form })
      if (!res.ok) return
      const data = await res.json() as { media: MediaItem }
      setMedia(prev => [data.media, ...prev])
    } finally {
      setUploading(false)
    }
  }

  return (
    <div>
      <label className="block text-sm font-medium text-[#374151] mb-2">{label}</label>
      {value ? (
        <div className="flex items-center gap-3">
          <div className="relative w-20 h-20 rounded-md overflow-hidden border border-[#E5E7EB]">
            <Image src={value} alt="Selected media" fill className="object-cover" />
          </div>
          <Button variant="secondary" size="sm" onClick={() => onChange(null)}>Remove</Button>
        </div>
      ) : (
        <Button variant="secondary" size="sm" onClick={() => setOpen(true)}>Select Image</Button>
      )}

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" role="dialog" aria-label="Media picker">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl mx-4 max-h-[80vh] flex flex-col">
            <div className="flex items-center justify-between p-4 border-b border-[#E5E7EB]">
              <h2 className="text-lg font-bold text-[#1F2937]">Select Image</h2>
              <div className="flex items-center gap-2">
                <label className="px-3 py-1.5 text-xs font-medium border border-[#D1D5DB] rounded-md cursor-pointer hover:bg-[#F9FAFB]">
                  {uploading ? 'Uploading...' : 'Upload New'}
                  <input type="file" accept="image/*" className="sr-only" onChange={handleUpload} disabled={uploading} />
                </label>
                <button onClick={() => setOpen(false)} className="text-[#6B7280] hover:text-[#374151]">✕</button>
              </div>
            </div>
            <div className="flex-1 overflow-y-auto p-4">
              {!loaded ? (
                <div className="text-center py-8 text-[#9CA3AF] text-sm">Loading media...</div>
              ) : (
                <div className="grid grid-cols-4 gap-3">
                  {media.map(item => (
                    <button
                      key={item.id}
                      onClick={() => { onChange(item.url); setOpen(false) }}
                      className="relative aspect-square rounded-md overflow-hidden border-2 border-transparent hover:border-[#4472C4] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#4472C4]"
                    >
                      <Image src={item.url} alt={item.original_name} fill className="object-cover" />
                    </button>
                  ))}
                  {media.length === 0 && loaded && (
                    <p className="col-span-4 text-center text-[#9CA3AF] text-sm py-8">No media found. Upload an image to get started.</p>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
