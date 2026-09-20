import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getComiteAccess } from '@/lib/security/comite'
import { safeJson, safeText } from '@/lib/security/http'
import { isTacheStatut } from '@/lib/projets'
import { parseEcheance, resolveAssigne } from '@/lib/projets-server'

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ tacheId: string }> }) {
  const membre = await getComiteAccess(request)
  if (!membre) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })

  try {
    const { tacheId } = await params
    const tache = await db.tache.findUnique({ where: { id: tacheId }, select: { id: true } })
    if (!tache) return NextResponse.json({ error: 'Tâche introuvable' }, { status: 404 })

    const body = await safeJson<Record<string, unknown>>(request, 16_384)
    const data: Record<string, unknown> = {}

    // Le niveau d'évolution reste la main de l'administrateur.
    if (body.statut !== undefined) {
      if (!membre.isAdmin) {
        return NextResponse.json(
          { error: "Seul un administrateur met à jour l'avancement d'une tâche." },
          { status: 403 }
        )
      }
      const statut = safeText(body.statut, 20)
      if (!statut || !isTacheStatut(statut)) {
        return NextResponse.json({ error: 'Statut invalide' }, { status: 400 })
      }
      data.statut = statut
    }

    if (body.titre !== undefined) {
      const titre = safeText(body.titre, 200)
      if (!titre) return NextResponse.json({ error: 'Titre invalide' }, { status: 400 })
      data.titre = titre
    }
    if (body.description !== undefined) data.description = safeText(body.description, 2_000)

    if (body.echeance !== undefined) {
      const echeance = parseEcheance(body.echeance)
      if (echeance === 'invalid') return NextResponse.json({ error: 'Délai invalide' }, { status: 400 })
      data.echeance = echeance
    }

    if (body.assigneId !== undefined) {
      const assigneId = await resolveAssigne(body.assigneId)
      if (assigneId === 'invalid') return NextResponse.json({ error: 'Membre introuvable' }, { status: 400 })
      data.assigneId = assigneId
    }

    if (Object.keys(data).length === 0) {
      return NextResponse.json({ error: 'Aucune modification' }, { status: 400 })
    }

    await db.tache.update({ where: { id: tacheId }, data })
    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: 'Requête invalide' }, { status: 400 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ tacheId: string }> }) {
  const membre = await getComiteAccess(request)
  if (!membre) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
  if (!membre.isAdmin) {
    return NextResponse.json({ error: "Seul un administrateur supprime une tâche." }, { status: 403 })
  }

  const { tacheId } = await params
  await db.tache.delete({ where: { id: tacheId } })
  return NextResponse.json({ success: true })
}
