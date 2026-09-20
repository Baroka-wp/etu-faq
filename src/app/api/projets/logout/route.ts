import { NextResponse } from 'next/server'
import { secureCookieOptions } from '@/lib/security/http'

export async function POST() {
  const response = NextResponse.json({ success: true })
  response.cookies.set('comite-session', '', { ...secureCookieOptions(0), maxAge: 0 })
  return response
}
