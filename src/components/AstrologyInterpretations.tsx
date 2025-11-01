'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { getSpiritualGuidance, getPersonalityAnalysis, getProgressGuidance, getPlanetSymbol, getPlanetColor } from '@/utils/astrologyInterpretations'

interface AstrologyInterpretationsProps {
    chartData: {
        planets: Record<string, any>
    }
}

export default function AstrologyInterpretations({ chartData }: AstrologyInterpretationsProps) {
    const [activeTab, setActiveTab] = useState('spiritual')

    // Trouver les planètes principales avec plus de variations
    const sun = Object.values(chartData.planets).find((planet: any) =>
        planet.planet_name === 'Soleil' || planet.planet_name === 'Sun' || planet.planet_name === 'sun' || planet.planet_name === 'SUN'
    )
    const moon = Object.values(chartData.planets).find((planet: any) =>
        planet.planet_name === 'Lune' || planet.planet_name === 'Moon' || planet.planet_name === 'moon' || planet.planet_name === 'MOON'
    )
    const jupiter = Object.values(chartData.planets).find((planet: any) =>
        planet.planet_name === 'Jupiter' || planet.planet_name === 'jupiter' || planet.planet_name === 'JUPITER'
    )
    const ascendant = Object.values(chartData.planets).find((planet: any) =>
        planet.planet_name === 'Ascendant' || planet.planet_name === 'ascendant' || planet.planet_name === 'ASCENDANT'
    )
    const saturn = Object.values(chartData.planets).find((planet: any) =>
        planet.planet_name === 'Saturne' || planet.planet_name === 'Saturn' || planet.planet_name === 'saturne' || planet.planet_name === 'SATURN'
    )
    const mars = Object.values(chartData.planets).find((planet: any) =>
        planet.planet_name === 'Mars' || planet.planet_name === 'mars' || planet.planet_name === 'MARS'
    )

    // Approche alternative : utiliser les premières planètes disponibles
    const allPlanets = Object.values(chartData.planets).filter(Boolean)

    // Données pour les interprétations spirituelles
    const spiritualInterpretations = [
        {
            title: 'Votre Mission d\'Âme',
            planet: sun,
            symbol: getPlanetSymbol('Soleil'),
            color: getPlanetColor('Soleil'),
            content: sun ? getSpiritualGuidance('Soleil', sun.sign) : 'Mission spirituelle en cours de développement.'
        },
        {
            title: 'Votre Intuition Divine',
            planet: moon,
            symbol: getPlanetSymbol('Lune'),
            color: getPlanetColor('Lune'),
            content: moon ? getSpiritualGuidance('Lune', moon.sign) : 'Intuition divine en cours de développement.'
        },
        {
            title: 'Votre Expansion Spirituelle',
            planet: jupiter,
            symbol: getPlanetSymbol('Jupiter'),
            color: getPlanetColor('Jupiter'),
            content: jupiter ? getSpiritualGuidance('Jupiter', jupiter.sign) : 'Expansion spirituelle en cours de développement.'
        }
    ]

    // Données pour l'analyse de personnalité selon la structure demandée
    const personalityData = [
        {
            planet: sun,
            title: 'Identité profonde, essence, mission de vie',
            subtitle: sun ? `${sun.planet_name} en ${sun.sign}` : 'Soleil en Bélier',
            aspect: 'Identité profonde'
        },
        {
            planet: moon,
            title: 'Nature émotionnelle, besoins intérieurs',
            subtitle: moon ? `${moon.planet_name} en ${moon.sign}` : 'Lune en Vierge',
            aspect: 'Nature émotionnelle'
        },
        {
            planet: ascendant,
            title: 'Image publique, première impression',
            subtitle: ascendant ? `${ascendant.planet_name} en ${ascendant.sign}` : 'Ascendant en Bélier',
            aspect: 'Image publique'
        },
        {
            planet: jupiter,
            title: 'Talents naturels, domaines d\'excellence',
            subtitle: jupiter ? `${jupiter.planet_name} en ${jupiter.sign}` : 'Jupiter en Vierge',
            aspect: 'Talents naturels'
        },
        {
            planet: saturn,
            title: 'Défis, leçons de vie, croissance',
            subtitle: saturn ? `${saturn.planet_name} en ${saturn.sign}` : 'Saturne en Verseau',
            aspect: 'Défis et leçons'
        },
        {
            planet: mars,
            title: 'Énergie, action, affirmation de soi',
            subtitle: mars ? `${mars.planet_name} en ${mars.sign}` : 'Mars en Poissons',
            aspect: 'Énergie et action'
        }
    ].filter(item => item.planet)

    // Si aucune planète spécifique n'est trouvée, utiliser les premières planètes disponibles
    const fallbackPersonalityData = allPlanets.slice(0, 6).map((planet: any, index) => {
        const aspects = ['Identité profonde', 'Nature émotionnelle', 'Image publique', 'Talents naturels', 'Défis et leçons', 'Énergie et action']
        const titles = ['Identité profonde, essence, mission de vie', 'Nature émotionnelle, besoins intérieurs', 'Image publique, première impression', 'Talents naturels, domaines d\'excellence', 'Défis, leçons de vie, croissance', 'Énergie, action, affirmation de soi']
        return {
            planet,
            title: titles[index] || `Aspect ${index + 1}`,
            subtitle: `${planet.planet_name} en ${planet.sign}`,
            aspect: aspects[index] || `Aspect ${index + 1}`
        }
    })

    // Forcer l'affichage d'au moins 6 cartes même si certaines planètes sont manquantes
    const ensureMinimumCards = (data: any[], minCards: number = 6) => {
        if (data.length >= minCards) return data

        const fallbackCards: any[] = []
        for (let i = data.length; i < minCards; i++) {
            const aspects = ['Identité profonde', 'Nature émotionnelle', 'Image publique', 'Talents naturels', 'Défis et leçons', 'Énergie et action']
            const titles = ['Identité profonde, essence, mission de vie', 'Nature émotionnelle, besoins intérieurs', 'Image publique, première impression', 'Talents naturels, domaines d\'excellence', 'Défis, leçons de vie, croissance', 'Énergie, action, affirmation de soi']
            fallbackCards.push({
                planet: allPlanets[i % allPlanets.length] || { planet_name: 'Soleil', sign: 'Bélier' },
                title: titles[i] || `Aspect ${i + 1}`,
                subtitle: allPlanets[i % allPlanets.length] ? `${allPlanets[i % allPlanets.length].planet_name} en ${allPlanets[i % allPlanets.length].sign}` : 'Soleil en Bélier',
                aspect: aspects[i] || `Aspect ${i + 1}`
            })
        }
        return [...data, ...fallbackCards]
    }

    const finalPersonalityData = personalityData.length > 0 ? personalityData : fallbackPersonalityData
    const finalPersonalityDataWithFallback = ensureMinimumCards(finalPersonalityData)


    // Données pour le programme de progrès
    const progressData = [
        { planet: sun, title: 'Mission de Vie', subtitle: '(Soleil)' },
        { planet: moon, title: 'Équilibre Émotionnel', subtitle: '(Lune)' },
        { planet: ascendant, title: 'Image Personnelle', subtitle: '(Ascendant)' },
        { planet: jupiter, title: 'Développement des Talents', subtitle: '(Jupiter)' },
        { planet: saturn, title: 'Surmonter les Défis', subtitle: '(Saturne)' },
        { planet: mars, title: 'Énergie et Action', subtitle: '(Mars)' }
    ].filter(item => item.planet)

    // Si aucune planète spécifique n'est trouvée, utiliser les premières planètes disponibles
    const fallbackProgressData = allPlanets.slice(0, 6).map((planet: any, index) => {
        const titles = ['Mission de Vie', 'Équilibre Émotionnel', 'Image Personnelle', 'Développement des Talents', 'Surmonter les Défis', 'Énergie et Action']
        return {
            planet,
            title: titles[index] || `Progrès ${index + 1}`,
            subtitle: `(${planet.planet_name})`
        }
    })

    const finalProgressData = progressData.length > 0 ? progressData : fallbackProgressData

    return (
        <div className="space-y-6">
            {/* Navigation par onglets */}
            <div className="border-b border-gray-200">
                <nav className="flex space-x-8">
                    <button
                        onClick={() => setActiveTab('spiritual')}
                        className={`py-4 px-1 border-b-2 font-medium text-sm ${activeTab === 'spiritual'
                            ? 'border-purple-500 text-purple-600'
                            : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                            }`}
                    >
                        Interprétation Spirituelle
                    </button>
                    <button
                        onClick={() => setActiveTab('personality')}
                        className={`py-4 px-1 border-b-2 font-medium text-sm ${activeTab === 'personality'
                            ? 'border-purple-500 text-purple-600'
                            : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                            }`}
                    >
                        Analyse de la Personnalité
                    </button>
                    <button
                        onClick={() => setActiveTab('progress')}
                        className={`py-4 px-1 border-b-2 font-medium text-sm ${activeTab === 'progress'
                            ? 'border-purple-500 text-purple-600'
                            : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                            }`}
                    >
                        Programme de Progrès
                    </button>
                </nav>
            </div>

            {/* Contenu des onglets */}
            {activeTab === 'spiritual' && (
                <div className="space-y-6">
                    <div className="text-center">
                        <h2 className="text-2xl font-bold text-gray-900 mb-2">Interprétation Spirituelle</h2>
                        <p className="text-gray-600">Votre chemin d'évolution spirituelle révélé par votre thème astral.</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {spiritualInterpretations.map((interpretation, index) => (
                            <Card key={index} className="relative overflow-hidden">
                                <CardHeader className="pb-4">
                                    <div className="text-center">
                                        <div className={`text-4xl ${interpretation.color} mb-4`}>
                                            {interpretation.symbol}
                                        </div>
                                        <CardTitle className="text-lg font-semibold text-gray-900 mb-2">
                                            {interpretation.title}
                                        </CardTitle>
                                        {interpretation.planet && (
                                            <p className="text-sm text-gray-600">
                                                {interpretation.planet.planet_name} en {interpretation.planet.sign}
                                            </p>
                                        )}
                                    </div>
                                </CardHeader>
                                <CardContent>
                                    <p className="text-sm text-gray-700 leading-relaxed">
                                        {interpretation.content}
                                    </p>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </div>
            )}

            {activeTab === 'personality' && (
                <div className="space-y-6">
                    <div className="text-center">
                        <h2 className="text-2xl font-bold text-gray-900 mb-2">Analyse de votre Personnalité</h2>
                        <p className="text-gray-600">Les caractéristiques essentielles de votre personnalité révélées par votre thème.</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {finalPersonalityDataWithFallback.map((item, index) => (
                            <Card key={index} className="relative overflow-hidden">
                                <CardHeader className="pb-4">
                                    <div className="text-center">
                                        <div className={`text-4xl ${getPlanetColor(item.planet.planet_name)} mb-4`}>
                                            {getPlanetSymbol(item.planet.planet_name)}
                                        </div>
                                        <CardTitle className="text-lg font-semibold text-gray-900 mb-2">
                                            {item.aspect}
                                        </CardTitle>
                                        <p className="text-sm text-gray-600">
                                            {item.subtitle}
                                        </p>
                                    </div>
                                </CardHeader>
                                <CardContent>
                                    <div className="mb-3">
                                        <h4 className="font-semibold text-sm text-purple-600 mb-1">{item.title}</h4>
                                    </div>
                                    <p className="text-sm text-gray-700 leading-relaxed">
                                        {getPersonalityAnalysis(item.planet.planet_name, item.planet.sign)}
                                    </p>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </div>
            )}

            {activeTab === 'progress' && (
                <div className="space-y-6">
                    <div className="text-center">
                        <h2 className="text-2xl font-bold text-gray-900 mb-2">Programme de Progrès</h2>
                        <p className="text-gray-600">Votre plan d'action personnalisé basé sur votre analyse de personnalité et votre interprétation spirituelle.</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {finalProgressData.map((item, index) => (
                            <Card key={index} className="relative overflow-hidden">
                                <CardHeader className="pb-4">
                                    <div className="text-center">
                                        <div className={`text-4xl ${getPlanetColor(item.planet.planet_name)} mb-4`}>
                                            {getPlanetSymbol(item.planet.planet_name)}
                                        </div>
                                        <CardTitle className="text-lg font-semibold text-gray-900 mb-2">
                                            {item.title}
                                        </CardTitle>
                                        <p className="text-sm text-gray-600">
                                            {item.subtitle}
                                        </p>
                                    </div>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div>
                                        <h4 className="font-semibold text-sm text-purple-600 mb-2">OBJECTIF :</h4>
                                        <p className="text-sm text-gray-700 leading-relaxed">
                                            {item.planet ? getProgressGuidance(item.planet.planet_name, item.planet.sign, 'immediate') : 'Objectif en cours de développement.'}
                                        </p>
                                    </div>
                                    <div>
                                        <h4 className="font-semibold text-sm text-gray-800 mb-2">Actions à entreprendre :</h4>
                                        <p className="text-sm text-gray-700 leading-relaxed">
                                            {item.planet ? getProgressGuidance(item.planet.planet_name, item.planet.sign, '30days') : 'Actions en cours de développement.'}
                                        </p>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </div>
            )}
        </div>
    )
}
