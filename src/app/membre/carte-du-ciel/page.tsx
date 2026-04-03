'use client'

import { useEffect, useState } from 'react'
import { Star, Calendar, MapPin, Clock } from 'lucide-react'

export default function CarteDuCielPage() {
  const [membre, setMembre] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetchMembre()
  }, [])

  const fetchMembre = async () => {
    try {
      const response = await fetch('/api/membre/me')
      if (response.ok) {
        const data = await response.json()
        setMembre(data.membre)
      }
    } catch (error) {
      console.error('Erreur:', error)
    } finally {
      setIsLoading(false)
    }
  }

  if (isLoading) {
    return <div className="p-8">Chargement...</div>
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-6xl">
      <h1 className="text-3xl font-serif font-bold text-gray-900 mb-8">Carte du Ciel</h1>

      {/* Informations de naissance */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
        <h2 className="text-xl font-bold font-serif text-gray-900 mb-4">Vos informations de naissance</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="flex items-center space-x-3">
            <Calendar className="w-5 h-5 text-gray-400" />
            <div>
              <p className="text-sm text-gray-500 font-serif">Date de naissance</p>
              <p className="font-semibold font-serif">{membre?.dateNaissance}</p>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <Clock className="w-5 h-5 text-gray-400" />
            <div>
              <p className="text-sm text-gray-500 font-serif">Heure de naissance</p>
              <p className="font-semibold font-serif">{membre?.heureNaissance || 'Non renseignée'}</p>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <MapPin className="w-5 h-5 text-gray-400" />
            <div>
              <p className="text-sm text-gray-500 font-serif">Lieu de naissance</p>
              <p className="font-semibold font-serif">{membre?.lieuNaissance}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Message d'information */}
      <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl shadow-lg p-8 text-white text-center">
        <Star className="w-16 h-16 mx-auto mb-4" />
        <h2 className="text-2xl font-bold font-serif mb-3">Fonctionnalité en développement</h2>
        <p className="text-purple-100 font-serif max-w-2xl mx-auto mb-6">
          La génération de votre carte du ciel astrologique sera bientôt disponible.
          Cette fonctionnalité calculera vos positions planétaires, maisons astrologiques,
          et aspects basés sur vos informations de naissance.
        </p>
        <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6 max-w-md mx-auto">
          <p className="text-sm font-serif">
            En attendant, pour obtenir votre carte du ciel, contactez l'administrateur au{' '}
            <a href="tel:+22967153974" className="font-bold hover:underline">
              +229 67 15 39 74
            </a>
          </p>
        </div>
      </div>

      {/* Aperçu des données disponibles */}
      {membre?.heureNaissance && (
        <div className="mt-6 bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-bold font-serif text-gray-900 mb-4">
            Informations complètes disponibles
          </h3>
          <div className="flex items-center space-x-2 text-green-600">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            <span className="font-serif">
              Vos informations sont complètes pour générer une carte du ciel précise
            </span>
          </div>
        </div>
      )}

      {!membre?.heureNaissance && (
        <div className="mt-6 bg-yellow-50 border border-yellow-200 rounded-xl p-6">
          <h3 className="text-lg font-bold font-serif text-yellow-900 mb-2">
            Information manquante
          </h3>
          <p className="text-yellow-800 font-serif">
            L'heure de naissance n'est pas renseignée. Pour une carte du ciel précise,
            veuillez mettre à jour votre profil avec cette information.
          </p>
        </div>
      )}
    </div>
  )
}
