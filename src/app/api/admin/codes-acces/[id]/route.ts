import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getAuthorizedAdmin } from '@/lib/security/admin'
import { isSameOrigin, safeJson, safeText } from '@/lib/security/http'

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!(await getAuthorizedAdmin(request))) {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
  }
  if (!isSameOrigin(request)) return NextResponse.json({ error: 'Origine non autorisée' }, { status: 403 })

  try {
    const { id } = await params
    const body = await safeJson<Record<string, unknown>>(request, 16_384)
    const data: Record<string, unknown> = {}

    if (body.libelle !== undefined) {
      const libelle = safeText(body.libelle, 180)
      if (!libelle) return NextResponse.json({ error: 'Libellé invalide' }, { status: 400 })
      data.libelle = libelle
    }
    if (body.note !== undefined) data.note = safeText(body.note, 500)
    if (body.actif !== undefined) data.actif = body.actif === true
    if (body.expiresAt !== undefined) {
      const echeance = safeText(body.expiresAt, 40)
      if (!echeance) {
        data.expiresAt = null
      } else {
        const date = new Date(echeance)
        if (Number.isNaN(date.getTime())) {
          return NextResponse.json({ error: 'Date de fin invalide' }, { status: 400 })
        }
        data.expiresAt = date
      }
    }

    if (Array.isArray(body.ressourceIds)) {
      const ressourceIds = [...new Set(body.ressourceIds.filter((item): item is string => typeof item === 'string'))]
      await db.$transaction([
        db.codeAccesRessource.deleteMany({ where: { codeId: id } }),
        db.codeAccesRessource.createMany({
          data: ressourceIds.map((bookId) => ({ codeId: id, bookId })),
          skipDuplicates: true,
        }),
      ])
    }
    if (body.collectionId !== undefined) {
      data.collectionId = safeText(body.collectionId, 120) || null
    }

    if (Object.keys(data).length > 0) {
      await db.codeAcces.update({ where: { id }, data })
    }
    return NextResponse.json({ success: true })
  } catch (erreur: unknown) {
    if (erreur && typeof erreur === 'object' && 'code' in erreur && erreur.code === 'P2025') {
      return NextResponse.json({ error: 'Code introuvable' }, { status: 404 })
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
  await db.codeAcces.delete({ where: { id } })
  return NextResponse.json({ success: true })
}
