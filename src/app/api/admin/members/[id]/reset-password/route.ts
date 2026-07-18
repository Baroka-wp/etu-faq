import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'
import { getAuthorizedAdmin } from '@/lib/security/admin'

const prisma = new PrismaClient()

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!(await getAuthorizedAdmin(request))) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
  try {
    const { id } = await params
    const body = await request.json()
    const { motDePasse } = body

    if (typeof motDePasse !== 'string' || motDePasse.length < 10 || motDePasse.length > 128) {
      return NextResponse.json(
        { error: 'Le mot de passe doit contenir entre 10 et 128 caractères' },
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
        motDePasse: hashedPassword
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
