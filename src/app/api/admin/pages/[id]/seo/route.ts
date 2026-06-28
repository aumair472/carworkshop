import { NextRequest } from 'next/server'
import { handleSeoUpdate } from '@/lib/seo-route'

// Generated pages — slug is the full path under /brands (e.g. audi/a4/oil-change).
export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  return handleSeoUpdate(req, { table: 'generated_pages', idColumn: 'id', idValue: id, pathFor: slug => `/brands/${slug}` })
}
