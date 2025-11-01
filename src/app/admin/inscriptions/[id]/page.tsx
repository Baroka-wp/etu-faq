'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { 
    User, Mail, Phone, Calendar, MapPin, BookOpen, Shield, Award, Clock, 
    ArrowLeft, Edit, LogOut 
} from 'lucide-react'
import AdminSidebar from '@/components/AdminSidebar'
import Link from 'next/link'

interface InscriptionProfile {
    id: string
    nom: string
    prenom: string
    sexe: string
    telephone: string
    lieuResidence: string
    grade: string
    programme: string
    statut: string
    motDePasse: string
    dateNaissance?: string
    heureNaissance?: string
    lieuNaissance?: string
    religion?: string
    createdAt: string
    updatedAt?: string
}

export default function InscriptionProfilePage() {
    const params = useParams()
    const router = useRouter()
    const [activeTab, setActiveTab] = useState('inscriptions')
    const [inscription, setInscription] = useState<InscriptionProfile | null>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')
    const id = params?.id as string

    useEffect(() => {
        if (id) {
            fetchInscriptionProfile()
        }
    }, [id])

    const fetchInscriptionProfile = async () => {
        try {
            const response = await fetch(`/api/admin/inscriptions/${id}`)
            if (response.ok) {
                const data = await response.json()
                setInscription(data)
            } else if (response.status === 404) {
                setError('Inscription non trouvée')
            } else {
                setError('Erreur lors du chargement du profil')
            }
        } catch (err) {
            console.error('Erreur:', err)
            setError('Une erreur de connexion est survenue')
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
            <div className="h-screen bg-gray-50 flex overflow-hidden">
                <AdminSidebar
                    activeTab={activeTab}
                    onTabChange={setActiveTab}
                    onLogout={handleLogout}
                />
                <div className="flex-1 flex flex-col lg:ml-64 overflow-hidden">
                    <div className="flex-1 overflow-y-auto flex items-center justify-center">
                        <div className="text-center">
                            <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900 mx-auto"></div>
                            <p className="mt-4 text-gray-600">Chargement du profil...</p>
                        </div>
                    </div>
                </div>
            </div>
        )
    }

    if (error) {
        return (
            <div className="h-screen bg-gray-50 flex overflow-hidden">
                <AdminSidebar
                    activeTab={activeTab}
                    onTabChange={setActiveTab}
                    onLogout={handleLogout}
                />
                <div className="flex-1 flex flex-col lg:ml-64 overflow-hidden">
                    <div className="flex-1 overflow-y-auto flex items-center justify-center">
                        <div className="text-center p-6 bg-white rounded-lg shadow-md">
                            <p className="text-red-600 text-lg mb-4">{error}</p>
                            <button
                                onClick={() => router.push('/admin/inscriptions')}
                                className="text-blue-600 hover:underline"
                            >
                                Retour aux inscriptions
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        )
    }

    if (!inscription) {
        return (
            <div className="h-screen bg-gray-50 flex overflow-hidden">
                <AdminSidebar
                    activeTab={activeTab}
                    onTabChange={setActiveTab}
                    onLogout={handleLogout}
                />
                <div className="flex-1 flex flex-col lg:ml-64 overflow-hidden">
                    <div className="flex-1 overflow-y-auto flex items-center justify-center">
                        <div className="text-center p-6 bg-white rounded-lg shadow-md">
                            <p className="text-gray-700 text-lg mb-4">Aucun profil trouvé.</p>
                            <button
                                onClick={() => router.push('/admin/inscriptions')}
                                className="text-blue-600 hover:underline"
                            >
                                Retour aux inscriptions
                            </button>
                        </div>
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
                            <div className="flex items-center space-x-4">
                                <button
                                    onClick={() => router.push('/admin/inscriptions')}
                                    className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
                                    title="Retour aux inscriptions"
                                >
                                    <ArrowLeft className="w-5 h-5" />
                                </button>
                                <div>
                                    <h1 className="text-2xl font-bold text-gray-900">Profil de l'inscrit</h1>
                                    <p className="text-sm text-gray-600 mt-1">{inscription.prenom} {inscription.nom}</p>
                                </div>
                            </div>
                            <div className="flex items-center space-x-3">
                                <Link
                                    href={`/admin/inscriptions?id=${inscription.id}&edit=true`}
                                    className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition-colors"
                                >
                                    <Edit className="w-4 h-4 mr-2" />
                                    Modifier
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Profile Content */}
                <div className="flex-1 overflow-y-auto overflow-x-hidden">
                    <div className="p-4 sm:p-6 lg:p-8">
                        <div className="max-w-4xl mx-auto bg-white rounded-xl shadow-sm border border-gray-200 p-6 sm:p-8 lg:p-10">
                            {/* Informations personnelles */}
                            <div className="mb-8">
                                <h2 className="text-xl font-bold text-gray-900 mb-6 border-b pb-2">Informations personnelles</h2>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="flex items-start space-x-4">
                                        <User className="w-6 h-6 text-gray-600 flex-shrink-0 mt-1" />
                                        <div>
                                            <p className="text-sm text-gray-500">Nom complet</p>
                                            <p className="text-lg font-medium text-gray-900">{inscription.prenom} {inscription.nom}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-start space-x-4">
                                        <User className="w-6 h-6 text-gray-600 flex-shrink-0 mt-1" />
                                        <div>
                                            <p className="text-sm text-gray-500">Sexe</p>
                                            <p className="text-lg font-medium text-gray-900">{inscription.sexe}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-start space-x-4">
                                        <Phone className="w-6 h-6 text-gray-600 flex-shrink-0 mt-1" />
                                        <div>
                                            <p className="text-sm text-gray-500">Téléphone</p>
                                            <p className="text-lg font-medium text-gray-900">{inscription.telephone}</p>
                                        </div>
                                    </div>
                                    {inscription.dateNaissance && (
                                        <div className="flex items-start space-x-4">
                                            <Calendar className="w-6 h-6 text-gray-600 flex-shrink-0 mt-1" />
                                            <div>
                                                <p className="text-sm text-gray-500">Date de naissance</p>
                                                <p className="text-lg font-medium text-gray-900">
                                                    {inscription.dateNaissance} 
                                                    {inscription.heureNaissance ? ` à ${inscription.heureNaissance}` : ''}
                                                </p>
                                            </div>
                                        </div>
                                    )}
                                    <div className="flex items-start space-x-4">
                                        <MapPin className="w-6 h-6 text-gray-600 flex-shrink-0 mt-1" />
                                        <div>
                                            <p className="text-sm text-gray-500">Lieu de résidence</p>
                                            <p className="text-lg font-medium text-gray-900">{inscription.lieuResidence}</p>
                                        </div>
                                    </div>
                                    {inscription.lieuNaissance && (
                                        <div className="flex items-start space-x-4">
                                            <MapPin className="w-6 h-6 text-gray-600 flex-shrink-0 mt-1" />
                                            <div>
                                                <p className="text-sm text-gray-500">Lieu de naissance</p>
                                                <p className="text-lg font-medium text-gray-900">{inscription.lieuNaissance}</p>
                                            </div>
                                        </div>
                                    )}
                                    {inscription.religion && (
                                        <div className="flex items-start space-x-4">
                                            <BookOpen className="w-6 h-6 text-gray-600 flex-shrink-0 mt-1" />
                                            <div>
                                                <p className="text-sm text-gray-500">Religion</p>
                                                <p className="text-lg font-medium text-gray-900">{inscription.religion}</p>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Informations ETU */}
                            <div className="border-t border-gray-200 pt-8">
                                <h2 className="text-xl font-bold text-gray-900 mb-6">Parcours ETU</h2>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                    <div className="bg-gray-50 rounded-lg p-4 flex items-center space-x-3">
                                        <Shield className="w-6 h-6 text-purple-600" />
                                        <div>
                                            <p className="text-sm text-gray-500">Grade actuel</p>
                                            <p className="text-lg font-medium text-gray-900">{inscription.grade}</p>
                                        </div>
                                    </div>
                                    <div className="bg-gray-50 rounded-lg p-4 flex items-center space-x-3">
                                        <Award className="w-6 h-6 text-yellow-600" />
                                        <div>
                                            <p className="text-sm text-gray-500">Programme</p>
                                            <p className="text-lg font-medium text-gray-900">{inscription.programme}</p>
                                        </div>
                                    </div>
                                    <div className="bg-gray-50 rounded-lg p-4 flex items-center space-x-3">
                                        <Clock className="w-6 h-6 text-blue-600" />
                                        <div>
                                            <p className="text-sm text-gray-500">Statut</p>
                                            <p className={`text-lg font-medium ${
                                                inscription.statut === 'Actif' 
                                                    ? 'text-green-600' 
                                                    : inscription.statut === 'En attente' 
                                                    ? 'text-yellow-600' 
                                                    : 'text-gray-600'
                                            }`}>
                                                {inscription.statut}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Informations système */}
                            <div className="border-t border-gray-200 pt-8 mt-8">
                                <h2 className="text-xl font-bold text-gray-900 mb-6">Informations système</h2>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="flex items-start space-x-4">
                                        <Clock className="w-6 h-6 text-gray-600 flex-shrink-0 mt-1" />
                                        <div>
                                            <p className="text-sm text-gray-500">Date d'inscription</p>
                                            <p className="text-lg font-medium text-gray-900">
                                                {new Date(inscription.createdAt).toLocaleDateString('fr-FR', {
                                                    day: 'numeric',
                                                    month: 'long',
                                                    year: 'numeric',
                                                    hour: '2-digit',
                                                    minute: '2-digit'
                                                })}
                                            </p>
                                        </div>
                                    </div>
                                    {inscription.updatedAt && (
                                        <div className="flex items-start space-x-4">
                                            <Clock className="w-6 h-6 text-gray-600 flex-shrink-0 mt-1" />
                                            <div>
                                                <p className="text-sm text-gray-500">Dernière mise à jour</p>
                                                <p className="text-lg font-medium text-gray-900">
                                                    {new Date(inscription.updatedAt).toLocaleDateString('fr-FR', {
                                                        day: 'numeric',
                                                        month: 'long',
                                                        year: 'numeric',
                                                        hour: '2-digit',
                                                        minute: '2-digit'
                                                    })}
                                                </p>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

