import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  // Vérifier si l'utilisateur est authentifié (admin)
  const isAdminAuthenticated = request.cookies.get('admin-session')?.value === 'authenticated'
  // Vérifier si l'utilisateur est authentifié (membre inscription)
  const isUserAuthenticated = request.cookies.get('user-session')?.value !== undefined
  // Vérifier si le membre OMP est authentifié
  const isMembreAuthenticated = request.cookies.get('membre-session')?.value !== undefined

  // Routes protégées pour l'admin
  const adminProtectedRoutes = ['/admin', '/api/admin']
  const isCurrentRouteAdminProtected = adminProtectedRoutes.some(route =>
    request.nextUrl.pathname.startsWith(route)
  )

  // Routes protégées pour les membres inscription
  const userProtectedRoutes = ['/profil', '/api/user']
  const isCurrentRouteUserProtected = userProtectedRoutes.some(route =>
    request.nextUrl.pathname.startsWith(route)
  )

  // Routes protégées pour les membres OMP
  const membreProtectedRoutes = ['/membre/dashboard', '/membre/planning', '/membre/carte-du-ciel', '/membre/bibliotheque', '/membre/profil', '/api/membre']
  const isCurrentRouteMembreProtected = membreProtectedRoutes.some(route =>
    request.nextUrl.pathname.startsWith(route)
  )

  // Si c'est une route admin protégée et que l'admin n'est pas authentifié
  if (isCurrentRouteAdminProtected && !isAdminAuthenticated) {
    return NextResponse.redirect(new URL('/admin-login', request.url))
  }

  // Si c'est une route membre protégée et que le membre n'est pas authentifié
  if (isCurrentRouteUserProtected && !isUserAuthenticated) {
    return NextResponse.redirect(new URL('/member-login', request.url))
  }

  // Si c'est une route membre OMP protégée et que le membre n'est pas authentifié
  if (isCurrentRouteMembreProtected && !isMembreAuthenticated) {
    // Exclure les routes de login et logout
    if (!request.nextUrl.pathname.startsWith('/api/membre/login') &&
        !request.nextUrl.pathname.startsWith('/api/membre/logout')) {
      return NextResponse.redirect(new URL('/membre/login', request.url))
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    '/admin/:path*',
    '/api/admin/:path*',
    '/profil',
    '/api/user/:path*',
    '/membre/dashboard/:path*',
    '/membre/planning/:path*',
    '/membre/carte-du-ciel/:path*',
    '/membre/bibliotheque/:path*',
    '/membre/profil/:path*',
    '/api/membre/:path*'
  ]
}
