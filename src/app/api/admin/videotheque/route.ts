import { NextRequest, NextResponse } from 'next/server'
import { Prisma } from '@prisma/client'
import { db } from '@/lib/db'
import { getAuthorizedAdmin } from '@/lib/security/admin'
import { safeJson } from '@/lib/security/http'

export async function POST(request: NextRequest) {
  if (!(await getAuthorizedAdmin(request))) {
    return NextResponse.json({ error: 'Accès administrateur requis.' }, { status: 403 })
  }
  try {
    const body = await safeJson<Record<string, unknown>>(request, 100_000)
    const { id, date, presentiel, notes } = body
    const titre = typeof body.titre === 'string' ? body.titre.trim() : ''
    let url: URL
    try {
      url = new URL(String(body.lien))
    } catch {
      return NextResponse.json({ error: 'Le lien Google Drive est invalide.' }, { status: 400 })
    }
    const driveId = url.pathname.match(/^\/file\/d\/([\w-]+)(?:\/|$)/)?.[1] ?? url.searchParams.get('id')
    if (url.origin !== 'https://drive.google.com' || !driveId || !/^[\w-]{10,150}$/.test(driveId)) {
      return NextResponse.json({ error: 'Indiquez le lien de partage du fichier vidéo Google Drive.' }, { status: 400 })
    }
    if (!titre || titre.length > 200 || typeof notes !== 'string' || notes.length > 20000 ||
        typeof presentiel !== 'boolean' || typeof date !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(date) ||
        !Number.isFinite(Date.parse(date)) || new Date(date).toISOString().slice(0,10) !== date ||
        (id !== undefined && typeof id !== 'string')) {
      return NextResponse.json({ error: 'Vérifiez le titre, la date et les notes du cours.' }, { status: 400 })
    }
    const data = { titre, date, notes: notes.trim(), presentiel, driveId }
    const ids = body.ressourceIds
    if (ids !== undefined && (!Array.isArray(ids) || !ids.every(v => typeof v === 'string' && v.length > 0))) {
      return NextResponse.json({ error: 'Sélection de ressources invalide.' }, { status: 400 })
    }
    const liens = ids === undefined ? undefined : [...new Set<string>(ids)].map(id => ({ id }))
    const cours = typeof id === 'string'
      ? await db.coursVideo.update({ where: { id }, data: { ...data, ressources: liens && { set: liens } } })
      : await db.coursVideo.create({ data: { ...data, ressources: liens && { connect: liens } } })
    return NextResponse.json({ id: cours.id })
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
      return NextResponse.json({ error: 'Cette vidéo est déjà enregistrée.' }, { status: 409 })
    }
    return NextResponse.json({ error: 'Impossible d’enregistrer ce cours.' }, { status: 400 })
  }
}
