'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ArrowLeft, Download, Sparkles, Printer } from 'lucide-react'
import { toast } from 'sonner'
import AdminSidebar from '@/components/AdminSidebar'
import { getPlanetSymbol, getZodiacSymbol, getZodiacName, getSpiritualGuidance, getPersonalityAnalysis, getProgressGuidance, normalizePlanetName, getPlanetNameFrench, getPlanetDisplayOrder } from '@/utils/astrologyInterpretations'

interface NatalChartData {
    basic_info: {
        name: string
        birth_date: string
        birth_time: string
        location: string
        coordinates: {
            longitude: number
            latitude: number
        }
    }
    planets: Record<string, any>
    houses: Record<string, any>
    interpretations: Record<string, any>
    svg: {
        base64: string
        filename: string
        generated: boolean
    }
}

export default function ResultatsPage() {
    const router = useRouter()
    const [chartData, setChartData] = useState<NatalChartData | null>(null)
    const [loading, setLoading] = useState(true)
    const [activeTab, setActiveTab] = useState('carte-du-ciel')
    const [interpretationTab, setInterpretationTab] = useState('spiritual')

    const handleLogout = async () => {
        try {
            await fetch('/api/auth/logout', {
                method: 'POST'
            })
            router.push('/login')
        } catch (error) {
            console.error('Erreur lors de la déconnexion:', error)
        }
    }

    useEffect(() => {
        // Récupérer les données depuis le localStorage uniquement
        const savedData = localStorage.getItem('astrology-chart-data')
        if (savedData) {
            try {
                const parsedData = JSON.parse(savedData)
                
                // DEBUG: Afficher la structure complète des données pour comprendre comment l'Ascendant est nommé
                console.log('=== STRUCTURE DES DONNÉES COMPLÈTES ===')
                console.log('ChartData:', parsedData)
                console.log('Planets keys:', Object.keys(parsedData?.planets || {}))
                console.log('Planets values:', Object.values(parsedData?.planets || {}))
                
                // Chercher spécifiquement l'Ascendant dans toutes les formes possibles
                const planets = parsedData?.planets || {}
                console.log('=== RECHERCHE ASCENDANT ===')
                console.log('Toutes les clés de planets:', Object.keys(planets))
                console.log('Tous les planet_name:', Object.values(planets).map((p: any) => p?.planet_name))
                
                // Chercher toutes les variantes possibles
                Object.entries(planets).forEach(([key, planet]: [string, any]) => {
                    const name = planet?.planet_name || ''
                    if (name.toLowerCase().includes('asc') || 
                        name.toLowerCase().includes('ac') || 
                        key.toLowerCase().includes('asc') ||
                        key.toLowerCase().includes('ac')) {
                        console.log(`✅ ASCENDANT TROUVÉ: key="${key}", planet_name="${name}", planet=`, planet)
                    }
                })
                
                // Chercher aussi dans d'autres objets possibles
                if (parsedData?.houses) {
                    console.log('Houses keys:', Object.keys(parsedData.houses))
                }
                if (parsedData?.basic_info) {
                    console.log('Basic info:', parsedData.basic_info)
                }
                
                // Afficher la structure complète pour comprendre
                console.log('Structure complète de la réponse API:', JSON.stringify(parsedData, null, 2))
                
                setChartData(parsedData)
            } catch (error) {
                console.error('Erreur lors de la récupération des données:', error)
                toast.error('Données de carte invalides')
                router.push('/admin/carte-du-ciel')
            }
        } else {
            toast.error('Aucune carte trouvée. Veuillez générer une nouvelle carte.')
            router.push('/admin/carte-du-ciel')
        }
        setLoading(false)
    }, [router])

    const handleBackToForm = () => {
        router.push('/admin/carte-du-ciel')
    }

    const handleDownload = () => {
        if (chartData?.svg.base64) {
            try {
                const svgContent = atob(chartData.svg.base64)
                const blob = new Blob([svgContent], { type: 'image/svg+xml' })
                const url = URL.createObjectURL(blob)
                const a = document.createElement('a')
                a.href = url
                a.download = chartData.svg.filename || 'carte-du-ciel.svg'
                a.click()
                URL.revokeObjectURL(url)
                toast.success('Carte téléchargée avec succès!')
            } catch (error) {
                console.error('Erreur lors du téléchargement:', error)
                toast.error('Erreur lors du téléchargement de la carte')
            }
        }
    }

    const handlePrint = () => {
        window.print()
    }

    // Trouver les planètes spécifiques (en utilisant la normalisation pour être plus robuste)
    const sun = Object.values(chartData?.planets || {}).find((p: any) => {
        const normalized = normalizePlanetName(p.planet_name)
        return normalized === 'Soleil'
    })
    const moon = Object.values(chartData?.planets || {}).find((p: any) => {
        const normalized = normalizePlanetName(p.planet_name)
        return normalized === 'Lune'
    })
    const mars = Object.values(chartData?.planets || {}).find((p: any) => {
        const normalized = normalizePlanetName(p.planet_name)
        return normalized === 'Mars'
    })
    const jupiter = Object.values(chartData?.planets || {}).find((p: any) => {
        const normalized = normalizePlanetName(p.planet_name)
        return normalized === 'Jupiter'
    })
    const saturn = Object.values(chartData?.planets || {}).find((p: any) => {
        const normalized = normalizePlanetName(p.planet_name)
        return normalized === 'Saturne'
    })
    // Recherche de l'Ascendant - il n'est pas dans planets, chercher ailleurs
    let ascendant: any = null
    
    // 1. Chercher dans houses (première maison = Ascendant - le signe de la première maison est le signe ascendant)
    if (chartData?.houses) {
        // Chercher la première maison dans toutes les formes possibles
        const firstHouseKeys = [
            'first_house', 'first', 'house_1', 'house1', '1', 
            'First_House', 'First', 'House_1', 'House1',
            'FIRST_HOUSE', 'FIRST'
        ]
        
        let firstHouse: any = null
        for (const key of firstHouseKeys) {
            if (chartData.houses[key]) {
                firstHouse = chartData.houses[key]
                console.log(`✅ Première maison trouvée avec la clé: "${key}"`, firstHouse)
                break
            }
        }
        
        // Si pas trouvé, chercher par correspondance dans les clés
        if (!firstHouse) {
            const housesKeys = Object.keys(chartData.houses)
            const firstHouseKey = housesKeys.find(k => 
                k.toLowerCase().includes('first') || 
                k.toLowerCase().includes('1') ||
                k === '1' ||
                k === 'first'
            )
            if (firstHouseKey) {
                firstHouse = chartData.houses[firstHouseKey]
                console.log(`✅ Première maison trouvée avec correspondance: "${firstHouseKey}"`, firstHouse)
            }
        }
        
        // Si trouvé, créer l'objet ascendant à partir du signe de la première maison
        if (firstHouse && firstHouse.sign) {
            ascendant = {
                planet_name: 'Ascendant',
                sign: firstHouse.sign,
                position: firstHouse.position || 0,
                house: 'Maison 1'
            }
            console.log('✅ Ascendant créé à partir de la première maison:', ascendant)
        }
    }
    
    // 2. Chercher dans basic_info (peut-être stocké là)
    if (!ascendant && chartData?.basic_info) {
        if (chartData.basic_info.ascendant || chartData.basic_info.asc) {
            ascendant = chartData.basic_info.ascendant || chartData.basic_info.asc
            console.log('✅ Ascendant trouvé dans basic_info:', ascendant)
        }
    }
    
    // 3. Chercher dans un objet séparé "angles" ou "ascendant"
    if (!ascendant && (chartData as any)?.angles) {
        ascendant = (chartData as any).angles.ascendant || (chartData as any).angles.AC || (chartData as any).angles.asc
        if (ascendant) {
            console.log('✅ Ascendant trouvé dans angles:', ascendant)
        }
    }
    
    // 4. Si toujours pas trouvé, utiliser l'index -3 comme dans le code Python (3ème depuis la fin)
    if (!ascendant && chartData?.planets) {
        const planetsArray = Object.values(chartData.planets)
        if (planetsArray.length >= 3) {
            const ascendantCandidate = planetsArray[planetsArray.length - 3] as any
            // Vérifier si c'est bien l'ascendant
            const name = (ascendantCandidate?.planet_name || '').toLowerCase()
            if (name.includes('asc') || name === 'ac' || name.includes('ascendant')) {
                ascendant = ascendantCandidate
                console.log('✅ Ascendant trouvé à l\'index -3:', ascendant)
            }
        }
    }
    
    if (!ascendant) {
        console.log('⚠️ Ascendant non trouvé. Structure complète:', {
            houses: chartData?.houses,
            basic_info: chartData?.basic_info,
            planets_count: Object.keys(chartData?.planets || {}).length,
            planets_keys: Object.keys(chartData?.planets || {})
        })
    } else {
        console.log('✅ Ascendant final trouvé:', ascendant)
    }

    if (loading) {
        return (
            <div className="h-screen bg-gray-50 flex overflow-hidden">
                <AdminSidebar
                    activeTab={activeTab}
                    onTabChange={setActiveTab}
                    onLogout={handleLogout}
                />
                <div className="flex-1 lg:ml-64 flex items-center justify-center">
                    <div className="text-center">
                        <Sparkles className="w-8 h-8 mx-auto mb-4 text-purple-600 animate-pulse" />
                        <p className="text-gray-600">Chargement des résultats...</p>
                    </div>
                </div>
            </div>
        )
    }

    if (!chartData) {
        return (
            <div className="h-screen bg-gray-50 flex overflow-hidden">
                <AdminSidebar
                    activeTab={activeTab}
                    onTabChange={setActiveTab}
                    onLogout={handleLogout}
                />
                <div className="flex-1 lg:ml-64 flex items-center justify-center">
                    <div className="text-center">
                        <h1 className="text-2xl font-bold text-gray-900 mb-4">Aucune donnée trouvée</h1>
                        <p className="text-gray-600 mb-6">Les données de la carte astrologique ne sont pas disponibles.</p>
                        <Button onClick={handleBackToForm} variant="outline">
                            <ArrowLeft className="w-4 h-4 mr-2" />
                            Retour au formulaire
                        </Button>
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <AdminSidebar
                activeTab={activeTab}
                onTabChange={setActiveTab}
                onLogout={handleLogout}
            />

            {/* Main Content */}
            <div className="lg:ml-64">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    {/* Header */}
                    <header className="mb-8">
                        <h1 className="text-3xl font-bold text-gray-900 mb-4">Votre Carte du Ciel</h1>
                        <div className="bg-white rounded-lg shadow-sm p-6">
                            <h2 className="text-2xl font-semibold text-gray-900 mb-2">{chartData.basic_info.name}</h2>
                            <p className="text-gray-600 mb-1">Né(e) le {chartData.basic_info.birth_date} à {chartData.basic_info.birth_time}</p>
                            <p className="text-gray-600">{chartData.basic_info.location}</p>
                        </div>
                    </header>

                    {/* Carte SVG */}
                    {chartData.svg.base64 && (
                        <div className="mb-8">
                            <Card>
                                <CardHeader>
                                    <CardTitle className="text-xl">Votre Thème Astral</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="bg-gray-50 rounded-lg p-6 flex justify-center">
                                        <img
                                            src={`data:image/svg+xml;base64,${chartData.svg.base64}`}
                                            alt={`Carte du Ciel de ${chartData.basic_info.name}`}
                                            className="max-w-full h-auto max-h-[600px] object-contain"
                                        />
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    )}

                    {/* Données astrologiques compactes */}
                    <div className="mb-8">
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            {/* Tableau des Planètes compact */}
                            <Card>
                                <CardHeader>
                                    <CardTitle className="text-lg">Planètes</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-2">
                                        {(() => {
                                            // Trier les planètes selon l'ordre spécifié
                                            const planetsArray = Object.entries(chartData.planets).map(([key, planet]: [string, any]) => ({
                                                key,
                                                planet,
                                                frenchName: getPlanetNameFrench(planet.planet_name)
                                            }))
                                            
                                            const displayOrder = getPlanetDisplayOrder()
                                            
                                            // Trier selon l'ordre d'affichage
                                            planetsArray.sort((a, b) => {
                                                const indexA = displayOrder.indexOf(a.frenchName)
                                                const indexB = displayOrder.indexOf(b.frenchName)
                                                
                                                // Si les deux sont dans l'ordre, trier par index
                                                if (indexA !== -1 && indexB !== -1) {
                                                    return indexA - indexB
                                                }
                                                // Si seul A est dans l'ordre, A vient en premier
                                                if (indexA !== -1) return -1
                                                // Si seul B est dans l'ordre, B vient en premier
                                                if (indexB !== -1) return 1
                                                // Sinon, garder l'ordre original
                                                return 0
                                            })
                                            
                                            return planetsArray.map(({ key, planet, frenchName }) => {
                                                const houseNumber = planet.house ? planet.house.split(' ')[1] : ''
                                                return (
                                                    <div key={key} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
                                                        <div className="flex items-center space-x-3">
                                                            <span className="text-lg">{getPlanetSymbol(planet.planet_name)}</span>
                                                            <span className="font-medium text-gray-900">{frenchName}</span>
                                                        </div>
                                                        <div className="flex items-center space-x-4 text-sm">
                                                            <span className="text-purple-600">
                                                                {getZodiacSymbol(planet.sign)} {Math.floor(planet.position)}°
                                                            </span>
                                                            {houseNumber && (
                                                                <span className="text-gray-600">Maison {houseNumber}</span>
                                                            )}
                                                        </div>
                                                    </div>
                                                )
                                            })
                                        })()}
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Tableau des Maisons compact */}
                            <Card>
                                <CardHeader>
                                    <CardTitle className="text-lg">Maisons</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-2">
                                        {Object.entries(chartData.houses).map(([key, house]) => {
                                            const houseNumber = key.replace('_house', '').replace('first', '1').replace('second', '2').replace('third', '3').replace('fourth', '4').replace('fifth', '5').replace('sixth', '6').replace('seventh', '7').replace('eighth', '8').replace('ninth', '9').replace('tenth', '10').replace('eleventh', '11').replace('twelfth', '12')
                                            const signName = getZodiacName(house.sign)
                                            return (
                                                <div key={key} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
                                                    <div className="flex items-center space-x-3">
                                                        <span className="text-sm font-medium text-gray-600 w-6">{houseNumber}</span>
                                                        <div className="flex items-center space-x-2">
                                                            <span className="text-purple-600 text-sm">{getZodiacSymbol(house.sign)}</span>
                                                            <span className="text-gray-900">{signName}</span>
                                                        </div>
                                                    </div>
                                                    <span className="text-gray-600 text-sm">{Math.floor(house.position)}°</span>
                                                </div>
                                            )
                                        })}
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    </div>

                    {/* Navigation Tabs */}
                    <div className="mb-6 border-b border-gray-200">
                        <nav className="flex space-x-8">
                            <button
                                onClick={() => setInterpretationTab('spiritual')}
                                className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                                    interpretationTab === 'spiritual'
                                        ? 'border-purple-500 text-purple-600'
                                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                }`}
                            >
                                Interprétation Spirituelle
                            </button>
                            <button
                                onClick={() => setInterpretationTab('personality')}
                                className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                                    interpretationTab === 'personality'
                                        ? 'border-purple-500 text-purple-600'
                                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                }`}
                            >
                                Analyse de la Personnalité
                            </button>
                            <button
                                onClick={() => setInterpretationTab('progress')}
                                className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                                    interpretationTab === 'progress'
                                        ? 'border-purple-500 text-purple-600'
                                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                }`}
                            >
                                Programme de Progrès
                            </button>
                        </nav>
                    </div>

                    {/* Interprétation Spirituelle Tab */}
                    {interpretationTab === 'spiritual' && (
                        <div className="mb-8">
                            <div className="text-center mb-6">
                                <h2 className="text-2xl font-bold text-gray-900 mb-2">Interprétation Spirituelle</h2>
                                <p className="text-gray-600">Votre chemin d'évolution spirituelle révélé par votre thème astral.</p>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                {/* Mission d'Âme - Soleil */}
                                <Card>
                                    <CardHeader>
                                        <div className="text-center">
                                            <div className="text-4xl text-orange-600 mb-4">☉</div>
                                            <CardTitle className="text-lg mb-2">Votre Mission d'Âme</CardTitle>
                                            {sun && (
                                                <p className="text-sm text-gray-600">
                                                    <strong>Soleil en {getZodiacName(sun.sign)}</strong>
                                                </p>
                                            )}
                                        </div>
                                    </CardHeader>
                                    <CardContent>
                                        <p className="text-sm text-gray-700 leading-relaxed">
                                            {getSpiritualGuidance('Soleil', sun?.sign || 'Bélier')}
                                        </p>
                                    </CardContent>
                                </Card>

                                {/* Intuition Divine - Lune */}
                                <Card>
                                    <CardHeader>
                                        <div className="text-center">
                                            <div className="text-4xl text-blue-500 mb-4">☽</div>
                                            <CardTitle className="text-lg mb-2">Votre Intuition Divine</CardTitle>
                                            {moon && (
                                                <p className="text-sm text-gray-600">
                                                    <strong>Lune en {getZodiacName(moon.sign)}</strong>
                                                </p>
                                            )}
                                        </div>
                                    </CardHeader>
                                    <CardContent>
                                        <p className="text-sm text-gray-700 leading-relaxed">
                                            {getSpiritualGuidance('Lune', moon?.sign || 'Cancer')}
                                        </p>
                                    </CardContent>
                                </Card>

                                {/* Expansion Spirituelle - Jupiter */}
                                <Card>
                                    <CardHeader>
                                        <div className="text-center">
                                            <div className="text-4xl text-purple-600 mb-4">♃</div>
                                            <CardTitle className="text-lg mb-2">Votre Expansion Spirituelle</CardTitle>
                                            {jupiter && (
                                                <p className="text-sm text-gray-600">
                                                    <strong>Jupiter en {getZodiacName(jupiter.sign)}</strong>
                                                </p>
                                            )}
                                        </div>
                                    </CardHeader>
                                    <CardContent>
                                        <p className="text-sm text-gray-700 leading-relaxed">
                                            {getSpiritualGuidance('Jupiter', jupiter?.sign || 'Sagittaire')}
                                        </p>
                                    </CardContent>
                                </Card>
                            </div>
                        </div>
                    )}

                    {/* Analyse Personnalité Tab */}
                    {interpretationTab === 'personality' && (
                        <div className="mb-8">
                            <div className="text-center mb-6">
                                <h2 className="text-2xl font-bold text-gray-900 mb-2">Analyse de votre Personnalité</h2>
                                <p className="text-gray-600">Les caractéristiques essentielles de votre personnalité révélées par votre thème.</p>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {/* Soleil */}
                                {sun && (
                                    <Card>
                                        <CardHeader>
                                            <div className="text-center">
                                                <div className="text-4xl text-orange-600 mb-4">☉</div>
                                                <CardTitle className="text-lg mb-2">Votre Essence</CardTitle>
                                                <p className="text-sm text-gray-600">
                                                    <strong>Soleil en {getZodiacName(sun.sign)}</strong>
                                                </p>
                                            </div>
                                        </CardHeader>
                                        <CardContent>
                                            <p className="text-sm text-gray-700 leading-relaxed">
                                                {getPersonalityAnalysis('Soleil', sun.sign)}
                                            </p>
                                        </CardContent>
                                    </Card>
                                )}

                                {/* Lune */}
                                {moon && (
                                    <Card>
                                        <CardHeader>
                                            <div className="text-center">
                                                <div className="text-4xl text-blue-500 mb-4">☽</div>
                                                <CardTitle className="text-lg mb-2">Vos Émotions</CardTitle>
                                                <p className="text-sm text-gray-600">
                                                    <strong>Lune en {getZodiacName(moon.sign)}</strong>
                                                </p>
                                            </div>
                                        </CardHeader>
                                        <CardContent>
                                            <p className="text-sm text-gray-700 leading-relaxed">
                                                {getPersonalityAnalysis('Lune', moon.sign)}
                                            </p>
                                        </CardContent>
                                    </Card>
                                )}

                                {/* Ascendant */}
                                {ascendant && (
                                    <Card>
                                        <CardHeader>
                                            <div className="text-center">
                                                <div className="text-4xl text-blue-700 mb-4">Ac</div>
                                                <CardTitle className="text-lg mb-2">Votre Image</CardTitle>
                                                <p className="text-sm text-gray-600">
                                                    <strong>Ascendant en {getZodiacName(ascendant.sign)}</strong>
                                                </p>
                                            </div>
                                        </CardHeader>
                                        <CardContent>
                                            <p className="text-sm text-gray-700 leading-relaxed">
                                                {getPersonalityAnalysis('Ascendant', ascendant.sign)}
                                            </p>
                                        </CardContent>
                                    </Card>
                                )}

                                {/* Jupiter */}
                                {jupiter && (
                                    <Card>
                                        <CardHeader>
                                            <div className="text-center">
                                                <div className="text-4xl text-purple-600 mb-4">♃</div>
                                                <CardTitle className="text-lg mb-2">Vos Talents</CardTitle>
                                                <p className="text-sm text-gray-600">
                                                    <strong>Jupiter en {getZodiacName(jupiter.sign)}</strong>
                                                </p>
                                            </div>
                                        </CardHeader>
                                        <CardContent>
                                            <p className="text-sm text-gray-700 leading-relaxed">
                                                {getPersonalityAnalysis('Jupiter', jupiter.sign)}
                                            </p>
                                        </CardContent>
                                    </Card>
                                )}

                                {/* Saturne */}
                                {saturn && (
                                    <Card>
                                        <CardHeader>
                                            <div className="text-center">
                                                <div className="text-4xl text-gray-700 mb-4">♄</div>
                                                <CardTitle className="text-lg mb-2">Vos Défis</CardTitle>
                                                <p className="text-sm text-gray-600">
                                                    <strong>Saturne en {getZodiacName(saturn.sign)}</strong>
                                                </p>
                                            </div>
                                        </CardHeader>
                                        <CardContent>
                                            <p className="text-sm text-gray-700 leading-relaxed">
                                                {getPersonalityAnalysis('Saturne', saturn.sign)}
                                            </p>
                                        </CardContent>
                                    </Card>
                                )}

                                {/* Mars */}
                                {mars && (
                                    <Card>
                                        <CardHeader>
                                            <div className="text-center">
                                                <div className="text-4xl text-red-600 mb-4">♂</div>
                                                <CardTitle className="text-lg mb-2">Votre Énergie</CardTitle>
                                                <p className="text-sm text-gray-600">
                                                    <strong>Mars en {getZodiacName(mars.sign)}</strong>
                                                </p>
                                            </div>
                                        </CardHeader>
                                        <CardContent>
                                            <p className="text-sm text-gray-700 leading-relaxed">
                                                {getPersonalityAnalysis('Mars', mars.sign)}
                                            </p>
                                        </CardContent>
                                    </Card>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Programme de Progrès Tab */}
                    {interpretationTab === 'progress' && (
                        <div className="mb-8">
                            <div className="text-center mb-6">
                                <h2 className="text-2xl font-bold text-gray-900 mb-2">Programme de Progrès</h2>
                                <p className="text-gray-600">Votre plan d'action personnalisé basé sur votre analyse de personnalité et votre interprétation spirituelle.</p>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {/* Soleil */}
                                {sun && (
                                    <Card>
                                        <CardHeader>
                                            <div className="text-center">
                                                <div className="text-4xl text-orange-600 mb-4">☉</div>
                                                <CardTitle className="text-lg mb-2">Mission de Vie (Soleil)</CardTitle>
                                            </div>
                                        </CardHeader>
                                        <CardContent>
                                            <div>
                                                <h4 className="font-semibold text-sm text-purple-600 mb-2">OBJECTIF :</h4>
                                                <p className="text-sm text-gray-700 leading-relaxed">
                                                    {getProgressGuidance('Soleil', sun.sign, '30days')}
                                                </p>
                                            </div>
                                        </CardContent>
                                    </Card>
                                )}

                                {/* Lune */}
                                {moon && (
                                    <Card>
                                        <CardHeader>
                                            <div className="text-center">
                                                <div className="text-4xl text-blue-500 mb-4">☽</div>
                                                <CardTitle className="text-lg mb-2">Équilibre Émotionnel (Lune)</CardTitle>
                                            </div>
                                        </CardHeader>
                                        <CardContent>
                                            <div>
                                                <h4 className="font-semibold text-sm text-purple-600 mb-2">OBJECTIF :</h4>
                                                <p className="text-sm text-gray-700 leading-relaxed">
                                                    {getProgressGuidance('Lune', moon.sign, '30days')}
                                                </p>
                                            </div>
                                        </CardContent>
                                    </Card>
                                )}

                                {/* Ascendant */}
                                {ascendant && (
                                    <Card>
                                        <CardHeader>
                                            <div className="text-center">
                                                <div className="text-4xl text-blue-700 mb-4">Ac</div>
                                                <CardTitle className="text-lg mb-2">Image Personnelle (Ascendant)</CardTitle>
                                            </div>
                                        </CardHeader>
                                        <CardContent>
                                            <div>
                                                <h4 className="font-semibold text-sm text-purple-600 mb-2">OBJECTIF :</h4>
                                                <p className="text-sm text-gray-700 leading-relaxed">
                                                    {getProgressGuidance('Ascendant', ascendant.sign, '30days')}
                                                </p>
                                            </div>
                                        </CardContent>
                                    </Card>
                                )}

                                {/* Jupiter */}
                                {jupiter && (
                                    <Card>
                                        <CardHeader>
                                            <div className="text-center">
                                                <div className="text-4xl text-purple-600 mb-4">♃</div>
                                                <CardTitle className="text-lg mb-2">Développement des Talents (Jupiter)</CardTitle>
                                            </div>
                                        </CardHeader>
                                        <CardContent>
                                            <div>
                                                <h4 className="font-semibold text-sm text-purple-600 mb-2">OBJECTIF :</h4>
                                                <p className="text-sm text-gray-700 leading-relaxed">
                                                    {getProgressGuidance('Jupiter', jupiter.sign, '30days')}
                                                </p>
                                            </div>
                                        </CardContent>
                                    </Card>
                                )}

                                {/* Saturne */}
                                {saturn && (
                                    <Card>
                                        <CardHeader>
                                            <div className="text-center">
                                                <div className="text-4xl text-gray-700 mb-4">♄</div>
                                                <CardTitle className="text-lg mb-2">Surmonter les Défis (Saturne)</CardTitle>
                                            </div>
                                        </CardHeader>
                                        <CardContent>
                                            <div>
                                                <h4 className="font-semibold text-sm text-purple-600 mb-2">OBJECTIF :</h4>
                                                <p className="text-sm text-gray-700 leading-relaxed">
                                                    {getProgressGuidance('Saturne', saturn.sign, '30days')}
                                                </p>
                                            </div>
                                        </CardContent>
                                    </Card>
                                )}

                                {/* Mars */}
                                {mars && (
                                    <Card>
                                        <CardHeader>
                                            <div className="text-center">
                                                <div className="text-4xl text-red-600 mb-4">♂</div>
                                                <CardTitle className="text-lg mb-2">Énergie et Action (Mars)</CardTitle>
                                            </div>
                                        </CardHeader>
                                        <CardContent>
                                            <div>
                                                <h4 className="font-semibold text-sm text-purple-600 mb-2">OBJECTIF :</h4>
                                                <p className="text-sm text-gray-700 leading-relaxed">
                                                    {getProgressGuidance('Mars', mars.sign, '30days')}
                                                </p>
                                            </div>
                                        </CardContent>
                                    </Card>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Actions */}
                    <div className="flex justify-between items-center mb-8 pt-6 border-t border-gray-200">
                        <Button onClick={handleBackToForm} variant="outline">
                            <ArrowLeft className="w-4 h-4 mr-2" />
                            Nouvelle Carte
                        </Button>
                        <Button onClick={handlePrint} variant="default">
                            <Printer className="w-4 h-4 mr-2" />
                            Imprimer
                        </Button>
                    </div>

                    {/* Footer */}
                    <footer className="text-center py-8 border-t border-gray-200">
                        <p className="text-gray-600 mb-1">
                            Propulsé par <strong className="text-gray-900">Kerykeion</strong> - Bibliothèque d'Astrologie Python
                        </p>
                        <p className="text-sm text-gray-500">
                            Les données sont calculées avec précision astronomique.
                        </p>
                    </footer>
                </div>
            </div>
        </div>
    )
}
