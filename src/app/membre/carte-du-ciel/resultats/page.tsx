'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import {
  planetSymbols,
  planetNamesFR,
  signSymbols,
  signNamesFR,
  planetColors,
  signColors,
  planetOrder,
  formatPosition,
  toRoman
} from '@/data/astrology-symbols'

export default function ResultatsMembre() {
  const router = useRouter()
  const [chartData, setChartData] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const savedData = localStorage.getItem('astrology-chart-data')
    if (savedData) {
      try {
        const parsedData = JSON.parse(savedData)
        console.log('📊 Données du thème astral:', parsedData)
        console.log('🪐 Planètes:', parsedData.planets)
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
        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 px-6 py-4 border-b border-gray-200">
            <h2 className="text-2xl font-bold font-serif text-gray-900">
              Planètes du ciel de naissance
            </h2>
            <p className="text-sm text-gray-600 font-serif mt-1">
              Voici le tableau détaillé de vos planètes de naissance, incluant positions et maisons.
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-blue-100 border-b-2 border-blue-200">
                  <th className="text-left py-3 px-4 font-bold font-serif text-blue-900">Planète</th>
                  <th className="text-left py-3 px-4 font-bold font-serif text-blue-900">Position en signe</th>
                  <th className="text-center py-3 px-4 font-bold font-serif text-blue-900">Maison</th>
                </tr>
              </thead>
              <tbody className="bg-blue-50">
                {planetOrder
                  .map(planetKey => {
                    // Chercher directement par la clé de l'objet
                    const planetData = chartData.planets[planetKey]
                    if (!planetData) return null
                    return { key: planetKey, ...planetData }
                  })
                  .filter((planet): planet is NonNullable<typeof planet> => planet !== null)
                  .map((planet, index) => {
                    const planetKey = planet.key
                    const planetSymbol = planetSymbols[planetKey] || '●'
                    const planetNameFR = planetNamesFR[planetKey] || planetKey
                    const planetColor = planetColors[planetKey] || 'text-gray-700'

                    const signSymbol = signSymbols[planet.sign] || ''
                    const signNameFR = signNamesFR[planet.sign] || planet.sign
                    const signColor = signColors[planet.sign] || 'text-gray-700'

                    const position = formatPosition(planet.position || 0)
                    const house = toRoman(planet.house || 0)

                    return (
                      <tr
                        key={planet.key}
                        className={`border-b border-blue-100 hover:bg-blue-100 transition-colors ${
                          index % 2 === 0 ? 'bg-white' : 'bg-blue-50'
                        }`}
                      >
                        {/* Planète */}
                        <td className="py-3 px-4">
                          <div className="flex items-center space-x-3">
                            <span className={`text-2xl ${planetColor}`}>
                              {planetSymbol}
                            </span>
                            <span className="font-semibold font-serif text-gray-900">
                              {planetNameFR}
                            </span>
                          </div>
                        </td>

                        {/* Position en signe */}
                        <td className="py-3 px-4">
                          <div className="flex items-center space-x-3">
                            <span className={`text-2xl ${signColor}`}>
                              {signSymbol}
                            </span>
                            <div className="flex items-center space-x-2">
                              <span className="font-semibold font-serif text-gray-900">
                                {signNameFR}
                              </span>
                              <span className="text-sm text-gray-600 font-mono">
                                {position}
                              </span>
                            </div>
                          </div>
                        </td>

                        {/* Maison */}
                        <td className="py-3 px-4 text-center">
                          <span className="font-bold font-serif text-gray-900 text-lg">
                            {house}
                          </span>
                        </td>
                      </tr>
                    )
                  })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
