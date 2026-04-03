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

        // Récupérer les statistiques réelles
        const statsResponse = await fetch('/api/membre/stats')
        if (statsResponse.ok) {
          const statsData = await statsResponse.json()
          setStats(statsData.stats)
        }
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
            <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
              <Calendar className="w-6 h-6 text-gray-700" />
            </div>
            <span className="text-sm font-semibold text-gray-600 font-serif">Prochainement</span>
          </div>
          <h3 className="text-3xl font-bold text-gray-900 mb-1">{stats.prochainEvents}</h3>
          <p className="text-sm text-gray-600 font-serif">Événements à venir</p>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
              <Users className="w-6 h-6 text-gray-700" />
            </div>
            <span className="text-sm font-semibold text-gray-600 font-serif">Total</span>
          </div>
          <h3 className="text-3xl font-bold text-gray-900 mb-1">{stats.totalInscriptions}</h3>
          <p className="text-sm text-gray-600 font-serif">Traversées suivies</p>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
              <BookOpen className="w-6 h-6 text-gray-700" />
            </div>
            <span className="text-sm font-semibold text-gray-600 font-serif">Disponibles</span>
          </div>
          <h3 className="text-3xl font-bold text-gray-900 mb-1">{stats.totalLivres}</h3>
          <p className="text-sm text-gray-600 font-serif">Livres dans la bibliothèque</p>
        </div>
      </div>

      {/* Raccourcis rapides */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Link
          href="/membre/planning"
          className="bg-white border-2 border-gray-200 rounded-xl shadow-sm p-8 hover:shadow-md hover:border-gray-300 transition-all group"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="w-14 h-14 bg-gray-100 rounded-lg flex items-center justify-center group-hover:bg-gray-800 transition-colors">
              <Calendar className="w-7 h-7 text-gray-700 group-hover:text-white transition-colors" />
            </div>
            <TrendingUp className="w-5 h-5 text-gray-400" />
          </div>
          <h3 className="text-xl font-bold font-serif mb-2 text-gray-900">Consulter le planning</h3>
          <p className="text-gray-600 font-serif text-sm">
            Voir les traversées et événements autorisés pour votre grade
          </p>
        </Link>

        <Link
          href="/membre/carte-du-ciel"
          className="bg-white border-2 border-gray-200 rounded-xl shadow-sm p-8 hover:shadow-md hover:border-gray-300 transition-all group"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="w-14 h-14 bg-gray-100 rounded-lg flex items-center justify-center group-hover:bg-gray-800 transition-colors">
              <Star className="w-7 h-7 text-gray-700 group-hover:text-white transition-colors" />
            </div>
            <TrendingUp className="w-5 h-5 text-gray-400" />
          </div>
          <h3 className="text-xl font-bold font-serif mb-2 text-gray-900">Carte du ciel</h3>
          <p className="text-gray-600 font-serif text-sm">
            Découvrez votre thème astral et positions planétaires
          </p>
        </Link>

        <Link
          href="/membre/bibliotheque"
          className="bg-white border-2 border-gray-200 rounded-xl shadow-sm p-8 hover:shadow-md hover:border-gray-300 transition-all group"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="w-14 h-14 bg-gray-100 rounded-lg flex items-center justify-center group-hover:bg-gray-800 transition-colors">
              <BookOpen className="w-7 h-7 text-gray-700 group-hover:text-white transition-colors" />
            </div>
            <TrendingUp className="w-5 h-5 text-gray-400" />
          </div>
          <h3 className="text-xl font-bold font-serif mb-2 text-gray-900">Bibliothèque</h3>
          <p className="text-gray-600 font-serif text-sm">
            Accéder aux livres et ressources de l'ETU
          </p>
        </Link>

        <Link
          href="/membre/profil"
          className="bg-white border-2 border-gray-200 rounded-xl shadow-sm p-8 hover:shadow-md hover:border-gray-300 transition-all group"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="w-14 h-14 bg-gray-100 rounded-lg flex items-center justify-center group-hover:bg-gray-800 transition-colors">
              <Users className="w-7 h-7 text-gray-700 group-hover:text-white transition-colors" />
            </div>
            <TrendingUp className="w-5 h-5 text-gray-400" />
          </div>
          <h3 className="text-xl font-bold font-serif mb-2 text-gray-900">Mon profil</h3>
          <p className="text-gray-600 font-serif text-sm">
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
