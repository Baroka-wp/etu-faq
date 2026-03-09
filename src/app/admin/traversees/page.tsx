'use client'

import { useState, useEffect, useCallback } from 'react'
import {
    Compass, Plus, Edit, Trash2, Eye, Copy, Download, FileText,
    Calendar, MapPin, Users, Search, X
} from 'lucide-react'
import { useRouter } from 'next/navigation'
import jsPDF from 'jspdf'
import AdminSidebar from '@/components/AdminSidebar'
import {
    Table, TableBody, TableCell, TableHead, TableHeader, TableRow
} from '@/components/ui/table'
import {
    Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { useToast } from '@/components/Toast'
import { ToastContainer } from '@/components/ToastContainer'
import { slugify } from '@/lib/utils'

interface Traversee {
    id: string
    titre: string
    description: string
    date: string
    lieu: string
    lienUnique: string
    createdAt: string
    _count: { inscriptions: number }
}

interface InscritItem {
    id: string
    createdAt: string
    membre: {
        id: string
        nom: string
        prenoms: string
        nomSacre: string | null
        grade: string
        telephoneWhatsapp: string
    }
}

const GRADE_COLORS: Record<string, string> = {
    Explorateur: 'bg-green-100 text-green-800',
    Constructeur: 'bg-blue-100 text-blue-800',
    Navigateur: 'bg-purple-100 text-purple-800',
    Alchimiste: 'bg-yellow-100 text-yellow-800',
}

function formatDate(dateStr: string) {
    return new Date(dateStr).toLocaleDateString('fr-FR', {
        day: '2-digit', month: 'long', year: 'numeric'
    })
}

function formatDateTime(dateStr: string) {
    return new Date(dateStr).toLocaleDateString('fr-FR', {
        day: '2-digit', month: '2-digit', year: 'numeric',
        hour: '2-digit', minute: '2-digit'
    })
}

export default function TraverseesPage() {
    const [activeTab, setActiveTab] = useState('traversees')
    const [traversees, setTraversees] = useState<Traversee[]>([])
    const [loading, setLoading] = useState(true)
    const [showAddModal, setShowAddModal] = useState(false)
    const [showEditModal, setShowEditModal] = useState(false)
    const [showDeleteModal, setShowDeleteModal] = useState(false)
    const [showInscritsModal, setShowInscritsModal] = useState(false)
    const [selectedTraversee, setSelectedTraversee] = useState<Traversee | null>(null)
    const [inscrits, setInscrits] = useState<InscritItem[]>([])
    const [loadingInscrits, setLoadingInscrits] = useState(false)
    const [submitting, setSubmitting] = useState(false)
    const [formData, setFormData] = useState({
        titre: '', description: '', date: '', lieu: '', lienUnique: ''
    })
    const router = useRouter()
    const { toasts, addToast, removeToast } = useToast()

    const fetchTraversees = useCallback(async () => {
        setLoading(true)
        try {
            const res = await fetch('/api/admin/traversees')
            if (res.status === 401) { router.push('/admin-login'); return }
            const data = await res.json()
            if (data.success) setTraversees(data.data)
        } catch {
            addToast({ type: 'error', title: 'Erreur', message: 'Impossible de charger les traversées' })
        } finally {
            setLoading(false)
        }
    }, [router]) // eslint-disable-line react-hooks/exhaustive-deps

    useEffect(() => { fetchTraversees() }, [fetchTraversees])

    const handleLogout = async () => {
        await fetch('/api/auth/logout', { method: 'POST' })
        router.push('/admin-login')
    }

    const resetForm = () => setFormData({ titre: '', description: '', date: '', lieu: '', lienUnique: '' })

    const handleTitreChange = (titre: string) => {
        setFormData(prev => ({ ...prev, titre, lienUnique: slugify(titre) }))
    }

    const handleAdd = () => {
        resetForm()
        setShowAddModal(true)
    }

    const handleEdit = (traversee: Traversee) => {
        const dateLocal = new Date(traversee.date).toISOString().slice(0, 16)
        setFormData({
            titre: traversee.titre,
            description: traversee.description,
            date: dateLocal,
            lieu: traversee.lieu,
            lienUnique: traversee.lienUnique
        })
        setSelectedTraversee(traversee)
        setShowEditModal(true)
    }

    const handleSubmit = async (isEdit: boolean) => {
        if (!formData.titre || !formData.description || !formData.date || !formData.lieu || !formData.lienUnique) {
            addToast({ type: 'error', title: 'Erreur', message: 'Tous les champs sont obligatoires' })
            return
        }
        setSubmitting(true)
        try {
            const url = isEdit ? `/api/admin/traversees/${selectedTraversee!.id}` : '/api/admin/traversees'
            const method = isEdit ? 'PUT' : 'POST'
            const res = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            })
            const data = await res.json()
            if (data.success) {
                addToast({
                    type: 'success',
                    title: isEdit ? 'Traversée modifiée' : 'Traversée créée',
                    message: `"${formData.titre}" a été ${isEdit ? 'modifiée' : 'créée'} avec succès`
                })
                setShowAddModal(false)
                setShowEditModal(false)
                fetchTraversees()
            } else {
                addToast({ type: 'error', title: 'Erreur', message: data.error })
            }
        } catch {
            addToast({ type: 'error', title: 'Erreur', message: 'Une erreur est survenue' })
        } finally {
            setSubmitting(false)
        }
    }

    const handleDeleteConfirm = async () => {
        if (!selectedTraversee) return
        setSubmitting(true)
        try {
            const res = await fetch(`/api/admin/traversees/${selectedTraversee.id}`, { method: 'DELETE' })
            const data = await res.json()
            if (data.success) {
                addToast({ type: 'success', title: 'Supprimée', message: `"${selectedTraversee.titre}" a été supprimée` })
                setShowDeleteModal(false)
                fetchTraversees()
            } else {
                addToast({ type: 'error', title: 'Erreur', message: data.error })
            }
        } catch {
            addToast({ type: 'error', title: 'Erreur', message: 'Une erreur est survenue' })
        } finally {
            setSubmitting(false)
        }
    }

    const handleViewInscrits = async (traversee: Traversee) => {
        setSelectedTraversee(traversee)
        setInscrits([])
        setLoadingInscrits(true)
        setShowInscritsModal(true)
        try {
            const res = await fetch(`/api/admin/traversees/${traversee.id}/inscrits`)
            const data = await res.json()
            if (data.success) setInscrits(data.data)
        } catch {
            addToast({ type: 'error', title: 'Erreur', message: 'Impossible de charger les inscrits' })
        } finally {
            setLoadingInscrits(false)
        }
    }

    const handleCopyLink = (lienUnique: string) => {
        const url = `${window.location.origin}/traversee/${lienUnique}`
        navigator.clipboard.writeText(url).then(() => {
            addToast({ type: 'success', title: 'Lien copié !', message: url })
        })
    }

    const exportToTxt = () => {
        if (!selectedTraversee) return
        let content = `LISTE DE PRÉSENCE\n`
        content += `Traversée : ${selectedTraversee.titre}\n`
        content += `Date      : ${formatDate(selectedTraversee.date)}\n`
        content += `Lieu      : ${selectedTraversee.lieu}\n`
        content += `Inscrits  : ${inscrits.length}\n`
        content += `${'='.repeat(90)}\n\n`
        content += `N°\tNOM\t\t\tPRÉNOM(S)\t\t\tTÉLÉPHONE\t\tGRADE\t\t\tSIGNATURE\n`
        content += `${'-'.repeat(90)}\n`
        inscrits.forEach((item, index) => {
            const { nom, prenoms, telephoneWhatsapp, grade } = item.membre
            content += `${index + 1}\t${nom}\t\t${prenoms}\t\t${telephoneWhatsapp}\t\t${grade}\t\t\n`
        })
        const blob = new Blob([content], { type: 'text/plain; charset=utf-8' })
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `presence-${selectedTraversee.lienUnique}.txt`
        document.body.appendChild(a)
        a.click()
        document.body.removeChild(a)
        window.URL.revokeObjectURL(url)
    }

    const exportToPDF = () => {
        if (!selectedTraversee) return
        const pdf = new jsPDF('p', 'mm', 'a4') // portrait
        const margin = 15
        const pageW = 210

        // Titre
        pdf.setFontSize(14)
        pdf.setFont('helvetica', 'bold')
        pdf.text("LISTE D'EMBARQUEMENT", margin, 20)

        // Infos événement
        pdf.setFontSize(10)
        pdf.setFont('helvetica', 'normal')
        pdf.text(`${selectedTraversee.titre}`, margin, 28)
        pdf.setFontSize(9)
        pdf.setTextColor(100, 100, 100)
        pdf.text(`${formatDate(selectedTraversee.date)}  —  ${selectedTraversee.lieu}`, margin, 34)

        // Ligne séparatrice
        pdf.setDrawColor(180, 180, 180)
        pdf.line(margin, 39, pageW - margin, 39)

        // En-têtes colonnes
        // N°(10) | Nom(35) | Prénom(45) | Téléphone(35) | Grade(30) | Signature(rest)
        const cols = [
            { label: 'N°',        x: margin,    w: 10 },
            { label: 'Nom',       x: margin+10, w: 35 },
            { label: 'Prénom(s)', x: margin+45, w: 45 },
            { label: 'Téléphone', x: margin+90, w: 35 },
            { label: 'Grade',     x: margin+125, w: 30 },
            { label: 'Signature', x: margin+155, w: 40 },
        ]

        let y = 46
        pdf.setFontSize(8)
        pdf.setFont('helvetica', 'bold')
        pdf.setTextColor(0, 0, 0)
        cols.forEach(c => pdf.text(c.label, c.x, y))

        pdf.setDrawColor(150, 150, 150)
        pdf.line(margin, y + 2, pageW - margin, y + 2)
        y += 8

        // Lignes de données
        pdf.setFont('helvetica', 'normal')
        pdf.setFontSize(9)

        inscrits.forEach((item, index) => {
            if (y > 270) {
                pdf.addPage()
                y = 20
            }
            const { nom, prenoms, telephoneWhatsapp, grade } = item.membre
            const row = [
                String(index + 1),
                nom,
                prenoms,
                telephoneWhatsapp,
                grade,
                ''
            ]
            cols.forEach((c, i) => {
                const val = (row[i] || '').substring(0, 20)
                pdf.text(val, c.x, y)
            })
            // ligne légère sous chaque ligne
            pdf.setDrawColor(220, 220, 220)
            pdf.line(margin, y + 3, pageW - margin, y + 3)
            y += 9
        })

        pdf.save(`presence-${selectedTraversee.lienUnique}.pdf`)
    }

    const formDialogContent = (isEdit: boolean) => (
        <DialogContent className="max-w-lg">
            <DialogHeader>
                <DialogTitle>{isEdit ? 'Modifier la traversée' : 'Nouvelle traversée'}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-2">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Titre *</label>
                    <Input
                        value={formData.titre}
                        onChange={e => handleTitreChange(e.target.value)}
                        placeholder="Ex: Sortie forêt de Toho"
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Description *</label>
                    <textarea
                        value={formData.description}
                        onChange={e => setFormData(prev => ({ ...prev, description: e.target.value }))}
                        placeholder="Description de l'événement..."
                        rows={3}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent resize-none"
                    />
                </div>
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Date & heure *</label>
                        <Input
                            type="datetime-local"
                            value={formData.date}
                            onChange={e => setFormData(prev => ({ ...prev, date: e.target.value }))}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Lieu *</label>
                        <Input
                            value={formData.lieu}
                            onChange={e => setFormData(prev => ({ ...prev, lieu: e.target.value }))}
                            placeholder="Ex: Forêt de Toho"
                        />
                    </div>
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Lien unique (slug) *</label>
                    <div className="flex items-center gap-2">
                        <span className="text-sm text-gray-500 whitespace-nowrap">/traversee/</span>
                        <Input
                            value={formData.lienUnique}
                            onChange={e => setFormData(prev => ({ ...prev, lienUnique: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '') }))}
                            placeholder="sortie-foret-toho"
                        />
                    </div>
                    <p className="text-xs text-gray-400 mt-1">Lettres minuscules, chiffres et tirets uniquement</p>
                </div>
            </div>
            <DialogFooter>
                <Button variant="outline" onClick={() => isEdit ? setShowEditModal(false) : setShowAddModal(false)}>
                    Annuler
                </Button>
                <Button
                    onClick={() => handleSubmit(isEdit)}
                    disabled={submitting}
                    className="bg-gray-900 hover:bg-gray-700 text-white"
                >
                    {submitting ? 'En cours...' : isEdit ? 'Enregistrer' : 'Créer'}
                </Button>
            </DialogFooter>
        </DialogContent>
    )

    return (
        <div className="h-screen bg-gray-50 flex overflow-hidden">
            <AdminSidebar activeTab={activeTab} onTabChange={setActiveTab} onLogout={handleLogout} />

            <div className="flex-1 flex flex-col lg:ml-64 overflow-hidden">
                {/* Header */}
                <div className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <Compass className="w-6 h-6 text-gray-700" />
                        <div>
                            <h1 className="text-xl font-bold text-gray-900">Traversées</h1>
                            <p className="text-sm text-gray-500">{traversees.length} événement(s)</p>
                        </div>
                    </div>
                    <Button onClick={handleAdd} className="bg-gray-900 hover:bg-gray-700 text-white gap-2">
                        <Plus className="w-4 h-4" />
                        Nouvelle traversée
                    </Button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-auto p-6">
                    {loading ? (
                        <div className="flex justify-center items-center h-64">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900" />
                        </div>
                    ) : traversees.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-64 text-gray-500">
                            <Compass className="w-16 h-16 text-gray-300 mb-4" />
                            <p className="text-lg font-medium">Aucune traversée</p>
                            <p className="text-sm">Créez votre première traversée pour commencer</p>
                            <Button onClick={handleAdd} className="mt-4 bg-gray-900 hover:bg-gray-700 text-white">
                                <Plus className="w-4 h-4 mr-2" /> Créer une traversée
                            </Button>
                        </div>
                    ) : (
                        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                            <Table>
                                <TableHeader>
                                    <TableRow className="bg-gray-50">
                                        <TableHead className="font-semibold">Titre</TableHead>
                                        <TableHead className="font-semibold">Date</TableHead>
                                        <TableHead className="font-semibold">Lieu</TableHead>
                                        <TableHead className="font-semibold text-center">Inscrits</TableHead>
                                        <TableHead className="font-semibold">Lien partageable</TableHead>
                                        <TableHead className="font-semibold text-right">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {traversees.map(t => (
                                        <TableRow key={t.id} className="hover:bg-gray-50">
                                            <TableCell className="font-medium max-w-[200px]">
                                                <p className="truncate">{t.titre}</p>
                                            </TableCell>
                                            <TableCell className="text-sm text-gray-600 whitespace-nowrap">
                                                <div className="flex items-center gap-1">
                                                    <Calendar className="w-3 h-3" />
                                                    {formatDate(t.date)}
                                                </div>
                                            </TableCell>
                                            <TableCell className="text-sm text-gray-600">
                                                <div className="flex items-center gap-1">
                                                    <MapPin className="w-3 h-3" />
                                                    {t.lieu}
                                                </div>
                                            </TableCell>
                                            <TableCell className="text-center">
                                                <Badge variant="secondary" className="gap-1">
                                                    <Users className="w-3 h-3" />
                                                    {t._count.inscriptions}
                                                </Badge>
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex items-center gap-2">
                                                    <code className="text-xs bg-gray-100 px-2 py-1 rounded text-gray-600 max-w-[180px] truncate block">
                                                        /traversee/{t.lienUnique}
                                                    </code>
                                                    <button
                                                        onClick={() => handleCopyLink(t.lienUnique)}
                                                        className="text-gray-400 hover:text-gray-700 flex-shrink-0"
                                                        title="Copier le lien"
                                                    >
                                                        <Copy className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <div className="flex items-center justify-end gap-1">
                                                    <button
                                                        onClick={() => handleViewInscrits(t)}
                                                        className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
                                                        title="Voir les inscrits"
                                                    >
                                                        <Eye className="w-4 h-4" />
                                                    </button>
                                                    <button
                                                        onClick={() => handleEdit(t)}
                                                        className="p-1.5 text-gray-600 hover:bg-gray-50 rounded-md transition-colors"
                                                        title="Modifier"
                                                    >
                                                        <Edit className="w-4 h-4" />
                                                    </button>
                                                    <button
                                                        onClick={() => { setSelectedTraversee(t); setShowDeleteModal(true) }}
                                                        className="p-1.5 text-red-600 hover:bg-red-50 rounded-md transition-colors"
                                                        title="Supprimer"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>
                    )}
                </div>
            </div>

            {/* Add Modal */}
            <Dialog open={showAddModal} onOpenChange={setShowAddModal}>
                {formDialogContent(false)}
            </Dialog>

            {/* Edit Modal */}
            <Dialog open={showEditModal} onOpenChange={setShowEditModal}>
                {formDialogContent(true)}
            </Dialog>

            {/* Delete Modal */}
            <Dialog open={showDeleteModal} onOpenChange={setShowDeleteModal}>
                <DialogContent className="max-w-sm">
                    <DialogHeader>
                        <DialogTitle>Supprimer la traversée</DialogTitle>
                    </DialogHeader>
                    <p className="text-sm text-gray-600 py-2">
                        Êtes-vous sûr de vouloir supprimer <strong>"{selectedTraversee?.titre}"</strong> ?
                        Toutes les inscriptions associées seront également supprimées.
                    </p>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setShowDeleteModal(false)}>Annuler</Button>
                        <Button
                            onClick={handleDeleteConfirm}
                            disabled={submitting}
                            className="bg-red-600 hover:bg-red-700 text-white"
                        >
                            {submitting ? 'Suppression...' : 'Supprimer'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Inscrits Modal */}
            <Dialog open={showInscritsModal} onOpenChange={setShowInscritsModal}>
                <DialogContent className="max-w-4xl max-h-[85vh] flex flex-col">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <Users className="w-5 h-5" />
                            Inscrits — {selectedTraversee?.titre}
                        </DialogTitle>
                        {selectedTraversee && (
                            <p className="text-sm text-gray-500">
                                {formatDate(selectedTraversee.date)} · {selectedTraversee.lieu}
                            </p>
                        )}
                    </DialogHeader>

                    {/* Export buttons */}
                    <div className="flex items-center justify-between border-b pb-3">
                        <p className="text-sm text-gray-600">
                            {loadingInscrits ? 'Chargement...' : `${inscrits.length} inscrit(s)`}
                        </p>
                        {inscrits.length > 0 && (
                            <div className="flex gap-2">
                                <Button onClick={exportToTxt} variant="outline" size="sm" className="gap-2">
                                    <FileText className="w-4 h-4" />
                                    Export TXT
                                </Button>
                                <Button onClick={exportToPDF} variant="outline" size="sm" className="gap-2">
                                    <Download className="w-4 h-4" />
                                    Export PDF
                                </Button>
                            </div>
                        )}
                    </div>

                    {/* Table */}
                    <div className="flex-1 overflow-auto">
                        {loadingInscrits ? (
                            <div className="flex justify-center items-center h-32">
                                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-gray-900" />
                            </div>
                        ) : inscrits.length === 0 ? (
                            <div className="flex flex-col items-center justify-center h-32 text-gray-400">
                                <Users className="w-10 h-10 mb-2" />
                                <p className="text-sm">Aucun inscrit pour le moment</p>
                            </div>
                        ) : (
                            <Table>
                                <TableHeader>
                                    <TableRow className="bg-gray-50">
                                        <TableHead className="w-12">N°</TableHead>
                                        <TableHead>Nom</TableHead>
                                        <TableHead>Prénom(s)</TableHead>
                                        <TableHead>Téléphone</TableHead>
                                        <TableHead>Grade</TableHead>
                                        <TableHead>Inscrit le</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {inscrits.map((item, index) => (
                                        <TableRow key={item.id}>
                                            <TableCell className="text-gray-500 text-sm">{index + 1}</TableCell>
                                            <TableCell className="font-medium">{item.membre.nom}</TableCell>
                                            <TableCell>{item.membre.prenoms}</TableCell>
                                            <TableCell className="text-sm text-gray-600">{item.membre.telephoneWhatsapp}</TableCell>
                                            <TableCell>
                                                <Badge className={`text-xs ${GRADE_COLORS[item.membre.grade] || 'bg-gray-100 text-gray-700'}`}>
                                                    {item.membre.grade}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="text-sm text-gray-500">
                                                {formatDateTime(item.createdAt)}
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        )}
                    </div>
                </DialogContent>
            </Dialog>

            <ToastContainer toasts={toasts} removeToast={removeToast} />
        </div>
    )
}
