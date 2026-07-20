import { NextRequest, NextResponse } from 'next/server'
import { rateLimit, safeJson, safeText } from '@/lib/security/http'
import { findActiveMemberBySacredName } from '@/lib/sacred-name'

export async function POST(request: NextRequest) {
  const limited = rateLimit(request, 'member-name-check', 8, 15 * 60 * 1000)
  if (limited) return limited
  try {
    const body = await safeJson<Record<string, unknown>>(request, 2_048)
    const nomSacre = safeText(body.nomSacre, 120)

    // Validation du champ requis
    if (!nomSacre) {
      return NextResponse.json(
        { error: 'Le nom sacré est requis' },
        { status: 400 }
      )
    }

    // Rechercher le membre par nom sacré (insensible à la casse et aux espaces)
    const membre = await findActiveMemberBySacredName(nomSacre)

    if (!membre) {
      return NextResponse.json(
        { error: 'Nom sacré incorrect ou membre inactif' },
        { status: 404 }
      )
    }

    // Vérifier si c'est la première connexion
    const premiereConnexion = false

    return NextResponse.json({
      success: true,
      premiereConnexion,
      nomSacre: membre.nomSacre?.trim() ?? null
    })

  } catch (error) {
    console.error('Erreur lors de la vérification du nom sacré:', error)
    return NextResponse.json(
      { error: 'Une erreur est survenue lors de la vérification' },
      { status: 500 }
    )
  }
}
