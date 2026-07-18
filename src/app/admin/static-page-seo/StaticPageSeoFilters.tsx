'use client'

import { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'

export function StaticPageSeoFilters() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [title, setTitle] = useState(searchParams.get('title') ?? '')
  const [keyword, setKeyword] = useState(searchParams.get('keyword') ?? '')
  const [url, setUrl] = useState(searchParams.get('url') ?? '')

  function search() {
    const params = new URLSearchParams()
    if (title) params.set('title', title)
    if (keyword) params.set('keyword', keyword)
    if (url) params.set('url', url)
    router.push(`/admin/static-page-seo${params.toString() ? `?${params}` : ''}`)
  }

  function reset() {
    setTitle(''); setKeyword(''); setUrl('')
    router.push('/admin/static-page-seo')
  }

  return (
    <div className="bg-white border border-[#E5E7EB] rounded-lg p-4 flex flex-wrap items-end gap-3">
      <div className="w-48">
        <Input label="Page Title" value={title} onChange={e => setTitle(e.target.value)} onKeyDown={e => e.key === 'Enter' && search()} />
      </div>
      <div className="w-48">
        <Input label="Key Word" value={keyword} onChange={e => setKeyword(e.target.value)} onKeyDown={e => e.key === 'Enter' && search()} />
      </div>
      <div className="w-48">
        <Input label="Page URL" value={url} onChange={e => setUrl(e.target.value)} onKeyDown={e => e.key === 'Enter' && search()} />
      </div>
      <Button variant="primary" size="sm" onClick={search}>Search</Button>
      <Button variant="secondary" size="sm" onClick={reset}>Reset</Button>
    </div>
  )
}
