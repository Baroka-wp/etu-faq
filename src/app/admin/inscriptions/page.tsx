'use client'

import { useState, useEffect } from 'react'
import {
    Users,
    Search,
    Filter,
    Download,
    Eye,
    Edit,
    Trash2,
    Copy,
    Key,
    UserCheck,
    Clock,
    X,
    MessageCircle,
    FileText,
    Send,
    Link,
    RefreshCw
} from 'lucide-react'
import { useRouter } from 'next/navigation'
import AdminSidebar from '@/components/AdminSidebar'
import { useToast } from '@/components/Toast'
import { ToastContainer } from '@/components/ToastContainer'

interface Inscription {
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
    createdAt: string
}

export default function AdminInscriptions() {
    const [activeTab, setActiveTab] = useState('inscriptions')
    const [inscriptions, setInscriptions] = useState<Inscription[]>([])
    const [loading, setLoading] = useState(true)
    const [searchTerm, setSearchTerm] = useState('')
    const [filterStatut, setFilterStatut] = useState('')
    const [selectedInscription, setSelectedInscription] = useState<Inscription | null>(null)
    const [showPasswordModal, setShowPasswordModal] = useState(false)
    const [showEditModal, setShowEditModal] = useState(false)
    const [showDeleteModal, setShowDeleteModal] = useState(false)
    const [editingInscription, setEditingInscription] = useState<Inscription | null>(null)
    const [generatingLinks, setGeneratingLinks] = useState<Set<string>>(new Set())
    const router = useRouter()
    const { toasts, addToast, removeToast } = useToast()

    useEffect(() => {
        fetchInscriptions()
    }, [])

    const fetchInscriptions = async () => {
        try {
            const response = await fetch('/api/admin/inscriptions')
            if (response.ok) {
                const data = await response.json()
                setInscriptions(data)
            }
        } catch (err) {
            console.error('Erreur lors du chargement des inscriptions:', err)
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
                setInscriptions(prev =>
                    prev.map(inscription =>
                        inscription.id === id
                            ? { ...inscription, statut: newStatut }
                            : inscription
                    )
                )
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
                setInscriptions(prev => prev.filter(inscription => inscription.id !== id))
                addToast({
                    type: 'success',
                    title: 'Inscription supprimée',
                    message: 'L\'inscription a été supprimée avec succès'
                })
                setShowDeleteModal(false)
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
                setInscriptions(prev =>
                    prev.map(inscription =>
                        inscription.id === editingInscription.id
                            ? updatedInscription
                            : inscription
                    )
                )
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

    const generateUniqueLink = async (inscription: Inscription) => {
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

    const sendWhatsAppMessage = async (inscription: Inscription) => {
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

    const sendCustomWhatsApp = (inscription: Inscription) => {
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

    const filteredInscriptions = inscriptions.filter(inscription => {
        const matchesSearch = inscription.nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
            inscription.prenom.toLowerCase().includes(searchTerm.toLowerCase()) ||
            inscription.telephone.includes(searchTerm)
        const matchesStatut = !filterStatut || inscription.statut === filterStatut
        // Afficher uniquement les prospects "En attente"
        const matchesProspects = inscription.statut === 'En attente'
        return matchesSearch && matchesStatut && matchesProspects
    })

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
                        <p className="mt-4 text-gray-600">Chargement des inscriptions...</p>
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
                            <div>
                                <h1 className="text-2xl font-bold text-gray-900">Gestion des Prospects</h1>
                                <p className="text-sm text-gray-600 mt-1">Gérer les inscriptions en attente</p>
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

                {/* Main Content */}
                <div className="flex-1 overflow-y-auto overflow-x-hidden">
                    <div className="p-4 sm:p-6 lg:p-8">
                    {/* Filters */}
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
                        <div className="flex flex-col sm:flex-row gap-4">
                            <div className="flex-1">
                                <div className="relative">
                                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                                    <input
                                        type="text"
                                        placeholder="Rechercher par nom, prénom ou téléphone..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-gray-500 text-sm"
                                    />
                                </div>
                            </div>
                            <div className="sm:w-48">
                                <select
                                    value={filterStatut}
                                    onChange={(e) => setFilterStatut(e.target.value)}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-gray-500 text-sm"
                                >
                                    <option value="">Tous les statuts</option>
                                    <option value="En attente">En attente</option>
                                    <option value="Actif">Actif</option>
                                    <option value="Suspendu">Suspendu</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    {/* Inscriptions Table */}
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                        <div className="px-6 py-4 border-b border-gray-200">
                            <h2 className="text-lg font-semibold text-gray-900">
                                Inscriptions ({filteredInscriptions.length})
                            </h2>
                        </div>

                        {filteredInscriptions.length === 0 ? (
                            <div className="p-8 text-center">
                                <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                                <p className="text-gray-500">Aucune inscription trouvée</p>
                            </div>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="min-w-full divide-y divide-gray-200">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Membre
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Contact
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Grade/Programme
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Statut
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Mot de passe
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Actions
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-200">
                                        {filteredInscriptions.map((inscription) => (
                                            <tr key={inscription.id} className="hover:bg-gray-50">
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="flex items-center">
                                                        <div className="w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center">
                                                            <Users className="w-5 h-5 text-white" />
                                                        </div>
                                                        <div className="ml-4">
                                                            <div className="text-sm font-medium text-gray-900">
                                                                {inscription.prenom} {inscription.nom}
                                                            </div>
                                                            <div className="text-sm text-gray-500">{inscription.sexe}</div>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="text-sm text-gray-900">{inscription.telephone}</div>
                                                    <div className="text-sm text-gray-500">{inscription.lieuResidence}</div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="text-sm text-gray-900">{inscription.grade}</div>
                                                    <div className="text-sm text-gray-500">{inscription.programme}</div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <select
                                                        value={inscription.statut}
                                                        onChange={(e) => updateStatut(inscription.id, e.target.value)}
                                                        className={`text-sm px-2 py-1 rounded-full border-0 ${inscription.statut === 'Actif'
                                                            ? 'bg-green-100 text-green-800'
                                                            : inscription.statut === 'En attente'
                                                                ? 'bg-yellow-100 text-yellow-800'
                                                                : 'bg-red-100 text-red-800'
                                                            }`}
                                                    >
                                                        <option value="En attente">En attente</option>
                                                        <option value="Actif">Actif</option>
                                                        <option value="Suspendu">Suspendu</option>
                                                    </select>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="flex items-center space-x-2">
                                                        <span className="text-sm font-mono text-gray-600">
                                                            {inscription.motDePasse.substring(0, 4)}...
                                                        </span>
                                                        <button
                                                            onClick={() => copyPassword(inscription.motDePasse)}
                                                            className="p-1 text-gray-400 hover:text-gray-600"
                                                            title="Copier le mot de passe"
                                                        >
                                                            <Copy className="w-4 h-4" />
                                                        </button>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                                    <div className="flex space-x-2">
                                                        <button
                                                            onClick={() => router.push(`/admin/inscriptions/${inscription.id}`)}
                                                            className="text-gray-600 hover:text-gray-900 p-1"
                                                            title="Voir le profil"
                                                        >
                                                            <Eye className="w-4 h-4" />
                                                        </button>
                                                        <button
                                                            onClick={() => {
                                                                setSelectedInscription(inscription)
                                                                setShowPasswordModal(true)
                                                            }}
                                                            className="text-gray-600 hover:text-gray-900 p-1"
                                                            title="Voir le mot de passe"
                                                        >
                                                            <Key className="w-4 h-4" />
                                                        </button>
                                                        <button
                                                            onClick={() => sendWhatsAppMessage(inscription)}
                                                            disabled={generatingLinks.has(inscription.id)}
                                                            className={`p-1 ${generatingLinks.has(inscription.id)
                                                                ? 'text-gray-400 cursor-not-allowed'
                                                                : 'text-green-600 hover:text-green-900'
                                                                }`}
                                                            title="Générer et envoyer un lien unique"
                                                        >
                                                            {generatingLinks.has(inscription.id) ? (
                                                                <RefreshCw className="w-4 h-4 animate-spin" />
                                                            ) : (
                                                                <Link className="w-4 h-4" />
                                                            )}
                                                        </button>
                                                        <button
                                                            onClick={() => sendCustomWhatsApp(inscription)}
                                                            className="text-blue-600 hover:text-blue-900 p-1"
                                                            title="Envoyer un message WhatsApp personnalisé"
                                                        >
                                                            <Send className="w-4 h-4" />
                                                        </button>
                                                        <button
                                                            onClick={() => {
                                                                setEditingInscription(inscription)
                                                                setShowEditModal(true)
                                                            }}
                                                            className="text-yellow-600 hover:text-yellow-900 p-1"
                                                            title="Modifier l'inscription"
                                                        >
                                                            <Edit className="w-4 h-4" />
                                                        </button>
                                                        <button
                                                            onClick={() => {
                                                                setSelectedInscription(inscription)
                                                                setShowDeleteModal(true)
                                                            }}
                                                            className="text-red-600 hover:text-red-900 p-1"
                                                            title="Supprimer l'inscription"
                                                        >
                                                            <Trash2 className="w-4 h-4" />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                    </div>
                </div>
            </div>

            {/* Password Modal */}
            {showPasswordModal && selectedInscription && (
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
                                Pour {selectedInscription.prenom} {selectedInscription.nom}
                            </p>
                        </div>
                        <div className="p-6">
                            <div className="bg-gray-50 rounded-lg p-4 mb-6">
                                <p className="text-sm text-gray-600 mb-3 font-medium">Mot de passe généré :</p>
                                <div className="flex items-center space-x-3">
                                    <code className="text-lg font-mono bg-white px-4 py-3 rounded-lg border flex-1 text-center font-bold text-gray-900">
                                        {selectedInscription.motDePasse}
                                    </code>
                                    <button
                                        onClick={() => copyPassword(selectedInscription.motDePasse)}
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
                                        copyPassword(selectedInscription.motDePasse)
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
                                        <option value="Approuvé">Approuvé</option>
                                        <option value="Rejeté">Rejeté</option>
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
            {showDeleteModal && selectedInscription && (
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
                                Êtes-vous sûr de vouloir supprimer l'inscription de <strong>{selectedInscription.prenom} {selectedInscription.nom}</strong> ?
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
                                    onClick={() => deleteInscription(selectedInscription.id)}
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
