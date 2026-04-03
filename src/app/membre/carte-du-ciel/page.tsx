'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Star, Calendar, MapPin, Clock } from 'lucide-react'
import AstrologyForm from '@/components/AstrologyForm'
import { toast } from 'sonner'

export default function CarteDuCielPage() {
  const router = useRouter()
  const [membre, setMembre] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [generating, setGenerating] = useState(false)

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

  const generateNatalChart = async (formData: any) => {
    setGenerating(true)
    try {
      const response = await fetch('/api/astrology/natal', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      const result = await response.json()

      if (result.success) {
        localStorage.setItem('astrology-chart-data', JSON.stringify(result.data))
        toast.success('Carte astrologique générée avec succès!')
        router.push('/membre/carte-du-ciel/resultats')
      } else {
        toast.error('Erreur lors de la génération de la carte')
      }
    } catch (error) {
      console.error('Error:', error)
      toast.error('Erreur lors de la génération de la carte')
    } finally {
      setGenerating(false)
    }
  }

  if (isLoading) {
    return <div className="p-8">Chargement...</div>
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-6xl">
      <h1 className="text-3xl font-serif font-bold text-gray-900 mb-8">Carte du Ciel</h1>

      {/* Informations de naissance enregistrées */}
      {membre && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
          <h2 className="text-xl font-bold font-serif text-gray-900 mb-4">Vos informations de naissance</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-center space-x-3">
              <Calendar className="w-5 h-5 text-gray-400" />
              <div>
                <p className="text-sm text-gray-500 font-serif">Date de naissance</p>
                <p className="font-semibold font-serif">{membre.dateNaissance}</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <Clock className="w-5 h-5 text-gray-400" />
              <div>
                <p className="text-sm text-gray-500 font-serif">Heure de naissance</p>
                <p className="font-semibold font-serif">{membre.heureNaissance || 'Non renseignée'}</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <MapPin className="w-5 h-5 text-gray-400" />
              <div>
                <p className="text-sm text-gray-500 font-serif">Lieu de naissance</p>
                <p className="font-semibold font-serif">{membre.lieuNaissance}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Formulaire de génération */}
      <AstrologyForm
        onSubmit={generateNatalChart}
        loading={generating}
        title="Générer votre carte du ciel"
        description="Remplissez les informations pour générer votre carte astrologique personnalisée"
      />

      {/* Aperçu des données disponibles */}
      {membre?.heureNaissance && (
        <div className="mt-6 bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-bold font-serif text-gray-900 mb-4">
            Informations complètes disponibles
          </h3>
          <div className="flex items-center space-x-2 text-gray-700">
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
        <div className="mt-6 bg-gray-50 border border-gray-300 rounded-xl p-6">
          <h3 className="text-lg font-bold font-serif text-gray-900 mb-2">
            Information manquante
          </h3>
          <p className="text-gray-700 font-serif">
            L'heure de naissance n'est pas renseignée. Pour une carte du ciel précise,
            veuillez mettre à jour votre profil avec cette information.
          </p>
        </div>
      )}
    </div>
  )
}
