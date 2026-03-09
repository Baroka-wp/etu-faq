import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const adminSession = request.cookies.get('admin-session')?.value
    if (adminSession !== 'authenticated') {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
    }

    const { id } = await params
    const { type, titre, description, date, lieu, lienUnique, gradesAutorises } = await request.json()

    if (!titre || !description || !date || !lieu || !lienUnique) {
      return NextResponse.json({ error: 'Tous les champs sont obligatoires' }, { status: 400 })
    }

    if (!/^[a-z0-9-]+$/.test(lienUnique)) {
      return NextResponse.json(
        { error: 'Le lien unique ne doit contenir que des lettres minuscules, chiffres et tirets' },
        { status: 400 }
      )
    }

    const existing = await db.traversee.findUnique({ where: { id } })
    if (!existing) {
      return NextResponse.json({ error: 'Planification non trouvée' }, { status: 404 })
    }

    const grades = Array.isArray(gradesAutorises) && gradesAutorises.length > 0
      ? gradesAutorises
      : ['Explorateur', 'Constructeur', 'Navigateur', 'Alchimiste']

    const traversee = await db.traversee.update({
      where: { id },
      data: { type: type || 'Traversée Grand Navire', titre, description, date: new Date(date), lieu, lienUnique, gradesAutorises: grades },
      include: { _count: { select: { inscriptions: true } } }
    })

    return NextResponse.json({ success: true, data: traversee })
  } catch (error: unknown) {
    if (error && typeof error === 'object' && 'code' in error && error.code === 'P2002') {
      return NextResponse.json({ error: 'Ce lien unique est déjà utilisé.' }, { status: 409 })
    }
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const adminSession = request.cookies.get('admin-session')?.value
    if (adminSession !== 'authenticated') {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
    }

    const { id } = await params

    const existing = await db.traversee.findUnique({ where: { id } })
    if (!existing) {
      return NextResponse.json({ error: 'Traversée non trouvée' }, { status: 404 })
    }

    await db.traversee.delete({ where: { id } })

    return NextResponse.json({ success: true, message: 'Traversée supprimée avec succès' })
  } catch {
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
