import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getLecteur, nomLecteur, peutVoirRessource } from '@/lib/acces-lecteur'

/**
 * Bibliothèque vue par le visiteur : les ressources ouvertes à tous, plus
 * celles que son nom sacré ou son code lui ouvre. Le reste n'est pas listé.
 */
export async function GET(request: NextRequest) {
  try {
    const [lecteur, publiees] = await Promise.all([
      getLecteur(request),
      db.book.findMany({ where: { publie: true }, orderBy: { createdAt: 'desc' } }),
    ])

    // Un code peut ouvrir une collection entière : on ajoute ses ressources.
    let parCollection: Set<string> = new Set()
    if (lecteur?.genre === 'code' && lecteur.collectionId) {
      const liens = await db.collectionRessource.findMany({
        where: { collectionId: lecteur.collectionId },
        select: { bookId: true },
      })
      parCollection = new Set(liens.map((lien) => lien.bookId))
    }

    const books = publiees
      .filter((livre) => peutVoirRessource(lecteur, livre, parCollection.has(livre.id)))
      .map((livre) => ({ ...livre, reservee: livre.acces === 'restreint' }))

    return NextResponse.json({
      books,
      lecteur: lecteur ? { genre: lecteur.genre, nom: nomLecteur(lecteur) } : null,
      reservees: publiees.filter((livre) => livre.acces === 'restreint').length,
    })
  } catch (error) {
    console.error('Erreur lors de la récupération des livres:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la récupération des livres' },
      { status: 500 },
    )
  }
}
