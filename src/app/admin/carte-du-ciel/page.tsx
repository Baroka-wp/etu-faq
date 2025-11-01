'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Sparkles } from 'lucide-react'
import { toast } from 'sonner'
import AstrologyForm from '@/components/AstrologyForm'
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

export default function CarteDuCielPage() {
    const router = useRouter()
    const [loading, setLoading] = useState(false)
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

    const generateNatalChart = async (formData: any) => {
        setLoading(true)
        try {
            const response = await fetch('/api/astrology/natal', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData),
            })

            const result = await response.json()

            if (result.success) {
                // Sauvegarder les données dans le localStorage uniquement
                localStorage.setItem('astrology-chart-data', JSON.stringify(result.data))

                toast.success('Carte astrologique générée avec succès!')

                // Rediriger vers la page de résultats sans paramètres URL
                router.push('/admin/carte-du-ciel/resultats')
            } else {
                toast.error('Erreur lors de la génération de la carte')
            }
        } catch (error) {
            console.error('Error:', error)
            toast.error('Erreur lors de la génération de la carte')
        } finally {
            setLoading(false)
        }
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
                                <h1 className="text-2xl font-bold text-gray-900">Carte du ciel</h1>
                                <p className="text-sm text-gray-600 mt-1">
                                    Générez des cartes astrologiques avec l'API Kerykeion
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Content Area */}
                <div className="flex-1 overflow-y-auto overflow-x-hidden">
                    <div className="p-4 sm:p-6 lg:p-8">
                    <div className="max-w-2xl mx-auto">
                        <AstrologyForm
                            onSubmit={generateNatalChart}
                            loading={loading}
                            title="Informations de naissance"
                            description="Remplissez les informations pour générer une carte astrologique personnalisée"
                        />
                    </div>
                </div>
            </div>
            </div>
        </div>
    )
}
