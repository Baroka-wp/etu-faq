'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import {
  Calendar, MapPin, List, ChevronLeft, ChevronRight, CheckCircle2,
  Loader2, FileText, RefreshCw, Eye, X, Clock, Users
} from 'lucide-react'
import { useRouter } from 'next/navigation'
import jsPDF from 'jspdf'
import { useToast } from '@/components/Toast'
import { ToastContainer } from '@/components/ToastContainer'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'

// ── Types & Constants ────────────────────────────────────────────────────
const TYPE_BADGE_COLORS: Record<string, string> = {
  'Traversée Grand Navire':   'bg-blue-100 text-blue-800',
  'Traversée Équipage':       'bg-sky-100 text-sky-800',
  "Traversée d'Initiation":   'bg-emerald-100 text-emerald-800',
  'Cours de Grade':           'bg-purple-100 text-purple-800',
  'Cours':                    'bg-indigo-100 text-indigo-800',
  'Instruction':              'bg-purple-100 text-purple-800',
  'Agape':                    'bg-orange-100 text-orange-800',
  'Rencontre':                'bg-pink-100 text-pink-800',
  'Traversée':                'bg-blue-100 text-blue-800',
}

const TYPE_CALENDAR_COLORS: Record<string, string> = {
  'Traversée Grand Navire':   'bg-blue-700 hover:bg-blue-800',
  'Traversée Équipage':       'bg-sky-600 hover:bg-sky-700',
  "Traversée d'Initiation":   'bg-emerald-600 hover:bg-emerald-700',
  'Cours de Grade':           'bg-purple-700 hover:bg-purple-800',
  'Cours':                    'bg-indigo-600 hover:bg-indigo-700',
  'Instruction':              'bg-purple-700 text-purple-800',
  'Agape':                    'bg-orange-500 hover:bg-orange-600',
  'Rencontre':                'bg-pink-600 hover:bg-pink-700',
  'Traversée':                'bg-blue-700 hover:bg-blue-800',
}

interface Evenement {
  id: string
  type: string
  titre: string
  description: string
  date: string
  lieu: string
  gradesAutorises: string[]
  isInscrit: boolean
  _count?: { inscriptions: number }
}

// ── Helpers ──────────────────────────────────────────────────────────────
function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('fr-FR', {
    day: '2-digit', month: 'long', year: 'numeric'
  })
}

function formatTime(dateStr: string) {
  return new Date(dateStr).toLocaleTimeString('fr-FR', {
    hour: '2-digit', minute: '2-digit'
  })
}

function gradesLabel(grades: string[]): string {
  if (grades.length === 0 || grades.length === 4) return 'Tous'
  if (grades.length === 1 && grades[0] === 'Alchimiste') return 'Alchimiste uniquement'
  return grades.join(', ')
}

