import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getComiteAccess } from '@/lib/security/comite'
import { safeJson, safeText } from '@/lib/security/http'

export async function GET(request: NextRequest) {
  if (!(await getComiteAccess(request))) {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
  }

  const projets = await db.projet.findMany({
    orderBy: [{ ordre: 'asc' }, { createdAt: 'asc' }],
    include: {
      taches: { select: { statut: true, echeance: true } },
      _count: { select: { commentaires: true } },
    },
  })

  return NextResponse.json({
    projets: projets.map((projet) => {
      const total = projet.taches.length
      const terminees = projet.taches.filter((tache) => tache.statut === 'terminee').length
      return {
        id: projet.id,
        titre: projet.titre,
        resume: projet.resume,
        statut: projet.statut,
        ordre: projet.ordre,
        proposePar: projet.proposePar,
        taches: total,
        tachesTerminees: terminees,
        avancement: total === 0 ? 0 : Math.round((terminees / total) * 100),
        commentaires: projet._count.commentaires,
      }
    }),
  })
}

export async function POST(request: NextRequest) {
  const membre = await getComiteAccess(request)
  if (!membre) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })

  try {
    const body = await safeJson<Record<string, unknown>>(request, 16_384)
    const titre = safeText(body.titre, 160)
    if (!titre) return NextResponse.json({ error: 'Le titre est requis' }, { status: 400 })

    const dernier = await db.projet.findFirst({ orderBy: { ordre: 'desc' }, select: { ordre: true } })

    const projet = await db.projet.create({
      data: {
        titre,
        resume: safeText(body.resume, 300),
        description: safeText(body.description, 4_000),
        // Une suggestion reste « proposée » jusqu'à ce qu'un administrateur l'ouvre.
        statut: membre.isAdmin ? 'en_cours' : 'propose',
        ordre: (dernier?.ordre ?? 0) + 1,
        proposePar: membre.nomSacre,
      },
      select: { id: true },
    })

    return NextResponse.json({ success: true, id: projet.id }, { status: 201 })
  } catch {
    return NextResponse.json({ error: 'Requête invalide' }, { status: 400 })
  }
}
