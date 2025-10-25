'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Sparkles } from 'lucide-react'
import { toast } from 'sonner'
import AstrologyForm from '@/components/AstrologyForm'

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
        <div className="container mx-auto p-6 space-y-6">
            <div className="flex items-center space-x-2">
                <Sparkles className="w-8 h-8 text-purple-600" />
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Carte du ciel</h1>
                    <p className="text-gray-600">Générez des cartes astrologiques avec l'API Kerykeion</p>
                </div>
            </div>

            <div className="max-w-2xl mx-auto">
                <AstrologyForm
                    onSubmit={generateNatalChart}
                    loading={loading}
                    title="Informations de naissance"
                    description="Remplissez les informations pour générer une carte astrologique personnalisée"
                />
            </div>
        </div>
    )
}
