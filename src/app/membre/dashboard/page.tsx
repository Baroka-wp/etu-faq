'use client'

import { useEffect, useState } from 'react'
import { Calendar, BookOpen, Users } from 'lucide-react'
import Link from 'next/link'

interface Membre {
  nom: string
  prenoms: string
  nomSacre: string | null
  grade: string
  equipage: string
  createdAt: string
}

interface Participation {
  concernees: number
  participations: number
  taux: number | null
}

export default function DashboardPage() {
  const [membre, setMembre] = useState<Membre | null>(null)
  const [participation, setParticipation] = useState<Participation | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [membreResponse, statsResponse] = await Promise.all([
          fetch('/api/membre/me'),
          fetch('/api/membre/stats')
        ])
        if (membreResponse.ok) {
          const membreData = await membreResponse.json()
          setMembre(membreData.membre)
        }
        if (statsResponse.ok) {
          const statsData = await statsResponse.json()
          setParticipation(statsData.stats?.participation ?? null)
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
          <div className="h-8 bg-gray-200 w-1/3"></div>
          <div className="h-24 bg-gray-200"></div>
        </div>
      </div>
    )
  }

  const memberSince = membre?.createdAt
    ? new Date(membre.createdAt).toLocaleDateString('fr-FR', { year: 'numeric', month: 'long' })
    : ''

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      {/* En-tête */}
      <div className="mb-10 pb-6 border-b-2 border-black">
        <h1 className="text-4xl sm:text-5xl font-serif font-bold text-gray-900 mb-2">
          Bienvenue, {membre?.nomSacre || membre?.prenoms}
        </h1>
        <p className="text-lg text-gray-600 font-serif">
          {membre?.grade} ; Équipage {membre?.equipage}
        </p>
        {memberSince && (
          <p className="text-sm text-gray-500 font-serif mt-1">
            Membre depuis {memberSince}
          </p>
        )}
        {participation && participation.taux !== null && (
          <p className="text-sm text-gray-700 font-serif mt-3">
            Taux de participation aux traversées :{' '}
            <span className="font-bold">{participation.taux}%</span>
            <span className="text-gray-500">
              {' '}({participation.participations}/{participation.concernees} traversées de votre grade)
            </span>
          </p>
        )}
      </div>

      {/* Grille asymétrique de raccourcis */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-0 border-2 border-black">
        {/* Planning - grand bloc en haut à gauche */}
        <Link
          href="/membre/planning"
          className="md:col-span-8 bg-white border-b-2 md:border-r-2 border-black p-8 lg:p-12 hover:bg-gray-900 group transition-colors"
        >
          <div className="flex items-start justify-between mb-6">
            <Calendar className="w-10 h-10 text-gray-900 group-hover:text-white transition-colors" strokeWidth={1.5} />
            <span className="text-5xl lg:text-6xl font-serif font-bold text-gray-200 group-hover:text-gray-700 transition-colors">01</span>
          </div>
          <h3 className="text-2xl lg:text-3xl font-bold font-serif mb-2 text-gray-900 group-hover:text-white transition-colors">
            Consulter le planning
          </h3>
          <p className="text-gray-600 font-serif group-hover:text-gray-300 transition-colors">
            Traversées et événements autorisés pour votre grade
          </p>
        </Link>

        {/* Bibliothèque */}
        <Link
          href="/membre/bibliotheque"
          className="md:col-span-4 bg-gray-50 border-b-2 border-black p-8 lg:p-12 hover:bg-gray-900 group transition-colors"
        >
          <div className="flex items-start justify-between mb-6">
            <BookOpen className="w-10 h-10 text-gray-900 group-hover:text-white transition-colors" strokeWidth={1.5} />
            <span className="text-5xl lg:text-6xl font-serif font-bold text-gray-200 group-hover:text-gray-700 transition-colors">02</span>
          </div>
          <h3 className="text-2xl lg:text-3xl font-bold font-serif mb-2 text-gray-900 group-hover:text-white transition-colors">
            Bibliothèque
          </h3>
          <p className="text-gray-600 font-serif group-hover:text-gray-300 transition-colors">
            Livres et ressources de l'ETU
          </p>
        </Link>

        {/* Profil */}
        <Link
          href="/membre/profil"
          className="md:col-span-12 bg-white p-8 lg:p-12 hover:bg-gray-900 group transition-colors"
        >
          <div className="flex items-start justify-between mb-6">
            <Users className="w-10 h-10 text-gray-900 group-hover:text-white transition-colors" strokeWidth={1.5} />
            <span className="text-5xl lg:text-6xl font-serif font-bold text-gray-200 group-hover:text-gray-700 transition-colors">03</span>
          </div>
          <h3 className="text-2xl lg:text-3xl font-bold font-serif mb-2 text-gray-900 group-hover:text-white transition-colors">
            Mon profil
          </h3>
          <p className="text-gray-600 font-serif group-hover:text-gray-300 transition-colors">
            Informations et paramètres personnels
          </p>
        </Link>
      </div>
    </div>
  )
}
