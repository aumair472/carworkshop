'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Badge } from '@/components/ui/Badge'
import type { ContentStatus } from '@/types'

interface StaticRow { slug: string; title: string; status: ContentStatus; updated_at: string | null; exists: boolean }

export default function StaticPagesAdmin() {
  const [rows, setRows] = useState<StaticRow[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    void (async () => {
      try {
        const res = await fetch('/api/admin/pages/static')
        if (res.ok) { const d = await res.json() as { pages: StaticRow[] }; setRows(d.pages) }
      } catch { /* ignore */ } finally { setLoading(false) }
    })()
  }, [])

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <Link href="/admin/pages" className="text-sm text-[#4472C4] hover:underline">← Pages</Link>
          <h1 className="text-2xl font-bold text-[#1F2937] mt-1">Static Pages</h1>
          <p className="text-sm text-[#6B7280] mt-1">Edit Home, About, Contact, FAQ, Privacy and Terms.</p>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-card border border-[#E5E7EB] overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-[#F9FAFB] border-b border-[#E5E7EB] text-left text-xs font-semibold text-[#6B7280] uppercase tracking-wider">
              <th className="px-4 py-3">Page</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Updated</th>
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#F3F4F6]">
            {loading && <tr><td colSpan={4} className="px-4 py-12 text-center text-[#9CA3AF]">Loading…</td></tr>}
            {!loading && rows.map(r => (
              <tr key={r.slug} className="hover:bg-[#F9FAFB]">
                <td className="px-4 py-3 font-medium text-[#1F2937]">{r.title}</td>
                <td className="px-4 py-3"><Badge variant={r.status}>{r.exists ? r.status : 'not customized'}</Badge></td>
                <td className="px-4 py-3 text-[#9CA3AF] text-xs">{r.updated_at ? new Date(r.updated_at).toLocaleDateString('en-AE') : '—'}</td>
                <td className="px-4 py-3 text-right">
                  <Link href={`/admin/pages/static/${r.slug}`} className="text-[#4472C4] hover:underline text-xs font-medium">Edit</Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
