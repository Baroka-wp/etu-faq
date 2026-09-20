import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { displayName, getComiteAccess } from '@/lib/security/comite'
import { safeJson, safeText } from '@/lib/security/http'
import { isProjetStatut } from '@/lib/projets'

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!(await getComiteAccess(request))) {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
  }

  const { id } = await params
  const projet = await db.projet.findUnique({
    where: { id },
    include: {
      taches: {
        orderBy: [{ ordre: 'asc' }, { createdAt: 'asc' }],
        include: {
          assigne: { select: { id: true, nom: true, prenoms: true, nomSacre: true } },
          _count: { select: { commentaires: true } },
        },
      },
      commentaires: {
        where: { tacheId: null },
        orderBy: { createdAt: 'asc' },
      },
    },
  })

  if (!projet) return NextResponse.json({ error: 'Projet introuvable' }, { status: 404 })

  const terminees = projet.taches.filter((tache) => tache.statut === 'terminee').length

  return NextResponse.json({
    projet: {
      id: projet.id,
      titre: projet.titre,
      resume: projet.resume,
      description: projet.description,
      statut: projet.statut,
      proposePar: projet.proposePar,
      avancement: projet.taches.length === 0 ? 0 : Math.round((terminees / projet.taches.length) * 100),
      tachesTerminees: terminees,
      taches: projet.taches.map((tache) => ({
        id: tache.id,
        titre: tache.titre,
        description: tache.description,
        statut: tache.statut,
        echeance: tache.echeance,
        creePar: tache.creePar,
        assigne: tache.assigne
          ? { id: tache.assigne.id, nom: displayName(tache.assigne) }
          : null,
        commentaires: tache._count.commentaires,
      })),
      commentaires: projet.commentaires,
    },
  })
}

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const membre = await getComiteAccess(request)
  if (!membre) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
  if (!membre.isAdmin) {
    return NextResponse.json(
      { error: "Seul un administrateur fait évoluer un projet." },
      { status: 403 }
    )
  }

  try {
    const { id } = await params
    const body = await safeJson<Record<string, unknown>>(request, 16_384)
    const data: Record<string, unknown> = {}

    if (body.titre !== undefined) {
      const titre = safeText(body.titre, 160)
      if (!titre) return NextResponse.json({ error: 'Titre invalide' }, { status: 400 })
      data.titre = titre
    }
    if (body.resume !== undefined) data.resume = safeText(body.resume, 300)
    if (body.description !== undefined) data.description = safeText(body.description, 4_000)
    if (body.statut !== undefined) {
      const statut = safeText(body.statut, 20)
      if (!statut || !isProjetStatut(statut)) {
        return NextResponse.json({ error: 'Statut invalide' }, { status: 400 })
      }
      data.statut = statut
    }

    if (Object.keys(data).length === 0) {
      return NextResponse.json({ error: 'Aucune modification' }, { status: 400 })
    }

    await db.projet.update({ where: { id }, data })
    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: 'Requête invalide' }, { status: 400 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const membre = await getComiteAccess(request)
  if (!membre) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
  if (!membre.isAdmin) {
    return NextResponse.json({ error: "Seul un administrateur supprime un projet." }, { status: 403 })
  }

  const { id } = await params
  await db.projet.delete({ where: { id } })
  return NextResponse.json({ success: true })
}
