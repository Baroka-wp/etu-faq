import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getAuthorizedAdmin } from '@/lib/security/admin'
import { isSameOrigin, safeJson, safeText } from '@/lib/security/http'
import { estAcces, gradesValides, slugifierTitre } from '@/lib/ressources'

export async function GET(request: NextRequest) {
  if (!(await getAuthorizedAdmin(request))) {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
  }

  const collections = await db.collection.findMany({
    orderBy: { createdAt: 'desc' },
    include: {
      ressources: {
        orderBy: { ordre: 'asc' },
        include: { ressource: { select: { id: true, title: true, type: true, imageUrl: true } } },
      },
      _count: { select: { codes: true } },
    },
  })

  return NextResponse.json({
    success: true,
    data: collections.map((collection) => ({
      id: collection.id,
      titre: collection.titre,
      slug: collection.slug,
      description: collection.description,
      acces: collection.acces,
      gradesAutorises: collection.gradesAutorises,
      publie: collection.publie,
      codes: collection._count.codes,
      ressources: collection.ressources.map((lien) => ({
        id: lien.ressource.id,
        titre: lien.ressource.title,
        type: lien.ressource.type,
        imageUrl: lien.ressource.imageUrl,
      })),
    })),
  })
}

/** Réserve un identifiant de lien unique pour la collection. */
async function slugDisponible(base: string): Promise<string> {
  const racine = base || 'collection'
  let candidat = racine
  let suffixe = 2
  while (await db.collection.findUnique({ where: { slug: candidat }, select: { id: true } })) {
    candidat = `${racine}-${suffixe++}`
  }
  return candidat
}

export async function POST(request: NextRequest) {
  if (!(await getAuthorizedAdmin(request))) {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
  }
  if (!isSameOrigin(request)) return NextResponse.json({ error: 'Origine non autorisée' }, { status: 403 })

  try {
    const body = await safeJson<Record<string, unknown>>(request, 32_768)
    const titre = safeText(body.titre, 180)
    if (!titre) return NextResponse.json({ error: 'Le titre est requis' }, { status: 400 })

    const ressourceIds = Array.isArray(body.ressourceIds)
      ? [...new Set(body.ressourceIds.filter((id): id is string => typeof id === 'string'))]
      : []

    const collection = await db.collection.create({
      data: {
        titre,
        slug: await slugDisponible(slugifierTitre(titre)),
        description: safeText(body.description, 2_000),
        acces: estAcces(body.acces) ? body.acces : 'restreint',
        gradesAutorises: gradesValides(body.gradesAutorises),
        publie: body.publie !== false,
        ressources: {
          create: ressourceIds.map((bookId, index) => ({ bookId, ordre: index })),
        },
      },
      select: { id: true, slug: true },
    })

    return NextResponse.json({ success: true, data: collection }, { status: 201 })
  } catch {
    return NextResponse.json({ error: 'Création impossible' }, { status: 400 })
  }
}
