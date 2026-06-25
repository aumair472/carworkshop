import { createServerClient } from '@supabase/ssr'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function middleware(req: NextRequest) {
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

  const { data: { session } } = await supabase.auth.getSession()

  const isAdminPath = req.nextUrl.pathname.startsWith('/admin')
  const isLoginPath = req.nextUrl.pathname === '/admin/login'

  if (isAdminPath && !isLoginPath) {
    if (!session) {
      return NextResponse.redirect(new URL('/admin/login', req.url))
    }

    const { data: userRecord } = await supabase
      .from('users')
      .select('role, is_active')
      .eq('id', session.user.id)
      .single()

    if (!userRecord || !userRecord.is_active) {
      return NextResponse.redirect(new URL('/admin/login', req.url))
    }
  }

  if (isLoginPath && session) {
    return NextResponse.redirect(new URL('/admin', req.url))
  }

  return res
}

export const config = {
  matcher: ['/admin/:path*', '/api/admin/:path*'],
}
