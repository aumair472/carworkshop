import { createServiceClient } from '@/lib/supabase/service'

const ALLOWED_MIME_TYPES = [
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif',
  'image/svg+xml',
] as const

const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024 // 5 MB
const BUCKET = 'media'

export interface UploadResult {
  url: string
  path: string
  size: number
  mimeType: string
}

export class UploadError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'UploadError'
  }
}

function isAllowedMimeType(mime: string): mime is (typeof ALLOWED_MIME_TYPES)[number] {
  return (ALLOWED_MIME_TYPES as readonly string[]).includes(mime)
}

function sanitizeFilename(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9.\-_]/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
}

export async function uploadMedia(file: File, folder = 'uploads'): Promise<UploadResult> {
  if (!isAllowedMimeType(file.type)) {
    throw new UploadError(`File type "${file.type}" is not allowed. Allowed types: ${ALLOWED_MIME_TYPES.join(', ')}`)
  }

  if (file.size > MAX_FILE_SIZE_BYTES) {
    throw new UploadError(`File size ${(file.size / 1024 / 1024).toFixed(1)} MB exceeds the 5 MB limit`)
  }

  const ext = file.name.split('.').pop() ?? 'bin'
  const baseName = sanitizeFilename(file.name.replace(/\.[^.]+$/, ''))
  const timestamp = Date.now()
  const path = `${folder}/${timestamp}-${baseName}.${ext}`

  const supabase = createServiceClient()
  const { error } = await supabase.storage.from(BUCKET).upload(path, file, {
    contentType: file.type,
    upsert: false,
  })

  if (error) {
    throw new UploadError(`Upload failed: ${error.message}`)
  }

  const { data: publicUrlData } = supabase.storage.from(BUCKET).getPublicUrl(path)

  return {
    url: publicUrlData.publicUrl,
    path,
    size: file.size,
    mimeType: file.type,
  }
}

export async function deleteMedia(path: string): Promise<void> {
  const supabase = createServiceClient()
  const { error } = await supabase.storage.from(BUCKET).remove([path])
  if (error) {
    throw new UploadError(`Delete failed: ${error.message}`)
  }
}
