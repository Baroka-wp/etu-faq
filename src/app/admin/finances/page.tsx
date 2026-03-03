'use client'

import { useState, useEffect } from 'react'
import {
    DollarSign,
    TrendingUp,
    Users,
    CreditCard,
    CheckCircle2,
    XCircle,
    Calendar
} from 'lucide-react'
import { useRouter } from 'next/navigation'
import AdminSidebar from '@/components/AdminSidebar'
import { useToast } from '@/components/Toast'
import { ToastContainer } from '@/components/ToastContainer'

interface Stats {
    totalRecettes: number
    recettesInscription: number
    recettesMensuelles: number
    nombreInscriptionsPayes: number
    nombrePaiementsMensuelsPayes: number
}

interface RecetteMois {
    mois: number
    annee: number
    label: string
    total: number
}

interface StatsResponse {
    stats: Stats
    membresAJour: number
    membresEnRetard: number
    totalMembresActifs: number
    recettesParMois: RecetteMois[]
}

export default function AdminFinances() {
    const [activeTab, setActiveTab] = useState('finances')
    const [loading, setLoading] = useState(true)
    const [stats, setStats] = useState<StatsResponse | null>(null)
    const router = useRouter()
    const { toasts, addToast, removeToast } = useToast()

    useEffect(() => {
        fetchStats()
    }, [])

    const fetchStats = async () => {
        try {
            const response = await fetch('/api/admin/payments/stats')
            if (response.ok) {
                const data = await response.json()
                setStats(data)
            } else {
                addToast({
                    type: 'error',
                    title: 'Erreur',
                    message: 'Impossible de charger les statistiques'
                })
            }
        } catch (err) {
            console.error('Erreur lors du chargement des statistiques:', err)
            addToast({
                type: 'error',
                title: 'Erreur',
                message: 'Erreur lors du chargement des statistiques'
            })
        } finally {
            setLoading(false)
        }
    }

    const handleLogout = async () => {
        try {
            await fetch('/api/auth/logout', {
                method: 'POST'
            })
            router.push('/login')
        } catch (err) {
            console.error('Erreur lors de la déconnexion:', err)
        }
    }

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('fr-FR', {
            style: 'decimal',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        }).format(amount) + ' FCFA'
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
                        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900 mx-auto"></div>
                        <p className="mt-4 text-gray-600">Chargement des statistiques...</p>
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
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900">Tableau de Bord Financier</h1>
                            <p className="text-sm text-gray-600 mt-1">Suivi des recettes et paiements</p>
                        </div>
                    </div>
                </div>

                {/* Main Content */}
                <div className="flex-1 overflow-y-auto overflow-x-hidden">
                    <div className="p-4 sm:p-6 lg:p-8">
                        {stats && (
                            <>
                                {/* Stats Cards */}
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                                    {/* Total Recettes */}
                                    <div className="bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-lg shadow-lg p-6 text-white">
                                        <div className="flex items-center justify-between mb-2">
                                            <DollarSign className="w-8 h-8" />
                                            <TrendingUp className="w-5 h-5" />
                                        </div>
                                        <p className="text-emerald-100 text-sm font-medium">Total Recettes</p>
                                        <p className="text-3xl font-bold mt-2">{formatCurrency(stats.stats.totalRecettes)}</p>
                                    </div>

                                    {/* Frais d'inscription */}
                                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                                        <div className="flex items-center justify-between mb-2">
                                            <CreditCard className="w-8 h-8 text-blue-600" />
                                            <span className="text-sm text-gray-500">{stats.stats.nombreInscriptionsPayes} paiements</span>
                                        </div>
                                        <p className="text-gray-600 text-sm font-medium">Frais d'inscription</p>
                                        <p className="text-2xl font-bold text-gray-900 mt-2">{formatCurrency(stats.stats.recettesInscription)}</p>
                                    </div>

                                    {/* Cotisations mensuelles */}
                                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                                        <div className="flex items-center justify-between mb-2">
                                            <Calendar className="w-8 h-8 text-purple-600" />
                                            <span className="text-sm text-gray-500">{stats.stats.nombrePaiementsMensuelsPayes} paiements</span>
                                        </div>
                                        <p className="text-gray-600 text-sm font-medium">Cotisations mensuelles</p>
                                        <p className="text-2xl font-bold text-gray-900 mt-2">{formatCurrency(stats.stats.recettesMensuelles)}</p>
                                    </div>

                                    {/* Membres actifs */}
                                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                                        <div className="flex items-center justify-between mb-2">
                                            <Users className="w-8 h-8 text-orange-600" />
                                        </div>
                                        <p className="text-gray-600 text-sm font-medium">Membres actifs</p>
                                        <p className="text-2xl font-bold text-gray-900 mt-2">{stats.totalMembresActifs}</p>
                                        <div className="flex items-center gap-4 mt-3 text-sm">
                                            <span className="text-emerald-600 flex items-center gap-1">
                                                <CheckCircle2 className="w-4 h-4" />
                                                {stats.membresAJour} à jour
                                            </span>
                                            <span className="text-red-600 flex items-center gap-1">
                                                <XCircle className="w-4 h-4" />
                                                {stats.membresEnRetard} en retard
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                {/* Recettes par mois */}
                                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
                                    <h2 className="text-lg font-semibold text-gray-900 mb-6">Recettes des 12 derniers mois</h2>
                                    <div className="space-y-3">
                                        {stats.recettesParMois.map((recette) => {
                                            const maxTotal = Math.max(...stats.recettesParMois.map(r => r.total))
                                            const percentage = maxTotal > 0 ? (recette.total / maxTotal) * 100 : 0

                                            return (
                                                <div key={`${recette.annee}-${recette.mois}`} className="flex items-center gap-4">
                                                    <div className="w-24 text-sm font-medium text-gray-700">
                                                        {recette.label}
                                                    </div>
                                                    <div className="flex-1 bg-gray-200 rounded-full h-8 relative overflow-hidden">
                                                        <div
                                                            className="bg-gradient-to-r from-emerald-500 to-emerald-600 h-full rounded-full transition-all duration-500 flex items-center justify-end px-3"
                                                            style={{ width: `${Math.max(percentage, 5)}%` }}
                                                        >
                                                            {recette.total > 0 && (
                                                                <span className="text-white text-sm font-semibold">
                                                                    {formatCurrency(recette.total)}
                                                                </span>
                                                            )}
                                                        </div>
                                                        {recette.total === 0 && (
                                                            <div className="absolute inset-0 flex items-center px-3">
                                                                <span className="text-gray-500 text-sm">Aucun paiement</span>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            )
                                        })}
                                    </div>
                                </div>

                                {/* Informations complémentaires */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {/* Membres à jour */}
                                    <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-6">
                                        <div className="flex items-center gap-3 mb-3">
                                            <CheckCircle2 className="w-6 h-6 text-emerald-600" />
                                            <h3 className="text-lg font-semibold text-gray-900">Membres à jour</h3>
                                        </div>
                                        <p className="text-4xl font-bold text-emerald-600">{stats.membresAJour}</p>
                                        <p className="text-sm text-emerald-700 mt-2">
                                            {stats.totalMembresActifs > 0
                                                ? `${Math.round((stats.membresAJour / stats.totalMembresActifs) * 100)}% des membres actifs`
                                                : 'Aucun membre actif'}
                                        </p>
                                    </div>

                                    {/* Membres en retard */}
                                    <div className="bg-red-50 border border-red-200 rounded-lg p-6">
                                        <div className="flex items-center gap-3 mb-3">
                                            <XCircle className="w-6 h-6 text-red-600" />
                                            <h3 className="text-lg font-semibold text-gray-900">Membres en retard</h3>
                                        </div>
                                        <p className="text-4xl font-bold text-red-600">{stats.membresEnRetard}</p>
                                        <p className="text-sm text-red-700 mt-2">
                                            {stats.totalMembresActifs > 0
                                                ? `${Math.round((stats.membresEnRetard / stats.totalMembresActifs) * 100)}% des membres actifs`
                                                : 'Aucun membre actif'}
                                        </p>
                                    </div>
                                </div>
                            </>
                        )}
                    </div>
                </div>
            </div>

            {/* Toast Container */}
            <ToastContainer toasts={toasts} removeToast={removeToast} />
        </div>
    )
}
