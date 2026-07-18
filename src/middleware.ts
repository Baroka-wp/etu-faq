import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { isSameOrigin } from '@/lib/security/http'
import { SESSION_COOKIES, SessionRole, verifySessionToken } from '@/lib/security/session'

const PUBLIC_MEMBER_API_POSTS = new Set(['/api/members', '/api/members/upload-photo'])

function apiUnauthorized() {
  return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })
}

async function hasRole(request: NextRequest, role: Exclude<SessionRole, 'upload' | 'event'>) {
  return Boolean(await verifySessionToken(request.cookies.get(SESSION_COOKIES[role])?.value, role))
}

async function protect(
  request: NextRequest,
  role: Exclude<SessionRole, 'upload' | 'event'>,
  loginPath: string
) {
  if (await hasRole(request, role)) return null
  if (request.nextUrl.pathname.startsWith('/api/')) return apiUnauthorized()
  const url = new URL(loginPath, request.url)
  url.searchParams.set('retour', request.nextUrl.pathname)
  return NextResponse.redirect(url)
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  const unsafeMethod = !['GET', 'HEAD', 'OPTIONS'].includes(request.method)

  if (unsafeMethod && !isSameOrigin(request)) {
    return NextResponse.json({ error: 'Origine de la requête non autorisée' }, { status: 403 })
  }

  if (unsafeMethod) {
    const contentLength = Number(request.headers.get('content-length') || 0)
    const isImageUpload = pathname.endsWith('/upload') || pathname.endsWith('/upload-photo')
    const maxBytes = isImageUpload ? 6 * 1024 * 1024 : 1024 * 1024
    if (Number.isFinite(contentLength) && contentLength > maxBytes) {
      return NextResponse.json({ error: 'Requête trop volumineuse' }, { status: 413 })
    }
  }

  if (pathname.startsWith('/admin') || pathname.startsWith('/api/admin')) {
    return (await protect(request, 'admin', '/admin-login')) ?? NextResponse.next()
  }

  if (pathname.startsWith('/api/members')) {
    if (pathname === '/api/members/access') return NextResponse.next()
    if (request.method === 'POST' && PUBLIC_MEMBER_API_POSTS.has(pathname)) {
      return (await protect(request, 'registration', '/members/login')) ?? NextResponse.next()
    }
    return (await protect(request, 'admin', '/admin-login')) ?? NextResponse.next()
  }

  if (pathname === '/members/inscription') {
    return (await protect(request, 'registration', '/members/login')) ?? NextResponse.next()
  }

  if (pathname === '/profil' || pathname.startsWith('/api/user')) {
    if (pathname === '/api/user/login' || pathname === '/api/user/logout') return NextResponse.next()
    return (await protect(request, 'user', '/member-login')) ?? NextResponse.next()
  }

  if (pathname.startsWith('/membre/') || pathname.startsWith('/api/membre')) {
    if (pathname === '/membre/login') return NextResponse.next()
    const publicMembreApi = ['/api/membre/login', '/api/membre/logout', '/api/membre/check-nom-sacre', '/api/membre/set-password']
    if (publicMembreApi.some((route) => pathname.startsWith(route))) return NextResponse.next()
    return (await protect(request, 'membre', '/membre/login')) ?? NextResponse.next()
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    '/api/:path*',
    '/admin/:path*',
    '/api/admin/:path*',
    '/api/members/:path*',
    '/members/inscription',
    '/profil',
    '/api/user/:path*',
    '/membre/:path*',
    '/api/membre/:path*',
  ],
}
