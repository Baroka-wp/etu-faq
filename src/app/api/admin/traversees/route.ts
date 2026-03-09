import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const adminSession = request.cookies.get('admin-session')?.value
    if (adminSession !== 'authenticated') {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
    }

    const traversees = await db.traversee.findMany({
      orderBy: { date: 'desc' },
      include: {
        _count: { select: { inscriptions: true } }
      }
    })

    return NextResponse.json({ success: true, data: traversees })
  } catch {
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const adminSession = request.cookies.get('admin-session')?.value
    if (adminSession !== 'authenticated') {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
    }

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

    const grades = Array.isArray(gradesAutorises) && gradesAutorises.length > 0
      ? gradesAutorises
      : ['Explorateur', 'Constructeur', 'Navigateur', 'Alchimiste']

    const traversee = await db.traversee.create({
      data: { type: type || 'Traversée Grand Navire', titre, description, date: new Date(date), lieu, lienUnique, gradesAutorises: grades },
      include: { _count: { select: { inscriptions: true } } }
    })

    return NextResponse.json({ success: true, data: traversee })
  } catch (error: unknown) {
    if (error && typeof error === 'object' && 'code' in error && error.code === 'P2002') {
      return NextResponse.json({ error: 'Ce lien unique est déjà utilisé. Veuillez en choisir un autre.' }, { status: 409 })
    }
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
