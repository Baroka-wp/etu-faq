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
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto mb-4"></div>
          <p className="text-gray-600 font-serif">Chargement...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-4xl">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-serif font-bold text-gray-900 mb-2">Thème Astral</h1>
        <p className="text-sm text-gray-600 font-serif">Générez votre carte astrologique personnalisée</p>
      </div>

      {/* Message d'information si heure manquante */}
      {!membre?.heureNaissance && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-6">
          <div className="flex items-start space-x-3">
            <div className="flex-shrink-0 mt-0.5">
              <svg className="w-5 h-5 text-amber-600" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="flex-1">
              <p className="text-sm font-serif text-amber-800">
                L'heure de naissance n'est pas renseignée. Pour une carte plus précise, pensez à la renseigner dans votre profil.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Formulaire de génération */}
      {initialFormData ? (
        <AstrologyForm
          onSubmit={generateNatalChart}
          loading={generating}
          title="Générer votre Thème Astral"
          description="Vos informations sont pré-remplies. Vérifiez et ajustez si nécessaire."
          initialData={initialFormData}
        />
      ) : !isLoading && (
        <AstrologyForm
          onSubmit={generateNatalChart}
          loading={generating}
          title="Générer votre Thème Astral"
          description="Remplissez les informations pour générer votre carte astrologique personnalisée"
        />
      )}
    </div>
  )
}
