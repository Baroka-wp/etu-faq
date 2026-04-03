'use client'

import { useEffect, useState } from 'react'
import { Calendar, MapPin, Clock, Users, CheckCircle } from 'lucide-react'

interface Traversee {
  id: string
  titre: string
  type: string
  description: string
  date: string
  lieu: string
  gradesAutorises: string[]
  _count?: { inscriptions: number }
  isInscrit?: boolean
}

export default function PlanningPage() {
  const [traversees, setTraversees] = useState<Traversee[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetchTraversees()
  }, [])

  const fetchTraversees = async () => {
    try {
      const response = await fetch('/api/membre/planning')
      if (response.ok) {
        const data = await response.json()
        setTraversees(data.traversees || [])
      }
    } catch (error) {
      console.error('Erreur:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleInscription = async (traverseeId: string) => {
    try {
      const response = await fetch('/api/membre/planning/inscrire', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ traverseeId })
      })

      if (response.ok) {
        alert('Inscription réussie !')
        fetchTraversees()
      } else {
        const data = await response.json()
        alert(data.error || 'Erreur lors de l\'inscription')
      }
    } catch (error) {
      alert('Erreur de connexion')
    }
  }

  if (isLoading) {
    return <div className="p-8">Chargement du planning...</div>
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <h1 className="text-3xl font-serif font-bold text-gray-900 mb-8">Mon Planning</h1>

      {traversees.length === 0 ? (
        <div className="bg-white rounded-xl p-12 text-center">
          <Calendar className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600 font-serif">Aucun événement programmé pour le moment</p>
        </div>
      ) : (
        <div className="grid gap-6">
          {traversees.map((traversee) => (
            <div key={traversee.id} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-xl font-bold font-serif text-gray-900">{traversee.titre}</h3>
                  <span className="inline-block px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full font-semibold mt-2">
                    {traversee.type}
                  </span>
                </div>
                {traversee.isInscrit && (
                  <span className="flex items-center text-green-600 font-semibold text-sm">
                    <CheckCircle className="w-5 h-5 mr-1" />
                    Inscrit
                  </span>
                )}
              </div>

              <p className="text-gray-600 font-serif mb-4">{traversee.description}</p>

              <div className="flex flex-wrap gap-4 text-sm text-gray-600 mb-4">
                <div className="flex items-center">
                  <Calendar className="w-4 h-4 mr-2" />
                  {new Date(traversee.date).toLocaleDateString('fr-FR', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </div>
                <div className="flex items-center">
                  <Clock className="w-4 h-4 mr-2" />
                  {new Date(traversee.date).toLocaleTimeString('fr-FR', {
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </div>
                <div className="flex items-center">
                  <MapPin className="w-4 h-4 mr-2" />
                  {traversee.lieu}
                </div>
                {traversee._count && (
                  <div className="flex items-center">
                    <Users className="w-4 h-4 mr-2" />
                    {traversee._count.inscriptions} inscrit(s)
                  </div>
                )}
              </div>

              {!traversee.isInscrit && (
                <button
                  onClick={() => handleInscription(traversee.id)}
                  className="bg-gray-800 text-white px-6 py-2 rounded-lg hover:bg-gray-900 font-serif"
                >
                  S'inscrire
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
