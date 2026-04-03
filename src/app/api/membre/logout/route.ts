import { NextResponse } from 'next/server'

export async function POST() {
  const response = NextResponse.json({
    success: true,
    message: 'Déconnexion réussie'
  })

  // Supprimer le cookie de session
  response.cookies.delete('membre-session')

  return response
}
