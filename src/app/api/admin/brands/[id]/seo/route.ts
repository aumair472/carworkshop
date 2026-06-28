import { NextRequest } from 'next/server'
import { handleSeoUpdate } from '@/lib/seo-route'

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  return handleSeoUpdate(req, { table: 'brands', idColumn: 'id', idValue: id, pathFor: slug => `/brands/${slug}` })
}
