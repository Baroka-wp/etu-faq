import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

function gradeAutorise(membreGrade: string, gradesAutorises: string[]): boolean {
  if (membreGrade === 'Alchimiste') return true
  if (gradesAutorises.length === 0) return true
  return gradesAutorises.includes(membreGrade)
}

export async function GET(request: NextRequest) {
  try {
    const nomSacre = request.nextUrl.searchParams.get('nomSacre')

    if (!nomSacre || !nomSacre.trim()) {
      return NextResponse.json({ error: 'Le nom sacré est requis' }, { status: 400 })
    }

    const membre = await db.membre.findFirst({
      where: {
        nomSacre: { equals: nomSacre.trim(), mode: 'insensitive' },
        statut: 'actif'
      },
      select: {
        id: true,
        nom: true,
        prenoms: true,
        nomSacre: true,
        grade: true
      }
    })

    if (!membre) {
      return NextResponse.json({ error: 'Aucun membre actif trouvé avec ce nom sacré' }, { status: 404 })
    }

    // Récupérer tous les événements à venir
    const traversees = await db.traversee.findMany({
      where: { date: { gte: new Date() } },
      orderBy: { date: 'asc' },
      select: {
        id: true,
        type: true,
        titre: true,
        description: true,
        date: true,
        lieu: true,
        lienUnique: true,
        gradesAutorises: true,
        _count: { select: { inscriptions: true } }
      }
    })

    // Filtrer selon le grade du membre
    const evenements = traversees.filter(t =>
      gradeAutorise(membre.grade, t.gradesAutorises)
    )

    return NextResponse.json({ success: true, membre, evenements })
  } catch {
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
