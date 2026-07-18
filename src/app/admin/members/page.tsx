'use client'

import { useState, useEffect } from 'react'
import { Users, Search, Filter, Eye, Edit, Trash2, Shield, MapPin, Phone, Calendar, Briefcase, UserCheck, AlertCircle, Download, FileText, User, X, KeyRound } from 'lucide-react'
import jsPDF from 'jspdf'
import { useRouter } from 'next/navigation'
import AdminSidebar from '@/components/AdminSidebar'
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'

interface Membre {
    id: string
    nom: string
    prenoms: string
    nomSacre: string | null
    profession: string | null
    dateNaissance: string
    heureNaissance: string | null
    lieuNaissance: string
    religionPratique: string
    appartientAutreOrdre: boolean
    precisionOrdre: string | null
    grade: string
    equipage: string
    telephoneWhatsapp: string
    lieuResidence: string
    statut: string
    role: 'MEMBRE' | 'ADMIN'
    createdAt: string
    updatedAt: string
    imageUrl: string | null
}

export default function MembersPage() {
    const [activeTab, setActiveTab] = useState('members')
    const [membres, setMembres] = useState<Membre[]>([])
    const [loading, setLoading] = useState(true)
    const [searchTerm, setSearchTerm] = useState('')
    const [statutFilter, setStatutFilter] = useState<string>('all')
    const [gradeFilter, setGradeFilter] = useState<string>('all')
    const [equipageFilter, setEquipageFilter] = useState<string>('all')
    const [selectedMembre, setSelectedMembre] = useState<Membre | null>(null)
    const [viewDialogOpen, setViewDialogOpen] = useState(false)
    const [editDialogOpen, setEditDialogOpen] = useState(false)
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
    const [editFormData, setEditFormData] = useState<Partial<Membre>>({})
    const [submitting, setSubmitting] = useState(false)
    const [currentPage, setCurrentPage] = useState(1)
    const [itemsPerPage] = useState(10)
    const [showDuplicates, setShowDuplicates] = useState(false)
    const [duplicates, setDuplicates] = useState<Record<string, Membre[]>>({})
    const [resetPasswordDialogOpen, setResetPasswordDialogOpen] = useState(false)
    const [newPassword, setNewPassword] = useState('')
    const [resetPasswordError, setResetPasswordError] = useState('')
    const [resetPasswordSuccess, setResetPasswordSuccess] = useState(false)
    const router = useRouter()

    useEffect(() => {
        fetchMembers()
        fetchDuplicates()
    }, [])

    const fetchDuplicates = async () => {
        try {
            const response = await fetch('/api/members/duplicates')
            if (response.ok) {
                const result = await response.json()
                setDuplicates(result.data)
            }
        } catch (err) {
            console.error('Erreur lors de la détection des doublons:', err)
        }
    }

    const fetchMembers = async () => {
        try {
            const response = await fetch('/api/members')
            if (response.ok) {
                const result = await response.json()
                setMembres(result.data)
            }
        } catch (err) {
            console.error('Erreur lors du chargement des membres:', err)
        } finally {
            setLoading(false)
        }
    }

    const filteredMembers = membres.filter((membre) => {
        const matchesSearch =
            membre.nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
            membre.prenoms.toLowerCase().includes(searchTerm.toLowerCase()) ||
            membre.telephoneWhatsapp.includes(searchTerm) ||
            (membre.nomSacre && membre.nomSacre.toLowerCase().includes(searchTerm.toLowerCase()))

        const matchesStatut = statutFilter === 'all' || membre.statut === statutFilter
        const matchesGrade = gradeFilter === 'all' || membre.grade === gradeFilter
        const matchesEquipage = equipageFilter === 'all' || membre.equipage === equipageFilter

        return matchesSearch && matchesStatut && matchesGrade && matchesEquipage
    })

    // Pagination
    const totalPages = Math.ceil(filteredMembers.length / itemsPerPage)
    const startIndex = (currentPage - 1) * itemsPerPage
    const endIndex = startIndex + itemsPerPage
    const paginatedMembers = filteredMembers.slice(startIndex, endIndex)

    const handlePageChange = (page: number) => {
        setCurrentPage(page)
    }

    const handleViewMembre = (membre: Membre) => {
        setSelectedMembre(membre)
        setViewDialogOpen(true)
    }

    useEffect(() => {
        setCurrentPage(1)
    }, [searchTerm, statutFilter, gradeFilter, equipageFilter])

    const handleEditMembre = (membre: Membre) => {
        setSelectedMembre(membre)
        setEditFormData(membre)
        setEditDialogOpen(true)
    }

    const handleDeleteMembre = (membre: Membre) => {
        setSelectedMembre(membre)
        setDeleteDialogOpen(true)
    }

    const handleUpdateMembre = async () => {
        if (!selectedMembre) return

        setSubmitting(true)
        try {
            const response = await fetch(`/api/members/${selectedMembre.id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(editFormData)
            })

            if (response.ok) {
                setEditDialogOpen(false)
                fetchMembers()
            } else {
                console.error('Erreur lors de la mise à jour du membre')
            }
        } catch (error) {
            console.error('Erreur:', error)
        } finally {
            setSubmitting(false)
        }
    }

    const handleConfirmDelete = async () => {
        if (!selectedMembre) return

        setSubmitting(true)
        try {
            const response = await fetch(`/api/members/${selectedMembre.id}`, {
                method: 'DELETE'
            })

            if (response.ok) {
                setDeleteDialogOpen(false)
                fetchMembers()
            } else {
                console.error('Erreur lors de la suppression du membre')
            }
        } catch (error) {
            console.error('Erreur:', error)
        } finally {
            setSubmitting(false)
        }
    }

    const exportToPDF = () => {
        const pdf = new jsPDF('p', 'mm', 'a4')

        pdf.setFontSize(16)
        pdf.text('Liste des Membres - OMP', 105, 15, { align: 'center' })

        pdf.setFontSize(8)
        pdf.text(`Généré le ${new Date().toLocaleDateString('fr-FR')} à ${new Date().toLocaleTimeString('fr-FR')}`, 105, 22, { align: 'center' })
        pdf.text(`Total: ${filteredMembers.length} membre(s)`, 105, 27, { align: 'center' })

        pdf.setFontSize(9)
        let y = 35

        filteredMembers.forEach((membre, index) => {
            // Vérifier s'il faut une nouvelle page
            if (y > 260) {
                pdf.addPage()
                y = 20
            }

            // En-tête du membre (nom et prénoms en gras)
            pdf.setFont('helvetica', 'bold')
            pdf.text(`${index + 1}. ${membre.nom} ${membre.prenoms}`, 10, y)
            pdf.setFont('helvetica', 'normal')
            y += 5

            // Nom Sacré
            if (membre.nomSacre) {
                pdf.text(`   Nom Sacré: ${membre.nomSacre}`, 10, y)
                y += 4
            }

            // Profession
            if (membre.profession) {
                pdf.text(`   Profession: ${membre.profession}`, 10, y)
                y += 4
            }

            // Date et heure de naissance
            const dateNaissance = new Date(membre.dateNaissance).toLocaleDateString('fr-FR')
            pdf.text(`   Né(e) le: ${dateNaissance}${membre.heureNaissance ? ' à ' + membre.heureNaissance : ''}`, 10, y)
            y += 4

            // Lieu de naissance
            pdf.text(`   Lieu de naissance: ${membre.lieuNaissance}`, 10, y)
            y += 4

            // Lieu de résidence
            pdf.text(`   Résidence: ${membre.lieuResidence}`, 10, y)
            y += 4

            // Religion pratiquée
            pdf.text(`   Religion pratiquée: ${membre.religionPratique}`, 10, y)
            y += 4

            // Appartenance à un autre ordre
            const autreOrdre = membre.appartientAutreOrdre ? 'Oui' : 'Non'
            pdf.text(`   Appartient à un autre Ordre: ${autreOrdre}`, 10, y)
            y += 4

            if (membre.appartientAutreOrdre && membre.precisionOrdre) {
                pdf.text(`   Précision: ${membre.precisionOrdre}`, 10, y)
                y += 4
            }

            // Grade et Statut
            pdf.text(`   Grade: ${membre.grade} | Statut: ${membre.statut}`, 10, y)
            y += 4

            // Téléphone WhatsApp
            pdf.text(`   Téléphone WhatsApp: ${membre.telephoneWhatsapp}`, 10, y)
            y += 4

            // Date d'inscription
            const dateInscription = new Date(membre.createdAt).toLocaleDateString('fr-FR')
            pdf.setFontSize(7)
            pdf.text(`   Inscrit le: ${dateInscription}`, 10, y)
            pdf.setFontSize(9)
            y += 6

            // Ligne de séparation
            pdf.setDrawColor(200, 200, 200)
            pdf.line(10, y, 200, y)
            y += 4
        })

        pdf.save('membres-omp.pdf')
    }

    const exportToTxt = () => {
        let content = 'LISTE DES MEMBRES - ORDRE DES MARINS PECHEURS (OMP)\n'
        content += '='.repeat(80) + '\n'
        content += `Généré le ${new Date().toLocaleDateString('fr-FR')} à ${new Date().toLocaleTimeString('fr-FR')}\n`
        content += `Total: ${filteredMembers.length} membre(s)\n`
        content += '='.repeat(80) + '\n\n'

        filteredMembers.forEach((membre, index) => {
            content += `${index + 1}. ${membre.nom} ${membre.prenoms}\n`

            if (membre.nomSacre) {
                content += `   Nom Sacré: ${membre.nomSacre}\n`
            }

            if (membre.profession) {
                content += `   Profession: ${membre.profession}\n`
            }

            const dateNaissance = new Date(membre.dateNaissance).toLocaleDateString('fr-FR')
            content += `   Date de naissance: ${dateNaissance}\n`

            if (membre.heureNaissance) {
                content += `   Heure de naissance: ${membre.heureNaissance}\n`
            }

            content += `   Lieu de naissance: ${membre.lieuNaissance}\n`
            content += `   Lieu de résidence: ${membre.lieuResidence}\n`
            content += `   Religion pratiquée: ${membre.religionPratique}\n`

            const autreOrdre = membre.appartientAutreOrdre ? 'Oui' : 'Non'
            content += `   Appartient à un autre Ordre: ${autreOrdre}\n`

            if (membre.appartientAutreOrdre && membre.precisionOrdre) {
                content += `   Précision sur l'ordre: ${membre.precisionOrdre}\n`
            }

            content += `   Grade: ${membre.grade}\n`
            content += `   Statut: ${membre.statut}\n`
            content += `   Téléphone WhatsApp: ${membre.telephoneWhatsapp}\n`

            const dateInscription = new Date(membre.createdAt).toLocaleDateString('fr-FR')
            const heureInscription = new Date(membre.createdAt).toLocaleTimeString('fr-FR')
            content += `   Inscrit le: ${dateInscription} à ${heureInscription}\n`

            content += '-'.repeat(80) + '\n\n'
        })

        const blob = new Blob([content], { type: 'text/plain; charset=utf-8' })
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = 'membres-omp.txt'
        a.click()
        window.URL.revokeObjectURL(url)
    }

    const getStatutBadgeVariant = (statut: string) => {
        switch (statut) {
            case 'actif':
                return 'default' as const
            case 'suspendu':
                return 'destructive' as const
            default:
                return 'secondary' as const
        }
    }

    const getGradeBadgeVariant = (grade: string) => {
        switch (grade) {
            case 'Explorateur':
                return 'default' as const
            case 'Constructeur':
                return 'secondary' as const
            case 'Navigateur':
                return 'outline' as const
            case 'Alchimiste':
                return 'default' as const
            default:
                return 'secondary' as const
        }
    }

    const handleResetPassword = (membre: Membre) => {
        setSelectedMembre(membre)
        setNewPassword('')
        setResetPasswordError('')
        setResetPasswordSuccess(false)
        setResetPasswordDialogOpen(true)
    }

    const handleConfirmResetPassword = async () => {
        if (!selectedMembre) return

        if (newPassword.length < 10) {
            setResetPasswordError('Le mot de passe doit contenir au moins 10 caractères')
            return
        }

        setSubmitting(true)
        setResetPasswordError('')
        try {
            const response = await fetch(`/api/admin/members/${selectedMembre.id}/reset-password`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ motDePasse: newPassword })
            })

            if (response.ok) {
                setResetPasswordSuccess(true)
                setNewPassword('')
            } else {
                const data = await response.json()
                setResetPasswordError(data.error || 'Erreur lors de la réinitialisation')
            }
        } catch (error) {
            setResetPasswordError('Erreur de connexion au serveur')
        } finally {
            setSubmitting(false)
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
                    <p className="mt-4 text-gray-600">Chargement des membres...</p>
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
                                <h1 className="text-2xl font-bold text-gray-900">Membres-OMP</h1>
                                <p className="text-sm text-gray-600 mt-1">Gestion des membres de l'Ordre des Marins Pêcheurs</p>
                            </div>
                            <div className="flex items-center space-x-3">
                                <Button
                                    onClick={() => setShowDuplicates(!showDuplicates)}
                                    variant={showDuplicates || Object.keys(duplicates).length > 0 ? 'destructive' : 'outline'}
                                >
                                    <AlertCircle className="w-4 h-4 mr-2" />
                                    Doublons ({Object.keys(duplicates).length})
                                </Button>
                                <Button
                                    onClick={exportToPDF}
                                    variant="outline"
                                >
                                    <FileText className="w-4 h-4 mr-2" />
                                    Export PDF
                                </Button>
                                <Button
                                    onClick={exportToTxt}
                                    variant="outline"
                                >
                                    <Download className="w-4 h-4 mr-2" />
                                    Export TXT
                                </Button>
                                <Button
                                    onClick={() => router.push('/members/login')}
                                    variant="outline"
                                >
                                    <Users className="w-4 h-4 mr-2" />
                                    Nouveau membre
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Members Content */}
                <div className="flex-1 overflow-y-auto overflow-x-hidden">
                    <div className="p-4 sm:p-6 lg:p-8">
                        {/* Stats Cards - Réactives au filtrage */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-6">
                            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                                <div className="flex items-center">
                                    <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                                        <Users className="w-6 h-6 text-blue-600" />
                                    </div>
                                    <div className="ml-4">
                                        <p className="text-sm font-medium text-gray-500">Total membres</p>
                                        <p className="text-2xl font-bold text-gray-900">{filteredMembers.length}</p>
                                    </div>
                                </div>
                            </div>

                            {['Constructeur', 'Navigateur', 'Alchimiste'].map((grade) => {
                                const count = filteredMembers.filter(m => m.grade === grade).length
                                const percentage = filteredMembers.length > 0
                                    ? Math.round((count / filteredMembers.length) * 100)
                                    : 0
                                return (
                                    <div key={grade} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                                        <div className="flex flex-col items-center">
                                            <p className="text-xs font-medium text-gray-500 text-center mb-2">{grade}</p>
                                            <div className="w-16 h-16 relative mb-2">
                                                <svg className="w-full h-full" viewBox="0 0 36 36">
                                                    <path
                                                        d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                                                        fill="none"
                                                        stroke="#e5e7eb"
                                                        strokeWidth="3"
                                                    />
                                                    <path
                                                        d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                                                        fill="none"
                                                        stroke="#eab308"
                                                        strokeWidth="3"
                                                        strokeDasharray={`${percentage}, 100`}
                                                        className="transition-all duration-500"
                                                    />
                                                </svg>
                                                <div className="absolute inset-0 flex items-center justify-center">
                                                    <span className="text-xs font-bold text-gray-900">{percentage}%</span>
                                                </div>
                                            </div>
                                            <p className="text-xs font-medium text-gray-600 text-center">{count}</p>
                                        </div>
                                    </div>
                                )
                            })}
                        </div>

                        {/* Doublons Section */}
                        {showDuplicates && Object.keys(duplicates).length > 0 && (
                            <div className="bg-white rounded-lg shadow-sm border border-red-200 mb-6">
                                <div className="px-6 py-4 border-b border-red-200 bg-red-50">
                                    <div className="flex items-center justify-between">
                                        <h2 className="text-lg font-semibold text-red-900 flex items-center">
                                            <AlertCircle className="w-5 h-5 mr-2" />
                                            Doublons détectés ({Object.keys(duplicates).length})
                                        </h2>
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => setShowDuplicates(false)}
                                        >
                                            <X className="w-4 h-4" />
                                        </Button>
                                    </div>
                                </div>
                                <div className="p-6 space-y-4">
                                    {Object.entries(duplicates).map(([nomSacre, membres]) => (
                                        <div key={nomSacre} className="border border-red-200 rounded-lg p-4 bg-red-50/50">
                                            <div className="flex items-center justify-between mb-3">
                                                <h3 className="font-semibold text-red-900">
                                                    Nom Sacré: {nomSacre}
                                                </h3>
                                                <Badge variant="destructive">
                                                    {membres.length} doublons
                                                </Badge>
                                            </div>
                                            <div className="space-y-2">
                                                {membres.map(membre => (
                                                    <div key={membre.id} className="flex items-center justify-between bg-white p-3 rounded border border-red-100">
                                                        <div className="flex items-center space-x-3">
                                                            <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden">
                                                                {membre.imageUrl ? (
                                                                    <img src={membre.imageUrl} alt={membre.nom} className="w-full h-full object-cover" />
                                                                ) : (
                                                                    <User className="w-4 h-4 text-gray-400" />
                                                                )}
                                                            </div>
                                                            <div>
                                                                <p className="font-medium text-gray-900">{membre.nom} {membre.prenoms}</p>
                                                                <p className="text-sm text-gray-500">{membre.telephoneWhatsapp} - {membre.grade}</p>
                                                            </div>
                                                        </div>
                                                        <div className="flex items-center space-x-2">
                                                            <Badge variant={getStatutBadgeVariant(membre.statut)}>
                                                                {membre.statut}
                                                            </Badge>
                                                            <Button
                                                                variant="ghost"
                                                                size="sm"
                                                                onClick={() => handleViewMembre(membre)}
                                                            >
                                                                <Eye className="w-4 h-4" />
                                                            </Button>
                                                            <Button
                                                                variant="ghost"
                                                                size="sm"
                                                                onClick={() => handleEditMembre(membre)}
                                                            >
                                                                <Edit className="w-4 h-4" />
                                                            </Button>
                                                            <Button
                                                                variant="ghost"
                                                                size="sm"
                                                                onClick={() => handleDeleteMembre(membre)}
                                                            >
                                                                <Trash2 className="w-4 h-4 text-red-600" />
                                                            </Button>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Filters */}
                        <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-6">
                            <div className="p-4 sm:p-6">
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            <Search className="w-4 h-4 inline mr-1" />
                                            Rechercher
                                        </label>
                                        <Input
                                            placeholder="Nom, prénom, téléphone..."
                                            value={searchTerm}
                                            onChange={(e) => setSearchTerm(e.target.value)}
                                            className="w-full"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            <Filter className="w-4 h-4 inline mr-1" />
                                            Statut
                                        </label>
                                        <Select value={statutFilter} onValueChange={setStatutFilter}>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Tous les statuts" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="all">Tous les statuts</SelectItem>
                                                <SelectItem value="actif">Actif</SelectItem>
                                                <SelectItem value="suspendu">Suspendu</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            <Shield className="w-4 h-4 inline mr-1" />
                                            Grade
                                        </label>
                                        <Select value={gradeFilter} onValueChange={setGradeFilter}>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Tous les grades" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="all">Tous les grades</SelectItem>
                                                <SelectItem value="Explorateur">Explorateur</SelectItem>
                                                <SelectItem value="Constructeur">Constructeur</SelectItem>
                                                <SelectItem value="Navigateur">Navigateur</SelectItem>
                                                <SelectItem value="Alchimiste">Alchimiste</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            <Shield className="w-4 h-4 inline mr-1" />
                                            Équipage
                                        </label>
                                        <Select value={equipageFilter} onValueChange={setEquipageFilter}>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Tous les équipages" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="all">Tous les équipages</SelectItem>
                                                <SelectItem value="ALEPH">ALEPH</SelectItem>
                                                <SelectItem value="BETH">BETH</SelectItem>
                                                <SelectItem value="GUIMEL">GUIMEL</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Members Table */}
                        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                            <div className="overflow-x-auto">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Photo</TableHead>
                                            <TableHead>Nom</TableHead>
                                            <TableHead>Prénoms</TableHead>
                                            <TableHead>Nom Sacré</TableHead>
                                            <TableHead>Grade</TableHead>
                                            <TableHead>Équipage</TableHead>
                                            <TableHead>Téléphone</TableHead>
                                            <TableHead>Résidence</TableHead>
                                            <TableHead>Statut</TableHead>
                                            <TableHead className="text-right">Actions</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {paginatedMembers.length === 0 ? (
                                            <TableRow>
                                                <TableCell colSpan={10} className="text-center py-8">
                                                    <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                                                    <p className="text-gray-500">Aucun membre trouvé</p>
                                                </TableCell>
                                            </TableRow>
                                        ) : (
                                            paginatedMembers.map((membre) => (
                                                <TableRow
                                                    key={membre.id}
                                                    className="cursor-pointer hover:bg-gray-50"
                                                    onClick={() => handleViewMembre(membre)}
                                                >
                                                    <TableCell>
                                                        <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden">
                                                            {membre.imageUrl ? (
                                                                <img
                                                                    src={membre.imageUrl}
                                                                    alt={`${membre.nom} ${membre.prenoms}`}
                                                                    className="w-full h-full object-cover"
                                                                />
                                                            ) : (
                                                                <User className="w-6 h-6 text-gray-400" />
                                                            )}
                                                        </div>
                                                    </TableCell>
                                                    <TableCell className="font-medium">{membre.nom}</TableCell>
                                                    <TableCell>{membre.prenoms}</TableCell>
                                                    <TableCell>{membre.nomSacre || '-'}</TableCell>
                                                    <TableCell>
                                                        <Badge variant={getGradeBadgeVariant(membre.grade)}>
                                                            {membre.grade}
                                                        </Badge>
                                                    </TableCell>
                                                    <TableCell>
                                                        <Badge variant="outline">
                                                            {membre.equipage}
                                                        </Badge>
                                                    </TableCell>
                                                    <TableCell>{membre.telephoneWhatsapp}</TableCell>
                                                    <TableCell>{membre.lieuResidence}</TableCell>
                                                    <TableCell>
                                                        <Badge variant={getStatutBadgeVariant(membre.statut)}>
                                                            {membre.statut}
                                                        </Badge>
                                                    </TableCell>
                                                    <TableCell className="text-right">
                                                        <div
                                                            className="flex items-center justify-end space-x-2"
                                                            onClick={(e) => e.stopPropagation()}
                                                        >
                                                            <Button
                                                                variant="ghost"
                                                                size="sm"
                                                                onClick={() => handleViewMembre(membre)}
                                                                title="Voir les détails"
                                                            >
                                                                <Eye className="w-4 h-4" />
                                                            </Button>
                                                            <Button
                                                                variant="ghost"
                                                                size="sm"
                                                                onClick={() => handleEditMembre(membre)}
                                                                title="Modifier"
                                                            >
                                                                <Edit className="w-4 h-4 text-blue-600" />
                                                            </Button>
                                                            <Button
                                                                variant="ghost"
                                                                size="sm"
                                                                onClick={() => handleResetPassword(membre)}
                                                                title="Réinitialiser le mot de passe"
                                                            >
                                                                <KeyRound className="w-4 h-4 text-amber-600" />
                                                            </Button>
                                                            <Button
                                                                variant="ghost"
                                                                size="sm"
                                                                onClick={() => handleDeleteMembre(membre)}
                                                                title="Supprimer"
                                                            >
                                                                <Trash2 className="w-4 h-4 text-red-600" />
                                                            </Button>
                                                        </div>
                                                    </TableCell>
                                                </TableRow>
                                            ))
                                        )}
                                    </TableBody>
                                </Table>
                            </div>
                        </div>

                        {/* Pagination */}
                        {totalPages > 1 && (
                            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mt-6">
                                <div className="flex items-center justify-between">
                                    <p className="text-sm text-gray-600">
                                        Affichage de {startIndex + 1} à {Math.min(endIndex, filteredMembers.length)} sur {filteredMembers.length} membres
                                    </p>
                                    <div className="flex items-center space-x-2">
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => handlePageChange(currentPage - 1)}
                                            disabled={currentPage === 1}
                                        >
                                            Précédent
                                        </Button>
                                        <div className="flex items-center space-x-1">
                                            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                                                <Button
                                                    key={page}
                                                    variant={currentPage === page ? 'default' : 'outline'}
                                                    size="sm"
                                                    onClick={() => handlePageChange(page)}
                                                    className="w-10"
                                                >
                                                    {page}
                                                </Button>
                                            ))}
                                        </div>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => handlePageChange(currentPage + 1)}
                                            disabled={currentPage === totalPages}
                                        >
                                            Suivant
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* View Dialog */}
            <Dialog open={viewDialogOpen} onOpenChange={setViewDialogOpen}>
                <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <div className="flex items-center justify-between">
                            <div>
                                <DialogTitle className="text-lg font-semibold">FICHE MEMBRE</DialogTitle>
                                <p className="text-sm text-gray-500">Ordre des Marins Pêcheurs</p>
                            </div>
                            <div className="flex items-center gap-2">
                                <Badge variant={getStatutBadgeVariant(selectedMembre?.statut || 'actif')} className="text-sm">
                                    {selectedMembre?.statut?.toUpperCase()}
                                </Badge>
                                <Badge variant={getGradeBadgeVariant(selectedMembre?.grade || 'Explorateur')} className="text-sm">
                                    {selectedMembre?.grade?.toUpperCase()}
                                </Badge>
                                <Badge className={selectedMembre?.role === 'ADMIN' ? 'bg-amber-100 text-amber-800 border-amber-200' : 'bg-gray-100 text-gray-700 border-gray-200'}>
                                    {selectedMembre?.role === 'ADMIN' ? 'ADMINISTRATEUR' : 'MEMBRE'}
                                </Badge>
                            </div>
                        </div>
                    </DialogHeader>

                    <div className="mt-4">
                        {selectedMembre && (
                            <>
                                <div className="flex gap-6 mb-6">
                                    {/* Photo style passeport */}
                                    <div className="flex-shrink-0">
                                        <div className="w-32 h-40 rounded-lg bg-gray-100 border-2 border-gray-200 flex items-center justify-center overflow-hidden">
                                            {selectedMembre.imageUrl ? (
                                                <img
                                                    src={selectedMembre.imageUrl}
                                                    alt={`${selectedMembre.nom} ${selectedMembre.prenoms}`}
                                                    className="w-full h-full object-cover"
                                                />
                                            ) : (
                                                <div className="text-center text-gray-400">
                                                    <User className="w-12 h-12 mx-auto mb-2" />
                                                    <span className="text-xs">Sans photo</span>
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {/* Informations principales */}
                                    <div className="flex-1 space-y-3">
                                        <div>
                                            <p className="text-xs text-gray-500 uppercase tracking-wide">Nom</p>
                                            <p className="text-base font-semibold text-gray-900">{selectedMembre.nom}</p>
                                        </div>
                                        <div>
                                            <p className="text-xs text-gray-500 uppercase tracking-wide">Prénoms</p>
                                            <p className="text-base font-semibold text-gray-900">{selectedMembre.prenoms}</p>
                                        </div>
                                        {selectedMembre.nomSacre && (
                                            <div>
                                                <p className="text-xs text-gray-500 uppercase tracking-wide">Nom Sacré</p>
                                                <p className="text-sm font-medium text-gray-700">{selectedMembre.nomSacre}</p>
                                            </div>
                                        )}
                                        {selectedMembre.profession && (
                                            <div className="flex items-center gap-2">
                                                <Briefcase className="w-4 h-4 text-gray-400" />
                                                <div>
                                                    <p className="text-xs text-gray-500 uppercase tracking-wide">Profession</p>
                                                    <p className="text-sm font-medium text-gray-900">{selectedMembre.profession}</p>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Séparateur */}
                                <div className="border-t border-gray-200 my-4"></div>

                                {/* Informations personnelles en grille */}
                                <div className="grid grid-cols-2 gap-x-6 gap-y-4">
                                    <div>
                                        <div className="flex items-center gap-2 mb-1">
                                            <Calendar className="w-4 h-4 text-gray-400" />
                                            <p className="text-xs text-gray-500 uppercase tracking-wide">Date de naissance</p>
                                        </div>
                                        <p className="text-sm font-medium text-gray-900">
                                            {new Date(selectedMembre.dateNaissance).toLocaleDateString('fr-FR', {
                                                day: 'numeric',
                                                month: 'long',
                                                year: 'numeric'
                                            })}
                                        </p>
                                    </div>

                                    {selectedMembre.heureNaissance && (
                                        <div>
                                            <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Heure de naissance</p>
                                            <p className="text-sm font-medium text-gray-900">{selectedMembre.heureNaissance}</p>
                                        </div>
                                    )}

                                    <div>
                                        <div className="flex items-center gap-2 mb-1">
                                            <MapPin className="w-4 h-4 text-gray-400" />
                                            <p className="text-xs text-gray-500 uppercase tracking-wide">Lieu de naissance</p>
                                        </div>
                                        <p className="text-sm font-medium text-gray-900">{selectedMembre.lieuNaissance}</p>
                                    </div>

                                    <div>
                                        <div className="flex items-center gap-2 mb-1">
                                            <MapPin className="w-4 h-4 text-gray-400" />
                                            <p className="text-xs text-gray-500 uppercase tracking-wide">Lieu de résidence</p>
                                        </div>
                                        <p className="text-sm font-medium text-gray-900">{selectedMembre.lieuResidence}</p>
                                    </div>

                                    <div>
                                        <div className="flex items-center gap-2 mb-1">
                                            <Phone className="w-4 h-4 text-gray-400" />
                                            <p className="text-xs text-gray-500 uppercase tracking-wide">Téléphone WhatsApp</p>
                                        </div>
                                        <p className="text-sm font-medium text-gray-900">{selectedMembre.telephoneWhatsapp}</p>
                                    </div>

                                    <div>
                                        <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Religion pratiquée</p>
                                        <p className="text-sm font-medium text-gray-900">{selectedMembre.religionPratique}</p>
                                    </div>

                                    <div>
                                        <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Appartient à un autre Ordre</p>
                                        <Badge variant={selectedMembre.appartientAutreOrdre ? 'destructive' : 'default'}>
                                            {selectedMembre.appartientAutreOrdre ? 'Oui' : 'Non'}
                                        </Badge>
                                        {selectedMembre.appartientAutreOrdre && selectedMembre.precisionOrdre && (
                                            <p className="text-xs text-gray-600 mt-1">{selectedMembre.precisionOrdre}</p>
                                        )}
                                    </div>
                                </div>

                                {/* Séparateur */}
                                <div className="border-t border-gray-200 my-4"></div>

                                {/* Date d'inscription */}
                                <div className="bg-gray-50 rounded-lg p-4">
                                    <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Date d'inscription</p>
                                    <p className="text-sm font-medium text-gray-900">
                                        {new Date(selectedMembre.createdAt).toLocaleDateString('fr-FR', {
                                            day: 'numeric',
                                            month: 'long',
                                            year: 'numeric',
                                            hour: '2-digit',
                                            minute: '2-digit'
                                        })}
                                    </p>
                                </div>
                            </>
                        )}
                    </div>
                </DialogContent>
            </Dialog>

            {/* Edit Dialog */}
            <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
                <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>Modifier le membre</DialogTitle>
                    </DialogHeader>
                    {selectedMembre && (
                        <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Nom</label>
                                    <Input
                                        value={editFormData.nom || ''}
                                        onChange={(e) => setEditFormData({ ...editFormData, nom: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Prénoms</label>
                                    <Input
                                        value={editFormData.prenoms || ''}
                                        onChange={(e) => setEditFormData({ ...editFormData, prenoms: e.target.value })}
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Nom Sacré</label>
                                <Input
                                    value={editFormData.nomSacre || ''}
                                    onChange={(e) => setEditFormData({ ...editFormData, nomSacre: e.target.value })}
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Profession</label>
                                <Input
                                    value={editFormData.profession || ''}
                                    onChange={(e) => setEditFormData({ ...editFormData, profession: e.target.value })}
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Téléphone WhatsApp</label>
                                <Input
                                    value={editFormData.telephoneWhatsapp || ''}
                                    onChange={(e) => setEditFormData({ ...editFormData, telephoneWhatsapp: e.target.value })}
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Lieu de résidence</label>
                                <Input
                                    value={editFormData.lieuResidence || ''}
                                    onChange={(e) => setEditFormData({ ...editFormData, lieuResidence: e.target.value })}
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Grade</label>
                                <Select
                                    value={editFormData.grade || ''}
                                    onValueChange={(value) => setEditFormData({ ...editFormData, grade: value })}
                                >
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="Explorateur">Explorateur</SelectItem>
                                        <SelectItem value="Constructeur">Constructeur</SelectItem>
                                        <SelectItem value="Navigateur">Navigateur</SelectItem>
                                        <SelectItem value="Alchimiste">Alchimiste</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Équipage</label>
                                <Select
                                    value={editFormData.equipage || ''}
                                    onValueChange={(value) => setEditFormData({ ...editFormData, equipage: value })}
                                >
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="ALEPH">ALEPH</SelectItem>
                                        <SelectItem value="BETH">BETH</SelectItem>
                                        <SelectItem value="GUIMEL">GUIMEL</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Statut</label>
                                <Select
                                    value={editFormData.statut || ''}
                                    onValueChange={(value) => setEditFormData({ ...editFormData, statut: value })}
                                >
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="actif">Actif</SelectItem>
                                        <SelectItem value="suspendu">Suspendu</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Rôle dans l’application</label>
                                <Select
                                    value={editFormData.role || 'MEMBRE'}
                                    onValueChange={(value) => setEditFormData({ ...editFormData, role: value as 'MEMBRE' | 'ADMIN' })}
                                >
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="MEMBRE">Membre — espace personnel</SelectItem>
                                        <SelectItem value="ADMIN">Administrateur — tableau de bord</SelectItem>
                                    </SelectContent>
                                </Select>
                                <p className="mt-1 text-xs text-gray-500">Un administrateur se connecte avec son nom sacré et son mot de passe membre.</p>
                            </div>

                            <div className="flex justify-end space-x-2 pt-4">
                                <Button
                                    variant="outline"
                                    onClick={() => setEditDialogOpen(false)}
                                    disabled={submitting}
                                >
                                    Annuler
                                </Button>
                                <Button
                                    onClick={handleUpdateMembre}
                                    disabled={submitting}
                                >
                                    {submitting ? 'Mise à jour...' : 'Enregistrer'}
                                </Button>
                            </div>
                        </div>
                    )}
                </DialogContent>
            </Dialog>

            {/* Delete Dialog */}
            <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Confirmer la suppression</DialogTitle>
                    </DialogHeader>
                    {selectedMembre && (
                        <div className="space-y-4">
                            <p className="text-gray-600">
                                Êtes-vous sûr de vouloir supprimer le membre <strong>{selectedMembre.nom} {selectedMembre.prenoms}</strong> ?
                            </p>
                            <p className="text-sm text-red-600">
                                Cette action est irréversible.
                            </p>

                            <div className="flex justify-end space-x-2 pt-4">
                                <Button
                                    variant="outline"
                                    onClick={() => setDeleteDialogOpen(false)}
                                    disabled={submitting}
                                >
                                    Annuler
                                </Button>
                                <Button
                                    variant="destructive"
                                    onClick={handleConfirmDelete}
                                    disabled={submitting}
                                >
                                    {submitting ? 'Suppression...' : 'Supprimer'}
                                </Button>
                            </div>
                        </div>
                    )}
                </DialogContent>
            </Dialog>

            {/* Reset Password Dialog */}
            <Dialog open={resetPasswordDialogOpen} onOpenChange={(open) => {
                setResetPasswordDialogOpen(open)
                if (!open) {
                    setNewPassword('')
                    setResetPasswordError('')
                    setResetPasswordSuccess(false)
                }
            }}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <KeyRound className="w-5 h-5 text-amber-600" />
                            Réinitialiser le mot de passe
                        </DialogTitle>
                    </DialogHeader>
                    {selectedMembre && (
                        <div className="space-y-4">
                            <p className="text-sm text-gray-600">
                                Définir un nouveau mot de passe pour <strong>{selectedMembre.nom} {selectedMembre.prenoms}</strong>
                                {selectedMembre.nomSacre && <span className="text-gray-500"> ({selectedMembre.nomSacre})</span>}.
                            </p>

                            {resetPasswordSuccess ? (
                                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                                    <p className="text-sm text-green-700 font-medium">
                                        Mot de passe réinitialisé avec succès.
                                    </p>
                                    <p className="text-xs text-green-600 mt-1">
                                        Le membre peut maintenant se connecter avec le nouveau mot de passe.
                                    </p>
                                </div>
                            ) : (
                                <>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Nouveau mot de passe
                                        </label>
                                        <Input
                                            type="password"
                                            placeholder="Au moins 10 caractères"
                                            value={newPassword}
                                            onChange={(e) => {
                                                setNewPassword(e.target.value)
                                                setResetPasswordError('')
                                            }}
                                            onKeyDown={(e) => e.key === 'Enter' && handleConfirmResetPassword()}
                                        />
                                        {resetPasswordError && (
                                            <p className="text-sm text-red-600 mt-1">{resetPasswordError}</p>
                                        )}
                                    </div>

                                    <div className="flex justify-end space-x-2 pt-2">
                                        <Button
                                            variant="outline"
                                            onClick={() => setResetPasswordDialogOpen(false)}
                                            disabled={submitting}
                                        >
                                            Annuler
                                        </Button>
                                        <Button
                                            onClick={handleConfirmResetPassword}
                                            disabled={submitting || newPassword.length < 10}
                                            className="bg-amber-600 hover:bg-amber-700 text-white"
                                        >
                                            {submitting ? 'Enregistrement...' : 'Définir le mot de passe'}
                                        </Button>
                                    </div>
                                </>
                            )}

                            {resetPasswordSuccess && (
                                <div className="flex justify-end">
                                    <Button onClick={() => setResetPasswordDialogOpen(false)}>
                                        Fermer
                                    </Button>
                                </div>
                            )}
                        </div>
                    )}
                </DialogContent>
            </Dialog>
        </div>
    )
}
