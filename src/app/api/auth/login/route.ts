import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'

export async function POST(request: NextRequest) {
  try {
    const { password } = await request.json()

    // Mot de passe simple (en production, utilisez un hash sécurisé)
    const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'etu2024'

    if (password === ADMIN_PASSWORD) {
      // Créer un cookie de session
      const response = NextResponse.json({ success: true })
      
      response.cookies.set('admin-session', 'authenticated', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 60 * 60 * 24 * 7 // 7 jours
      })

      return response
    } else {
      return NextResponse.json(
        { error: 'Mot de passe incorrect' },
        { status: 401 }
      )
    }
  } catch (error) {
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    )
  }
}
