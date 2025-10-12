import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  // Vérifier si l'utilisateur est authentifié (admin)
  const isAdminAuthenticated = request.cookies.get('admin-session')?.value === 'authenticated'
  // Vérifier si l'utilisateur est authentifié (membre)
  const isUserAuthenticated = request.cookies.get('user-session')?.value !== undefined

  // Routes protégées pour l'admin
  const adminProtectedRoutes = ['/admin', '/api/admin']
  const isCurrentRouteAdminProtected = adminProtectedRoutes.some(route =>
    request.nextUrl.pathname.startsWith(route)
  )

  // Routes protégées pour les membres
  const userProtectedRoutes = ['/profil', '/api/user']
  const isCurrentRouteUserProtected = userProtectedRoutes.some(route =>
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

  return NextResponse.next()
}

export const config = {
  matcher: [
    // Temporairement désactivé pour tester
  ]
}
