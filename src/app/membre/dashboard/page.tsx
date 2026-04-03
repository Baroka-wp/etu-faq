'use client'

import { useEffect, useState } from 'react'
import { Calendar, Users, BookOpen, Star, TrendingUp } from 'lucide-react'
import Link from 'next/link'

interface Membre {
  nom: string
  prenoms: string
  nomSacre: string | null
  grade: string
  equipage: string
  createdAt: string
}

interface Stats {
  prochainEvents: number
  totalInscriptions: number
  totalLivres: number
}

export default function DashboardPage() {
  const [membre, setMembre] = useState<Membre | null>(null)
  const [stats, setStats] = useState<Stats>({ prochainEvents: 0, totalInscriptions: 0, totalLivres: 0 })
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const membreResponse = await fetch('/api/membre/me')
        if (membreResponse.ok) {
          const membreData = await membreResponse.json()
          setMembre(membreData.membre)
        }

        // TODO: Récupérer les vraies statistiques
        setStats({
          prochainEvents: 5,
          totalInscriptions: 12,
          totalLivres: 24
        })
      } catch (error) {
        console.error('Erreur lors du chargement:', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [])

  if (isLoading) {
    return (
      <div className="p-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/3"></div>
          <div className="h-24 bg-gray-200 rounded"></div>
        </div>
      </div>
    )
  }

  const memberSince = membre?.createdAt
    ? new Date(membre.createdAt).toLocaleDateString('fr-FR', { year: 'numeric', month: 'long' })
    : ''

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      {/* En-tête de bienvenue */}
      <div className="mb-8">
        <h1 className="text-3xl sm:text-4xl font-serif font-bold text-gray-900 mb-2">
          Bienvenue, {membre?.nomSacre || membre?.prenoms}
        </h1>
        <p className="text-lg text-gray-600 font-serif">
          {membre?.grade} - Équipage {membre?.equipage}
        </p>
        {memberSince && (
          <p className="text-sm text-gray-500 font-serif mt-1">
            Membre depuis {memberSince}
          </p>
        )}
      </div>

      {/* Cartes de statistiques */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <Calendar className="w-6 h-6 text-blue-600" />
            </div>
            <span className="text-sm font-semibold text-blue-600 font-serif">Prochainement</span>
          </div>
          <h3 className="text-3xl font-bold text-gray-900 mb-1">{stats.prochainEvents}</h3>
          <p className="text-sm text-gray-600 font-serif">Événements à venir</p>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <Users className="w-6 h-6 text-green-600" />
            </div>
            <span className="text-sm font-semibold text-green-600 font-serif">Total</span>
          </div>
          <h3 className="text-3xl font-bold text-gray-900 mb-1">{stats.totalInscriptions}</h3>
          <p className="text-sm text-gray-600 font-serif">Traversées suivies</p>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
              <BookOpen className="w-6 h-6 text-purple-600" />
            </div>
            <span className="text-sm font-semibold text-purple-600 font-serif">Disponibles</span>
          </div>
          <h3 className="text-3xl font-bold text-gray-900 mb-1">{stats.totalLivres}</h3>
          <p className="text-sm text-gray-600 font-serif">Livres dans la bibliothèque</p>
        </div>
      </div>

      {/* Raccourcis rapides */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Link
          href="/membre/planning"
          className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-lg p-8 text-white hover:shadow-xl transition-all transform hover:-translate-y-1"
        >
          <div className="flex items-center justify-between mb-4">
            <Calendar className="w-12 h-12" />
            <TrendingUp className="w-6 h-6 opacity-50" />
          </div>
          <h3 className="text-2xl font-bold font-serif mb-2">Consulter le planning</h3>
          <p className="text-blue-100 font-serif">
            Voir les traversées et événements autorisés pour votre grade
          </p>
        </Link>

        <Link
          href="/membre/carte-du-ciel"
          className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl shadow-lg p-8 text-white hover:shadow-xl transition-all transform hover:-translate-y-1"
        >
          <div className="flex items-center justify-between mb-4">
            <Star className="w-12 h-12" />
            <TrendingUp className="w-6 h-6 opacity-50" />
          </div>
          <h3 className="text-2xl font-bold font-serif mb-2">Carte du ciel</h3>
          <p className="text-purple-100 font-serif">
            Découvrez votre thème astral et positions planétaires
          </p>
        </Link>

        <Link
          href="/membre/bibliotheque"
          className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl shadow-lg p-8 text-white hover:shadow-xl transition-all transform hover:-translate-y-1"
        >
          <div className="flex items-center justify-between mb-4">
            <BookOpen className="w-12 h-12" />
            <TrendingUp className="w-6 h-6 opacity-50" />
          </div>
          <h3 className="text-2xl font-bold font-serif mb-2">Bibliothèque</h3>
          <p className="text-green-100 font-serif">
            Accéder aux livres et ressources de l'ETU
          </p>
        </Link>

        <Link
          href="/membre/profil"
          className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl shadow-lg p-8 text-white hover:shadow-xl transition-all transform hover:-translate-y-1"
        >
          <div className="flex items-center justify-between mb-4">
            <Users className="w-12 h-12" />
            <TrendingUp className="w-6 h-6 opacity-50" />
          </div>
          <h3 className="text-2xl font-bold font-serif mb-2">Mon profil</h3>
          <p className="text-orange-100 font-serif">
            Gérer vos informations et paramètres personnels
          </p>
        </Link>
      </div>

      {/* Message de bienvenue */}
      <div className="mt-8 bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h3 className="text-xl font-bold font-serif text-gray-900 mb-3">
          À propos de votre espace membre
        </h3>
        <div className="space-y-2 text-gray-600 font-serif">
          <p>Bienvenue dans votre espace personnel OMP-ETU Bénin.</p>
          <p>
            Depuis ce tableau de bord, vous pouvez consulter votre planning personnalisé,
            vous inscrire aux traversées, accéder à votre carte du ciel, consulter la bibliothèque
            et gérer vos informations personnelles.
          </p>
          <p className="text-sm text-gray-500 mt-4">
            Pour toute question ou assistance, contactez l'administrateur au +229 67 15 39 74.
          </p>
        </div>
      </div>
    </div>
  )
}
