import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getComiteAccess } from '@/lib/security/comite'
import { safeJson, safeText } from '@/lib/security/http'
import { parseEcheance, resolveAssigne } from '@/lib/projets-server'

/** Une tâche proposée par un membre du comité apparaît sans validation. */
export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const membre = await getComiteAccess(request)
  if (!membre) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })

  try {
    const { id } = await params
    const projet = await db.projet.findUnique({ where: { id }, select: { id: true } })
    if (!projet) return NextResponse.json({ error: 'Projet introuvable' }, { status: 404 })

    const body = await safeJson<Record<string, unknown>>(request, 16_384)
    const titre = safeText(body.titre, 200)
    if (!titre) return NextResponse.json({ error: 'Le titre de la tâche est requis' }, { status: 400 })

    const echeance = parseEcheance(body.echeance)
    if (echeance === 'invalid') return NextResponse.json({ error: 'Délai invalide' }, { status: 400 })

    const assigneId = await resolveAssigne(body.assigneId)
    if (assigneId === 'invalid') return NextResponse.json({ error: 'Membre introuvable' }, { status: 400 })

    const dernier = await db.tache.findFirst({
      where: { projetId: id },
      orderBy: { ordre: 'desc' },
      select: { ordre: true },
    })

    const tache = await db.tache.create({
      data: {
        projetId: id,
        titre,
        description: safeText(body.description, 2_000),
        echeance,
        assigneId,
        ordre: (dernier?.ordre ?? 0) + 1,
        creePar: membre.nomSacre,
      },
      select: { id: true },
    })

    return NextResponse.json({ success: true, id: tache.id }, { status: 201 })
  } catch {
    return NextResponse.json({ error: 'Requête invalide' }, { status: 400 })
  }
}
