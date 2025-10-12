import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import { readFile } from 'fs/promises'
import { join } from 'path'

const prisma = new PrismaClient()

export async function GET(
  request: NextRequest,
  { params }: { params: { token: string } }
) {
  try {
    const { token } = params

    // Trouver le lien unique
    const uniqueLink = await prisma.uniqueLink.findUnique({
      where: { token },
      include: { inscription: true }
    })

    if (!uniqueLink) {
      return NextResponse.json(
        { error: 'Lien non trouvé' },
        { status: 404 }
      )
    }

    // Vérifier si le lien est actif
    if (!uniqueLink.isActive) {
      return NextResponse.json(
        { error: 'Lien désactivé' },
        { status: 403 }
      )
    }

    // Vérifier si le lien a expiré
    if (new Date(uniqueLink.expiresAt) < new Date()) {
      return NextResponse.json(
        { error: 'Lien expiré' },
        { status: 410 }
      )
    }

    try {
      // Lire le fichier PDF
      const pdfPath = join(process.cwd(), 'public', 'pdfs', uniqueLink.pdfPath)
      const pdfBuffer = await readFile(pdfPath)

      // Retourner le fichier PDF
      return new NextResponse(pdfBuffer, {
        headers: {
          'Content-Type': 'application/pdf',
          'Content-Disposition': `attachment; filename="${uniqueLink.pdfPath}"`,
          'Content-Length': pdfBuffer.length.toString()
        }
      })

    } catch (fileError) {
      console.error('Erreur lors de la lecture du fichier:', fileError)
      return NextResponse.json(
        { error: 'Fichier PDF non trouvé' },
        { status: 404 }
      )
    }

  } catch (error) {
    console.error('Erreur lors du téléchargement:', error)
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    )
  }
}
