'use client'

import { useState, useEffect } from 'react'
import {
    Users,
    Search,
    Filter,
    Download,
    Eye,
    Copy,
    UserCheck,
    Clock,
    X,
    MessageCircle
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

export default function AdminMembers() {
    const [activeTab, setActiveTab] = useState('members')
    const [inscriptions, setInscriptions] = useState<Inscription[]>([])
    const [loading, setLoading] = useState(true)
    const [searchTerm, setSearchTerm] = useState('')
    const [filterStatut, setFilterStatut] = useState('')
    const [selectedInscription, setSelectedInscription] = useState<Inscription | null>(null)
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
                // Filtrer uniquement les membres actifs
                const actifs = data.filter((item: Inscription) => item.statut === 'Actif')
                setInscriptions(actifs)
            }
        } catch (err) {
            console.error('Erreur lors du chargement des membres:', err)
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

    const copyWhatsAppMessage = async (inscription: Inscription) => {
        const message = `Bonjour ${inscription.prenom} ${inscription.nom},\n\nVotre compte ETU-Bénin est actif !\n\n📧 Email: ${inscription.telephone}\n🔐 Mot de passe: ${inscription.motDePasse}\n\nAccédez à votre espace membre : /profil\n\nCordialement,\nL'équipe ETU-Bénin`

        try {
            await navigator.clipboard.writeText(message)
            addToast({
                type: 'success',
                title: 'Message copié',
                message: 'Message WhatsApp copié dans le presse-papiers'
            })
        } catch (err) {
            addToast({
                type: 'error',
                title: 'Erreur',
                message: 'Impossible de copier le message'
            })
        }
    }

    const sendWhatsAppMessage = (inscription: Inscription) => {
        const message = `Bonjour ${inscription.prenom} ${inscription.nom},\n\nVotre compte ETU-Bénin est actif !\n\n📧 Email: ${inscription.telephone}\n🔐 Mot de passe: ${inscription.motDePasse}\n\nAccédez à votre espace membre : /profil\n\nCordialement,\nL'équipe ETU-Bénin`

        const encodedMessage = encodeURIComponent(message)
        const whatsappUrl = `https://wa.me/${inscription.telephone}?text=${encodedMessage}`
        window.open(whatsappUrl, '_blank')

        addToast({
            type: 'success',
            title: 'Message envoyé',
            message: `Message WhatsApp envoyé à ${inscription.prenom} ${inscription.nom}`
        })
    }

    const filteredInscriptions = inscriptions.filter(inscription => {
        const matchesSearch = inscription.nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
            inscription.prenom.toLowerCase().includes(searchTerm.toLowerCase()) ||
            inscription.telephone.includes(searchTerm)
        const matchesStatut = !filterStatut || inscription.statut === filterStatut
        return matchesSearch && matchesStatut
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
                        <p className="mt-4 text-gray-600">Chargement des membres...</p>
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
                                <h1 className="text-2xl font-bold text-gray-900">Gestion des Membres</h1>
                                <p className="text-sm text-gray-600 mt-1">Gérer les membres actifs</p>
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
                                    <option value="Actif">Actif</option>
                                    <option value="Suspendu">Suspendu</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    {/* Members Table */}
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                        <div className="px-6 py-4 border-b border-gray-200">
                            <h2 className="text-lg font-semibold text-gray-900">
                                Membres actifs ({filteredInscriptions.length})
                            </h2>
                        </div>

                        {filteredInscriptions.length === 0 ? (
                            <div className="p-8 text-center">
                                <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                                <p className="text-gray-500">Aucun membre actif trouvé</p>
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
                                                Mot de passe
                                            </th>
                                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Actions
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-200">
                                        {filteredInscriptions.map((inscription) => (
                                            <tr key={inscription.id} className="hover:bg-gray-50 transition-colors">
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="flex items-center">
                                                        <div className="flex-shrink-0 h-10 w-10 bg-gray-200 rounded-full flex items-center justify-center">
                                                            <span className="text-sm font-medium text-gray-700">
                                                                {inscription.prenom[0]}{inscription.nom[0]}
                                                            </span>
                                                        </div>
                                                        <div className="ml-4">
                                                            <div className="text-sm font-medium text-gray-900">
                                                                {inscription.prenom} {inscription.nom}
                                                            </div>
                                                            <div className="text-xs text-gray-500">
                                                                {inscription.sexe}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="text-sm text-gray-900">{inscription.telephone}</div>
                                                    <div className="text-xs text-gray-500">{inscription.lieuResidence}</div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="text-sm text-gray-900">{inscription.grade}</div>
                                                    <div className="text-xs text-gray-500">{inscription.programme}</div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="flex items-center space-x-2">
                                                        <code className="px-2 py-1 bg-gray-100 rounded text-sm">
                                                            {inscription.motDePasse}
                                                        </code>
                                                        <button
                                                            onClick={() => copyPassword(inscription.motDePasse)}
                                                            className="text-gray-400 hover:text-gray-600 transition-colors"
                                                            title="Copier le mot de passe"
                                                        >
                                                            <Copy className="w-4 h-4" />
                                                        </button>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                    <div className="flex items-center justify-end gap-2">
                                                        <button
                                                            onClick={() => copyWhatsAppMessage(inscription)}
                                                            className="text-blue-600 hover:text-blue-800 transition-colors"
                                                            title="Copier le message WhatsApp"
                                                        >
                                                            <Copy className="w-4 h-4" />
                                                        </button>
                                                        <button
                                                            onClick={() => sendWhatsAppMessage(inscription)}
                                                            className="text-green-600 hover:text-green-800 transition-colors"
                                                            title="Envoyer WhatsApp"
                                                        >
                                                            <MessageCircle className="w-4 h-4" />
                                                        </button>
                                                        <button
                                                            onClick={() => setSelectedInscription(inscription)}
                                                            className="text-gray-600 hover:text-gray-800 transition-colors"
                                                            title="Voir les détails"
                                                        >
                                                            <Eye className="w-4 h-4" />
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

            {/* Detail Modal */}
            {selectedInscription && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                        <div className="p-6">
                            <div className="flex justify-between items-center mb-4">
                                <h3 className="text-lg font-semibold text-gray-900">
                                    Détails du membre
                                </h3>
                                <button
                                    onClick={() => setSelectedInscription(null)}
                                    className="text-gray-400 hover:text-gray-600"
                                >
                                    <X className="w-6 h-6" />
                                </button>
                            </div>

                            <div className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <p className="text-sm text-gray-500">Nom</p>
                                        <p className="text-base font-medium text-gray-900">{selectedInscription.nom}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-500">Prénom</p>
                                        <p className="text-base font-medium text-gray-900">{selectedInscription.prenom}</p>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <p className="text-sm text-gray-500">Sexe</p>
                                        <p className="text-base font-medium text-gray-900">{selectedInscription.sexe}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-500">Téléphone</p>
                                        <p className="text-base font-medium text-gray-900">{selectedInscription.telephone}</p>
                                    </div>
                                </div>

                                <div>
                                    <p className="text-sm text-gray-500">Lieu de résidence</p>
                                    <p className="text-base font-medium text-gray-900">{selectedInscription.lieuResidence}</p>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <p className="text-sm text-gray-500">Grade</p>
                                        <p className="text-base font-medium text-gray-900">{selectedInscription.grade}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-500">Programme</p>
                                        <p className="text-base font-medium text-gray-900">{selectedInscription.programme}</p>
                                    </div>
                                </div>

                                <div>
                                    <p className="text-sm text-gray-500">Statut</p>
                                    <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${
                                        selectedInscription.statut === 'Actif'
                                            ? 'bg-green-100 text-green-800'
                                            : 'bg-gray-100 text-gray-800'
                                    }`}>
                                        {selectedInscription.statut}
                                    </span>
                                </div>

                                <div>
                                    <p className="text-sm text-gray-500">Mot de passe</p>
                                    <div className="flex items-center space-x-2 mt-1">
                                        <code className="px-3 py-1.5 bg-gray-100 rounded text-base font-mono">
                                            {selectedInscription.motDePasse}
                                        </code>
                                        <button
                                            onClick={() => copyPassword(selectedInscription.motDePasse)}
                                            className="text-gray-400 hover:text-gray-600 transition-colors"
                                        >
                                            <Copy className="w-5 h-5" />
                                        </button>
                                    </div>
                                </div>

                                <div>
                                    <p className="text-sm text-gray-500">Date d'inscription</p>
                                    <p className="text-base font-medium text-gray-900">
                                        {new Date(selectedInscription.createdAt).toLocaleDateString('fr-FR', {
                                            day: 'numeric',
                                            month: 'long',
                                            year: 'numeric',
                                            hour: '2-digit',
                                            minute: '2-digit'
                                        })}
                                    </p>
                                </div>
                            </div>

                            <div className="flex gap-3 mt-6 pt-6 border-t border-gray-200">
                                <button
                                    onClick={() => sendWhatsAppMessage(selectedInscription)}
                                    className="flex-1 bg-green-600 text-white py-2.5 px-4 rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center font-medium"
                                >
                                    <MessageCircle className="w-5 h-5 mr-2" />
                                    Envoyer sur WhatsApp
                                </button>
                                <button
                                    onClick={() => setSelectedInscription(null)}
                                    className="flex-1 bg-gray-100 text-gray-700 py-2.5 px-4 rounded-lg hover:bg-gray-200 transition-colors font-medium"
                                >
                                    Fermer
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
