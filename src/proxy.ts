import { createServerClient } from '@supabase/ssr'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function proxy(req: NextRequest) {
  let res = NextResponse.next({ request: req })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return req.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => req.cookies.set(name, value))
          res = NextResponse.next({ request: req })
          cookiesToSet.forEach(({ name, value, options }) =>
            res.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  const { data: { user } } = await supabase.auth.getUser()

  const pathname = req.nextUrl.pathname
  const isAdminPath = pathname.startsWith('/admin')
  const isLoginPath = pathname === '/admin/login'

  if (isAdminPath && !isLoginPath && !user) {
    return NextResponse.redirect(new URL('/admin/login', req.url))
  }

  if (isLoginPath && user) {
    return NextResponse.redirect(new URL('/admin', req.url))
  }

  // Role restriction: seo_editor may reach ONLY the 5 SEO modules (allowlist,
  // not blocklist) — everything else under /admin including the dashboard itself
  // is denied. /admin/pages/static is the Static Page SEO editor (separate from
  // the /admin/static-page-seo list view) and must stay allowed alongside it.
  if (user && !isLoginPath) {
    const { data: u } = await supabase.from('users').select('role').eq('id', user.id).maybeSingle()
    if (u?.role === 'seo_editor') {
      const allowedPages = ['/admin/seo-pages', '/admin/seo-blog', '/admin/service-content', '/admin/static-page-seo', '/admin/pages/static', '/admin/search-content']
      const allowedApi = ['/api/admin/seo-pages', '/api/admin/seo-blog', '/api/admin/service-content', '/api/admin/static-page-seo', '/api/admin/pages/static', '/api/admin/search-content', '/api/admin/media', '/api/admin/me', '/api/admin/logout']

      if (pathname.startsWith('/api/admin/')) {
        if (!allowedApi.some(p => pathname === p || pathname.startsWith(p + '/'))) {
          return NextResponse.json({ error: 'Forbidden — SEO editors cannot access this' }, { status: 403 })
        }
      } else if (pathname.startsWith('/admin')) {
        if (!allowedPages.some(p => pathname === p || pathname.startsWith(p + '/'))) {
          return NextResponse.redirect(new URL('/admin/seo-pages?error=access_denied', req.url))
        }
      }
    }
  }

  return res
}

export const config = {
  matcher: ['/admin/:path*', '/api/admin/:path*'],
}
