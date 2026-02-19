import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params
        const course = await prisma.course.findUnique({
            where: { id }
        })

        if (!course) {
            return NextResponse.json(
                { error: 'Cours non trouvé' },
                { status: 404 }
            )
        }

        return NextResponse.json(course)
    } catch (error) {
        console.error('Erreur lors de la récupération du cours:', error)
        return NextResponse.json(
            { error: 'Erreur lors de la récupération du cours' },
            { status: 500 }
        )
    }
}

export async function PUT(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params
        const body = await request.json()
        const { title, videoUrl, shortDescription, longDescription, thumbnailUrl, order, published } = body

        const course = await prisma.course.update({
            where: { id },
            data: {
                title,
                videoUrl,
                shortDescription,
                longDescription,
                thumbnailUrl,
                order,
                published
            }
        })

        return NextResponse.json(course)
    } catch (error) {
        console.error('Erreur lors de la modification du cours:', error)
        return NextResponse.json(
            { error: 'Erreur lors de la modification du cours' },
            { status: 500 }
        )
    }
}

export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params
        await prisma.course.delete({
            where: { id }
        })

        return NextResponse.json({ success: true })
    } catch (error) {
        console.error('Erreur lors de la suppression du cours:', error)
        return NextResponse.json(
            { error: 'Erreur lors de la suppression du cours' },
            { status: 500 }
        )
    }
}
