import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { db } from '@/lib/db'
import BookDetail from '@/components/BookDetail'
import RessourceReservee from '@/components/acces/RessourceReservee'
import { getLecteurServeur, nomLecteur, peutVoirRessource } from '@/lib/acces-lecteur'

interface PageProps {
    params: Promise<{
        slug: string
    }>
}

// Générer les métadonnées Open Graph pour le partage sur les réseaux sociaux
export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
    const resolvedParams = await params
    const book = await db.book.findUnique({
        where: { slug: resolvedParams.slug }
    })

    if (!book || !book.publie) {
        return {
            title: 'Livre non trouvé - Bibliothèque ETU-Bénin',
        }
    }

    // Une ressource réservée ne livre pas sa description au partage.
    if (book.acces === 'restreint') {
        return {
            title: `${book.title} - Bibliothèque ETU-Bénin`,
            description: 'Ressource réservée : accès par nom sacré ou par code.',
            robots: { index: false, follow: false },
        }
    }

    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://etufaq.vercel.app'
    const url = `${baseUrl}/bibliotheque/${book.slug}`

    return {
        title: `${book.title} - Bibliothèque ETU-Bénin`,
        description: book.description.length > 160
            ? book.description.substring(0, 157) + '...'
            : book.description,
        openGraph: {
            title: book.title,
            description: book.description,
            url: url,
            siteName: 'ETU-Bénin',
            images: book.imageUrl ? [
                {
                    url: book.imageUrl,
                    width: 1200,
                    height: 630,
                    alt: book.title,
                }
            ] : [],
            locale: 'fr_FR',
            type: 'book',
        },
        twitter: {
            card: 'summary_large_image',
            title: book.title,
            description: book.description,
            images: book.imageUrl ? [book.imageUrl] : [],
        },
    }
}

export default async function BookPage({ params }: PageProps) {
    const resolvedParams = await params
    const book = await db.book.findUnique({
        where: { slug: resolvedParams.slug }
    })

    if (!book || !book.publie) {
        notFound()
    }

    const lecteur = await getLecteurServeur()
    if (!peutVoirRessource(lecteur, book)) {
        return (
            <RessourceReservee
                titre={book.title}
                auteur={book.author}
                imageUrl={book.imageUrl}
                type={book.type}
                gradesAutorises={book.gradesAutorises}
                lecteurConnu={lecteur ? nomLecteur(lecteur) : null}
            />
        )
    }

    return <BookDetail book={book} />
}
