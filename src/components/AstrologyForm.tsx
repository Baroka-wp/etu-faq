'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Loader2, Sparkles } from 'lucide-react'
import { toast } from 'sonner'

interface AstrologyFormProps {
    onSubmit: (data: any) => Promise<void>
    loading: boolean
    title?: string
    description?: string
}

export default function AstrologyForm({
    onSubmit,
    loading,
    title = "Informations de naissance",
    description = "Remplissez les informations pour générer une carte astrologique"
}: AstrologyFormProps) {
    const [formData, setFormData] = useState({
        name: '',
        year: new Date().getFullYear(),
        month: 1,
        day: 1,
        hour: 12,
        minute: 0,
        city: '',
        nation: 'FR',
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
        <Card>
            <CardHeader>
                <CardTitle>{title}</CardTitle>
                <CardDescription>{description}</CardDescription>
            </CardHeader>
            <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <Label htmlFor="name">Nom *</Label>
                            <Input
                                id="name"
                                value={formData.name}
                                onChange={(e) => handleInputChange('name', e.target.value)}
                                placeholder="Nom de la personne"
                                required
                            />
                        </div>
                        <div>
                            <Label htmlFor="city">Ville *</Label>
                            <Input
                                id="city"
                                value={formData.city}
                                onChange={(e) => handleInputChange('city', e.target.value)}
                                placeholder="Ville de naissance"
                                required
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-3 gap-4">
                        <div>
                            <Label htmlFor="year">Année</Label>
                            <Input
                                id="year"
                                type="number"
                                value={formData.year || ''}
                                onChange={(e) => handleInputChange('year', e.target.value)}
                                min="1900"
                                max="2100"
                            />
                        </div>
                        <div>
                            <Label htmlFor="month">Mois</Label>
                            <Select value={(formData.month || 1).toString()} onValueChange={(value) => handleInputChange('month', value)}>
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    {[
                                        { value: 1, label: 'Janvier' },
                                        { value: 2, label: 'Février' },
                                        { value: 3, label: 'Mars' },
                                        { value: 4, label: 'Avril' },
                                        { value: 5, label: 'Mai' },
                                        { value: 6, label: 'Juin' },
                                        { value: 7, label: 'Juillet' },
                                        { value: 8, label: 'Août' },
                                        { value: 9, label: 'Septembre' },
                                        { value: 10, label: 'Octobre' },
                                        { value: 11, label: 'Novembre' },
                                        { value: 12, label: 'Décembre' }
                                    ].map((month) => (
                                        <SelectItem key={month.value} value={month.value.toString()}>
                                            {month.label}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div>
                            <Label htmlFor="day">Jour</Label>
                            <Input
                                id="day"
                                type="number"
                                min="1"
                                max="31"
                                value={formData.day || ''}
                                onChange={(e) => handleInputChange('day', e.target.value)}
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <Label htmlFor="hour">Heure</Label>
                            <Input
                                id="hour"
                                type="number"
                                min="0"
                                max="23"
                                value={formData.hour || ''}
                                onChange={(e) => handleInputChange('hour', e.target.value)}
                            />
                        </div>
                        <div>
                            <Label htmlFor="minute">Minute</Label>
                            <Input
                                id="minute"
                                type="number"
                                min="0"
                                max="59"
                                value={formData.minute || ''}
                                onChange={(e) => handleInputChange('minute', e.target.value)}
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <Label htmlFor="nation">Pays (code ISO 2 lettres)</Label>
                            <Input
                                id="nation"
                                value={formData.nation}
                                onChange={(e) => handleInputChange('nation', e.target.value.toUpperCase())}
                                placeholder="FR, US, GB, DE, ES, IT..."
                                maxLength={2}
                                pattern="[A-Z]{2}"
                                title="Code pays à 2 lettres (ex: FR, US, GB)"
                            />
                            <p className="text-xs text-gray-500 mt-1">
                                Codes courants: FR (France), US (États-Unis), GB (Royaume-Uni), DE (Allemagne), ES (Espagne), IT (Italie), CA (Canada), AU (Australie)
                            </p>
                        </div>
                        <div>
                            <Label htmlFor="theme">Thème</Label>
                            <Select value={formData.theme} onValueChange={(value) => handleInputChange('theme', value)}>
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="classic">Classic</SelectItem>
                                    <SelectItem value="dark">Dark</SelectItem>
                                    <SelectItem value="light">Light</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <Label htmlFor="language">Langue</Label>
                            <Select value={formData.language} onValueChange={(value) => handleInputChange('language', value)}>
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="FR">Français</SelectItem>
                                    <SelectItem value="EN">English</SelectItem>
                                    <SelectItem value="ES">Español</SelectItem>
                                    <SelectItem value="IT">Italiano</SelectItem>
                                    <SelectItem value="DE">Deutsch</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div>
                            <Label htmlFor="houses_system">Système de maisons</Label>
                            <Select value={formData.houses_system} onValueChange={(value) => handleInputChange('houses_system', value)}>
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="P">Placidus</SelectItem>
                                    <SelectItem value="K">Koch</SelectItem>
                                    <SelectItem value="O">Porphyry</SelectItem>
                                    <SelectItem value="R">Regiomontanus</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    <Button
                        type="submit"
                        disabled={loading}
                        className="w-full"
                    >
                        {loading ? (
                            <>
                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                Génération en cours...
                            </>
                        ) : (
                            <>
                                <Sparkles className="w-4 h-4 mr-2" />
                                Générer la carte
                            </>
                        )}
                    </Button>
                </form>
            </CardContent>
        </Card>
    )
}
