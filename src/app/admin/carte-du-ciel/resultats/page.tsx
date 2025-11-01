'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ArrowLeft, Download, Sparkles, Maximize2 } from 'lucide-react'
import { toast } from 'sonner'
import AstrologyChart from '@/components/AstrologyChart'
import AstrologyInterpretations from '@/components/AstrologyInterpretations'
import AdminSidebar from '@/components/AdminSidebar'

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
    const [isFullscreen, setIsFullscreen] = useState(false)
    const [activeTab, setActiveTab] = useState('carte-du-ciel')

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
                setChartData(JSON.parse(savedData))
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
        toast.success('Carte téléchargée avec succès!')
    }

    const toggleFullscreen = () => {
        setIsFullscreen(!isFullscreen)
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
        <div className="h-screen bg-gray-50 flex overflow-hidden">
            <AdminSidebar
                activeTab={activeTab}
                onTabChange={setActiveTab}
                onLogout={handleLogout}
            />

            {/* Main Content */}
            <div className="flex-1 flex flex-col lg:ml-64 overflow-hidden">
                {/* Header */}
                <div className="sticky top-0 z-30 bg-white border-b border-gray-200 flex-shrink-0">
                    <div className="px-4 sm:px-6 lg:px-8 py-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <h1 className="text-2xl font-bold text-gray-900">Carte astrologique</h1>
                                <p className="text-sm text-gray-600 mt-1">
                                    Thème natal de {chartData.basic_info.name}
                                </p>
                            </div>
                            <div className="flex space-x-3">
                                <Button onClick={handleBackToForm} variant="outline">
                                    <ArrowLeft className="w-4 h-4 mr-2" />
                                    Nouvelle carte
                                </Button>
                                {chartData.svg.generated && (
                                    <Button onClick={handleDownload} variant="default">
                                        <Download className="w-4 h-4 mr-2" />
                                        Télécharger
                                    </Button>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Content Area */}
                <div className="flex-1 overflow-y-auto overflow-x-hidden">
                    <div className="p-4 sm:p-6 lg:p-8 space-y-6">

            {/* Informations de base */}
            <Card>
                <CardHeader>
                    <CardTitle>Informations de naissance</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        <div>
                            <span className="text-sm font-medium text-gray-500">Nom</span>
                            <p className="text-lg font-semibold text-gray-900">{chartData.basic_info.name}</p>
                        </div>
                        <div>
                            <span className="text-sm font-medium text-gray-500">Date de naissance</span>
                            <p className="text-lg font-semibold text-gray-900">{chartData.basic_info.birth_date}</p>
                        </div>
                        <div>
                            <span className="text-sm font-medium text-gray-500">Heure</span>
                            <p className="text-lg font-semibold text-gray-900">{chartData.basic_info.birth_time}</p>
                        </div>
                        <div>
                            <span className="text-sm font-medium text-gray-500">Lieu</span>
                            <p className="text-lg font-semibold text-gray-900">{chartData.basic_info.location}</p>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Carte SVG */}
            {chartData.svg.base64 && (
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center justify-between">
                            <span>Carte astrologique</span>
                            <div className="flex space-x-2">
                                <Button onClick={toggleFullscreen} size="sm" variant="outline">
                                    <Maximize2 className="w-4 h-4 mr-2" />
                                    {isFullscreen ? 'Réduire' : 'Plein écran'}
                                </Button>
                                <Button onClick={handleDownload} size="sm" variant="outline">
                                    <Download className="w-4 h-4 mr-2" />
                                    Télécharger SVG
                                </Button>
                            </div>
                        </CardTitle>
                        <CardDescription>
                            Thème natal généré pour {chartData.basic_info.name}
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className={`border rounded-lg p-6 bg-gray-50 ${isFullscreen ? 'fixed inset-4 z-50 bg-white' : ''}`}>
                            <img
                                src={`data:image/svg+xml;base64,${chartData.svg.base64}`}
                                alt="Carte astrologique"
                                className={`w-full h-auto object-contain mx-auto ${isFullscreen ? 'max-h-[calc(100vh-8rem)]' : 'max-h-[600px]'}`}
                            />
                            {isFullscreen && (
                                <div className="absolute top-4 right-4">
                                    <Button onClick={toggleFullscreen} size="sm" variant="outline">
                                        <Maximize2 className="w-4 h-4 mr-2" />
                                        Réduire
                                    </Button>
                                </div>
                            )}
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Planètes et Maisons */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Section Planètes */}
                <Card>
                    <CardHeader className="pb-3">
                        <CardTitle className="text-lg font-semibold">Planètes</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-0">
                        {Object.entries(chartData.planets).map(([key, planet], index) => (
                            <div key={key} className={`flex items-center justify-between py-3 ${index !== Object.keys(chartData.planets).length - 1 ? 'border-b border-gray-200' : ''}`}>
                                <div className="flex items-center space-x-3">
                                    <div className="w-4 h-4 flex items-center justify-center">
                                        <span className="text-lg">☉</span>
                                    </div>
                                    <span className="font-medium text-gray-900">{planet.planet_name}</span>
                                </div>
                                <div className="flex items-center space-x-4">
                                    <div className="flex items-center space-x-1">
                                        <span className="text-purple-600 text-sm">♈</span>
                                        <span className="text-purple-600 font-medium">
                                            {planet.position}°
                                        </span>
                                    </div>
                                    <span className="text-gray-600 text-sm">
                                        {planet.house}
                                    </span>
                                </div>
                            </div>
                        ))}
                    </CardContent>
                </Card>

                {/* Section Maisons */}
                <Card>
                    <CardHeader className="pb-3">
                        <CardTitle className="text-lg font-semibold">Maisons</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-0">
                        {Object.entries(chartData.houses).map(([key, house], index) => {
                            const houseNumber = key.replace('_house', '').replace('first', '1').replace('second', '2').replace('third', '3').replace('fourth', '4').replace('fifth', '5').replace('sixth', '6').replace('seventh', '7').replace('eighth', '8').replace('ninth', '9').replace('tenth', '10').replace('eleventh', '11').replace('twelfth', '12')
                            const signNames: Record<string, string> = {
                                'Ari': 'Bélier', 'Tau': 'Taureau', 'Gem': 'Gémeaux', 'Can': 'Cancer',
                                'Leo': 'Lion', 'Vir': 'Vierge', 'Lib': 'Balance', 'Sco': 'Scorpion',
                                'Sag': 'Sagittaire', 'Cap': 'Capricorne', 'Aqu': 'Verseau', 'Pis': 'Poissons'
                            }
                            const signName = signNames[house.sign] || house.sign

                            return (
                                <div key={key} className={`flex items-center justify-between py-3 ${index !== Object.keys(chartData.houses).length - 1 ? 'border-b border-gray-200' : ''}`}>
                                    <div className="flex items-center space-x-3">
                                        <span className="text-sm font-medium text-gray-600 w-6">
                                            {houseNumber}
                                        </span>
                                        <div className="flex items-center space-x-2">
                                            <span className="text-purple-600 text-sm">♈</span>
                                            <span className="text-gray-900">
                                                {signName}
                                            </span>
                                        </div>
                                    </div>
                                    <span className="text-gray-600 text-sm">
                                        {house.position}°
                                    </span>
                                </div>
                            )
                        })}
                    </CardContent>
                </Card>
            </div>

            {/* Interprétations Spirituelles */}
            <AstrologyInterpretations chartData={chartData} />
                    </div>
                </div>
            </div>
        </div>
    )
}
