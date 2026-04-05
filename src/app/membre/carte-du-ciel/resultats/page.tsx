'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'

export default function ResultatsMembre() {
  const router = useRouter()
  const [chartData, setChartData] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const savedData = localStorage.getItem('astrology-chart-data')
    if (savedData) {
      try {
        const parsedData = JSON.parse(savedData)
        setChartData(parsedData)
      } catch (error) {
        console.error('Erreur parsing:', error)
      }
    }
    setLoading(false)
  }, [])

  if (loading) {
    return <div className="p-8">Chargement...</div>
  }

  if (!chartData) {
    return (
      <div className="p-8 text-center">
        <p className="text-gray-600 mb-4">Aucune donnée de Theme astral trouvée</p>
        <Link href="/membre/carte-du-ciel" className="text-gray-900 hover:underline">
          Retour
        </Link>
      </div>
    )
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-6xl">
      <div className="mb-6">
        <Link
          href="/membre/carte-du-ciel"
          className="inline-flex items-center text-gray-600 hover:text-gray-900 font-serif"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Retour
        </Link>
      </div>

      <h1 className="text-3xl font-serif font-bold text-gray-900 mb-8">
        Votre Theme astral
      </h1>

      {/* Informations de base */}
      {chartData.basic_info && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
          <h2 className="text-xl font-bold font-serif text-gray-900 mb-4">
            Informations
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm font-serif">
            <div>
              <span className="text-gray-500">Nom:</span>
              <span className="ml-2 font-semibold">{chartData.basic_info.name}</span>
            </div>
            <div>
              <span className="text-gray-500">Date de naissance:</span>
              <span className="ml-2 font-semibold">{chartData.basic_info.birth_date}</span>
            </div>
            <div>
              <span className="text-gray-500">Heure:</span>
              <span className="ml-2 font-semibold">{chartData.basic_info.birth_time}</span>
            </div>
            <div>
              <span className="text-gray-500">Lieu:</span>
              <span className="ml-2 font-semibold">{chartData.basic_info.location}</span>
            </div>
          </div>
        </div>
      )}

      {/* Carte SVG */}
      {chartData.svg?.base64 && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
          <h2 className="text-xl font-bold font-serif text-gray-900 mb-4">
            Thème Astral
          </h2>
          <div className="flex justify-center">
            <img
              src={`data:image/svg+xml;base64,${chartData.svg.base64}`}
              alt="Theme astral"
              className="max-w-full h-auto"
            />
          </div>
        </div>
      )}

      {/* Positions planétaires */}
      {chartData.planets && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-xl font-bold font-serif text-gray-900 mb-4">
            Positions Planétaires
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm font-serif">
              <thead className="border-b border-gray-200">
                <tr>
                  <th className="text-left py-2 px-3">Planète</th>
                  <th className="text-left py-2 px-3">Signe</th>
                  <th className="text-left py-2 px-3">Position</th>
                  <th className="text-left py-2 px-3">Maison</th>
                </tr>
              </thead>
              <tbody>
                {Object.entries(chartData.planets).map(([key, planet]: [string, any]) => (
                  <tr key={key} className="border-b border-gray-100">
                    <td className="py-2 px-3 font-semibold">{planet.planet_name}</td>
                    <td className="py-2 px-3">{planet.sign}</td>
                    <td className="py-2 px-3">{planet.position?.toFixed(2)}°</td>
                    <td className="py-2 px-3">Maison {planet.house}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
