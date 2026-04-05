'use client'

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

interface PlanetaryPositionsTableProps {
  planets: Record<string, any>
}

export default function PlanetaryPositionsTable({ planets }: PlanetaryPositionsTableProps) {
  if (!planets || Object.keys(planets).length === 0) {
    return (
      <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6">
        <p className="text-gray-500 text-center font-serif">Aucune donnée de planètes disponible</p>
      </div>
    )
  }

  return (
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
                const planetData = planets[planetKey]
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
  )
}
