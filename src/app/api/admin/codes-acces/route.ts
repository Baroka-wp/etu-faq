import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getAuthorizedAdmin } from '@/lib/security/admin'
import { isSameOrigin, safeJson, safeText } from '@/lib/security/http'
import { genererCode } from '@/lib/ressources'

export async function GET(request: NextRequest) {
  if (!(await getAuthorizedAdmin(request))) {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
  }

  const codes = await db.codeAcces.findMany({
    orderBy: { createdAt: 'desc' },
    include: {
      collection: { select: { id: true, titre: true, slug: true } },
      ressources: { include: { ressource: { select: { id: true, title: true, type: true } } } },
    },
  })

  return NextResponse.json({
    success: true,
    data: codes.map((code) => ({
      id: code.id,
      code: code.code,
      libelle: code.libelle,
      note: code.note,
      actif: code.actif,
      expiresAt: code.expiresAt,
      utilisations: code.utilisations,
      derniereUtilisation: code.derniereUtilisation,
      collection: code.collection,
      ressources: code.ressources.map((lien) => ({
        id: lien.ressource.id,
        titre: lien.ressource.title,
        type: lien.ressource.type,
      })),
    })),
  })
}

/** Un code remis à une personne, portant sur une collection ou des ressources. */
export async function POST(request: NextRequest) {
  if (!(await getAuthorizedAdmin(request))) {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
  }
  if (!isSameOrigin(request)) return NextResponse.json({ error: 'Origine non autorisée' }, { status: 403 })

  try {
    const body = await safeJson<Record<string, unknown>>(request, 16_384)
    const libelle = safeText(body.libelle, 180)
    if (!libelle) {
      return NextResponse.json({ error: 'Indiquez à qui ce code est remis' }, { status: 400 })
    }

    const collectionId = safeText(body.collectionId, 120)
    const ressourceIds = Array.isArray(body.ressourceIds)
      ? [...new Set(body.ressourceIds.filter((item): item is string => typeof item === 'string'))]
      : []
    if (!collectionId && ressourceIds.length === 0) {
      return NextResponse.json(
        { error: 'Rattachez le code à une collection ou à des ressources' },
        { status: 400 },
      )
    }

    const echeance = safeText(body.expiresAt, 40)
    const expiresAt = echeance ? new Date(echeance) : null
    if (expiresAt && Number.isNaN(expiresAt.getTime())) {
      return NextResponse.json({ error: 'Date de fin invalide' }, { status: 400 })
    }

    // Collision improbable, mais on vérifie tout de même.
    let code = genererCode()
    while (await db.codeAcces.findUnique({ where: { code }, select: { id: true } })) {
      code = genererCode()
    }

    const cree = await db.codeAcces.create({
      data: {
        code,
        libelle,
        note: safeText(body.note, 500),
        collectionId: collectionId || null,
        expiresAt,
        ressources: { create: ressourceIds.map((bookId) => ({ bookId })) },
      },
      select: { id: true, code: true },
    })

    return NextResponse.json({ success: true, data: cree }, { status: 201 })
  } catch {
    return NextResponse.json({ error: 'Création impossible' }, { status: 400 })
  }
}
