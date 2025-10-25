'use client'

interface AstrologySymbolsProps {
    planetName: string
    className?: string
}

export default function AstrologySymbols({ planetName, className = "text-lg" }: AstrologySymbolsProps) {
    const getSymbol = (name: string) => {
        const symbols: Record<string, string> = {
            'Soleil': '☉',
            'Lune': '☽',
            'Mercure': '☿',
            'Vénus': '♀',
            'Mars': '♂',
            'Jupiter': '♃',
            'Saturne': '♄',
            'Uranus': '♅',
            'Neptune': '♆',
            'Pluton': '♇',
            'Noeud nord': '☊',
            'Ascendant': 'Ac',
            'Descendant': 'Dc',
            'Noeud sud': '☋'
        }

        return symbols[name] || '●'
    }

    const getColor = (name: string) => {
        const colors: Record<string, string> = {
            'Soleil': 'text-orange-500',
            'Lune': 'text-blue-500',
            'Mercure': 'text-teal-500',
            'Vénus': 'text-pink-500',
            'Mars': 'text-red-500',
            'Jupiter': 'text-purple-500',
            'Saturne': 'text-gray-600',
            'Uranus': 'text-cyan-500',
            'Neptune': 'text-indigo-500',
            'Pluton': 'text-red-700',
            'Noeud nord': 'text-green-500',
            'Ascendant': 'text-blue-600',
            'Descendant': 'text-blue-600',
            'Noeud sud': 'text-green-500'
        }

        return colors[name] || 'text-gray-500'
    }

    return (
        <span className={`${getColor(planetName)} ${className}`}>
            {getSymbol(planetName)}
        </span>
    )
}
