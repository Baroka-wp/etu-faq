import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getAuthorizedAdmin } from '@/lib/security/admin'
import { isSameOrigin, safeJson, safeText } from '@/lib/security/http'
import { estAcces, gradesValides } from '@/lib/ressources'

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!(await getAuthorizedAdmin(request))) {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
  }
  if (!isSameOrigin(request)) return NextResponse.json({ error: 'Origine non autorisée' }, { status: 403 })

  try {
    const { id } = await params
    const body = await safeJson<Record<string, unknown>>(request, 32_768)
    const data: Record<string, unknown> = {}

    if (body.titre !== undefined) {
      const titre = safeText(body.titre, 180)
      if (!titre) return NextResponse.json({ error: 'Titre invalide' }, { status: 400 })
      data.titre = titre
    }
    if (body.description !== undefined) data.description = safeText(body.description, 2_000)
    if (body.acces !== undefined && estAcces(body.acces)) data.acces = body.acces
    if (body.gradesAutorises !== undefined) data.gradesAutorises = gradesValides(body.gradesAutorises)
    if (body.publie !== undefined) data.publie = body.publie === true

    // La liste des ressources est remplacée en bloc, dans l'ordre reçu.
    if (Array.isArray(body.ressourceIds)) {
      const ressourceIds = [...new Set(body.ressourceIds.filter((item): item is string => typeof item === 'string'))]
      await db.$transaction([
        db.collectionRessource.deleteMany({ where: { collectionId: id } }),
        db.collectionRessource.createMany({
          data: ressourceIds.map((bookId, index) => ({ collectionId: id, bookId, ordre: index })),
          skipDuplicates: true,
        }),
      ])
    }

    if (Object.keys(data).length > 0) {
      await db.collection.update({ where: { id }, data })
    }
    return NextResponse.json({ success: true })
  } catch (erreur: unknown) {
    if (erreur && typeof erreur === 'object' && 'code' in erreur && erreur.code === 'P2025') {
      return NextResponse.json({ error: 'Collection introuvable' }, { status: 404 })
    }
    return NextResponse.json({ error: 'Modification impossible' }, { status: 400 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!(await getAuthorizedAdmin(request))) {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
  }
  if (!isSameOrigin(request)) return NextResponse.json({ error: 'Origine non autorisée' }, { status: 403 })

  const { id } = await params
  await db.collection.delete({ where: { id } })
  return NextResponse.json({ success: true })
}
