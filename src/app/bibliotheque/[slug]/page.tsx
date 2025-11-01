import { Metadata } from 'next'
import { PrismaClient } from '@prisma/client'
import { notFound } from 'next/navigation'
import BookDetail from '@/components/BookDetail'

const prisma = new PrismaClient()

interface PageProps {
    params: Promise<{
        slug: string
    }>
}

// Générer les métadonnées Open Graph pour le partage sur les réseaux sociaux
export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
    const resolvedParams = await params
    const book = await prisma.book.findUnique({
        where: { slug: resolvedParams.slug }
    })

    if (!book) {
        return {
            title: 'Livre non trouvé - Bibliothèque ETU-Bénin',
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
    const book = await prisma.book.findUnique({
        where: { slug: resolvedParams.slug }
    })

    if (!book) {
        notFound()
    }

    return <BookDetail book={book} />
}
