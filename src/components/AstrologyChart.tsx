'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Download, Eye, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import AstrologySymbols from './AstrologySymbols'
import ZodiacSymbols from './ZodiacSymbols'

interface AstrologyChartProps {
    chartData: {
        basic_info: {
            name: string
            birth_date: string
            birth_time: string
            location: string
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
    onDownload?: () => void
}

export default function AstrologyChart({ chartData, onDownload }: AstrologyChartProps) {
    const [imageLoading, setImageLoading] = useState(false)

    const downloadSVG = () => {
        if (chartData.svg.base64) {
            try {
                const svgContent = atob(chartData.svg.base64)
                const blob = new Blob([svgContent], { type: 'image/svg+xml' })
                const url = URL.createObjectURL(blob)
                const a = document.createElement('a')
                a.href = url
                a.download = chartData.svg.filename
                a.click()
                URL.revokeObjectURL(url)
                toast.success('Carte téléchargée avec succès!')
                onDownload?.()
            } catch (error) {
                console.error('Erreur lors du téléchargement:', error)
                toast.error('Erreur lors du téléchargement de la carte')
            }
        }
    }

    const handleImageLoad = () => {
        setImageLoading(false)
    }

    const handleImageError = () => {
        setImageLoading(false)
        toast.error('Erreur lors du chargement de l\'image')
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center justify-between">
                    <span>Résultats astrologiques</span>
                    {chartData.svg.generated && (
                        <Button onClick={downloadSVG} size="sm" variant="outline">
                            <Download className="w-4 h-4 mr-2" />
                            Télécharger
                        </Button>
                    )}
                </CardTitle>
                <CardDescription>
                    Carte astrologique et interprétations pour {chartData.basic_info.name}
                </CardDescription>
            </CardHeader>
            <CardContent>
                <Tabs defaultValue="chart" className="w-full">
                    <TabsList className="grid w-full grid-cols-3">
                        <TabsTrigger value="chart">Carte</TabsTrigger>
                        <TabsTrigger value="planets">Planètes</TabsTrigger>
                        <TabsTrigger value="interpretations">Interprétations</TabsTrigger>
                    </TabsList>

                    <TabsContent value="chart" className="space-y-4">
                        <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-4 text-sm">
                                <div>
                                    <span className="font-medium">Nom:</span> {chartData.basic_info.name}
                                </div>
                                <div>
                                    <span className="font-medium">Date de naissance:</span> {chartData.basic_info.birth_date}
                                </div>
                                <div>
                                    <span className="font-medium">Heure:</span> {chartData.basic_info.birth_time}
                                </div>
                                <div>
                                    <span className="font-medium">Lieu:</span> {chartData.basic_info.location}
                                </div>
                            </div>

                            {chartData.svg.base64 && (
                                <div className="border rounded-lg p-4 bg-gray-50">
                                    {imageLoading && (
                                        <div className="flex items-center justify-center h-64">
                                            <Loader2 className="w-8 h-8 animate-spin" />
                                        </div>
                                    )}
                                    <img
                                        src={`data:image/svg+xml;base64,${chartData.svg.base64}`}
                                        alt="Carte astrologique"
                                        className="w-full h-auto max-h-96 object-contain"
                                        onLoad={handleImageLoad}
                                        onError={handleImageError}
                                        style={{ display: imageLoading ? 'none' : 'block' }}
                                    />
                                </div>
                            )}
                        </div>
                    </TabsContent>

                    <TabsContent value="planets" className="space-y-6">
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
                                                    <AstrologySymbols planetName={planet.planet_name} />
                                                </div>
                                                <span className="font-medium text-gray-900">{planet.planet_name}</span>
                                            </div>
                                            <div className="flex items-center space-x-4">
                                                <div className="flex items-center space-x-1">
                                                    <ZodiacSymbols signName={planet.sign} className="text-sm" />
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
                                                        <ZodiacSymbols signName={signName} className="text-sm" />
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
                    </TabsContent>

                    <TabsContent value="interpretations" className="space-y-4">
                        <h3 className="text-lg font-semibold">Interprétations</h3>
                        <div className="space-y-3">
                            {Object.entries(chartData.interpretations).map(([key, interpretation]) => (
                                <div key={key} className="p-4 bg-gray-50 rounded-lg">
                                    <h4 className="font-medium text-sm text-gray-700 mb-2 capitalize">
                                        {key.replace(/_/g, ' ')}
                                    </h4>
                                    <p className="text-sm text-gray-600 leading-relaxed">
                                        {interpretation}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </TabsContent>
                </Tabs>
            </CardContent>
        </Card>
    )
}
