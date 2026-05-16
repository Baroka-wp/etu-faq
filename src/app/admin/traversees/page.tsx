'use client'

import { useState, useEffect, useCallback } from 'react'
import {
    Compass, Plus, Trash2, Download, FileText, Edit, Copy,
    Calendar, MapPin, Users, List, ChevronLeft, ChevronRight, Clock
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

// ── Types d'événements ──────────────────────────────────────────────────────
const EVENT_TYPES = [
    'Traversée Grand Navire',
    'Traversée Équipage',
    "Traversée d'Initiation",
    'Cours de Grade',
    'Cours',
    'Agape',
    'Rencontre',
] as const

const TYPE_BADGE_COLORS: Record<string, string> = {
    'Traversée Grand Navire':   'bg-blue-100 text-blue-800',
    'Traversée Équipage':       'bg-sky-100 text-sky-800',
    "Traversée d'Initiation":   'bg-emerald-100 text-emerald-800',
    'Cours de Grade':           'bg-purple-100 text-purple-800',
    'Cours':                    'bg-indigo-100 text-indigo-800',
    'Agape':                    'bg-orange-100 text-orange-800',
    'Rencontre':                'bg-pink-100 text-pink-800',
}

const TYPE_CALENDAR_COLORS: Record<string, string> = {
    'Traversée Grand Navire':   'bg-blue-700 hover:bg-blue-800',
    'Traversée Équipage':       'bg-sky-600 hover:bg-sky-700',
    "Traversée d'Initiation":   'bg-emerald-600 hover:bg-emerald-700',
    'Cours de Grade':           'bg-purple-700 hover:bg-purple-800',
    'Cours':                    'bg-indigo-600 hover:bg-indigo-700',
    'Agape':                    'bg-orange-500 hover:bg-orange-600',
    'Rencontre':                'bg-pink-600 hover:bg-pink-700',
}

// ── Interfaces ───────────────────────────────────────────────────────────────
const ALL_GRADES = ['Explorateur', 'Constructeur', 'Navigateur', 'Alchimiste'] as const

interface Planification {
    id: string
    type: string
    titre: string
    description: string
    date: string
    lieu: string
    lienUnique: string
    gradesAutorises: string[]
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
    Explorateur:  'bg-green-100 text-green-800',
    Constructeur: 'bg-blue-100 text-blue-800',
    Navigateur:   'bg-purple-100 text-purple-800',
    Alchimiste:   'bg-yellow-100 text-yellow-800',
}

function gradesLabel(gradesAutorises: string[]): string {
    if (gradesAutorises.length === 0 || gradesAutorises.length === 4) return 'Tous'
    if (gradesAutorises.length === 1 && gradesAutorises[0] === 'Alchimiste') return 'Alchimiste uniquement'
    return gradesAutorises.join(', ')
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

function formatTime(dateStr: string) {
    return new Date(dateStr).toLocaleTimeString('fr-FR', {
        hour: '2-digit', minute: '2-digit'
    })
}

// ── Page ─────────────────────────────────────────────────────────────────────
export default function PlanificationsPage() {
    const [activeTab, setActiveTab] = useState('traversees')
    const [planifications, setPlanifications] = useState<Planification[]>([])
    const [loading, setLoading] = useState(true)
    const [showAddModal, setShowAddModal] = useState(false)
    const [showEditModal, setShowEditModal] = useState(false)
    const [showDeleteModal, setShowDeleteModal] = useState(false)
    const [showInscritsModal, setShowInscritsModal] = useState(false)
    const [showDangerZone, setShowDangerZone] = useState(false)
    const [selected, setSelected] = useState<Planification | null>(null)
    const [inscrits, setInscrits] = useState<InscritItem[]>([])
    const [loadingInscrits, setLoadingInscrits] = useState(false)
    const [viewMode, setViewMode] = useState<'list' | 'calendar'>('list')
    const [calendarDate, setCalendarDate] = useState(() => {
        const now = new Date()
        return new Date(now.getFullYear(), now.getMonth(), 1)
    })
    const [filterPeriod, setFilterPeriod] = useState<'all' | 'upcoming' | 'thisMonth' | 'lastMonth' | 'past'>('all')
    const [hoveredEvent, setHoveredEvent] = useState<Planification | null>(null)
    const [tooltipPos, setTooltipPos] = useState({ x: 0, y: 0 })
    const [submitting, setSubmitting] = useState(false)
    const [formData, setFormData] = useState({
        type: EVENT_TYPES[0] as string,
        titre: '', description: '', date: '', lieu: '', lienUnique: '',
        gradesAutorises: [...ALL_GRADES] as string[]
    })
    const router = useRouter()
    const { toasts, addToast, removeToast } = useToast()

    const fetchPlanifications = useCallback(async () => {
        setLoading(true)
        try {
            const res = await fetch('/api/admin/traversees')
            if (res.status === 401) { router.push('/admin-login'); return }
            const data = await res.json()
            if (data.success) setPlanifications(data.data)
        } catch {
            addToast({ type: 'error', title: 'Erreur', message: 'Impossible de charger les planifications' })
        } finally {
            setLoading(false)
        }
    }, [router]) // eslint-disable-line react-hooks/exhaustive-deps

    useEffect(() => { fetchPlanifications() }, [fetchPlanifications])

    const handleLogout = async () => {
        await fetch('/api/auth/logout', { method: 'POST' })
        router.push('/admin-login')
    }

    const resetForm = () => setFormData({ type: EVENT_TYPES[0], titre: '', description: '', date: '', lieu: '', lienUnique: '', gradesAutorises: [...ALL_GRADES] })

    const handleTitreChange = (titre: string) => {
        setFormData(prev => ({ ...prev, titre, lienUnique: slugify(titre) }))
    }

    const handleAdd = () => {
        resetForm()
        setShowAddModal(true)
    }

    const handleAddOnDate = (year: number, month: number, day: number) => {
        resetForm()
        const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}T12:00`
        setFormData(prev => ({ ...prev, date: dateStr }))
        setShowAddModal(true)
    }

    const toggleGrade = (grade: string) => {
        setFormData(prev => ({
            ...prev,
            gradesAutorises: prev.gradesAutorises.includes(grade)
                ? prev.gradesAutorises.filter(g => g !== grade)
                : [...prev.gradesAutorises, grade]
        }))
    }

    const handleEdit = (p: Planification) => {
        const dateLocal = new Date(p.date).toISOString().slice(0, 16)
        setFormData({
            type: p.type || EVENT_TYPES[0],
            titre: p.titre,
            description: p.description,
            date: dateLocal,
            lieu: p.lieu,
            lienUnique: p.lienUnique,
            gradesAutorises: p.gradesAutorises.length > 0 ? p.gradesAutorises : [...ALL_GRADES]
        })
        setSelected(p)
        setShowEditModal(true)
    }

    const handleSubmit = async (isEdit: boolean) => {
        if (!formData.titre || !formData.description || !formData.date || !formData.lieu || !formData.lienUnique) {
            addToast({ type: 'error', title: 'Erreur', message: 'Tous les champs sont obligatoires' })
            return
        }
        setSubmitting(true)
        try {
            const url = isEdit ? `/api/admin/traversees/${selected!.id}` : '/api/admin/traversees'
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
                    title: isEdit ? 'Planification modifiée' : 'Planification créée',
                    message: `"${formData.titre}" a été ${isEdit ? 'modifiée' : 'créée'} avec succès`
                })
                setShowAddModal(false)
                setShowEditModal(false)
                fetchPlanifications()
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
        if (!selected) return
        setSubmitting(true)
        try {
            const res = await fetch(`/api/admin/traversees/${selected.id}`, { method: 'DELETE' })
            const data = await res.json()
            if (data.success) {
                addToast({ type: 'success', title: 'Supprimée', message: `"${selected.titre}" a été supprimée` })
                setShowDeleteModal(false)
                fetchPlanifications()
            } else {
                addToast({ type: 'error', title: 'Erreur', message: data.error })
            }
        } catch {
            addToast({ type: 'error', title: 'Erreur', message: 'Une erreur est survenue' })
        } finally {
            setSubmitting(false)
        }
    }

    const fetchInscritsForTraversee = useCallback(async (traverseeId: string, withLoader = false) => {
        if (withLoader) setLoadingInscrits(true)
        try {
            const res = await fetch(`/api/admin/traversees/${traverseeId}/inscrits`)
            const data = await res.json()
            if (data.success) setInscrits(data.data)
        } catch {
            addToast({ type: 'error', title: 'Erreur', message: 'Impossible de charger les inscrits' })
        } finally {
            if (withLoader) setLoadingInscrits(false)
        }
    }, [addToast])

    const handleViewInscrits = async (p: Planification) => {
        setSelected(p)
        setInscrits([])
        setShowDangerZone(false)
        setShowInscritsModal(true)
        await fetchInscritsForTraversee(p.id, true)
    }

    const handleCopyPublicLink = async () => {
        if (!selected?.lienUnique) return
        const url = `${window.location.origin}/traversee/${selected.lienUnique}`
        try {
            await navigator.clipboard.writeText(url)
            addToast({ type: 'success', title: 'Lien copié', message: url })
        } catch {
            addToast({ type: 'error', title: 'Erreur', message: 'Impossible de copier le lien' })
        }
    }

    useEffect(() => {
        if (!showInscritsModal || !selected?.id) return

        const intervalId = setInterval(() => {
            fetchInscritsForTraversee(selected.id)
        }, 8000)

        return () => clearInterval(intervalId)
    }, [showInscritsModal, selected?.id, fetchInscritsForTraversee])

    // ── Filtres ──────────────────────────────────────────────────────────────
    const filteredList = planifications.filter(p => {
        const d = new Date(p.date)
        const now = new Date()
        const startOfThisMonth = new Date(now.getFullYear(), now.getMonth(), 1)
        const endOfThisMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59)
        const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1)
        const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59)
        switch (filterPeriod) {
            case 'upcoming':  return d >= now
            case 'thisMonth': return d >= startOfThisMonth && d <= endOfThisMonth
            case 'lastMonth': return d >= startOfLastMonth && d <= endOfLastMonth
            case 'past':      return d < now
            default:          return true
        }
    })

    const filterLabel = () => {
        const now = new Date()
        const fmt = (d: Date) => d.toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })
        const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1)
        switch (filterPeriod) {
            case 'upcoming':  return 'Événements à venir'
            case 'thisMonth': return `Programme — ${fmt(now)}`
            case 'lastMonth': return `Programme — ${fmt(lastMonth)}`
            case 'past':      return 'Événements passés'
            default:          return 'Tous les événements'
        }
    }

    // ── Export ICS ───────────────────────────────────────────────────────────
    const toICSDate = (dateStr: string) =>
        new Date(dateStr).toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '')

    const exportICS = (list: typeof planifications) => {
        if (list.length === 0) return
        const lines = [
            'BEGIN:VCALENDAR', 'VERSION:2.0',
            'PRODID:-//ETU//Planifications//FR',
            'CALSCALE:GREGORIAN', 'METHOD:PUBLISH',
        ]
        list.forEach(p => {
            const start = toICSDate(p.date)
            const end = toICSDate(new Date(new Date(p.date).getTime() + 2 * 60 * 60 * 1000).toISOString())
            const desc = p.description.replace(/\n/g, '\\n').replace(/,/g, '\\,')
            lines.push(
                'BEGIN:VEVENT',
                `UID:${p.id}@etufaq`,
                `DTSTAMP:${toICSDate(new Date().toISOString())}`,
                `DTSTART:${start}`,
                `DTEND:${end}`,
                `SUMMARY:${p.type} — ${p.titre}`,
                `DESCRIPTION:${desc}`,
                `LOCATION:${p.lieu}`,
                'END:VEVENT',
            )
        })
        lines.push('END:VCALENDAR')
        const blob = new Blob([lines.join('\r\n')], { type: 'text/calendar; charset=utf-8' })
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url; a.download = 'planifications-etu.ics'
        document.body.appendChild(a); a.click()
        document.body.removeChild(a); window.URL.revokeObjectURL(url)
    }

    // ── Export Programme PDF ─────────────────────────────────────────────────
    const exportProgramme = () => {
        if (filteredList.length === 0) return
        const pdf = new jsPDF('p', 'mm', 'a4')
        const margin = 15
        const pageW = 210

        pdf.setFontSize(14)
        pdf.setFont('helvetica', 'bold')
        pdf.text('PROGRAMME DE PLANIFICATION', margin, 20)

        pdf.setFontSize(10)
        pdf.setFont('helvetica', 'normal')
        pdf.setTextColor(100, 100, 100)
        pdf.text(filterLabel(), margin, 27)
        pdf.text(`Généré le ${new Date().toLocaleDateString('fr-FR')}`, margin, 33)

        pdf.setDrawColor(180, 180, 180)
        pdf.line(margin, 38, pageW - margin, 38)

        const cols = [
            { label: 'TYPE',         x: margin },
            { label: 'DATE & HEURE', x: margin + 50 },
            { label: 'TITRE',        x: margin + 90 },
            { label: 'LIEU',         x: margin + 148 },
        ]

        let y = 45
        pdf.setFontSize(8)
        pdf.setFont('helvetica', 'bold')
        pdf.setTextColor(0, 0, 0)
        cols.forEach(c => pdf.text(c.label, c.x, y))
        pdf.setDrawColor(150, 150, 150)
        pdf.line(margin, y + 2, pageW - margin, y + 2)
        y += 8

        const sorted = [...filteredList].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())

        pdf.setFont('helvetica', 'normal')
        pdf.setFontSize(9)
        sorted.forEach(p => {
            if (y > 270) { pdf.addPage(); y = 20 }
            const d = new Date(p.date)
            const dateStr = d.toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' })
            const timeStr = d.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })
            pdf.text((p.type || '').substring(0, 24), margin, y)
            pdf.text(`${dateStr} · ${timeStr}`, margin + 50, y)
            pdf.text((p.titre || '').substring(0, 28), margin + 90, y)
            pdf.text((p.lieu || '').substring(0, 20), margin + 148, y)
            pdf.setDrawColor(220, 220, 220)
            pdf.line(margin, y + 3, pageW - margin, y + 3)
            y += 9
        })

        pdf.save('programme-planification.pdf')
    }

    // ── Export TXT inscrits ──────────────────────────────────────────────────
    const exportToTxt = () => {
        if (!selected) return
        let content = `LISTE D'EMBARQUEMENT\n`
        content += `Type      : ${selected.type}\n`
        content += `Événement : ${selected.titre}\n`
        content += `Date      : ${formatDate(selected.date)}\n`
        content += `Lieu      : ${selected.lieu}\n`
        content += `Inscrits  : ${inscrits.length}\n`
        content += `${'='.repeat(120)}\n\n`
        content += `N°\tNOM\t\tPRÉNOM(S)\t\tNOM SACRÉ\t\tTÉLÉPHONE\t\tGRADE\t\tSIGNATURE\n`
        content += `${'-'.repeat(120)}\n`
        inscrits.forEach((item, index) => {
            const { nom, prenoms, nomSacre, telephoneWhatsapp, grade } = item.membre
            content += `${index + 1}\t${nom}\t\t${prenoms}\t\t${nomSacre || '—'}\t\t${telephoneWhatsapp}\t\t${grade}\t\t\n`
        })
        const blob = new Blob([content], { type: 'text/plain; charset=utf-8' })
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url; a.download = `presence-${selected.lienUnique}.txt`
        document.body.appendChild(a); a.click()
        document.body.removeChild(a); window.URL.revokeObjectURL(url)
    }

    // ── Export PDF inscrits ──────────────────────────────────────────────────
    const exportToPDF = () => {
        if (!selected) return
        const pdf = new jsPDF('l', 'mm', 'a4')
        const margin = 15
        const pageW = 297
        const pageBreakY = 195

        pdf.setFontSize(14)
        pdf.setFont('helvetica', 'bold')
        pdf.text("LISTE D'EMBARQUEMENT", margin, 20)

        pdf.setFontSize(10)
        pdf.setFont('helvetica', 'normal')
        pdf.text(`${selected.titre}`, margin, 28)
        pdf.setFontSize(9)
        pdf.setTextColor(100, 100, 100)
        pdf.text(`${selected.type}  ·  ${formatDate(selected.date)}  —  ${selected.lieu}`, margin, 34)

        pdf.setDrawColor(180, 180, 180)
        pdf.line(margin, 39, pageW - margin, 39)

        const cols = [
            { label: 'N°',         x: margin,      maxLen: 4 },
            { label: 'Nom',        x: margin + 12, maxLen: 32 },
            { label: 'Prénom(s)',  x: margin + 52, maxLen: 32 },
            { label: 'Nom sacré',  x: margin + 98, maxLen: 28 },
            { label: 'Téléphone',  x: margin + 138, maxLen: 24 },
            { label: 'Grade',      x: margin + 178, maxLen: 22 },
            { label: 'Signature',  x: margin + 228, maxLen: 0 },
        ]

        let y = 46
        pdf.setFontSize(8)
        pdf.setFont('helvetica', 'bold')
        pdf.setTextColor(0, 0, 0)
        cols.forEach(c => pdf.text(c.label, c.x, y))
        pdf.setDrawColor(150, 150, 150)
        pdf.line(margin, y + 2, pageW - margin, y + 2)
        y += 8

        pdf.setFont('helvetica', 'normal')
        pdf.setFontSize(9)
        inscrits.forEach((item, index) => {
            if (y > pageBreakY) { pdf.addPage(); y = 20 }
            const { nom, prenoms, nomSacre, telephoneWhatsapp, grade } = item.membre
            const row = [
                String(index + 1),
                nom,
                prenoms,
                nomSacre || '—',
                telephoneWhatsapp,
                grade,
                '',
            ]
            cols.forEach((c, i) => {
                const text = row[i] || ''
                if (c.maxLen > 0) pdf.text(text.substring(0, c.maxLen), c.x, y)
            })
            pdf.setDrawColor(220, 220, 220)
            pdf.line(margin, y + 3, pageW - margin, y + 3)
            y += 9
        })

        pdf.save(`presence-${selected.lienUnique}.pdf`)
    }

    // ── Form dialog ──────────────────────────────────────────────────────────
    const formDialogContent = (isEdit: boolean) => (
        <DialogContent className="max-w-lg">
            <DialogHeader>
                <DialogTitle>{isEdit ? 'Modifier la planification' : 'Nouvelle planification'}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-2">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Type d'événement *</label>
                    <select
                        value={formData.type}
                        onChange={e => setFormData(prev => ({ ...prev, type: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent bg-white"
                    >
                        {EVENT_TYPES.map(t => (
                            <option key={t} value={t}>{t}</option>
                        ))}
                    </select>
                </div>
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
                    <label className="block text-sm font-medium text-gray-700 mb-1">Accès par grade *</label>
                    <div className="flex flex-wrap gap-2 mt-1">
                        {ALL_GRADES.map(grade => {
                            const checked = formData.gradesAutorises.includes(grade)
                            return (
                                <button
                                    key={grade}
                                    type="button"
                                    onClick={() => toggleGrade(grade)}
                                    className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${
                                        checked
                                            ? `${TYPE_BADGE_COLORS[grade] || 'bg-gray-200 text-gray-800'} border-transparent`
                                            : 'bg-white text-gray-400 border-gray-200 hover:border-gray-400'
                                    }`}
                                >
                                    {checked ? '✓ ' : ''}{grade}
                                </button>
                            )
                        })}
                    </div>
                    <p className="text-xs text-gray-400 mt-1">
                        Alchimistes ont toujours accès. Sélectionnez les grades autorisés à s'inscrire.
                    </p>
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
                <Button variant="outline" onClick={() => (isEdit ? setShowEditModal(false) : setShowAddModal(false))}>
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

    // ── Render ───────────────────────────────────────────────────────────────
    return (
        <div className="h-screen bg-gray-50 flex overflow-hidden">
            <AdminSidebar activeTab={activeTab} onTabChange={setActiveTab} onLogout={handleLogout} />

            <div className="flex-1 flex flex-col lg:ml-64 overflow-hidden">
                {/* Header */}
                <div className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <Compass className="w-6 h-6 text-gray-700" />
                        <div>
                            <h1 className="text-xl font-bold text-gray-900">Planifications</h1>
                            <p className="text-sm text-gray-500">{planifications.length} événement(s)</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <div className="flex items-center border border-gray-200 rounded-lg overflow-hidden">
                            <button
                                onClick={() => setViewMode('list')}
                                className={`px-3 py-1.5 flex items-center gap-1.5 text-sm transition-colors ${viewMode === 'list' ? 'bg-gray-900 text-white' : 'text-gray-600 hover:bg-gray-50'}`}
                            >
                                <List className="w-4 h-4" /> Liste
                            </button>
                            <button
                                onClick={() => setViewMode('calendar')}
                                className={`px-3 py-1.5 flex items-center gap-1.5 text-sm transition-colors ${viewMode === 'calendar' ? 'bg-gray-900 text-white' : 'text-gray-600 hover:bg-gray-50'}`}
                            >
                                <Calendar className="w-4 h-4" /> Calendrier
                            </button>
                        </div>
                        <Button onClick={handleAdd} className="bg-gray-900 hover:bg-gray-700 text-white gap-2">
                            <Plus className="w-4 h-4" />
                            Nouvelle planification
                        </Button>
                    </div>
                </div>

                {/* Filtres + exports */}
                <div className="bg-white border-b border-gray-100 px-6 py-2 flex items-center justify-between gap-4">
                    <div className="flex items-center gap-1">
                        {([
                            { key: 'all',       label: 'Tous' },
                            { key: 'upcoming',  label: 'À venir' },
                            { key: 'thisMonth', label: 'Ce mois' },
                            { key: 'lastMonth', label: 'Mois dernier' },
                            { key: 'past',      label: 'Passés' },
                        ] as const).map(f => (
                            <button
                                key={f.key}
                                onClick={() => setFilterPeriod(f.key)}
                                className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${filterPeriod === f.key ? 'bg-gray-900 text-white' : 'text-gray-500 hover:bg-gray-100'}`}
                            >
                                {f.label}
                                {f.key !== 'all' && filterPeriod === f.key && filteredList.length > 0 &&
                                    <span className="ml-1 opacity-70">({filteredList.length})</span>
                                }
                            </button>
                        ))}
                    </div>
                    <div className="flex items-center gap-3">
                        <button
                            onClick={exportProgramme}
                            disabled={filteredList.length === 0}
                            className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-gray-900 disabled:opacity-30 transition-colors"
                            title="Exporter le programme en PDF"
                        >
                            <FileText className="w-3.5 h-3.5" />
                            Programme PDF
                        </button>
                        <button
                            onClick={() => exportICS(filteredList)}
                            disabled={filteredList.length === 0}
                            className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-gray-900 disabled:opacity-30 transition-colors"
                            title="Ajouter les événements à votre calendrier"
                        >
                            <Calendar className="w-3.5 h-3.5" />
                            Export .ics
                        </button>
                    </div>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-auto p-6">
                    {loading ? (
                        <div className="flex justify-center items-center h-64">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900" />
                        </div>
                    ) : filteredList.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-64 text-gray-500">
                            <Compass className="w-16 h-16 text-gray-300 mb-4" />
                            <p className="text-lg font-medium">
                                {planifications.length === 0 ? 'Aucune planification' : 'Aucun événement pour ce filtre'}
                            </p>
                            <p className="text-sm">
                                {planifications.length === 0 ? 'Créez votre première planification pour commencer' : 'Essayez un autre filtre de période'}
                            </p>
                            {planifications.length === 0 && (
                                <Button onClick={handleAdd} className="mt-4 bg-gray-900 hover:bg-gray-700 text-white">
                                    <Plus className="w-4 h-4 mr-2" /> Créer une planification
                                </Button>
                            )}
                        </div>
                    ) : viewMode === 'list' ? (
                        /* ── VUE LISTE ── */
                        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                            <Table>
                                <TableHeader>
                                    <TableRow className="bg-gray-50">
                                        <TableHead className="font-semibold">Type</TableHead>
                                        <TableHead className="font-semibold">Titre</TableHead>
                                        <TableHead className="font-semibold">Date</TableHead>
                                        <TableHead className="font-semibold">Lieu</TableHead>
                                        <TableHead className="font-semibold">Grades</TableHead>
                                        <TableHead className="font-semibold text-center">Inscrits</TableHead>
                                        <TableHead className="font-semibold">Lien</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {filteredList.map(p => (
                                        <TableRow
                                            key={p.id}
                                            className="hover:bg-gray-50 cursor-pointer"
                                            onClick={() => handleViewInscrits(p)}
                                        >
                                            <TableCell>
                                                <Badge className={`text-xs whitespace-nowrap ${TYPE_BADGE_COLORS[p.type] || 'bg-gray-100 text-gray-700'}`}>
                                                    {p.type}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="font-medium max-w-[160px]">
                                                <p className="truncate">{p.titre}</p>
                                            </TableCell>
                                            <TableCell className="text-sm text-gray-600 whitespace-nowrap">
                                                <div className="flex items-center gap-1">
                                                    <Calendar className="w-3 h-3" />
                                                    {formatDate(p.date)}
                                                </div>
                                            </TableCell>
                                            <TableCell className="text-sm text-gray-600">
                                                <div className="flex items-center gap-1">
                                                    <MapPin className="w-3 h-3" />
                                                    {p.lieu}
                                                </div>
                                            </TableCell>
                                            <TableCell className="text-sm text-gray-600">
                                                <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                                                    p.gradesAutorises.length === 4 || p.gradesAutorises.length === 0
                                                        ? 'bg-gray-100 text-gray-600'
                                                        : 'bg-amber-100 text-amber-800'
                                                }`}>
                                                    {gradesLabel(p.gradesAutorises)}
                                                </span>
                                            </TableCell>
                                            <TableCell className="text-center">
                                                <Badge variant="secondary" className="gap-1">
                                                    <Users className="w-3 h-3" />
                                                    {p._count.inscriptions}
                                                </Badge>
                                            </TableCell>
                                            <TableCell>
                                                <code className="text-xs bg-gray-100 px-2 py-1 rounded text-gray-600 max-w-[150px] truncate block">
                                                    /traversee/{p.lienUnique}
                                                </code>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>
                    ) : (
                        /* ── VUE CALENDRIER ── */
                        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                            {/* Navigation mois */}
                            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
                                <button
                                    onClick={() => setCalendarDate(d => new Date(d.getFullYear(), d.getMonth() - 1, 1))}
                                    className="p-1.5 hover:bg-gray-100 rounded-md transition-colors"
                                >
                                    <ChevronLeft className="w-5 h-5 text-gray-600" />
                                </button>
                                <h2 className="text-base font-semibold text-gray-900 capitalize">
                                    {calendarDate.toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })}
                                </h2>
                                <button
                                    onClick={() => setCalendarDate(d => new Date(d.getFullYear(), d.getMonth() + 1, 1))}
                                    className="p-1.5 hover:bg-gray-100 rounded-md transition-colors"
                                >
                                    <ChevronRight className="w-5 h-5 text-gray-600" />
                                </button>
                            </div>

                            {/* Légende types */}
                            <div className="px-6 py-2 border-b border-gray-100 flex flex-wrap gap-2">
                                {EVENT_TYPES.map(t => (
                                    <span key={t} className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${TYPE_BADGE_COLORS[t] || 'bg-gray-100 text-gray-700'}`}>
                                        {t}
                                    </span>
                                ))}
                            </div>

                            {/* Grille calendrier */}
                            {(() => {
                                const year = calendarDate.getFullYear()
                                const month = calendarDate.getMonth()
                                const today = new Date()
                                const firstDay = new Date(year, month, 1)
                                const lastDay = new Date(year, month + 1, 0)
                                const startOffset = (firstDay.getDay() + 6) % 7
                                const totalCells = startOffset + lastDay.getDate()
                                const rows = Math.ceil(totalCells / 7)
                                const dayLabels = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim']

                                const byDay: Record<number, Planification[]> = {}
                                planifications.forEach(p => {
                                    const d = new Date(p.date)
                                    if (d.getFullYear() === year && d.getMonth() === month) {
                                        const day = d.getDate()
                                        if (!byDay[day]) byDay[day] = []
                                        byDay[day].push(p)
                                    }
                                })

                                return (
                                    <div>
                                        <div className="grid grid-cols-7 border-b border-gray-100">
                                            {dayLabels.map(d => (
                                                <div key={d} className="py-2 text-center text-xs font-semibold text-gray-400 uppercase tracking-wide">
                                                    {d}
                                                </div>
                                            ))}
                                        </div>
                                        <div className="grid grid-cols-7">
                                            {Array.from({ length: rows * 7 }).map((_, i) => {
                                                const dayNum = i - startOffset + 1
                                                const isValid = dayNum >= 1 && dayNum <= lastDay.getDate()
                                                const isToday = isValid &&
                                                    today.getDate() === dayNum &&
                                                    today.getMonth() === month &&
                                                    today.getFullYear() === year
                                                const events = isValid ? (byDay[dayNum] || []) : []
                                                const isLastRow = i >= (rows - 1) * 7

                                                return (
                                                    <div
                                                        key={i}
                                                        onClick={() => isValid && handleAddOnDate(year, month, dayNum)}
                                                        className={`min-h-[100px] p-2 border-b border-r border-gray-100 transition-colors
                                                            ${!isValid ? 'bg-gray-50' : 'cursor-pointer hover:bg-gray-50'}
                                                            ${isLastRow ? 'border-b-0' : ''}
                                                            ${(i + 1) % 7 === 0 ? 'border-r-0' : ''}
                                                        `}
                                                    >
                                                        {isValid && (
                                                            <>
                                                                <span className={`inline-flex items-center justify-center w-7 h-7 text-sm font-medium rounded-full mb-1
                                                                    ${isToday ? 'bg-gray-900 text-white' : 'text-gray-700'}`}>
                                                                    {dayNum}
                                                                </span>
                                                                <div className="space-y-1">
                                                                    {events.map(p => (
                                                                        <button
                                                                            key={p.id}
                                                                            onClick={e => { e.stopPropagation(); handleViewInscrits(p) }}
                                                                            onMouseEnter={(ev) => {
                                                                                setHoveredEvent(p)
                                                                                const rect = ev.currentTarget.getBoundingClientRect()
                                                                                setTooltipPos({ x: rect.left + rect.width / 2, y: rect.top })
                                                                            }}
                                                                            onMouseLeave={() => setHoveredEvent(null)}
                                                                            className={`w-full text-left px-2 py-1 rounded-md text-white text-xs transition-all truncate cursor-pointer hover:scale-105 hover:shadow-lg ${TYPE_CALENDAR_COLORS[p.type] || 'bg-gray-900 hover:bg-gray-700'}`}
                                                                        >
                                                                            {p.titre}
                                                                        </button>
                                                                    ))}
                                                                </div>
                                                            </>
                                                        )}
                                                    </div>
                                                )
                                            })}
                                        </div>
                                    </div>
                                )
                            })()}
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
                        <DialogTitle>Supprimer la planification</DialogTitle>
                    </DialogHeader>
                    <p className="text-sm text-gray-600 py-2">
                        Êtes-vous sûr de vouloir supprimer <strong>"{selected?.titre}"</strong> ?
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
                <DialogContent className="w-[98vw] sm:w-[98vw] max-w-[98vw] sm:max-w-[98vw] h-[94vh] flex flex-col p-5 sm:p-6">
                    <DialogHeader>
                        <DialogTitle className="flex items-center justify-between gap-3">
                            <span className="flex items-center gap-2">
                            <Users className="w-5 h-5" />
                            Inscrits — {selected?.titre}
                            </span>
                            <button
                                type="button"
                                onClick={handleCopyPublicLink}
                                className="p-1.5 rounded-md text-gray-500 hover:text-gray-900 hover:bg-gray-100 transition-colors"
                                title="Copier le lien d'inscription"
                            >
                                <Copy className="w-4 h-4" />
                            </button>
                        </DialogTitle>
                        {selected && (
                            <div className="space-y-2">
                                <div className="flex items-center gap-2 text-sm text-gray-500">
                                    <Badge className={`text-xs ${TYPE_BADGE_COLORS[selected.type] || 'bg-gray-100 text-gray-700'}`}>
                                        {selected.type}
                                    </Badge>
                                    <span>{formatDate(selected.date)} · {selected.lieu}</span>
                                </div>
                            </div>
                        )}
                    </DialogHeader>

                    <div className="flex items-center justify-between border-b pb-3">
                        <p className="text-sm text-gray-600">
                            {loadingInscrits ? 'Chargement...' : `${inscrits.length} inscrit(s)`}
                        </p>
                        <div className="flex gap-2">
                            {selected && (
                                <Button
                                    onClick={() => {
                                        setShowInscritsModal(false)
                                        handleEdit(selected)
                                    }}
                                    variant="outline"
                                    size="sm"
                                    className="gap-2"
                                >
                                    <Edit className="w-4 h-4" />
                                    Modifier
                                </Button>
                            )}
                            {inscrits.length > 0 && (
                                <>
                                    <Button onClick={exportToTxt} variant="outline" size="sm" className="gap-2">
                                        <FileText className="w-4 h-4" />
                                        Export TXT
                                    </Button>
                                    <Button onClick={exportToPDF} variant="outline" size="sm" className="gap-2">
                                        <Download className="w-4 h-4" />
                                        Export PDF
                                    </Button>
                                </>
                            )}
                        </div>
                    </div>

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
                                        <TableHead>Nom sacré</TableHead>
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
                                            <TableCell className="text-sm text-gray-600">{item.membre.nomSacre || '—'}</TableCell>
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

                    <div className="mt-3 border-t pt-3">
                        <button
                            type="button"
                            onClick={() => setShowDangerZone(v => !v)}
                            className="text-xs text-gray-500 hover:text-gray-700 underline underline-offset-2"
                        >
                            {showDangerZone ? 'Masquer la zone dangereuse' : 'Afficher la zone dangereuse'}
                        </button>
                        {showDangerZone && (
                            <div className="mt-2 rounded-lg border border-red-200 bg-red-50 p-3 flex items-center justify-between gap-3">
                                <p className="text-xs text-red-700">
                                    Action irréversible : supprimer cet événement et toutes ses inscriptions.
                                </p>
                                <Button
                                    variant="destructive"
                                    size="sm"
                                    className="gap-2"
                                    onClick={() => {
                                        setShowInscritsModal(false)
                                        setShowDeleteModal(true)
                                    }}
                                >
                                    <Trash2 className="w-4 h-4" />
                                    Supprimer
                                </Button>
                            </div>
                        )}
                    </div>
                </DialogContent>
            </Dialog>

            {/* Tooltip au survol (calendrier) */}
            {hoveredEvent && (
                <div
                    className="fixed z-50 bg-gray-900 text-white p-3 rounded-lg shadow-xl max-w-sm pointer-events-none transform -translate-x-1/2 -translate-y-full -mt-2"
                    style={{ left: `${tooltipPos.x}px`, top: `${tooltipPos.y}px` }}
                >
                    <div className="text-xs font-semibold text-gray-300 mb-1">{hoveredEvent.type}</div>
                    <div className="font-bold mb-2">{hoveredEvent.titre}</div>
                    <div className="text-xs space-y-1">
                        <div className="flex items-center gap-1.5">
                            <Clock className="w-3 h-3" />
                            {formatDate(hoveredEvent.date)} à {formatTime(hoveredEvent.date)}
                        </div>
                        <div className="flex items-center gap-1.5">
                            <MapPin className="w-3 h-3" />
                            {hoveredEvent.lieu}
                        </div>
                        <div className="flex items-center gap-1.5">
                            <Users className="w-3 h-3" />
                            {hoveredEvent._count.inscriptions} inscrit{hoveredEvent._count.inscriptions > 1 ? 's' : ''}
                        </div>
                    </div>
                    <div className="text-xs text-gray-400 mt-2">Cliquez pour voir les inscrits</div>
                </div>
            )}

            <ToastContainer toasts={toasts} removeToast={removeToast} />
        </div>
    )
}
