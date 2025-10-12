'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { User, Mail, Phone, Calendar, MapPin, BookOpen, Shield, Award, LogOut, Clock } from 'lucide-react'
import Link from 'next/link'
import ClientOnly from '@/components/ClientOnly'

interface UserProfile {
    nom: string
    prenom: string
    sexe: string
    dateNaissance: string
    heureNaissance: string | null
    lieuNaissance: string
    lieuResidence: string
    religion: string
    telephone: string
    grade: string
    programme: string
    statut: string
    createdAt: string
}

export default function UserProfilePage() {
    const [user, setUser] = useState<UserProfile | null>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')
    const router = useRouter()

    useEffect(() => {
        fetchUserProfile()
    }, [])

    const fetchUserProfile = async () => {
        try {
            const response = await fetch('/api/user/profile')
            if (response.ok) {
                const data = await response.json()
                setUser(data)
            } else if (response.status === 401) {
                router.push('/member-login') // Redirect to member login if not authenticated
            } else {
                const errorData = await response.json()
                setError(errorData.error || 'Erreur lors du chargement du profil')
            }
        } catch (err) {
            setError('Une erreur de connexion est survenue')
        } finally {
            setLoading(false)
        }
    }

    const handleLogout = async () => {
        try {
            await fetch('/api/user/logout', {
                method: 'POST'
            })
            router.push('/member-login')
        } catch (err) {
            console.error('Erreur lors de la déconnexion:', err)
        }
    }

    if (loading) {
        return (
            <ClientOnly fallback={
                <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                    <div className="text-center">
                        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900 mx-auto"></div>
                        <p className="mt-4 text-gray-600">Chargement du profil...</p>
                    </div>
                </div>
            }>
                <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                    <div className="text-center">
                        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900 mx-auto"></div>
                        <p className="mt-4 text-gray-600">Chargement du profil...</p>
                    </div>
                </div>
            </ClientOnly>
        )
    }

    if (error) {
        return (
            <ClientOnly fallback={
                <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                    <div className="text-center p-6 bg-white rounded-lg shadow-md">
                        <p className="text-red-600 text-lg mb-4">{error}</p>
                        <Link href="/member-login" className="text-blue-600 hover:underline">
                            Se connecter
                        </Link>
                    </div>
                </div>
            }>
                <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                    <div className="text-center p-6 bg-white rounded-lg shadow-md">
                        <p className="text-red-600 text-lg mb-4">{error}</p>
                        <Link href="/member-login" className="text-blue-600 hover:underline">
                            Se connecter
                        </Link>
                    </div>
                </div>
            </ClientOnly>
        )
    }

    if (!user) {
        return (
            <ClientOnly fallback={
                <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                    <div className="text-center p-6 bg-white rounded-lg shadow-md">
                        <p className="text-gray-700 text-lg mb-4">Aucun profil trouvé. Veuillez vous connecter.</p>
                        <Link href="/member-login" className="text-blue-600 hover:underline">
                            Se connecter
                        </Link>
                    </div>
                </div>
            }>
                <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                    <div className="text-center p-6 bg-white rounded-lg shadow-md">
                        <p className="text-gray-700 text-lg mb-4">Aucun profil trouvé. Veuillez vous connecter.</p>
                        <Link href="/member-login" className="text-blue-600 hover:underline">
                            Se connecter
                        </Link>
                    </div>
                </div>
            </ClientOnly>
        )
    }

    return (
        <ClientOnly fallback={
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900 mx-auto"></div>
                    <p className="mt-4 text-gray-600">Chargement...</p>
                </div>
            </div>
        }>
            <div className="min-h-screen bg-gray-50 flex flex-col items-center py-12 px-4 sm:px-6 lg:px-8">
                <div className="max-w-3xl w-full bg-white rounded-xl shadow-xl p-6 sm:p-8 lg:p-10">
                    <div className="flex justify-between items-center mb-8 border-b pb-4">
                        <h1 className="text-3xl font-bold text-gray-900 font-serif">Mon Profil</h1>
                        <button
                            onClick={handleLogout}
                            className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors"
                        >
                            <LogOut className="w-5 h-5" />
                            <span className="text-sm font-serif">Déconnexion</span>
                        </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                        <div className="flex items-center space-x-4">
                            <User className="w-6 h-6 text-gray-600" />
                            <div>
                                <p className="text-sm text-gray-500">Nom complet</p>
                                <p className="text-lg font-medium text-gray-900">{user.prenom} {user.nom}</p>
                            </div>
                        </div>
                        <div className="flex items-center space-x-4">
                            <Phone className="w-6 h-6 text-gray-600" />
                            <div>
                                <p className="text-sm text-gray-500">Téléphone</p>
                                <p className="text-lg font-medium text-gray-900">{user.telephone}</p>
                            </div>
                        </div>
                        <div className="flex items-center space-x-4">
                            <Calendar className="w-6 h-6 text-gray-600" />
                            <div>
                                <p className="text-sm text-gray-500">Date de naissance</p>
                                <p className="text-lg font-medium text-gray-900">{user.dateNaissance} {user.heureNaissance ? `à ${user.heureNaissance}` : ''}</p>
                            </div>
                        </div>
                        <div className="flex items-center space-x-4">
                            <MapPin className="w-6 h-6 text-gray-600" />
                            <div>
                                <p className="text-sm text-gray-500">Lieu de naissance</p>
                                <p className="text-lg font-medium text-gray-900">{user.lieuNaissance}</p>
                            </div>
                        </div>
                        <div className="flex items-center space-x-4">
                            <MapPin className="w-6 h-6 text-gray-600" />
                            <div>
                                <p className="text-sm text-gray-500">Lieu de résidence</p>
                                <p className="text-lg font-medium text-gray-900">{user.lieuResidence}</p>
                            </div>
                        </div>
                        <div className="flex items-center space-x-4">
                            <BookOpen className="w-6 h-6 text-gray-600" />
                            <div>
                                <p className="text-sm text-gray-500">Religion</p>
                                <p className="text-lg font-medium text-gray-900">{user.religion}</p>
                            </div>
                        </div>
                    </div>

                    <div className="border-t border-gray-200 pt-8 mt-8">
                        <h2 className="text-2xl font-bold text-gray-900 mb-6 font-serif">Votre Parcours ETU</h2>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div className="bg-gray-50 rounded-lg p-4 flex items-center space-x-3">
                                <Shield className="w-6 h-6 text-purple-600" />
                                <div>
                                    <p className="text-sm text-gray-500">Grade actuel</p>
                                    <p className="text-lg font-medium text-gray-900">{user.grade}</p>
                                </div>
                            </div>
                            <div className="bg-gray-50 rounded-lg p-4 flex items-center space-x-3">
                                <Award className="w-6 h-6 text-yellow-600" />
                                <div>
                                    <p className="text-sm text-gray-500">Programme</p>
                                    <p className="text-lg font-medium text-gray-900">{user.programme}</p>
                                </div>
                            </div>
                            <div className="bg-gray-50 rounded-lg p-4 flex items-center space-x-3">
                                <Clock className="w-6 h-6 text-blue-600" />
                                <div>
                                    <p className="text-sm text-gray-500">Statut</p>
                                    <p className="text-lg font-medium text-gray-900">{user.statut}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </ClientOnly>
    )
}