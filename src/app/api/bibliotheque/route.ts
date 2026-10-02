import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

/**
 * Liste publique : seules les ressources publiées et ouvertes à tous.
 * Les ressources restreintes s'obtiennent par nom sacré ou par code.
 */
export async function GET() {
  try {
    const books = await db.book.findMany({
      where: { publie: true, acces: 'public' },
      orderBy: { createdAt: 'desc' },
    })
    return NextResponse.json({ books })
  } catch (error) {
    console.error('Erreur lors de la récupération des livres:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la récupération des livres' },
      { status: 500 },
    )
  }
}
