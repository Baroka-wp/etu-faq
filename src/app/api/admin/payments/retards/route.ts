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

    // Récupérer tous les membres actifs avec leurs paiements
    const membresActifs = await (prisma as any).inscription.findMany({
      where: {
        statut: 'Actif'
      },
      include: {
        payments: true
      }
    })

    const currentDate = new Date()
    const currentMonth = currentDate.getMonth() + 1
    const currentYear = currentDate.getFullYear()

    const membresStatus = membresActifs.map((membre: any) => {
      const inscriptionDate = new Date(membre.createdAt)
      const inscriptionMonth = inscriptionDate.getMonth() + 1
      const inscriptionYear = inscriptionDate.getFullYear()

      // Vérifier si le paiement d'inscription est fait
      const paiementInscription = membre.payments.find(
        (p: any) => p.type === 'INSCRIPTION' && p.estPaye
      )

      if (!paiementInscription) {
        return {
          id: membre.id,
          nom: membre.nom,
          prenom: membre.prenom,
          estAJour: false
        }
      }

      // Calculer combien de mois de cotisation sont dus
      let moisDus: { mois: number; annee: number }[] = []
      let year = inscriptionYear
      let month = inscriptionMonth

      while (year < currentYear || (year === currentYear && month <= currentMonth)) {
        moisDus.push({ mois: month, annee: year })
        month++
        if (month > 12) {
          month = 1
          year++
        }
      }

      // Vérifier si tous les mois sont payés
      const tousLesMoisPayes = moisDus.every(({ mois, annee }) => {
        return membre.payments.some(
          (p: any) =>
            p.type === 'MENSUEL' &&
            p.mois === mois &&
            p.annee === annee &&
            p.estPaye
        )
      })

      return {
        id: membre.id,
        nom: membre.nom,
        prenom: membre.prenom,
        estAJour: tousLesMoisPayes
      }
    })

    return NextResponse.json({
      membresAJour: membresStatus.filter((m: any) => m.estAJour).map((m: any) => m.id),
      membresEnRetard: membresStatus.filter((m: any) => !m.estAJour).map((m: any) => m.id),
      details: membresStatus
    })

  } catch (error: any) {
    console.error('Erreur lors de la récupération des retards:', error)

    return NextResponse.json(
      { error: 'Une erreur est survenue lors de la récupération des retards' },
      { status: 500 }
    )
  } finally {
    await prisma.$disconnect()
  }
}
