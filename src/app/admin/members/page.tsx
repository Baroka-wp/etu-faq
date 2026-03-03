'use client'

import { useState, useEffect } from 'react'
import { Users, Search, Filter, Eye, Edit, Trash2, Shield, MapPin, Phone, Calendar, Briefcase, UserCheck, AlertCircle, Download, FileText } from 'lucide-react'
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
    telephoneWhatsapp: string
    lieuResidence: string
    statut: string
    createdAt: string
    updatedAt: string
}

export default function MembersPage() {
    const [activeTab, setActiveTab] = useState('members')
    const [membres, setMembres] = useState<Membre[]>([])
    const [loading, setLoading] = useState(true)
    const [searchTerm, setSearchTerm] = useState('')
    const [statutFilter, setStatutFilter] = useState<string>('all')
    const [gradeFilter, setGradeFilter] = useState<string>('all')
    const [selectedMembre, setSelectedMembre] = useState<Membre | null>(null)
    const [viewDialogOpen, setViewDialogOpen] = useState(false)
    const [editDialogOpen, setEditDialogOpen] = useState(false)
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
    const [editFormData, setEditFormData] = useState<Partial<Membre>>({})
    const [submitting, setSubmitting] = useState(false)
    const router = useRouter()

    useEffect(() => {
        fetchMembers()
    }, [])

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

        return matchesSearch && matchesStatut && matchesGrade
    })

    const handleViewMembre = (membre: Membre) => {
        setSelectedMembre(membre)
        setViewDialogOpen(true)
    }

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

        pdf.setFontSize(10)
        let y = 30

        filteredMembers.forEach((membre, index) => {
            if (y > 270) {
                pdf.addPage()
                y = 20
            }

            pdf.text(`${index + 1}. ${membre.nom} ${membre.prenoms}`, 10, y)
            y += 5
            pdf.text(`   Grade: ${membre.grade} | Statut: ${membre.statut}`, 10, y)
            y += 5
            pdf.text(`   Téléphone: ${membre.telephoneWhatsapp} | Résidence: ${membre.lieuResidence}`, 10, y)
            y += 8
        })

        pdf.save('membres-omp.pdf')
    }

    const exportToTxt = () => {
        let content = 'LISTE DES MEMBRES - OMP\n'
        content += '='.repeat(80) + '\n\n'

        filteredMembers.forEach((membre, index) => {
            content += `${index + 1}. ${membre.nom} ${membre.prenoms}\n`
            content += `   Nom Sacré: ${membre.nomSacre || 'N/A'}\n`
            content += `   Grade: ${membre.grade} | Statut: ${membre.statut}\n`
            content += `   Profession: ${membre.profession || 'N/A'}\n`
            content += `   Date de naissance: ${new Date(membre.dateNaissance).toLocaleDateString('fr-FR')}\n`
            content += `   Lieu de naissance: ${membre.lieuNaissance}\n`
            content += `   Religion: ${membre.religionPratique}\n`
            content += `   Téléphone: ${membre.telephoneWhatsapp}\n`
            content += `   Résidence: ${membre.lieuResidence}\n`
            content += `   Inscrit le: ${new Date(membre.createdAt).toLocaleDateString('fr-FR')}\n`
            content += '-'.repeat(80) + '\n\n'
        })

        const blob = new Blob([content], { type: 'text/plain' })
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
                        {/* Stats Cards */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-6">
                            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                                <div className="flex items-center">
                                    <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                                        <Users className="w-6 h-6 text-blue-600" />
                                    </div>
                                    <div className="ml-4">
                                        <p className="text-sm font-medium text-gray-500">Total membres</p>
                                        <p className="text-2xl font-bold text-gray-900">{membres.length}</p>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                                <div className="flex items-center">
                                    <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                                        <UserCheck className="w-6 h-6 text-green-600" />
                                    </div>
                                    <div className="ml-4">
                                        <p className="text-sm font-medium text-gray-500">Membres actifs</p>
                                        <p className="text-2xl font-bold text-gray-900">
                                            {membres.filter(m => m.statut === 'actif').length}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                                <div className="flex items-center">
                                    <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                                        <Shield className="w-6 h-6 text-yellow-600" />
                                    </div>
                                    <div className="ml-4">
                                        <p className="text-sm font-medium text-gray-500">Explorateurs</p>
                                        <p className="text-2xl font-bold text-gray-900">
                                            {membres.filter(m => m.grade === 'Explorateur').length}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                                <div className="flex items-center">
                                    <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
                                        <AlertCircle className="w-6 h-6 text-red-600" />
                                    </div>
                                    <div className="ml-4">
                                        <p className="text-sm font-medium text-gray-500">Suspendus</p>
                                        <p className="text-2xl font-bold text-gray-900">
                                            {membres.filter(m => m.statut === 'suspendu').length}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>

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
                                </div>
                            </div>
                        </div>

                        {/* Members Table */}
                        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                            <div className="overflow-x-auto">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Nom</TableHead>
                                            <TableHead>Prénoms</TableHead>
                                            <TableHead>Grade</TableHead>
                                            <TableHead>Téléphone</TableHead>
                                            <TableHead>Résidence</TableHead>
                                            <TableHead>Statut</TableHead>
                                            <TableHead className="text-right">Actions</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {filteredMembers.length === 0 ? (
                                            <TableRow>
                                                <TableCell colSpan={7} className="text-center py-8">
                                                    <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                                                    <p className="text-gray-500">Aucun membre trouvé</p>
                                                </TableCell>
                                            </TableRow>
                                        ) : (
                                            filteredMembers.map((membre) => (
                                                <TableRow key={membre.id}>
                                                    <TableCell className="font-medium">{membre.nom}</TableCell>
                                                    <TableCell>{membre.prenoms}</TableCell>
                                                    <TableCell>
                                                        <Badge variant={getGradeBadgeVariant(membre.grade)}>
                                                            {membre.grade}
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
                                                        <div className="flex items-center justify-end space-x-2">
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
                    </div>
                </div>
            </div>

            {/* View Dialog */}
            <Dialog open={viewDialogOpen} onOpenChange={setViewDialogOpen}>
                <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>Détails du membre</DialogTitle>
                    </DialogHeader>
                    {selectedMembre && (
                        <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <p className="text-sm text-gray-500">Nom</p>
                                    <p className="font-medium">{selectedMembre.nom}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500">Prénoms</p>
                                    <p className="font-medium">{selectedMembre.prenoms}</p>
                                </div>
                            </div>

                            {selectedMembre.nomSacre && (
                                <div>
                                    <p className="text-sm text-gray-500">Nom Sacré</p>
                                    <p className="font-medium">{selectedMembre.nomSacre}</p>
                                </div>
                            )}

                            {selectedMembre.profession && (
                                <div className="flex items-center">
                                    <Briefcase className="w-4 h-4 text-gray-500 mr-2" />
                                    <div>
                                        <p className="text-sm text-gray-500">Profession</p>
                                        <p className="font-medium">{selectedMembre.profession}</p>
                                    </div>
                                </div>
                            )}

                            <div className="flex items-center">
                                <Calendar className="w-4 h-4 text-gray-500 mr-2" />
                                <div>
                                    <p className="text-sm text-gray-500">Date de naissance</p>
                                    <p className="font-medium">
                                        {new Date(selectedMembre.dateNaissance).toLocaleDateString('fr-FR')}
                                    </p>
                                </div>
                            </div>

                            {selectedMembre.heureNaissance && (
                                <div>
                                    <p className="text-sm text-gray-500">Heure de naissance</p>
                                    <p className="font-medium">{selectedMembre.heureNaissance}</p>
                                </div>
                            )}

                            <div className="flex items-center">
                                <MapPin className="w-4 h-4 text-gray-500 mr-2" />
                                <div>
                                    <p className="text-sm text-gray-500">Lieu de naissance</p>
                                    <p className="font-medium">{selectedMembre.lieuNaissance}</p>
                                </div>
                            </div>

                            <div className="flex items-center">
                                <MapPin className="w-4 h-4 text-gray-500 mr-2" />
                                <div>
                                    <p className="text-sm text-gray-500">Lieu de résidence</p>
                                    <p className="font-medium">{selectedMembre.lieuResidence}</p>
                                </div>
                            </div>

                            <div>
                                <p className="text-sm text-gray-500">Religion pratiquée</p>
                                <p className="font-medium">{selectedMembre.religionPratique}</p>
                            </div>

                            <div>
                                <p className="text-sm text-gray-500">Appartient à un autre Ordre</p>
                                <Badge variant={selectedMembre.appartientAutreOrdre ? 'destructive' : 'default'}>
                                    {selectedMembre.appartientAutreOrdre ? 'Oui' : 'Non'}
                                </Badge>
                                {selectedMembre.appartientAutreOrdre && selectedMembre.precisionOrdre && (
                                    <p className="text-sm text-gray-600 mt-1">{selectedMembre.precisionOrdre}</p>
                                )}
                            </div>

                            <div className="flex items-center">
                                <Shield className="w-4 h-4 text-gray-500 mr-2" />
                                <div>
                                    <p className="text-sm text-gray-500">Grade</p>
                                    <Badge variant={getGradeBadgeVariant(selectedMembre.grade)}>
                                        {selectedMembre.grade}
                                    </Badge>
                                </div>
                            </div>

                            <div className="flex items-center">
                                <Phone className="w-4 h-4 text-gray-500 mr-2" />
                                <div>
                                    <p className="text-sm text-gray-500">Téléphone WhatsApp</p>
                                    <p className="font-medium">{selectedMembre.telephoneWhatsapp}</p>
                                </div>
                            </div>

                            <div>
                                <p className="text-sm text-gray-500">Statut</p>
                                <Badge variant={getStatutBadgeVariant(selectedMembre.statut)}>
                                    {selectedMembre.statut}
                                </Badge>
                            </div>

                            <div className="pt-4 border-t">
                                <p className="text-xs text-gray-500">
                                    Inscrit le {new Date(selectedMembre.createdAt).toLocaleDateString('fr-FR', {
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
        </div>
    )
}
