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

  // Role restriction: seo_editor is blocked from generate/settings/users/media.
  if (user && !isLoginPath) {
    const { data: u } = await supabase.from('users').select('role').eq('id', user.id).maybeSingle()
    if (u?.role === 'seo_editor') {
      const blockedPages = ['/admin/pages/generate', '/admin/settings', '/admin/users', '/admin/media']
      if (blockedPages.some(r => pathname.startsWith(r))) {
        return NextResponse.redirect(new URL('/admin?error=access_denied', req.url))
      }
      const blockedApi = ['/api/admin/generate', '/api/admin/settings', '/api/admin/users', '/api/admin/media']
      if (blockedApi.some(r => pathname.startsWith(r))) {
        return NextResponse.json({ error: 'Forbidden — SEO editors cannot access this' }, { status: 403 })
      }
    }
  }

  return res
}

export const config = {
  matcher: ['/admin/:path*', '/api/admin/:path*'],
}
