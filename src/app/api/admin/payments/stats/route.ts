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

    // Récupérer tous les paiements payés
    const paiementsPayes = await (prisma as any).payment.findMany({
      where: {
        estPaye: true
      }
    })

    // Calculer les statistiques
    const stats = {
      totalRecettes: 0,
      recettesInscription: 0,
      recettesMensuelles: 0,
      nombreInscriptionsPayes: 0,
      nombrePaiementsMensuelsPayes: 0
    }

    paiementsPayes.forEach((paiement: any) => {
      stats.totalRecettes += paiement.montant

      if (paiement.type === 'INSCRIPTION') {
        stats.recettesInscription += paiement.montant
        stats.nombreInscriptionsPayes++
      } else if (paiement.type === 'MENSUEL') {
        stats.recettesMensuelles += paiement.montant
        stats.nombrePaiementsMensuelsPayes++
      }
    })

    // Récupérer tous les membres actifs
    const membresActifs = await (prisma as any).inscription.findMany({
      where: {
        statut: 'Actif'
      },
      include: {
        payments: true
      }
    })

    // Calculer combien de membres sont à jour
    const currentDate = new Date()
    const currentMonth = currentDate.getMonth() + 1
    const currentYear = currentDate.getFullYear()

    let membresAJour = 0
    let membresEnRetard = 0

    membresActifs.forEach((membre: any) => {
      const inscriptionDate = new Date(membre.createdAt)
      const inscriptionMonth = inscriptionDate.getMonth() + 1
      const inscriptionYear = inscriptionDate.getFullYear()

      // Vérifier si le paiement d'inscription est fait
      const paiementInscription = membre.payments.find(
        (p: any) => p.type === 'INSCRIPTION' && p.estPaye
      )

      if (!paiementInscription) {
        membresEnRetard++
        return
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

      if (tousLesMoisPayes) {
        membresAJour++
      } else {
        membresEnRetard++
      }
    })

    // Recettes par mois (12 derniers mois)
    const recettesParMois: { mois: number; annee: number; label: string; total: number }[] = []
    for (let i = 11; i >= 0; i--) {
      const date = new Date()
      date.setMonth(date.getMonth() - i)
      const mois = date.getMonth() + 1
      const annee = date.getFullYear()

      const paiementsDuMois = paiementsPayes.filter((p: any) => {
        if (p.type === 'MENSUEL') {
          return p.mois === mois && p.annee === annee
        } else if (p.type === 'INSCRIPTION' && p.datePaiement) {
          const datePaiement = new Date(p.datePaiement)
          return datePaiement.getMonth() + 1 === mois && datePaiement.getFullYear() === annee
        }
        return false
      })

      const totalMois = paiementsDuMois.reduce((sum: number, p: any) => sum + p.montant, 0)

      recettesParMois.push({
        mois,
        annee,
        label: `${date.toLocaleString('fr-FR', { month: 'short' })} ${annee}`,
        total: totalMois
      })
    }

    return NextResponse.json({
      stats,
      membresAJour,
      membresEnRetard,
      totalMembresActifs: membresActifs.length,
      recettesParMois
    })

  } catch (error: any) {
    console.error('Erreur lors de la récupération des statistiques:', error)

    return NextResponse.json(
      { error: 'Une erreur est survenue lors de la récupération des statistiques' },
      { status: 500 }
    )
  } finally {
    await prisma.$disconnect()
  }
}
