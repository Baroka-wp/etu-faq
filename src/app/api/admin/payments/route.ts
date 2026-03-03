import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function GET(request: NextRequest) {
  try {
    // Vérifier l'authentification admin
    const adminSession = request.cookies.get('admin-session')?.value
    if (adminSession !== 'authenticated') {
      return NextResponse.json(
        { error: 'Non autorisé' },
        { status: 401 }
      )
    }

    const searchParams = request.nextUrl.searchParams
    const inscriptionId = searchParams.get('inscriptionId')

    if (!inscriptionId) {
      return NextResponse.json(
        { error: 'inscriptionId requis' },
        { status: 400 }
      )
    }

    const payments = await (prisma as any).payment.findMany({
      where: {
        inscriptionId: inscriptionId
      },
      orderBy: [
        { annee: 'desc' },
        { mois: 'desc' }
      ]
    })

    return NextResponse.json(payments)

  } catch (error: any) {
    console.error('Erreur lors de la récupération des paiements:', error)

    return NextResponse.json(
      { error: 'Une erreur est survenue lors de la récupération des paiements' },
      { status: 500 }
    )
  } finally {
    await prisma.$disconnect()
  }
}

export async function POST(request: NextRequest) {
  try {
    // Vérifier l'authentification admin
    const adminSession = request.cookies.get('admin-session')?.value
    if (adminSession !== 'authenticated') {
      return NextResponse.json(
        { error: 'Non autorisé' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { inscriptionId, type, montant, estPaye, mois, annee } = body

    // Validation
    if (!inscriptionId || !type || montant === undefined) {
      return NextResponse.json(
        { error: 'Données manquantes' },
        { status: 400 }
      )
    }

    // Si c'est un paiement mensuel, mois et année sont requis
    if (type === 'MENSUEL' && (!mois || !annee)) {
      return NextResponse.json(
        { error: 'Mois et année requis pour paiement mensuel' },
        { status: 400 }
      )
    }

    // Vérifier si le paiement existe déjà
    const existingPayment = await (prisma as any).payment.findFirst({
      where: {
        inscriptionId,
        type,
        ...(type === 'MENSUEL' ? { mois, annee } : {})
      }
    })

    let payment
    if (existingPayment) {
      // Mettre à jour
      payment = await (prisma as any).payment.update({
        where: { id: existingPayment.id },
        data: {
          estPaye,
          datePaiement: estPaye ? new Date() : null
        }
      })
    } else {
      // Créer
      payment = await (prisma as any).payment.create({
        data: {
          inscriptionId,
          type,
          montant,
          estPaye,
          mois: type === 'MENSUEL' ? mois : null,
          annee: type === 'MENSUEL' ? annee : null,
          datePaiement: estPaye ? new Date() : null
        }
      })
    }

    return NextResponse.json(payment)

  } catch (error: any) {
    console.error('Erreur lors de la création/mise à jour du paiement:', error)

    return NextResponse.json(
      { error: 'Une erreur est survenue lors de la création/mise à jour du paiement' },
      { status: 500 }
    )
  } finally {
    await prisma.$disconnect()
  }
}
