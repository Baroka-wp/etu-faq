import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getAuthorizedAdmin } from '@/lib/security/admin'
import { isSameOrigin, safeJson, safeText } from '@/lib/security/http'

function gradeAutorise(grade: string, gradesAutorises: string[]) {
  return grade === 'Alchimiste' || gradesAutorises.length === 0 || gradesAutorises.includes(grade)
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const adminSession = await getAuthorizedAdmin(request)
    if (!adminSession) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
    }

    const { id } = await params

    const recherche = safeText(request.nextUrl.searchParams.get('q'), 120)
    if (recherche) {
      const traversee = await db.traversee.findUnique({
        where: { id },
        select: { id: true, gradesAutorises: true },
      })
      if (!traversee) return NextResponse.json({ error: 'Événement non trouvé' }, { status: 404 })

      const membres = await db.membre.findMany({
        where: {
          statut: 'actif',
          traversees: { none: { traverseeId: id } },
          OR: [
            { nom: { contains: recherche, mode: 'insensitive' } },
            { prenoms: { contains: recherche, mode: 'insensitive' } },
            { nomSacre: { contains: recherche, mode: 'insensitive' } },
          ],
        },
        select: { id: true, nom: true, prenoms: true, nomSacre: true, grade: true },
        orderBy: [{ nom: 'asc' }, { prenoms: 'asc' }],
        take: 20,
      })

      return NextResponse.json({
        success: true,
        data: membres.filter((membre) => gradeAutorise(membre.grade, traversee.gradesAutorises)).slice(0, 10),
      })
    }

    const inscrits = await db.inscriptionTraversee.findMany({
      where: { traverseeId: id },
      include: {
        membre: {
          select: {
            id: true,
            nom: true,
            prenoms: true,
            nomSacre: true,
            grade: true,
            telephoneWhatsapp: true
          }
        }
      },
      orderBy: { createdAt: 'asc' }
    })

    return NextResponse.json({ success: true, data: inscrits })
  } catch {
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!(await getAuthorizedAdmin(request))) {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
  }
  if (!isSameOrigin(request)) return NextResponse.json({ error: 'Origine non autorisée' }, { status: 403 })

  try {
    const { id } = await params
    const body = await safeJson<Record<string, unknown>>(request, 4_096)
    const membreId = safeText(body.membreId, 120)
    if (!membreId) return NextResponse.json({ error: 'Membre requis' }, { status: 400 })

    const [traversee, membre] = await Promise.all([
      db.traversee.findUnique({ where: { id }, select: { id: true, gradesAutorises: true } }),
      db.membre.findFirst({
        where: { id: membreId, statut: 'actif' },
        select: { id: true, nom: true, prenoms: true, nomSacre: true, grade: true, telephoneWhatsapp: true },
      }),
    ])
    if (!traversee) return NextResponse.json({ error: 'Événement non trouvé' }, { status: 404 })
    if (!membre) return NextResponse.json({ error: 'Membre actif introuvable' }, { status: 404 })
    if (!gradeAutorise(membre.grade, traversee.gradesAutorises)) {
      return NextResponse.json({ error: "Le grade de ce membre n'est pas autorisé" }, { status: 403 })
    }

    const existante = await db.inscriptionTraversee.findUnique({
      where: { traverseeId_membreId: { traverseeId: id, membreId } },
      select: { id: true },
    })
    if (existante) return NextResponse.json({ error: 'Ce membre est déjà inscrit' }, { status: 409 })

    const inscription = await db.inscriptionTraversee.create({
      data: { traverseeId: id, membreId },
      include: {
        membre: {
          select: {
            id: true, nom: true, prenoms: true, nomSacre: true,
            grade: true, telephoneWhatsapp: true,
          },
        },
      },
    })
    return NextResponse.json({ success: true, data: inscription }, { status: 201 })
  } catch {
    return NextResponse.json({ error: 'Inscription impossible' }, { status: 400 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!(await getAuthorizedAdmin(request))) {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
  }
  if (!isSameOrigin(request)) return NextResponse.json({ error: 'Origine non autorisée' }, { status: 403 })

  try {
    const { id } = await params
    const inscriptionId = safeText(request.nextUrl.searchParams.get('inscriptionId'), 120)
    if (!inscriptionId) return NextResponse.json({ error: 'Inscription requise' }, { status: 400 })

    const inscription = await db.inscriptionTraversee.findFirst({
      where: { id: inscriptionId, traverseeId: id },
      select: { id: true },
    })
    if (!inscription) return NextResponse.json({ error: 'Inscription introuvable' }, { status: 404 })

    await db.inscriptionTraversee.delete({ where: { id: inscription.id } })
    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: 'Retrait impossible' }, { status: 400 })
  }
}
