'use client'

import { useState } from 'react'
import { Loader2, Sparkles } from 'lucide-react'
import { toast } from 'sonner'
import CitySearch from './CitySearch'

interface AstrologyFormProps {
    onSubmit: (data: any) => Promise<void>
    loading: boolean
    title?: string
    description?: string
    initialData?: {
        name?: string
        year?: number
        month?: number
        day?: number
        hour?: number
        minute?: number
        city?: string
        nation?: string
    }
}

export default function AstrologyForm({
    onSubmit,
    loading,
    title = "Informations de naissance",
    description = "Remplissez les informations pour générer une carte astrologique",
    initialData
}: AstrologyFormProps) {
    const [formData, setFormData] = useState({
        name: initialData?.name || '',
        year: initialData?.year || new Date().getFullYear(),
        month: initialData?.month || 1,
        day: initialData?.day || 1,
        hour: initialData?.hour || 12,
        minute: initialData?.minute || 0,
        city: initialData?.city || '',
        nation: initialData?.nation || 'FR',
        theme: 'classic',
        language: 'FR',
        zodiac_type: 'Tropic',
        houses_system: 'P'
    })

    const handleInputChange = (field: string, value: any) => {
        // Gérer les cas où value peut être NaN ou undefined
        let processedValue = value

        if (field === 'year' || field === 'month' || field === 'day' || field === 'hour' || field === 'minute') {
            const numValue = parseInt(value)
            processedValue = isNaN(numValue) ? (field === 'year' ? new Date().getFullYear() : 1) : numValue
        }

        setFormData(prev => ({
            ...prev,
            [field]: processedValue
        }))
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        if (!formData.name || !formData.city) {
            toast.error('Veuillez remplir tous les champs obligatoires')
            return
        }

        // Validation du code pays
        if (!formData.nation || formData.nation.length !== 2 || !/^[A-Z]{2}$/.test(formData.nation)) {
            toast.error('Le code pays doit être composé de 2 lettres (ex: FR, US, GB)')
            return
        }

        await onSubmit(formData)
    }

    return (
        <div className="bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden">
            <div className="p-6 border-b border-gray-200">
                <h2 className="text-xl font-serif font-bold text-gray-900">{title}</h2>
                <p className="text-sm text-gray-600 font-serif mt-1">{description}</p>
            </div>
            <div className="p-6">
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <label htmlFor="name" className="block text-sm font-serif font-medium text-gray-700 mb-2">Nom *</label>
                            <input
                                id="name"
                                value={formData.name}
                                onChange={(e) => handleInputChange('name', e.target.value)}
                                placeholder="Nom de la personne"
                                required
                                className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-gray-900 focus:border-transparent text-sm font-serif transition-all"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-serif font-medium text-gray-700 mb-2">Ville de naissance *</label>
                            <CitySearch
                                value={formData.city}
                                onChange={(city, countryCode) => {
                                    handleInputChange('city', city)
                                    handleInputChange('nation', countryCode)
                                }}
                                placeholder="Ex: Cotonou, Paris..."
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-serif font-medium text-gray-700 mb-2">Date de naissance</label>
                        <div className="grid grid-cols-3 gap-3">
                            <div>
                                <input
                                    id="day"
                                    type="number"
                                    min="1"
                                    max="31"
                                    value={formData.day || ''}
                                    onChange={(e) => handleInputChange('day', e.target.value)}
                                    placeholder="Jour"
                                    className="w-full px-3 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-gray-900 focus:border-transparent text-sm font-serif transition-all"
                                />
                            </div>
                            <div>
                                <select
                                    value={(formData.month || 1).toString()}
                                    onChange={(e) => handleInputChange('month', e.target.value)}
                                    className="w-full px-3 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-gray-900 focus:border-transparent text-sm font-serif transition-all"
                                >
                                    <option value="1">Janvier</option>
                                    <option value="2">Février</option>
                                    <option value="3">Mars</option>
                                    <option value="4">Avril</option>
                                    <option value="5">Mai</option>
                                    <option value="6">Juin</option>
                                    <option value="7">Juillet</option>
                                    <option value="8">Août</option>
                                    <option value="9">Septembre</option>
                                    <option value="10">Octobre</option>
                                    <option value="11">Novembre</option>
                                    <option value="12">Décembre</option>
                                </select>
                            </div>
                            <div>
                                <input
                                    id="year"
                                    type="number"
                                    value={formData.year || ''}
                                    onChange={(e) => handleInputChange('year', e.target.value)}
                                    min="1900"
                                    max="2100"
                                    placeholder="Année"
                                    className="w-full px-3 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-gray-900 focus:border-transparent text-sm font-serif transition-all"
                                />
                            </div>
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-serif font-medium text-gray-700 mb-2">Heure de naissance (optionnel)</label>
                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <input
                                    id="hour"
                                    type="number"
                                    min="0"
                                    max="23"
                                    value={formData.hour || ''}
                                    onChange={(e) => handleInputChange('hour', e.target.value)}
                                    placeholder="Heure (0-23)"
                                    className="w-full px-3 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-gray-900 focus:border-transparent text-sm font-serif transition-all"
                                />
                            </div>
                            <div>
                                <input
                                    id="minute"
                                    type="number"
                                    min="0"
                                    max="59"
                                    value={formData.minute || ''}
                                    onChange={(e) => handleInputChange('minute', e.target.value)}
                                    placeholder="Minutes (0-59)"
                                    className="w-full px-3 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-gray-900 focus:border-transparent text-sm font-serif transition-all"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Le code pays est automatiquement rempli via la recherche de ville */}
                    <input type="hidden" value={formData.nation} />

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-gray-900 hover:bg-black disabled:bg-gray-400 text-white px-6 py-3.5 rounded-xl text-sm font-serif font-semibold transition-all shadow-lg hover:shadow-xl disabled:cursor-not-allowed disabled:shadow-none flex items-center justify-center space-x-2"
                    >
                        {loading ? (
                            <>
                                <Loader2 className="w-4 h-4 animate-spin" />
                                <span>Génération en cours...</span>
                            </>
                        ) : (
                            <>
                                <Sparkles className="w-4 h-4" />
                                <span>Générer ma carte astrologique</span>
                            </>
                        )}
                    </button>
                </form>
            </div>
        </div>
    )
}