// ── Main Component ───────────────────────────────────────────────────────
export default function PlanningMembrePage() {
  const [evenements, setEvenements] = useState<Evenement[]>([])
  const [loading, setLoading] = useState(true)
  const [inscribing, setInscribing] = useState<string | null>(null)
  const [viewMode, setViewMode] = useState<'list' | 'calendar'>(() => {
    // Liste par défaut sur mobile, calendrier sur desktop
    if (typeof window !== 'undefined' && window.innerWidth >= 768) {
      return 'calendar'
    }
    return 'list'
  })
  const [calendarDate, setCalendarDate] = useState(() => {
    const now = new Date()
    return new Date(now.getFullYear(), now.getMonth(), 1)
  })
  const [filterPeriod, setFilterPeriod] = useState<'all' | 'upcoming' | 'thisMonth' | 'inscrit'>('upcoming')
  const [selectedEvent, setSelectedEvent] = useState<Evenement | null>(null)
  const [hoveredEvent, setHoveredEvent] = useState<Evenement | null>(null)
  const [tooltipPos, setTooltipPos] = useState({ x: 0, y: 0 })
  const router = useRouter()
  const { toasts, addToast, removeToast } = useToast()
  const fetchingRef = useRef(false)
  const mountedRef = useRef(false)

  const fetchEvenements = useCallback(async (showLoader = true) => {
    // Empêcher les appels multiples simultanés
    if (fetchingRef.current) {
      console.log('⏭️ Fetch déjà en cours, ignoré')
      return
    }

    fetchingRef.current = true
    if (showLoader) setLoading(true)

    try {
      const res = await fetch('/api/membre/planning', {
        cache: 'no-store'
      })
      if (res.status === 401) {
        router.push('/membre/login')
        return
      }
      const data = await res.json()
      if (data.success) {
        setEvenements(data.traversees || [])
      }
    } catch (error) {
      console.error('Erreur chargement planning:', error)
      addToast({
        type: 'error',
        title: 'Erreur',
        message: 'Impossible de charger le planning'
      })
    } finally {
      if (showLoader) setLoading(false)
      fetchingRef.current = false
    }
  }, [router, addToast])

  useEffect(() => {
    // Appeler UNE SEULE FOIS au montage
    if (!mountedRef.current) {
      mountedRef.current = true
      fetchEvenements()
    }
  }, [])

  const handleRefresh = () => {
    fetchEvenements(false)
    addToast({
      type: 'success',
      title: 'Actualisé',
      message: 'Planning mis à jour'
    })
  }

  const handleInscription = async (evenementId: string) => {
    setInscribing(evenementId)
    try {
      const res = await fetch('/api/membre/planning/inscrire', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ traverseeId: evenementId })
      })
      const data = await res.json()
      if (res.ok) {
        addToast({
          type: 'success',
          title: 'Inscription réussie !',
          message: 'Vous êtes maintenant inscrit à cet événement'
        })
        fetchEvenements()
      } else {
        addToast({
          type: 'error',
          title: 'Erreur',
          message: data.error || 'Impossible de s\'inscrire'
        })
      }
    } catch {
      addToast({
        type: 'error',
        title: 'Erreur',
        message: 'Erreur de connexion au serveur'
      })
    } finally {
      setInscribing(null)
    }
  }

  // ── Filtres ──────────────────────────────────────────────────────────
  const filteredList = evenements.filter(e => {
    const d = new Date(e.date)
    const now = new Date()
    const startOfThisMonth = new Date(now.getFullYear(), now.getMonth(), 1)
    const endOfThisMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59)

    switch (filterPeriod) {
      case 'upcoming':  return d >= now
      case 'thisMonth': return d >= startOfThisMonth && d <= endOfThisMonth
      case 'inscrit':   return e.isInscrit
      default:          return true
    }
  })

  const filterLabel = () => {
    const now = new Date()
    const fmt = (d: Date) => d.toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })
    switch (filterPeriod) {
      case 'upcoming':  return 'Événements à venir'
      case 'thisMonth': return `Programme — ${fmt(now)}`
      case 'inscrit':   return 'Mes inscriptions'
      default:          return 'Tous les événements'
    }
  }

  // ── Export ICS ───────────────────────────────────────────────────────
  const toICSDate = (dateStr: string) =>
    new Date(dateStr).toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '')

  const exportICS = (list: typeof evenements) => {
    if (list.length === 0) return
    const lines = [
      'BEGIN:VCALENDAR', 'VERSION:2.0',
      'PRODID:-//ETU//Planning Membre//FR',
      'CALSCALE:GREGORIAN', 'METHOD:PUBLISH',
    ]
    list.forEach(e => {
      const start = toICSDate(e.date)
      const end = toICSDate(new Date(new Date(e.date).getTime() + 2 * 60 * 60 * 1000).toISOString())
      const desc = e.description.replace(/\n/g, '\\n').replace(/,/g, '\\,')
      lines.push(
        'BEGIN:VEVENT',
        `UID:${e.id}@etufaq`,
        `DTSTAMP:${toICSDate(new Date().toISOString())}`,
        `DTSTART:${start}`,
        `DTEND:${end}`,
        `SUMMARY:${e.type} — ${e.titre}`,
        `DESCRIPTION:${desc}`,
        `LOCATION:${e.lieu}`,
        'END:VEVENT',
      )
    })
    lines.push('END:VCALENDAR')
    const blob = new Blob([lines.join('\r\n')], { type: 'text/calendar; charset=utf-8' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'mon-planning-etu.ics'
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    window.URL.revokeObjectURL(url)
  }

  // ── Export PDF ───────────────────────────────────────────────────────
  const exportProgramme = () => {
    if (filteredList.length === 0) return
    const pdf = new jsPDF('p', 'mm', 'a4')
    const margin = 15
    const pageW = 210

    pdf.setFontSize(14)
    pdf.setFont('helvetica', 'bold')
    pdf.text('MON PLANNING', margin, 20)

    pdf.setFontSize(10)
    pdf.setFont('helvetica', 'normal')
    pdf.setTextColor(100, 100, 100)
    pdf.text(filterLabel(), margin, 27)
    pdf.text(`Généré le ${new Date().toLocaleDateString('fr-FR')}`, margin, 33)

    pdf.setDrawColor(180, 180, 180)
    pdf.line(margin, 38, pageW - margin, 38)

    const cols = [
      { label: 'TYPE', x: margin },
      { label: 'DATE & HEURE', x: margin + 45 },
      { label: 'TITRE', x: margin + 85 },
      { label: 'LIEU', x: margin + 140 },
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
    sorted.forEach(e => {
      if (y > 270) { pdf.addPage(); y = 20 }
      const d = new Date(e.date)
      const dateStr = d.toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' })
      const timeStr = d.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })

      // Si inscrit, ajouter un ✓
      if (e.isInscrit) {
        pdf.setTextColor(34, 197, 94) // green
        pdf.text('✓', margin - 5, y)
        pdf.setTextColor(0, 0, 0)
      }

      pdf.text((e.type || '').substring(0, 22), margin, y)
      pdf.text(`${dateStr} · ${timeStr}`, margin + 45, y)
      pdf.text((e.titre || '').substring(0, 26), margin + 85, y)
      pdf.text((e.lieu || '').substring(0, 20), margin + 140, y)
      pdf.setDrawColor(220, 220, 220)
      pdf.line(margin, y + 3, pageW - margin, y + 3)
      y += 9
    })

    pdf.save('mon-planning.pdf')
  }

  // ── Render ───────────────────────────────────────────────────────────
  return (
    <div className="p-4 sm:p-6 lg:p-8">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-serif font-bold text-gray-900 mb-2">Mon Planning</h1>
        <p className="text-gray-600 font-serif">
          {evenements.length} événement(s) accessible(s)
        </p>
      </div>

      {/* Controls - Responsive Toolbar */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 mb-6">
        <div className="flex flex-col gap-4">
          {/* Row 1: View Toggle + Filters */}
          <div className="flex flex-col sm:flex-row sm:items-center gap-3">
            {/* View Toggle */}
            <div className="flex items-center border border-gray-200 rounded-lg overflow-hidden w-fit shrink-0">
              <button
                onClick={() => setViewMode('list')}
                className={`px-3 py-2 flex items-center gap-1.5 text-sm transition-colors ${
                  viewMode === 'list' ? 'bg-gray-900 text-white' : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                <List className="w-4 h-4" />
                <span className="hidden sm:inline">Liste</span>
              </button>
              <button
                onClick={() => setViewMode('calendar')}
                className={`px-3 py-2 flex items-center gap-1.5 text-sm transition-colors ${
                  viewMode === 'calendar' ? 'bg-gray-900 text-white' : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                <Calendar className="w-4 h-4" />
                <span className="hidden sm:inline">Cal.</span>
              </button>
            </div>

            {/* Filters */}
            <div className="flex flex-wrap items-center gap-2 flex-1">
              {([
                { key: 'upcoming',  label: 'À venir' },
                { key: 'thisMonth', label: 'Ce mois' },
                { key: 'inscrit',   label: 'Inscriptions' },
                { key: 'all',       label: 'Tous' },
              ] as const).map(f => (
                <button
                  key={f.key}
                  onClick={() => setFilterPeriod(f.key)}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors whitespace-nowrap ${
                    filterPeriod === f.key
                      ? 'bg-gray-900 text-white'
                      : 'text-gray-500 hover:bg-gray-100'
                  }`}
                >
                  {f.label}
                  {f.key !== 'all' && filterPeriod === f.key && filteredList.length > 0 && (
                    <span className="ml-1 opacity-70">({filteredList.length})</span>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Row 2: Actions */}
          <div className="flex items-center justify-between gap-3 pt-3 border-t border-gray-100">
            <button
              onClick={handleRefresh}
              className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-gray-900 transition-colors"
              title="Actualiser"
            >
              <RefreshCw className="w-4 h-4" />
              <span className="hidden sm:inline">Actualiser</span>
            </button>

            <div className="flex items-center gap-3">
              <button
                onClick={exportProgramme}
                disabled={filteredList.length === 0}
                className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-gray-900 disabled:opacity-30 transition-colors"
                title="Exporter en PDF"
              >
                <FileText className="w-4 h-4" />
                <span className="hidden sm:inline">PDF</span>
              </button>
              <button
                onClick={() => exportICS(filteredList)}
                disabled={filteredList.length === 0}
                className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-gray-900 disabled:opacity-30 transition-colors"
                title="Ajouter à mon calendrier"
              >
                <Calendar className="w-4 h-4" />
                <span className="hidden sm:inline">.ics</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900" />
        </div>
      ) : filteredList.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
          <Calendar className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <p className="text-lg font-medium text-gray-700 mb-1">
            {evenements.length === 0 ? 'Aucun événement programmé' : 'Aucun événement pour ce filtre'}
          </p>
          <p className="text-sm text-gray-500">
            {evenements.length === 0 ? 'Revenez plus tard' : 'Essayez un autre filtre'}
          </p>
        </div>
      ) : viewMode === 'list' ? (
        /* ── VUE LISTE ── */
        <div className="space-y-4">
          {filteredList.map(evenement => (
            <div
              key={evenement.id}
              className={`bg-white rounded-xl shadow-sm border-2 transition-all hover:shadow-md ${
                evenement.isInscrit
                  ? 'border-green-500 bg-green-50/30'
                  : 'border-gray-200'
              }`}
            >
              <div className="p-6">
                {/* Header */}
                <div className="flex justify-between items-start mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <Badge className={`text-xs ${TYPE_BADGE_COLORS[evenement.type] || 'bg-gray-100 text-gray-700'}`}>
                        {evenement.type}
                      </Badge>
                      {gradesLabel(evenement.gradesAutorises) !== 'Tous' && (
                        <span className="text-xs text-gray-500 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
                          {gradesLabel(evenement.gradesAutorises)}
                        </span>
                      )}
                    </div>
                    <h3 className="text-xl font-bold font-serif text-gray-900">{evenement.titre}</h3>
                  </div>
                  {evenement.isInscrit && (
                    <div className="flex items-center gap-1.5 text-green-700 font-semibold text-sm bg-green-100 px-3 py-1.5 rounded-full">
                      <CheckCircle2 className="w-4 h-4" />
                      Inscrit
                    </div>
                  )}
                </div>

                {/* Description */}
                <p className="text-gray-600 font-serif mb-4">{evenement.description}</p>

                {/* Details */}
                <div className="flex flex-wrap gap-4 text-sm text-gray-600 mb-4">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    {formatDate(evenement.date)}
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4" />
                    {evenement.lieu}
                  </div>
                  <div className="flex items-center gap-2 text-gray-500">
                    {formatTime(evenement.date)}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-3">
                  <Button
                    onClick={() => setSelectedEvent(evenement)}
                    variant="outline"
                    className="border-gray-300 text-gray-700 hover:bg-gray-50"
                  >
                    <Eye className="w-4 h-4 mr-2" />
                    Voir détails
                  </Button>
                  {!evenement.isInscrit && (
                    <Button
                      onClick={() => handleInscription(evenement.id)}
                      disabled={inscribing === evenement.id}
                      className="bg-gray-800 hover:bg-gray-900 text-white"
                    >
                      {inscribing === evenement.id ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Inscription...
                        </>
                      ) : (
                        "S'inscrire"
                      )}
                    </Button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* ── VUE CALENDRIER ── */
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          {/* Navigation mois */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
            <button
              onClick={() => setCalendarDate(d => new Date(d.getFullYear(), d.getMonth() - 1, 1))}
              className="p-2 hover:bg-gray-100 rounded-md transition-colors"
            >
              <ChevronLeft className="w-5 h-5 text-gray-600" />
            </button>
            <h2 className="text-lg font-semibold text-gray-900 capitalize">
              {calendarDate.toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })}
            </h2>
            <button
              onClick={() => setCalendarDate(d => new Date(d.getFullYear(), d.getMonth() + 1, 1))}
              className="p-2 hover:bg-gray-100 rounded-md transition-colors"
            >
              <ChevronRight className="w-5 h-5 text-gray-600" />
            </button>
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

            const byDay: Record<number, Evenement[]> = {}
            evenements.forEach(e => {
              const d = new Date(e.date)
              if (d.getFullYear() === year && d.getMonth() === month) {
                const day = d.getDate()
                if (!byDay[day]) byDay[day] = []
                byDay[day].push(e)
              }
            })

            return (
              <div>
                <div className="grid grid-cols-7 border-b border-gray-100">
                  {dayLabels.map(d => (
                    <div key={d} className="py-2 text-center text-[10px] sm:text-xs font-semibold text-gray-400 uppercase tracking-wide">
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
                        className={`p-1 sm:p-2 border-b border-r border-gray-100 transition-colors
                          ${!isValid ? 'bg-gray-50' : ''}
                          ${isLastRow ? 'border-b-0' : ''}
                          ${(i + 1) % 7 === 0 ? 'border-r-0' : ''}
                        `}
                      >
                        {isValid && (
                          <>
                            <span className={`inline-flex items-center justify-center w-5 h-5 sm:w-7 sm:h-7 text-[10px] sm:text-sm font-medium rounded-full mb-0.5 sm:mb-1 ${
                              isToday ? 'bg-gray-900 text-white' : 'text-gray-700'
                            }`}>
                              {dayNum}
                            </span>
                            <div className="space-y-0.5 sm:space-y-1">
                              {events.slice(0, 2).map(e => (
                                <button
                                  key={e.id}
                                  onClick={() => setSelectedEvent(e)}
                                  onMouseEnter={(ev) => {
                                    setHoveredEvent(e)
                                    const rect = ev.currentTarget.getBoundingClientRect()
                                    setTooltipPos({ x: rect.left + rect.width / 2, y: rect.top })
                                  }}
                                  onMouseLeave={() => setHoveredEvent(null)}
                                  className={`w-full text-left px-1 sm:px-2 py-0.5 sm:py-1 rounded-md text-white text-[9px] sm:text-xs transition-all truncate cursor-pointer hover:scale-105 hover:shadow-lg ${
                                    TYPE_CALENDAR_COLORS[e.type] || 'bg-gray-900'
                                  } ${e.isInscrit ? 'ring-1 sm:ring-2 ring-green-400 ring-offset-0 sm:ring-offset-1' : ''}`}
                                >
                                  {e.isInscrit && '✓ '}{e.titre}
                                </button>
                              ))}
                              {events.length > 2 && (
                                <div className="text-[9px] sm:text-xs text-gray-400 pl-1">
                                  +{events.length - 2}
                                </div>
                              )}
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
          </div>
          {hoveredEvent.isInscrit && (
            <div className="mt-2 pt-2 border-t border-gray-700 text-green-400 text-xs font-semibold flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3" />
              Vous êtes inscrit
            </div>
          )}
          <div className="text-xs text-gray-400 mt-2">Cliquez pour voir les détails</div>
        </div>
      )}

      {/* Modal de détails */}
      {selectedEvent && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setSelectedEvent(null)}>
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            {/* Header */}
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between rounded-t-2xl">
              <h2 className="text-2xl font-bold font-serif text-gray-900">Détails de l'événement</h2>
              <button
                onClick={() => setSelectedEvent(null)}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            {/* Content */}
            <div className="p-6 space-y-6">
              {/* Type & Badges */}
              <div className="flex items-center gap-2 flex-wrap">
                <Badge className={`text-sm ${TYPE_BADGE_COLORS[selectedEvent.type] || 'bg-gray-100 text-gray-700'}`}>
                  {selectedEvent.type}
                </Badge>
                {selectedEvent.isInscrit && (
                  <div className="flex items-center gap-1.5 text-green-700 font-semibold text-sm bg-green-100 px-3 py-1.5 rounded-full">
                    <CheckCircle2 className="w-4 h-4" />
                    Vous êtes inscrit
                  </div>
                )}
                {gradesLabel(selectedEvent.gradesAutorises) !== 'Tous' && (
                  <span className="text-sm text-gray-600 bg-amber-50 px-3 py-1.5 rounded-full border border-amber-200 flex items-center gap-1.5">
                    <Users className="w-4 h-4" />
                    {gradesLabel(selectedEvent.gradesAutorises)}
                  </span>
                )}
              </div>

              {/* Titre */}
              <h3 className="text-3xl font-bold font-serif text-gray-900">{selectedEvent.titre}</h3>

              {/* Description */}
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-gray-700 font-serif leading-relaxed">{selectedEvent.description}</p>
              </div>

              {/* Informations */}
              <div className="grid md:grid-cols-2 gap-4">
                <div className="flex items-start gap-3 p-4 bg-blue-50 rounded-lg">
                  <Calendar className="w-5 h-5 text-blue-600 mt-0.5" />
                  <div>
                    <div className="text-xs font-semibold text-blue-900 uppercase tracking-wide mb-1">Date</div>
                    <div className="text-sm font-medium text-blue-800">{formatDate(selectedEvent.date)}</div>
                    <div className="text-sm text-blue-600">{formatTime(selectedEvent.date)}</div>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-4 bg-purple-50 rounded-lg">
                  <MapPin className="w-5 h-5 text-purple-600 mt-0.5" />
                  <div>
                    <div className="text-xs font-semibold text-purple-900 uppercase tracking-wide mb-1">Lieu</div>
                    <div className="text-sm font-medium text-purple-800">{selectedEvent.lieu}</div>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-3 pt-4 border-t border-gray-200">
                {!selectedEvent.isInscrit ? (
                  <Button
                    onClick={() => {
                      handleInscription(selectedEvent.id)
                      setSelectedEvent(null)
                    }}
                    disabled={inscribing === selectedEvent.id}
                    className="flex-1 bg-gray-800 hover:bg-gray-900 text-white"
                  >
                    {inscribing === selectedEvent.id ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Inscription en cours...
                      </>
                    ) : (
                      "S'inscrire à cet événement"
                    )}
                  </Button>
                ) : (
                  <div className="flex-1 text-center py-3 text-green-700 font-semibold bg-green-50 rounded-lg border border-green-200">
                    Vous participez à cet événement
                  </div>
                )}
                <Button
                  onClick={() => setSelectedEvent(null)}
                  variant="outline"
                  className="border-gray-300"
                >
                  Fermer
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      <ToastContainer toasts={toasts} removeToast={removeToast} />
    </div>
  )
}
