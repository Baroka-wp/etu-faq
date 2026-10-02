import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getLecteur, nomLecteur, peutVoirCollection, peutVoirRessource } from '@/lib/acces-lecteur'

/**
 * Une collection vue par un lecteur. Tant que l'accès n'est pas ouvert,
 * seuls le titre et le nombre de ressources sont renvoyés.
 */
export async function GET(request: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params

  const collection = await db.collection.findUnique({
    where: { slug },
    include: {
      ressources: {
        orderBy: { ordre: 'asc' },
        include: { ressource: true },
      },
    },
  })

  if (!collection || !collection.publie) {
    return NextResponse.json({ error: 'Collection introuvable' }, { status: 404 })
  }

  const lecteur = await getLecteur(request)
  const ouverte = peutVoirCollection(lecteur, collection)

  if (!ouverte) {
    return NextResponse.json({
      ouverte: false,
      lecteur: lecteur ? { genre: lecteur.genre, nom: nomLecteur(lecteur) } : null,
      collection: {
        titre: collection.titre,
        description: collection.description,
        gradesAutorises: collection.gradesAutorises,
        nombre: collection.ressources.length,
      },
    })
  }

  return NextResponse.json({
    ouverte: true,
    lecteur: lecteur ? { genre: lecteur.genre, nom: nomLecteur(lecteur) } : null,
    collection: {
      titre: collection.titre,
      description: collection.description,
      nombre: collection.ressources.length,
      ressources: collection.ressources.map(({ ressource }) => {
        const accessible = peutVoirRessource(lecteur, ressource, true)
        return {
          id: ressource.id,
          slug: ressource.slug,
          titre: ressource.title,
          auteur: ressource.author,
          description: accessible ? ressource.description : null,
          type: ressource.type,
          imageUrl: ressource.imageUrl,
          prix: ressource.isFree ? 0 : ressource.price,
          gratuit: ressource.isFree,
          // Le lien du fichier n'est servi qu'aux lecteurs autorisés.
          driveUrl: accessible ? ressource.driveUrl : null,
          accessible,
          gradesAutorises: ressource.gradesAutorises,
        }
      }),
    },
  })
}
