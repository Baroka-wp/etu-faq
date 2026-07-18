import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import { rateLimit, safeJson } from '@/lib/security/http'

const prisma = new PrismaClient()

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  const limited = rateLimit(request, 'download-metadata', 40, 15 * 60 * 1000)
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

    return NextResponse.json({
      id: uniqueLink.id,
      pdfPath: uniqueLink.pdfPath,
      isActive: uniqueLink.isActive,
      expiresAt: uniqueLink.expiresAt,
      downloadedAt: uniqueLink.downloadedAt,
      inscription: {
        nom: uniqueLink.inscription.nom,
        prenom: uniqueLink.inscription.prenom,
        grade: uniqueLink.inscription.grade
      }
    })

  } catch (error) {
    console.error('Erreur lors de la récupération du lien:', error)
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    )
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  try {
    const { token } = await params
    if (!/^[a-f0-9]{64}$/i.test(token)) return NextResponse.json({ error: 'Lien invalide' }, { status: 404 })
    const { downloaded } = await safeJson<{ downloaded?: unknown }>(request, 1_024)

    if (downloaded) {
      await prisma.uniqueLink.updateMany({
        where: { token, isActive: true, expiresAt: { gt: new Date() } },
        data: { downloadedAt: new Date() }
      })
    }

    return NextResponse.json({ success: true })

  } catch (error) {
    console.error('Erreur lors de la mise à jour:', error)
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    )
  }
}
