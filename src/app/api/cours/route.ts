import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function GET(request: NextRequest) {
    try {
        const courses = await prisma.course.findMany({
            where: { published: true },
            orderBy: { order: 'asc' }
        })
        return NextResponse.json(courses)
    } catch (error) {
        console.error('Erreur lors de la récupération des cours:', error)
        return NextResponse.json(
            { error: 'Erreur lors de la récupération des cours' },
            { status: 500 }
        )
    }
}

export async function POST(request: NextRequest) {
    try {
        const body = await request.json()
        const { title, videoUrl, shortDescription, longDescription, thumbnailUrl, order } = body

        if (!title || !videoUrl || !shortDescription || !longDescription) {
            return NextResponse.json(
                { error: 'Tous les champs obligatoires ne sont pas remplis' },
                { status: 400 }
            )
        }

        const course = await prisma.course.create({
            data: {
                title,
                videoUrl,
                shortDescription,
                longDescription,
                thumbnailUrl: thumbnailUrl || null,
                order: order || 0,
                published: true
            }
        })

        return NextResponse.json(course, { status: 201 })
    } catch (error) {
        console.error('Erreur lors de la création du cours:', error)
        return NextResponse.json(
            { error: 'Erreur lors de la création du cours' },
            { status: 500 }
        )
    }
}
