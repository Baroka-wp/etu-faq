'use client'

import { useState, useEffect } from 'react'
import { Users, UserCheck, Clock, TrendingUp, Eye, Download, Calendar, MapPin, Phone, Shield, Book, ArrowRight } from 'lucide-react'
import { useRouter } from 'next/navigation'
import AdminSidebar from '@/components/AdminSidebar'

interface DashboardStats {
    totalInscriptions: number
    totalMembers: number
    pendingApprovals: number
    recentInscriptions: any[]
}

export default function AdminDashboard() {
    const [activeTab, setActiveTab] = useState('dashboard')
    const [stats, setStats] = useState<DashboardStats>({
        totalInscriptions: 0,
        totalMembers: 0,
        pendingApprovals: 0,
        recentInscriptions: []
    })
    const [loading, setLoading] = useState(true)
    const router = useRouter()

    useEffect(() => {
        fetchDashboardData()
    }, [])

    const fetchDashboardData = async () => {
        try {
            const response = await fetch('/api/admin/dashboard')
            if (response.ok) {
                const data = await response.json()
                setStats(data)
            }
        } catch (err) {
            console.error('Erreur lors du chargement des données:', err)
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

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900 mx-auto"></div>
                    <p className="mt-4 text-gray-600">Chargement du dashboard...</p>
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
                                <h1 className="text-2xl font-bold text-gray-900">Tableau de bord</h1>
                                <p className="text-sm text-gray-600 mt-1">Vue d'ensemble de l'École Transcendantaliste Universelle</p>
                            </div>
                            <div className="flex items-center space-x-3">
                                <button className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition-colors">
                                    <Download className="w-4 h-4 mr-2" />
                                    Exporter
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Dashboard Content */}
                <div className="flex-1 overflow-y-auto overflow-x-hidden">
                    <div className="p-4 sm:p-6 lg:p-8">
                    {/* Stats Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-8">
                        {/* Total Inscriptions */}
                        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
                            <div className="flex items-center">
                                <div className="flex-shrink-0">
                                    <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                                        <Users className="w-6 h-6 text-blue-600" />
                                    </div>
                                </div>
                                <div className="ml-4">
                                    <p className="text-sm font-medium text-gray-500">Total inscriptions</p>
                                    <p className="text-2xl font-bold text-gray-900">{stats.totalInscriptions}</p>
                                </div>
                            </div>
                        </div>

                        {/* Active Members */}
                        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
                            <div className="flex items-center">
                                <div className="flex-shrink-0">
                                    <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                                        <UserCheck className="w-6 h-6 text-green-600" />
                                    </div>
                                </div>
                                <div className="ml-4">
                                    <p className="text-sm font-medium text-gray-500">Membres actifs</p>
                                    <p className="text-2xl font-bold text-gray-900">{stats.totalMembers}</p>
                                </div>
                            </div>
                        </div>

                        {/* Pending Approvals */}
                        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
                            <div className="flex items-center">
                                <div className="flex-shrink-0">
                                    <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                                        <Clock className="w-6 h-6 text-yellow-600" />
                                    </div>
                                </div>
                                <div className="ml-4">
                                    <p className="text-sm font-medium text-gray-500">En attente</p>
                                    <p className="text-2xl font-bold text-gray-900">{stats.pendingApprovals}</p>
                                </div>
                            </div>
                        </div>

                        {/* Growth Rate */}
                        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
                            <div className="flex items-center">
                                <div className="flex-shrink-0">
                                    <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                                        <TrendingUp className="w-6 h-6 text-purple-600" />
                                    </div>
                                </div>
                                <div className="ml-4">
                                    <p className="text-sm font-medium text-gray-500">Croissance</p>
                                    <p className="text-2xl font-bold text-gray-900">+12%</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Content Grid */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {/* Recent Inscriptions */}
                        <div className="lg:col-span-2 bg-white rounded-lg shadow-sm border border-gray-200">
                            <div className="px-6 py-4 border-b border-gray-200">
                                <div className="flex items-center justify-between">
                                    <h3 className="text-lg font-semibold text-gray-900">Inscriptions récentes</h3>
                                    <button
                                        onClick={() => router.push('/admin/inscriptions')}
                                        className="text-sm text-gray-600 hover:text-gray-900 flex items-center"
                                    >
                                        Voir tout
                                        <ArrowRight className="w-4 h-4 ml-1" />
                                    </button>
                                </div>
                            </div>
                            <div className="p-6">
                                {stats.recentInscriptions.length === 0 ? (
                                    <div className="text-center py-8">
                                        <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                                        <p className="text-gray-500">Aucune inscription récente</p>
                                    </div>
                                ) : (
                                    <div className="space-y-4">
                                        {stats.recentInscriptions.map((inscription) => (
                                            <div key={inscription.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                                                <div className="flex items-center space-x-4">
                                                    <div className="w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center">
                                                        <Users className="w-5 h-5 text-white" />
                                                    </div>
                                                    <div>
                                                        <p className="font-medium text-gray-900">{inscription.prenom} {inscription.nom}</p>
                                                        <p className="text-sm text-gray-500">{inscription.telephone}</p>
                                                    </div>
                                                </div>
                                                <div className="flex items-center space-x-2">
                                                    <span className="text-sm text-gray-500">
                                                        {new Date(inscription.createdAt).toLocaleDateString('fr-FR')}
                                                    </span>
                                                    <button className="p-1 text-gray-400 hover:text-gray-600 transition-colors">
                                                        <Eye className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Quick Actions */}
                        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                            <div className="px-6 py-4 border-b border-gray-200">
                                <h3 className="text-lg font-semibold text-gray-900">Actions rapides</h3>
                            </div>
                            <div className="p-6">
                                <div className="space-y-3">
                                    <button
                                        onClick={() => router.push('/admin/inscriptions')}
                                        className="w-full flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors group"
                                    >
                                        <div className="flex items-center space-x-3">
                                            <Users className="w-5 h-5 text-gray-600" />
                                            <span className="font-medium text-gray-900">Gérer les inscriptions</span>
                                        </div>
                                        <ArrowRight className="w-4 h-4 text-gray-400 group-hover:text-gray-600" />
                                    </button>

                                    <button
                                        onClick={() => router.push('/admin/members')}
                                        className="w-full flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors group"
                                    >
                                        <div className="flex items-center space-x-3">
                                            <UserCheck className="w-5 h-5 text-gray-600" />
                                            <span className="font-medium text-gray-900">Voir tous les membres</span>
                                        </div>
                                        <ArrowRight className="w-4 h-4 text-gray-400 group-hover:text-gray-600" />
                                    </button>

                                    <button
                                        onClick={() => router.push('/admin/grades')}
                                        className="w-full flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors group"
                                    >
                                        <div className="flex items-center space-x-3">
                                            <Shield className="w-5 h-5 text-gray-600" />
                                            <span className="font-medium text-gray-900">Gérer les grades</span>
                                        </div>
                                        <ArrowRight className="w-4 h-4 text-gray-400 group-hover:text-gray-600" />
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            </div>
        </div>
    )
}
