'use client'

import { useState, useEffect, useRef } from 'react'
import { MapPin, Search, Loader2, Navigation } from 'lucide-react'

interface City {
  name: string
  country: string
  countryCode: string
  lat: number
  lon: number
  displayName: string
}

interface CitySearchProps {
  value: string
  onChange: (city: string, countryCode: string, lat?: number, lon?: number) => void
  placeholder?: string
  className?: string
}

export default function CitySearch({
  value,
  onChange,
  placeholder = "Rechercher une ville...",
  className = ""
}: CitySearchProps) {
  const [query, setQuery] = useState(value)
  const [results, setResults] = useState<City[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const [showResults, setShowResults] = useState(false)
  const [isGeolocating, setIsGeolocating] = useState(false)
  const searchTimeoutRef = useRef<NodeJS.Timeout>()
  const containerRef = useRef<HTMLDivElement>(null)

  // Fermer les résultats quand on clique à l'extérieur
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setShowResults(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Recherche avec debounce
  useEffect(() => {
    if (query.length < 2) {
      setResults([])
      return
    }

    // Nettoyer le timeout précédent
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current)
    }

    // Nouveau timeout pour la recherche
    searchTimeoutRef.current = setTimeout(async () => {
      setIsSearching(true)
      try {
        // Utiliser l'API Nominatim d'OpenStreetMap (gratuite)
        const response = await fetch(
          `https://nominatim.openstreetmap.org/search?` +
          `q=${encodeURIComponent(query)}&` +
          `format=json&` +
          `addressdetails=1&` +
          `limit=5&` +
          `featuretype=city&` +
          `accept-language=fr`
        )

        if (response.ok) {
          const data = await response.json()
          const cities: City[] = data
            .filter((item: any) => item.type === 'city' || item.type === 'town' || item.type === 'village' || item.class === 'place')
            .map((item: any) => ({
              name: item.address?.city || item.address?.town || item.address?.village || item.name,
              country: item.address?.country || '',
              countryCode: item.address?.country_code?.toUpperCase() || '',
              lat: parseFloat(item.lat),
              lon: parseFloat(item.lon),
              displayName: item.display_name
            }))
            .slice(0, 5)

          setResults(cities)
          setShowResults(true)
        }
      } catch (error) {
        console.error('Erreur de recherche:', error)
      } finally {
        setIsSearching(false)
      }
    }, 300) // Délai de 300ms

    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current)
      }
    }
  }, [query])

  const handleSelectCity = (city: City) => {
    setQuery(city.name)
    setShowResults(false)
    onChange(city.name, city.countryCode, city.lat, city.lon)
  }

  const handleGeolocation = () => {
    if (!navigator.geolocation) {
      alert('La géolocalisation n\'est pas supportée par votre navigateur')
      return
    }

    setIsGeolocating(true)
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          // Reverse geocoding pour obtenir la ville depuis les coordonnées
          const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?` +
            `lat=${position.coords.latitude}&` +
            `lon=${position.coords.longitude}&` +
            `format=json&` +
            `addressdetails=1&` +
            `accept-language=fr`
          )

          if (response.ok) {
            const data = await response.json()
            const cityName = data.address?.city || data.address?.town || data.address?.village || ''
            const countryCode = data.address?.country_code?.toUpperCase() || ''

            if (cityName) {
              setQuery(cityName)
              onChange(cityName, countryCode, position.coords.latitude, position.coords.longitude)
            }
          }
        } catch (error) {
          console.error('Erreur de géolocalisation:', error)
          alert('Impossible de déterminer votre ville')
        } finally {
          setIsGeolocating(false)
        }
      },
      (error) => {
        console.error('Erreur de géolocalisation:', error)
        alert('Impossible d\'accéder à votre position')
        setIsGeolocating(false)
      }
    )
  }

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      <div className="relative">
        {/* Icon de recherche */}
        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
          {isSearching ? (
            <Loader2 className="w-5 h-5 text-gray-400 animate-spin" />
          ) : (
            <Search className="w-5 h-5 text-gray-400" />
          )}
        </div>

        {/* Input de recherche */}
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => results.length > 0 && setShowResults(true)}
          placeholder={placeholder}
          className="w-full pl-12 pr-12 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-gray-900 focus:border-transparent text-sm font-serif transition-all"
        />

        {/* Bouton de géolocalisation */}
        <button
          type="button"
          onClick={handleGeolocation}
          disabled={isGeolocating}
          className="absolute inset-y-0 right-0 pr-4 flex items-center hover:text-gray-900 text-gray-400 transition-colors disabled:opacity-50"
          title="Me géolocaliser"
        >
          {isGeolocating ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
            <Navigation className="w-5 h-5" />
          )}
        </button>
      </div>

      {/* Liste des résultats */}
      {showResults && results.length > 0 && (
        <div className="absolute z-50 w-full mt-2 bg-white rounded-xl shadow-xl border border-gray-200 overflow-hidden">
          <ul className="max-h-64 overflow-y-auto">
            {results.map((city, index) => (
              <li key={index}>
                <button
                  type="button"
                  onClick={() => handleSelectCity(city)}
                  className="w-full px-4 py-3 text-left hover:bg-gray-50 transition-colors flex items-start space-x-3"
                >
                  <MapPin className="w-5 h-5 text-gray-400 flex-shrink-0 mt-0.5" />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-2">
                      <p className="text-sm font-serif font-semibold text-gray-900 truncate">
                        {city.name}
                      </p>
                      {city.countryCode && (
                        <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full font-serif">
                          {city.countryCode}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-gray-500 font-serif truncate">
                      {city.displayName}
                    </p>
                  </div>
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Message si aucun résultat */}
      {showResults && query.length >= 2 && results.length === 0 && !isSearching && (
        <div className="absolute z-50 w-full mt-2 bg-white rounded-xl shadow-xl border border-gray-200 p-4">
          <p className="text-sm text-gray-500 font-serif text-center">
            Aucune ville trouvée
          </p>
        </div>
      )}
    </div>
  )
}
