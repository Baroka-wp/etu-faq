'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { 
    User, Mail, Phone, Calendar, MapPin, BookOpen, Shield, Award, Clock, 
    ArrowLeft, Edit, LogOut, Key, Link as LinkIcon, Send, Trash2, X, Copy, RefreshCw
} from 'lucide-react'
import AdminSidebar from '@/components/AdminSidebar'
import { useToast } from '@/components/Toast'
import { ToastContainer } from '@/components/ToastContainer'

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
    const [showPasswordModal, setShowPasswordModal] = useState(false)
    const [showEditModal, setShowEditModal] = useState(false)
    const [showDeleteModal, setShowDeleteModal] = useState(false)
    const [editingInscription, setEditingInscription] = useState<InscriptionProfile | null>(null)
    const [generatingLinks, setGeneratingLinks] = useState<Set<string>>(new Set())
    const { toasts, addToast, removeToast } = useToast()
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

    const copyPassword = async (password: string) => {
        try {
            await navigator.clipboard.writeText(password)
            addToast({
                type: 'success',
                title: 'Copié !',
                message: 'Mot de passe copié dans le presse-papiers'
            })
        } catch (err) {
            console.error('Erreur lors de la copie:', err)
            addToast({
                type: 'error',
                title: 'Erreur',
                message: 'Erreur lors de la copie du mot de passe'
            })
        }
    }

    const updateStatut = async (id: string, newStatut: string) => {
        try {
            const response = await fetch(`/api/admin/inscriptions/${id}`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ statut: newStatut }),
            })

            if (response.ok) {
                const updatedInscription = await response.json()
                setInscription(updatedInscription)
                addToast({
                    type: 'success',
                    title: 'Statut mis à jour',
                    message: `Le statut a été changé en "${newStatut}"`
                })
            } else {
                addToast({
                    type: 'error',
                    title: 'Erreur',
                    message: 'Impossible de mettre à jour le statut'
                })
            }
        } catch (err) {
            console.error('Erreur lors de la mise à jour:', err)
            addToast({
                type: 'error',
                title: 'Erreur',
                message: 'Erreur lors de la mise à jour du statut'
            })
        }
    }

    const deleteInscription = async (id: string) => {
        try {
            const response = await fetch(`/api/admin/inscriptions/${id}`, {
                method: 'DELETE'
            })

            if (response.ok) {
                addToast({
                    type: 'success',
                    title: 'Inscription supprimée',
                    message: 'L\'inscription a été supprimée avec succès'
                })
                setShowDeleteModal(false)
                router.push('/admin/inscriptions')
            } else {
                addToast({
                    type: 'error',
                    title: 'Erreur',
                    message: 'Impossible de supprimer l\'inscription'
                })
            }
        } catch (err) {
            console.error('Erreur lors de la suppression:', err)
            addToast({
                type: 'error',
                title: 'Erreur',
                message: 'Erreur lors de la suppression'
            })
        }
    }

    const handleEditInscription = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!editingInscription) return

        try {
            const response = await fetch(`/api/admin/inscriptions/${editingInscription.id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    nom: editingInscription.nom,
                    prenom: editingInscription.prenom,
                    sexe: editingInscription.sexe,
                    telephone: editingInscription.telephone,
                    lieuResidence: editingInscription.lieuResidence,
                    grade: editingInscription.grade,
                    programme: editingInscription.programme,
                    statut: editingInscription.statut,
                }),
            })

            if (response.ok) {
                const updatedInscription = await response.json()
                setInscription(updatedInscription)
                addToast({
                    type: 'success',
                    title: 'Inscription mise à jour',
                    message: 'L\'inscription a été modifiée avec succès'
                })
                setShowEditModal(false)
                setEditingInscription(null)
            } else {
                addToast({
                    type: 'error',
                    title: 'Erreur',
                    message: 'Impossible de modifier l\'inscription'
                })
            }
        } catch (err) {
            console.error('Erreur lors de la modification:', err)
            addToast({
                type: 'error',
                title: 'Erreur',
                message: 'Erreur lors de la modification'
            })
        }
    }

    const generateUniqueLink = async (inscription: InscriptionProfile) => {
        try {
            console.log('Tentative de génération de lien pour:', inscription.prenom, inscription.nom)
            console.log('ID de l\'inscription:', inscription.id)

            const response = await fetch(`/api/admin/inscriptions/${inscription.id}/generate-link`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ duration: 24 }) // 24 heures
            })

            console.log('Réponse de l\'API:', response.status, response.statusText)

            if (response.ok) {
                const data = await response.json()
                console.log('Données reçues:', data)
                return data.downloadUrl
            } else {
                const errorData = await response.json()
                console.error('Erreur API:', errorData)

                if (response.status === 401) {
                    addToast({
                        type: 'error',
                        title: 'Non autorisé',
                        message: 'Vous devez être connecté en tant qu\'administrateur'
                    })
                    return null
                }

                throw new Error(errorData.details || errorData.error || 'Erreur lors de la génération du lien')
            }
        } catch (err) {
            console.error('Erreur lors de la génération du lien:', err)
            const errorMessage = err instanceof Error ? err.message : 'Erreur inconnue'
            addToast({
                type: 'error',
                title: 'Erreur',
                message: `Impossible de générer le lien unique: ${errorMessage}`
            })
            return null
        }
    }

    const sendWhatsAppMessage = async (inscription: InscriptionProfile) => {
        // Ajouter l'ID à la liste des liens en cours de génération
        setGeneratingLinks(prev => new Set(prev).add(inscription.id))

        try {
            // Générer le lien unique
            const downloadUrl = await generateUniqueLink(inscription)

            if (!downloadUrl) {
                return
            }

            const message = `Bonjour ${inscription.prenom} ${inscription.nom},\n\nNous vous remercions pour votre inscription à l'ETU-Bénin.\nVotre cours est prêt ! Cliquez sur le lien ci-dessous pour télécharger votre matériel de formation :\n\n${downloadUrl}\n\n⚠️ Ce lien est unique et expirera dans 24 heures.\n\nCordialement,\nL'équipe ETU-Bénin`

            // Copier le message dans le presse-papiers
            await navigator.clipboard.writeText(message)

            addToast({
                type: 'success',
                title: 'Message copié !',
                message: `Le message avec le lien unique a été copié dans le presse-papiers`
            })
        } catch (err) {
            console.error('Erreur lors de la copie du message:', err)
            addToast({
                type: 'error',
                title: 'Erreur',
                message: 'Impossible de copier le message'
            })
        } finally {
            // Retirer l'ID de la liste des liens en cours de génération
            setGeneratingLinks(prev => {
                const newSet = new Set(prev)
                newSet.delete(inscription.id)
                return newSet
            })
        }
    }

    const sendCustomWhatsApp = (inscription: InscriptionProfile) => {
        // Ouvrir WhatsApp avec un message personnalisé
        const message = `Bonjour ${inscription.prenom} ${inscription.nom},\n\nNous vous remercions pour votre inscription à l'ETU-Bénin. Votre compte a été créé avec succès.\n\n📚 Votre cours est prêt ! Vous pouvez accéder à votre profil : /profil\n\nCordialement,\nL'équipe ETU-Bénin`

        const encodedMessage = encodeURIComponent(message)
        const whatsappUrl = `https://wa.me/${inscription.telephone}?text=${encodedMessage}`
        window.open(whatsappUrl, '_blank')

        addToast({
            type: 'success',
            title: 'Message envoyé',
            message: `Message WhatsApp personnalisé envoyé à ${inscription.prenom} ${inscription.nom}`
        })
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
                            <div className="flex items-center space-x-2">
                                <button
                                    onClick={() => setShowPasswordModal(true)}
                                    className="inline-flex items-center px-3 py-2 border border-gray-300 rounded-lg shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition-colors"
                                    title="Voir le mot de passe"
                                >
                                    <Key className="w-4 h-4 mr-2" />
                                    Mot de passe
                                </button>
                                <button
                                    onClick={() => inscription && sendWhatsAppMessage(inscription)}
                                    disabled={inscription ? generatingLinks.has(inscription.id) : false}
                                    className={`inline-flex items-center px-3 py-2 border rounded-lg shadow-sm text-sm font-medium transition-colors ${
                                        inscription && generatingLinks.has(inscription.id)
                                            ? 'border-gray-300 text-gray-400 bg-gray-100 cursor-not-allowed'
                                            : 'border-green-300 text-green-700 bg-white hover:bg-green-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500'
                                    }`}
                                    title="Générer et envoyer un lien unique"
                                >
                                    {inscription && generatingLinks.has(inscription.id) ? (
                                        <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                                    ) : (
                                        <LinkIcon className="w-4 h-4 mr-2" />
                                    )}
                                    Lien unique
                                </button>
                                <button
                                    onClick={() => inscription && sendCustomWhatsApp(inscription)}
                                    className="inline-flex items-center px-3 py-2 border border-blue-300 rounded-lg shadow-sm text-sm font-medium text-blue-700 bg-white hover:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
                                    title="Envoyer un message WhatsApp personnalisé"
                                >
                                    <Send className="w-4 h-4 mr-2" />
                                    WhatsApp
                                </button>
                                <button
                                    onClick={() => {
                                        setEditingInscription(inscription)
                                        setShowEditModal(true)
                                    }}
                                    className="inline-flex items-center px-3 py-2 border border-yellow-300 rounded-lg shadow-sm text-sm font-medium text-yellow-700 bg-white hover:bg-yellow-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500 transition-colors"
                                    title="Modifier l'inscription"
                                >
                                    <Edit className="w-4 h-4 mr-2" />
                                    Modifier
                                </button>
                                <button
                                    onClick={() => setShowDeleteModal(true)}
                                    className="inline-flex items-center px-3 py-2 border border-red-300 rounded-lg shadow-sm text-sm font-medium text-red-700 bg-white hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors"
                                    title="Supprimer l'inscription"
                                >
                                    <Trash2 className="w-4 h-4 mr-2" />
                                    Supprimer
                                </button>
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

            {/* Password Modal */}
            {showPasswordModal && inscription && (
                <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-xl shadow-xl max-w-md w-full">
                        <div className="px-6 py-4 border-b border-gray-200">
                            <div className="flex items-center justify-between">
                                <h3 className="text-lg font-semibold text-gray-900 font-serif">
                                    Mot de passe personnel
                                </h3>
                                <button
                                    onClick={() => setShowPasswordModal(false)}
                                    className="text-gray-400 hover:text-gray-600 transition-colors"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            </div>
                            <p className="text-sm text-gray-600 mt-1">
                                Pour {inscription.prenom} {inscription.nom}
                            </p>
                        </div>
                        <div className="p-6">
                            <div className="bg-gray-50 rounded-lg p-4 mb-6">
                                <p className="text-sm text-gray-600 mb-3 font-medium">Mot de passe généré :</p>
                                <div className="flex items-center space-x-3">
                                    <code className="text-lg font-mono bg-white px-4 py-3 rounded-lg border flex-1 text-center font-bold text-gray-900">
                                        {inscription.motDePasse}
                                    </code>
                                    <button
                                        onClick={() => copyPassword(inscription.motDePasse)}
                                        className="p-3 text-gray-600 hover:text-gray-900 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                                        title="Copier le mot de passe"
                                    >
                                        <Copy className="w-5 h-5" />
                                    </button>
                                </div>
                            </div>

                            <div className="bg-blue-50 rounded-lg p-4 mb-6">
                                <p className="text-sm text-blue-800 font-medium mb-2">Instructions :</p>
                                <ul className="text-sm text-blue-700 space-y-1">
                                    <li>• Transmettez ce mot de passe au membre</li>
                                    <li>• Il pourra se connecter sur /profil</li>
                                    <li>• Le mot de passe est unique et sécurisé</li>
                                </ul>
                            </div>

                            <div className="flex justify-end space-x-3">
                                <button
                                    onClick={() => setShowPasswordModal(false)}
                                    className="px-4 py-2 text-gray-600 hover:text-gray-900 transition-colors font-medium"
                                >
                                    Fermer
                                </button>
                                <button
                                    onClick={() => {
                                        copyPassword(inscription.motDePasse)
                                        setShowPasswordModal(false)
                                    }}
                                    className="px-6 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-900 transition-colors font-medium"
                                >
                                    Copier et fermer
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Edit Modal */}
            {showEditModal && editingInscription && (
                <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                        <div className="px-6 py-4 border-b border-gray-200 sticky top-0 bg-white">
                            <div className="flex items-center justify-between">
                                <h3 className="text-lg font-semibold text-gray-900">
                                    Modifier l'inscription
                                </h3>
                                <button
                                    onClick={() => {
                                        setShowEditModal(false)
                                        setEditingInscription(null)
                                    }}
                                    className="text-gray-400 hover:text-gray-600 transition-colors"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            </div>
                        </div>
                        <form onSubmit={handleEditInscription} className="p-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {/* Nom */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Nom
                                    </label>
                                    <input
                                        type="text"
                                        value={editingInscription.nom}
                                        onChange={(e) => setEditingInscription({
                                            ...editingInscription,
                                            nom: e.target.value
                                        })}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-1 focus:ring-gray-900 focus:border-gray-900"
                                        required
                                    />
                                </div>

                                {/* Prénom */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Prénom
                                    </label>
                                    <input
                                        type="text"
                                        value={editingInscription.prenom}
                                        onChange={(e) => setEditingInscription({
                                            ...editingInscription,
                                            prenom: e.target.value
                                        })}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-1 focus:ring-gray-900 focus:border-gray-900"
                                        required
                                    />
                                </div>

                                {/* Sexe */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Sexe
                                    </label>
                                    <select
                                        value={editingInscription.sexe}
                                        onChange={(e) => setEditingInscription({
                                            ...editingInscription,
                                            sexe: e.target.value
                                        })}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-1 focus:ring-gray-900 focus:border-gray-900"
                                        required
                                    >
                                        <option value="Masculin">Masculin</option>
                                        <option value="Féminin">Féminin</option>
                                    </select>
                                </div>

                                {/* Téléphone */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Téléphone
                                    </label>
                                    <input
                                        type="tel"
                                        value={editingInscription.telephone}
                                        onChange={(e) => setEditingInscription({
                                            ...editingInscription,
                                            telephone: e.target.value
                                        })}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-1 focus:ring-gray-900 focus:border-gray-900"
                                        required
                                    />
                                </div>

                                {/* Lieu de résidence */}
                                <div className="md:col-span-2">
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Lieu de résidence
                                    </label>
                                    <input
                                        type="text"
                                        value={editingInscription.lieuResidence}
                                        onChange={(e) => setEditingInscription({
                                            ...editingInscription,
                                            lieuResidence: e.target.value
                                        })}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-1 focus:ring-gray-900 focus:border-gray-900"
                                        required
                                    />
                                </div>

                                {/* Grade */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Grade
                                    </label>
                                    <select
                                        value={editingInscription.grade}
                                        onChange={(e) => setEditingInscription({
                                            ...editingInscription,
                                            grade: e.target.value
                                        })}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-1 focus:ring-gray-900 focus:border-gray-900"
                                        required
                                    >
                                        <option value="Explorateur">Explorateur</option>
                                        <option value="Néophyte">Néophyte</option>
                                        <option value="Constructeur">Constructeur</option>
                                        <option value="Navigateur">Navigateur</option>
                                        <option value="Alchimiste">Alchimiste</option>
                                    </select>
                                </div>

                                {/* Programme */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Programme
                                    </label>
                                    <select
                                        value={editingInscription.programme}
                                        onChange={(e) => setEditingInscription({
                                            ...editingInscription,
                                            programme: e.target.value
                                        })}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-1 focus:ring-gray-900 focus:border-gray-900"
                                        required
                                    >
                                        <option value="Initiation">Initiation</option>
                                        <option value="Formation Continue">Formation Continue</option>
                                    </select>
                                </div>

                                {/* Statut */}
                                <div className="md:col-span-2">
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Statut
                                    </label>
                                    <select
                                        value={editingInscription.statut}
                                        onChange={(e) => setEditingInscription({
                                            ...editingInscription,
                                            statut: e.target.value
                                        })}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-1 focus:ring-gray-900 focus:border-gray-900"
                                        required
                                    >
                                        <option value="En attente">En attente</option>
                                        <option value="Actif">Actif</option>
                                        <option value="Suspendu">Suspendu</option>
                                    </select>
                                </div>
                            </div>

                            <div className="flex justify-end space-x-3 mt-6 pt-6 border-t border-gray-200">
                                <button
                                    type="button"
                                    onClick={() => {
                                        setShowEditModal(false)
                                        setEditingInscription(null)
                                    }}
                                    className="px-4 py-2 text-gray-600 hover:text-gray-900 transition-colors font-medium"
                                >
                                    Annuler
                                </button>
                                <button
                                    type="submit"
                                    className="px-6 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors font-medium"
                                >
                                    Enregistrer
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Delete Confirmation Modal */}
            {showDeleteModal && inscription && (
                <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-xl shadow-xl max-w-md w-full">
                        <div className="px-6 py-4 border-b border-gray-200">
                            <div className="flex items-center justify-between">
                                <h3 className="text-lg font-semibold text-gray-900 font-serif">
                                    Confirmer la suppression
                                </h3>
                                <button
                                    onClick={() => setShowDeleteModal(false)}
                                    className="text-gray-400 hover:text-gray-600 transition-colors"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            </div>
                        </div>
                        <div className="p-6">
                            <p className="text-gray-600 mb-6">
                                Êtes-vous sûr de vouloir supprimer l'inscription de <strong>{inscription.prenom} {inscription.nom}</strong> ?
                                Cette action est irréversible.
                            </p>
                            <div className="flex justify-end space-x-3">
                                <button
                                    onClick={() => setShowDeleteModal(false)}
                                    className="px-4 py-2 text-gray-600 hover:text-gray-900 transition-colors font-medium"
                                >
                                    Annuler
                                </button>
                                <button
                                    onClick={() => inscription && deleteInscription(inscription.id)}
                                    className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium"
                                >
                                    Supprimer
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Toast Container */}
            <ToastContainer toasts={toasts} removeToast={removeToast} />
        </div>
    )
}

