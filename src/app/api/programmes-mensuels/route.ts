import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

function moisValide(annee: number, mois: number) {
  return Number.isInteger(annee) && annee >= 2020 && annee <= 2100 && Number.isInteger(mois) && mois >= 1 && mois <= 12
}

export async function GET(request: NextRequest) {
  const annee = Number(request.nextUrl.searchParams.get('annee'))
  const mois = Number(request.nextUrl.searchParams.get('mois'))
  if (!moisValide(annee, mois)) {
    return NextResponse.json({ error: 'Mois ou année invalide' }, { status: 400 })
  }

  try {
    const activites = await db.activiteProgramme.findMany({
      where: { actif: true },
      orderBy: [{ categorie: 'desc' }, { ordre: 'asc' }, { createdAt: 'asc' }],
      select: {
        id: true,
        categorie: true,
        titre: true,
        heures: true,
        lieu: true,
        ordre: true,
        programmations: {
          where: { annee, mois },
          select: { jours: true },
        },
      },
    })

    return NextResponse.json({
      success: true,
      data: activites.map(({ programmations, ...activite }) => ({
        ...activite,
        jours: programmations[0]?.jours ?? [],
        evenements: [],
      })),
    })
  } catch (error) {
    console.error('GET /api/programmes-mensuels:', error)
    return NextResponse.json({ error: 'Programme indisponible' }, { status: 500 })
  }
}
