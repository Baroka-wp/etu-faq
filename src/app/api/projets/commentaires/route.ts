import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { displayName, getComiteAccess } from '@/lib/security/comite'
import { safeJson, safeText } from '@/lib/security/http'

export async function GET(request: NextRequest) {
  if (!(await getComiteAccess(request))) {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
  }

  const tacheId = request.nextUrl.searchParams.get('tacheId')
  if (!tacheId) return NextResponse.json({ error: 'Tâche non précisée' }, { status: 400 })

  const commentaires = await db.commentaire.findMany({
    where: { tacheId },
    orderBy: { createdAt: 'asc' },
  })
  return NextResponse.json({ commentaires })
}

export async function POST(request: NextRequest) {
  const membre = await getComiteAccess(request)
  if (!membre) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })

  try {
    const body = await safeJson<Record<string, unknown>>(request, 8_192)
    const contenu = safeText(body.contenu, 2_000)
    if (!contenu) return NextResponse.json({ error: 'Le commentaire est vide' }, { status: 400 })

    const projetId = safeText(body.projetId, 40)
    const tacheId = safeText(body.tacheId, 40)
    if (!projetId && !tacheId) {
      return NextResponse.json({ error: 'Cible du commentaire manquante' }, { status: 400 })
    }

    if (tacheId) {
      const tache = await db.tache.findUnique({ where: { id: tacheId }, select: { id: true } })
      if (!tache) return NextResponse.json({ error: 'Tâche introuvable' }, { status: 404 })
    } else if (projetId) {
      const projet = await db.projet.findUnique({ where: { id: projetId }, select: { id: true } })
      if (!projet) return NextResponse.json({ error: 'Projet introuvable' }, { status: 404 })
    }

    const commentaire = await db.commentaire.create({
      data: {
        contenu,
        auteur: membre.nomSacre ?? displayName(membre),
        // Un commentaire de tâche n'est pas dupliqué au niveau du projet.
        projetId: tacheId ? null : projetId,
        tacheId: tacheId || null,
      },
    })

    return NextResponse.json({ success: true, commentaire }, { status: 201 })
  } catch {
    return NextResponse.json({ error: 'Requête invalide' }, { status: 400 })
  }
}
