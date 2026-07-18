import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import { readFile } from 'fs/promises'
import { basename, join } from 'path'
import { rateLimit } from '@/lib/security/http'

const prisma = new PrismaClient()

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  const limited = rateLimit(request, 'secure-download', 30, 15 * 60 * 1000)
  if (limited) return limited
  try {
    const { token } = await params
    if (!/^[a-f0-9]{64}$/i.test(token)) return NextResponse.json({ error: 'Lien invalide' }, { status: 404 })

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
      const safeFilename = basename(uniqueLink.pdfPath)
      if (safeFilename !== uniqueLink.pdfPath || !/^[a-zA-Z0-9_-]+\.pdf$/.test(safeFilename)) {
        return NextResponse.json({ error: 'Fichier invalide' }, { status: 400 })
      }
      const pdfPath = join(process.cwd(), 'public', 'pdfs', safeFilename)
      const pdfBuffer = await readFile(pdfPath)

      // Retourner le fichier PDF
      return new NextResponse(new Uint8Array(pdfBuffer), {
        headers: {
          'Content-Type': 'application/pdf',
          'Content-Disposition': `attachment; filename="${safeFilename}"`,
          'Content-Length': pdfBuffer.length.toString(),
          'Cache-Control': 'private, no-store',
          'X-Content-Type-Options': 'nosniff',
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
