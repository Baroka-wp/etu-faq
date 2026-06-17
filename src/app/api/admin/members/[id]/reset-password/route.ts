import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()
    const { motDePasse } = body

    if (!motDePasse || motDePasse.length < 6) {
      return NextResponse.json(
        { error: 'Le mot de passe doit contenir au moins 6 caractères' },
        { status: 400 }
      )
    }

    const membre = await (prisma as any).membre.findUnique({ where: { id } })

    if (!membre) {
      return NextResponse.json({ error: 'Membre non trouvé' }, { status: 404 })
    }

    const hashedPassword = await bcrypt.hash(motDePasse, 10)

    await (prisma as any).membre.update({
      where: { id },
      data: {
        motDePasse: hashedPassword,
        derniereConnexion: null
      }
    })

    return NextResponse.json({
      success: true,
      message: 'Mot de passe réinitialisé avec succès'
    })

  } catch (error) {
    console.error('Erreur reset-password:', error)
    return NextResponse.json(
      { error: 'Une erreur est survenue' },
      { status: 500 }
    )
  } finally {
    await prisma.$disconnect()
  }
}
