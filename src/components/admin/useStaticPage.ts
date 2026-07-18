'use client'

import { useState, useEffect, useCallback } from 'react'
import toast from 'react-hot-toast'
import type { SeoJson } from '@/lib/schemas/seo'

type Status = 'draft' | 'published' | 'archived'

interface StaticPageState<T> {
  loading: boolean
  saving: boolean
  savedLabel: string
  content: T
  setContent: React.Dispatch<React.SetStateAction<T>>
  patch: <K extends keyof T>(key: K, value: Partial<T[K]>) => void
  status: Status
  setStatus: (s: Status) => void
  seoTitle: string
  setSeoTitle: (v: string) => void
  seoDesc: string
  setSeoDesc: (v: string) => void
  seoJson: SeoJson
  setSeoJson: (v: SeoJson) => void
  subTitle: string
  setSubTitle: (v: string) => void
  metaKeyword: string
  setMetaKeyword: (v: string) => void
  h3Text: string
  setH3Text: (v: string) => void
  shortDescription: string
  setShortDescription: (v: string) => void
  saveSeo: () => Promise<void>
  save: (nextStatus?: Status) => Promise<void>
}

// Shared loader/saver for dedicated static-page editors (about/contact/faq).
// `merge` reconciles saved content_json with the editor's defaults.
export function useStaticPage<T>(slug: string, title: string, merge: (saved: Partial<T> | null) => T): StaticPageState<T> {
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [savedLabel, setSavedLabel] = useState('')
  const [content, setContent] = useState<T>(() => merge(null))
  const [status, setStatus] = useState<Status>('draft')
  const [seoTitle, setSeoTitle] = useState('')
  const [seoDesc, setSeoDesc] = useState('')
  const [seoJson, setSeoJson] = useState<SeoJson>({})
  const [subTitle, setSubTitle] = useState('')
  const [metaKeyword, setMetaKeyword] = useState('')
  const [h3Text, setH3Text] = useState('')
  const [shortDescription, setShortDescription] = useState('')

  useEffect(() => {
    let cancelled = false
    void (async () => {
      try {
        const res = await fetch(`/api/admin/pages/static/${slug}`)
        if (cancelled) return
        if (res.ok) {
          const d = await res.json() as { page: {
            content_json: Partial<T> | null; status: Status; seo_title: string | null; seo_description: string | null; seo_json?: SeoJson | null
            sub_title?: string | null; meta_keyword?: string | null; h3_text?: string | null; short_description?: string | null
          } }
          if (cancelled) return
          setContent(merge(d.page.content_json))
          setStatus(d.page.status)
          setSeoTitle(d.page.seo_title ?? '')
          setSeoDesc(d.page.seo_description ?? '')
          setSeoJson(d.page.seo_json ?? {})
          setSubTitle(d.page.sub_title ?? '')
          setMetaKeyword(d.page.meta_keyword ?? '')
          setH3Text(d.page.h3_text ?? '')
          setShortDescription(d.page.short_description ?? '')
        }
      } catch { /* ignore */ } finally { if (!cancelled) setLoading(false) }
    })()
    return () => { cancelled = true }
    // merge is stable per-render in callers; slug identifies the page.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [slug])

  const patch = useCallback(<K extends keyof T>(key: K, value: Partial<T[K]>) => {
    setContent(prev => ({ ...prev, [key]: { ...prev[key], ...value } }))
  }, [])

  const save = useCallback(async (nextStatus?: Status) => {
    setSaving(true)
    const t = toast.loading('Saving…')
    try {
      const res = await fetch(`/api/admin/pages/static/${slug}`, {
        method: 'PUT', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title, content_json: content, seo_title: seoTitle || null, seo_description: seoDesc || null,
          sub_title: subTitle || null, meta_keyword: metaKeyword || null, h3_text: h3Text || null, short_description: shortDescription || null,
          status: nextStatus ?? status,
        }),
      })
      const d = await res.json() as { error?: string }
      if (!res.ok) { toast.error(d.error ?? 'Save failed', { id: t }); return }
      if (nextStatus) setStatus(nextStatus)
      setSavedLabel(`Saved ${new Date().toLocaleTimeString('en-AE')}`)
      toast.success(nextStatus === 'published' ? 'Published! Changes are live.' : 'Saved', { id: t })
    } catch { toast.error('Network error', { id: t }) } finally { setSaving(false) }
  }, [slug, title, content, seoTitle, seoDesc, subTitle, metaKeyword, h3Text, shortDescription, status])

  const saveSeo = useCallback(async () => {
    setSaving(true)
    const t = toast.loading('Saving SEO…')
    try {
      const res = await fetch(`/api/admin/pages/static/${slug}/seo`, {
        method: 'PUT', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ seo_json: seoJson }),
      })
      const d = await res.json() as { error?: string }
      toast[res.ok ? 'success' : 'error'](res.ok ? 'SEO saved' : (d.error ?? 'Save failed'), { id: t })
    } catch { toast.error('Network error', { id: t }) } finally { setSaving(false) }
  }, [slug, seoJson])

  return {
    loading, saving, savedLabel, content, setContent, patch, status, setStatus,
    seoTitle, setSeoTitle, seoDesc, setSeoDesc, seoJson, setSeoJson,
    subTitle, setSubTitle, metaKeyword, setMetaKeyword, h3Text, setH3Text, shortDescription, setShortDescription,
    saveSeo, save,
  }
}
