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
  const [initialFormData, setInitialFormData] = useState<any>(null)

  useEffect(() => {
    fetchMembre()
  }, [])

  const fetchMembre = async () => {
    try {
      const response = await fetch('/api/membre/me')
      if (response.ok) {
        const data = await response.json()
        setMembre(data.membre)

        // Préparer les données initiales du formulaire
        const membreData = data.membre
        const initialData: any = {
          name: membreData.nomSacre || `${membreData.prenoms} ${membreData.nom}`
        }

        // Parser la date de naissance (format: DD/MM/YYYY ou YYYY-MM-DD)
        if (membreData.dateNaissance) {
          const dateStr = membreData.dateNaissance
          let day, month, year

          if (dateStr.includes('/')) {
            // Format DD/MM/YYYY
            const parts = dateStr.split('/')
            day = parseInt(parts[0])
            month = parseInt(parts[1])
            year = parseInt(parts[2])
          } else if (dateStr.includes('-')) {
            // Format YYYY-MM-DD
            const parts = dateStr.split('-')
            year = parseInt(parts[0])
            month = parseInt(parts[1])
            day = parseInt(parts[2])
          }

          if (year && month && day) {
            initialData.year = year
            initialData.month = month
            initialData.day = day
          }
        }

        // Parser l'heure de naissance (format: HH:MM)
        if (membreData.heureNaissance) {
          const timeParts = membreData.heureNaissance.split(':')
          if (timeParts.length >= 2) {
            initialData.hour = parseInt(timeParts[0])
            initialData.minute = parseInt(timeParts[1])
          }
        }

        // Parser le lieu de naissance pour extraire la ville
        if (membreData.lieuNaissance) {
          // Prendre la première partie (ville) avant la virgule ou le pays
          const city = membreData.lieuNaissance.split(',')[0].trim()
          initialData.city = city
        }

        // Déterminer le code pays depuis le lieu de naissance
        const lieu = membreData.lieuNaissance?.toLowerCase() || ''
        if (lieu.includes('benin') || lieu.includes('bénin')) {
          initialData.nation = 'BJ'
        } else if (lieu.includes('france')) {
          initialData.nation = 'FR'
        } else if (lieu.includes('togo')) {
          initialData.nation = 'TG'
        } else if (lieu.includes('niger')) {
          initialData.nation = 'NE'
        } else if (lieu.includes('côte d\'ivoire') || lieu.includes('cote d\'ivoire')) {
          initialData.nation = 'CI'
        } else {
          initialData.nation = 'BJ' // Par défaut Bénin
        }

        setInitialFormData(initialData)
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
      {initialFormData && (
        <AstrologyForm
          onSubmit={generateNatalChart}
          loading={generating}
          title="Générer votre carte du ciel"
          description="Vos informations sont pré-remplies. Vérifiez et ajustez si nécessaire."
          initialData={initialFormData}
        />
      )}

      {!initialFormData && !isLoading && (
        <AstrologyForm
          onSubmit={generateNatalChart}
          loading={generating}
          title="Générer votre carte du ciel"
          description="Remplissez les informations pour générer votre carte astrologique personnalisée"
        />
      )}

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
