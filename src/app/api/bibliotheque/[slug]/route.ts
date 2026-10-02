import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

/**
 * Fiche publique d'une ressource. Une ressource restreinte ne livre que son
 * existence et son titre : le contenu passe par le nom sacré ou un code.
 */
export async function GET(request: Request, { params }: { params: Promise<{ slug: string }> }) {
  try {
    const { slug } = await params
    const book = await db.book.findUnique({ where: { slug } })

    if (!book || !book.publie) {
      return NextResponse.json({ error: 'Livre non trouvé' }, { status: 404 })
    }

    if (book.acces === 'restreint') {
      return NextResponse.json({
        restreint: true,
        book: {
          id: book.id,
          slug: book.slug,
          title: book.title,
          author: book.author,
          imageUrl: book.imageUrl,
          type: book.type,
          gradesAutorises: book.gradesAutorises,
        },
      })
    }

    return NextResponse.json({ book })
  } catch (error) {
    console.error('Erreur lors de la récupération du livre:', error)
    return NextResponse.json({ error: 'Erreur lors de la récupération du livre' }, { status: 500 })
  }
}
