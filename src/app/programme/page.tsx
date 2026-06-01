'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'
import Link from 'next/link'
import {
    Calendar, MapPin, Loader2, CalendarPlus,
    ChevronDown, Video, List,
    ChevronLeft, ChevronRight,
} from 'lucide-react'
import type { ProgrammePeriod } from '@/lib/programme'
import {
    formatAppDate,
    formatAppDateYMD,
    formatAppHourShort,
    formatAppTime,
    getAppDayOfWeek,
    getAppHourMinute,
    parseAppDatetimeLocal,
} from '@/lib/datetime'
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog'

// ── Types ─────────────────────────────────────────────────────────────────────
interface Evenement {
    id: string
    type: string
    titre: string
    description: string
    date: string
    lieu: string
    lienUnique: string
    gradesAutorises: string[]
    serieId: string | null
    _count: { inscriptions: number }
}

interface SerieGroup {
    kind: 'serie'
    serieId: string
    titre: string
    type: string
    lieu: string
    description: string
    gradesAutorises: string[]
    occurrences: Evenement[]
}

interface SingleEvent {
    kind: 'single'
    event: Evenement
}

type ProgrammeEntry = SerieGroup | SingleEvent

const EVENT_TYPE_ORDER = [
    'Traversée Grand Navire',
    'Traversée Équipage',
    "Traversée d'Initiation",
    'Cours de Grade',
    'Cours',
    'Agape',
    'Rencontre',
] as const

const TYPE_COLORS: Record<string, string> = {
    'Traversée Grand Navire':   'bg-blue-500',
    'Traversée Équipage':       'bg-sky-500',
    "Traversée d'Initiation":   'bg-emerald-500',
    'Cours de Grade':           'bg-purple-600',
    'Cours':                    'bg-indigo-500',
    'Agape':                    'bg-orange-500',
    'Rencontre':                'bg-pink-500',
}

const TYPE_CALENDAR_COLORS: Record<string, string> = {
    'Traversée Grand Navire':   'bg-blue-600 hover:bg-blue-700',
    'Traversée Équipage':       'bg-sky-600 hover:bg-sky-700',
    "Traversée d'Initiation":   'bg-emerald-600 hover:bg-emerald-700',
    'Cours de Grade':           'bg-purple-700 hover:bg-purple-800',
    'Cours':                    'bg-indigo-600 hover:bg-indigo-700',
    'Agape':                    'bg-orange-500 hover:bg-orange-600',
    'Rencontre':                'bg-pink-600 hover:bg-pink-700',
}

const TYPE_BADGE: Record<string, string> = {
    'Traversée Grand Navire':   'bg-blue-100 text-blue-800',
    'Traversée Équipage':       'bg-sky-100 text-sky-800',
    "Traversée d'Initiation":   'bg-emerald-100 text-emerald-800',
    'Cours de Grade':           'bg-purple-100 text-purple-800',
    'Cours':                    'bg-indigo-100 text-indigo-800',
    'Agape':                    'bg-orange-100 text-orange-800',
    'Rencontre':                'bg-pink-100 text-pink-800',
}

const PERIOD_FILTERS: { key: ProgrammePeriod; label: string }[] = [
    { key: 'upcoming', label: 'À venir' },
    { key: 'thisMonth', label: 'Ce mois' },
    { key: 'all', label: 'Tous' },
    { key: 'lastMonth', label: 'Mois dernier' },
    { key: 'past', label: 'Passés' },
]

const PROGRAMME_VIEW_STORAGE_KEY = 'etu-programme-view-mode'
type ProgrammeViewMode = 'list' | 'calendar'

function readStoredViewMode(): ProgrammeViewMode {
    if (typeof window === 'undefined') return 'list'
    try {
        const stored = localStorage.getItem(PROGRAMME_VIEW_STORAGE_KEY)
        if (stored === 'list' || stored === 'calendar') return stored
    } catch {
        // localStorage indisponible
    }
    return 'list'
}

// ── Helpers ───────────────────────────────────────────────────────────────────
function formatDate(dateStr: string) {
    return formatAppDate(dateStr, {
        weekday: 'short', day: 'numeric', month: 'long', year: 'numeric',
    })
}

function formatDateShort(dateStr: string) {
    return formatAppDate(dateStr, {
        weekday: 'short', day: 'numeric', month: 'short',
    })
}

function formatTime(dateStr: string) {
    const t = formatAppTime(dateStr)
    return t !== '00:00' ? t : null
}

function gradesLabel(grades: string[]): string {
    if (grades.length === 0 || grades.length >= 4) return 'Tous les grades'
    return grades.join(', ')
}

function isTraverseeType(type: string): boolean {
    return type.startsWith('Traversée')
}

const WEEKDAY_PLURAL: Record<number, string> = {
    0: 'dimanches',
    1: 'lundis',
    2: 'mardis',
    3: 'mercredis',
    4: 'jeudis',
    5: 'vendredis',
    6: 'samedis',
}

const WEEKDAY_ORDER = [1, 2, 3, 4, 5, 6, 0]

function formatHourFr(date: Date | string): string {
    return formatAppHourShort(date)
}

function joinFrenchList(items: string[]): string {
    if (items.length <= 1) return items[0] ?? ''
    if (items.length === 2) return `${items[0]} et ${items[1]}`
    return `${items.slice(0, -1).join(', ')} et ${items[items.length - 1]}`
}

/** Ex. « Tous les vendredis à 21h » — déduit des occurrences d'une série */
function formatSerieSchedule(occurrences: { date: string }[]): string {
    if (occurrences.length === 0) return ''
    if (occurrences.length === 1) {
        const d = formatDateShort(occurrences[0].date)
        const time = formatTime(occurrences[0].date)
        return time ? `${d} à ${formatHourFr(new Date(occurrences[0].date))}` : d
    }

    const dates = occurrences.map(o => new Date(o.date))
    const times = dates.map(d => {
        const { hour, minute } = getAppHourMinute(d)
        return `${hour}:${minute}`
    })
    const sameTime = times.every(t => t === times[0])
    const timePart = sameTime ? ` à ${formatHourFr(dates[0])}` : ''

    const weekdaySet = new Set(dates.map(d => getAppDayOfWeek(d)))
    const weekdays = WEEKDAY_ORDER.filter(d => weekdaySet.has(d))
    const allOnKnownDays = dates.every(d => weekdaySet.has(getAppDayOfWeek(d)))

    if (!allOnKnownDays || weekdays.length === 0) {
        const sorted = [...occurrences].sort(
            (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
        )
        return `${formatDateShort(sorted[0].date)} → ${formatDateShort(sorted[sorted.length - 1].date)}${timePart}`
    }

    if (weekdays.length === 1 && dates.length >= 2) {
        const sorted = [...dates].sort((a, b) => a.getTime() - b.getTime())
        const gaps: number[] = []
        for (let i = 1; i < sorted.length; i++) {
            gaps.push(Math.round((sorted[i].getTime() - sorted[i - 1].getTime()) / 86400000))
        }
        const avgGap = gaps.reduce((a, b) => a + b, 0) / gaps.length
        const weeks = Math.round(avgGap / 7)
        const dayName = WEEKDAY_PLURAL[weekdays[0]]
        if (weeks >= 1 && weeks <= 4 && gaps.every(g => Math.abs(g - weeks * 7) <= 1)) {
            if (weeks === 1) return `Tous les ${dayName}${timePart}`
            return `Tous les ${weeks} ${dayName}${timePart}`
        }
    }

    const dayNames = weekdays.map(d => WEEKDAY_PLURAL[d])
    return `Tous les ${joinFrenchList(dayNames)}${timePart}`
}

function getProchaineOccurrence<T extends { date: string }>(occurrences: T[]): T | null {
    const now = Date.now()
    const sorted = [...occurrences].sort(
        (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime(),
    )
    return sorted.find(o => new Date(o.date).getTime() >= now) ?? null
}

function buildEntries(events: Evenement[]): ProgrammeEntry[] {
    const bySerie = new Map<string, Evenement[]>()
    const singles: Evenement[] = []

    for (const e of events) {
        if (e.serieId) {
            const list = bySerie.get(e.serieId) || []
            list.push(e)
            bySerie.set(e.serieId, list)
        } else {
            singles.push(e)
        }
    }

    const entries: ProgrammeEntry[] = []

    for (const [, occs] of bySerie) {
        const sorted = [...occs].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
        const first = sorted[0]
        entries.push({
            kind: 'serie',
            serieId: first.serieId!,
            titre: first.titre,
            type: first.type,
            lieu: first.lieu,
            description: first.description,
            gradesAutorises: first.gradesAutorises,
            occurrences: sorted,
        })
    }

    for (const e of singles) {
        entries.push({ kind: 'single', event: e })
    }

    entries.sort((a, b) => {
        const dateA = a.kind === 'single' ? a.event.date : a.occurrences[0].date
        const dateB = b.kind === 'single' ? b.event.date : b.occurrences[0].date
        return new Date(dateA).getTime() - new Date(dateB).getTime()
    })

    return entries
}

type RubriqueKey = 'TEMPLE' | 'ECOLE'

const RUBRIQUE_COLORS: Record<RubriqueKey, string> = {
    TEMPLE: 'bg-blue-500',
    ECOLE: 'bg-emerald-500',
}

function getEntryType(entry: ProgrammeEntry): string {
    return entry.kind === 'single' ? entry.event.type : entry.type
}

function getRubrique(type: string): RubriqueKey {
    return isTraverseeType(type) ? 'TEMPLE' : 'ECOLE'
}

function groupByRubrique(entries: ProgrammeEntry[]): { rubrique: RubriqueKey; entries: ProgrammeEntry[] }[] {
    const temple: ProgrammeEntry[] = []
    const ecole: ProgrammeEntry[] = []

    for (const entry of entries) {
        const bucket = getRubrique(getEntryType(entry)) === 'TEMPLE' ? temple : ecole
        bucket.push(entry)
    }

    const sections: { rubrique: RubriqueKey; entries: ProgrammeEntry[] }[] = []
    if (temple.length > 0) sections.push({ rubrique: 'TEMPLE', entries: temple })
    if (ecole.length > 0) sections.push({ rubrique: 'ECOLE', entries: ecole })
    return sections
}

function downloadICS(events: Evenement[], filename: string) {
    if (events.length === 0) return
    const toICS = (d: string) => new Date(d).toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '')
    const lines = [
        'BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//ETU//Programme//FR',
        'CALSCALE:GREGORIAN', 'METHOD:PUBLISH',
    ]
    events.forEach(e => {
        const end = new Date(new Date(e.date).getTime() + 2 * 60 * 60 * 1000).toISOString()
        const desc = e.description.replace(/\n/g, '\\n').replace(/,/g, '\\,')
        lines.push(
            'BEGIN:VEVENT',
            `UID:${e.id}@etufaq`,
            `DTSTAMP:${toICS(new Date().toISOString())}`,
            `DTSTART:${toICS(e.date)}`,
            `DTEND:${toICS(end)}`,
            `SUMMARY:${e.type} — ${e.titre}`,
            `DESCRIPTION:${desc}`,
            `LOCATION:${e.lieu}`,
            'END:VEVENT',
        )
    })
    lines.push('END:VCALENDAR')
    const blob = new Blob([lines.join('\r\n')], { type: 'text/calendar; charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = filename
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
}

// ── Page ──────────────────────────────────────────────────────────────────────
export default function ProgrammePage() {
    const [period, setPeriod] = useState<ProgrammePeriod>('thisMonth')
    const [evenements, setEvenements] = useState<Evenement[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')
    const [expandedSeries, setExpandedSeries] = useState<Set<string>>(new Set())
    const [viewMode, setViewModeState] = useState<ProgrammeViewMode>('list')
    const [calendarDate, setCalendarDate] = useState(() => {
        const now = new Date()
        return new Date(now.getFullYear(), now.getMonth(), 1)
    })

    useEffect(() => {
        setViewModeState(readStoredViewMode())
    }, [])

    const setViewMode = useCallback((mode: ProgrammeViewMode) => {
        setViewModeState(mode)
        try {
            localStorage.setItem(PROGRAMME_VIEW_STORAGE_KEY, mode)
        } catch {
            // localStorage indisponible
        }
    }, [])

    const fetchProgramme = useCallback(async () => {
        setLoading(true)
        setError('')
        try {
            const res = await fetch(`/api/programme?period=${period}`)
            const data = await res.json()
            if (!res.ok) {
                setError(data.error || 'Une erreur est survenue')
                setEvenements([])
            } else {
                setEvenements(data.evenements)
            }
        } catch {
            setError('Impossible de charger le programme.')
            setEvenements([])
        } finally {
            setLoading(false)
        }
    }, [period])

    useEffect(() => { fetchProgramme() }, [fetchProgramme])

    const entries = useMemo(() => buildEntries(evenements), [evenements])
    const byRubrique = useMemo(() => groupByRubrique(entries), [entries])
    const flatEvents = evenements

    const toggleSerie = (serieId: string) => {
        setExpandedSeries(prev => {
            const next = new Set(prev)
            if (next.has(serieId)) next.delete(serieId)
            else next.add(serieId)
            return next
        })
    }

    return (
        <div className="min-h-screen bg-white">
            <SiteNav />

            <section className="bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 py-6 sm:py-8">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center">
                    <h1 className="text-2xl sm:text-3xl font-serif font-bold text-gray-900">
                        Programme OMP-ETU
                    </h1>
                </div>
            </section>

            <main className="max-w-4xl mx-auto px-4 sm:px-6 py-10 space-y-8">
                {/* Filtres période */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div className="flex flex-wrap gap-1.5">
                        {PERIOD_FILTERS.map(f => (
                            <button
                                key={f.key}
                                type="button"
                                onClick={() => setPeriod(f.key)}
                                className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors font-serif ${
                                    period === f.key
                                        ? 'bg-gray-900 text-white'
                                        : 'text-gray-500 hover:bg-gray-100 border border-gray-200'
                                }`}
                            >
                                {f.label}
                            </button>
                        ))}
                    </div>
                    <div className="flex items-center gap-2 flex-wrap sm:justify-end">
                        <div className="flex items-center border border-gray-200 rounded-lg overflow-hidden shrink-0">
                            <button
                                type="button"
                                onClick={() => setViewMode('list')}
                                className={`px-3 py-1.5 flex items-center gap-1.5 text-xs font-medium font-serif transition-colors ${
                                    viewMode === 'list' ? 'bg-gray-900 text-white' : 'text-gray-600 hover:bg-gray-50'
                                }`}
                            >
                                <List className="w-4 h-4" />
                                Liste
                            </button>
                            <button
                                type="button"
                                onClick={() => setViewMode('calendar')}
                                className={`px-3 py-1.5 flex items-center gap-1.5 text-xs font-medium font-serif transition-colors ${
                                    viewMode === 'calendar' ? 'bg-gray-900 text-white' : 'text-gray-600 hover:bg-gray-50'
                                }`}
                            >
                                <Calendar className="w-4 h-4" />
                                Calendrier
                            </button>
                        </div>
                        {flatEvents.length > 0 && (
                            <button
                                type="button"
                                onClick={() => downloadICS(flatEvents, `programme-etu-${period}.ics`)}
                                className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-gray-900 transition-colors px-3 py-2 rounded-lg border border-gray-200 hover:border-gray-400 font-serif"
                            >
                                <CalendarPlus className="w-4 h-4" />
                                <span className="hidden sm:inline">Exporter .ics</span>
                            </button>
                        )}
                    </div>
                </div>

                {loading ? (
                    <div className="flex justify-center py-20">
                        <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
                    </div>
                ) : error ? (
                    <div className="bg-red-50 border border-red-200 rounded-2xl p-8 text-center">
                        <p className="text-red-700 font-serif">{error}</p>
                    </div>
                ) : evenements.length === 0 ? (
                    <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-12 text-center">
                        <Calendar className="w-14 h-14 text-gray-200 mx-auto mb-4" />
                        <p className="text-gray-600 font-semibold font-serif">Aucun événement</p>
                        <p className="text-gray-400 text-sm mt-1 font-serif">Aucun événement pour ce filtre de période.</p>
                    </div>
                ) : viewMode === 'calendar' ? (
                    <ProgrammeCalendar
                        events={evenements}
                        calendarDate={calendarDate}
                        onCalendarDateChange={setCalendarDate}
                    />
                ) : (
                    <div className="space-y-8">
                        {byRubrique.map(({ rubrique, entries: sectionEntries }) => (
                            <section key={rubrique}>
                                <header className="mb-3 pb-2 border-b border-gray-100">
                                    <h2 className="text-lg sm:text-xl font-bold text-gray-900 font-serif flex items-center gap-2.5 leading-tight">
                                        <span
                                            className={`w-2.5 h-2.5 rounded-full shrink-0 ${RUBRIQUE_COLORS[rubrique]}`}
                                            aria-hidden
                                        />
                                        {rubrique}
                                    </h2>
                                </header>

                                <div className="divide-y divide-gray-100">
                                    {sectionEntries.map(entry => {
                                        if (entry.kind === 'single') {
                                            return (
                                                <EventCard key={entry.event.id} event={entry.event} />
                                            )
                                        }

                                        const expanded = expandedSeries.has(entry.serieId)
                                        const scheduleLabel = formatSerieSchedule(entry.occurrences)
                                        const prochaine = getProchaineOccurrence(entry.occurrences)
                                        const prochaineTime = prochaine ? formatTime(prochaine.date) : null

                                        return (
                                            <div key={entry.serieId} className="py-3.5">
                                                <p className="text-xs text-gray-400 font-serif mb-1">
                                                    Série · {entry.occurrences.length} séances
                                                </p>
                                                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                                                    <div className="min-w-0 flex-1">
                                                        <p className="text-sm font-medium text-gray-900 font-serif capitalize">
                                                            {scheduleLabel}
                                                        </p>
                                                        <p className="text-sm text-gray-600 font-serif mt-0.5">{entry.titre}</p>
                                                        <p className="text-xs text-gray-400 font-serif mt-1">
                                                            {entry.lieu}
                                                            <span className="mx-1.5">·</span>
                                                            {gradesLabel(entry.gradesAutorises)}
                                                        </p>
                                                        {prochaine && (
                                                            <p className="mt-2 text-sm font-semibold text-gray-900 font-serif capitalize">
                                                                <span className="text-gray-500 font-normal">Prochaine séance · </span>
                                                                <span className="text-red-600">{formatDate(prochaine.date)}</span>
                                                                {prochaineTime && (
                                                                    <span className="text-gray-600 font-medium"> · {prochaineTime}</span>
                                                                )}
                                                            </p>
                                                        )}
                                                    </div>
                                                    <button
                                                        type="button"
                                                        onClick={() => toggleSerie(entry.serieId)}
                                                        className="shrink-0 flex items-center gap-1 text-xs font-medium text-gray-800 hover:text-gray-900 font-serif transition-colors sm:pt-0.5"
                                                    >
                                                        {expanded ? 'Réduire' : 'Voir toutes les dates'}
                                                        <ChevronDown className={`w-3.5 h-3.5 transition-transform ${expanded ? 'rotate-180' : ''}`} />
                                                    </button>
                                                </div>

                                                {expanded && (
                                                    <ul className="mt-3 ml-3 border-l border-gray-200 space-y-0 divide-y divide-gray-50">
                                                        {entry.occurrences.map(occ => {
                                                            const timeStr = formatTime(occ.date)
                                                            const dateLine = (
                                                                <p className="text-sm font-serif capitalize">
                                                                    <span className="text-red-600 font-medium">{formatDate(occ.date)}</span>
                                                                    {timeStr && <span className="text-gray-500 font-normal"> · {timeStr}</span>}
                                                                </p>
                                                            )
                                                            if (isTraverseeType(occ.type)) {
                                                                return (
                                                                    <li key={occ.id}>
                                                                        <Link
                                                                            href={`/traversee/${occ.lienUnique}`}
                                                                            className="flex items-center justify-between gap-3 py-2 pl-3 hover:bg-gray-50/80 -mr-1 pr-1 rounded transition-colors group"
                                                                        >
                                                                            {dateLine}
                                                                            <span className="text-xs text-gray-500 group-hover:text-gray-900 shrink-0">
                                                                                S&apos;inscrire →
                                                                            </span>
                                                                        </Link>
                                                                    </li>
                                                                )
                                                            }
                                                            return (
                                                                <li key={occ.id} className="py-2 pl-3">
                                                                    {dateLine}
                                                                </li>
                                                            )
                                                        })}
                                                    </ul>
                                                )}
                                            </div>
                                        )
                                    })}
                                </div>
                            </section>
                        ))}
                    </div>
                )}
            </main>
        </div>
    )
}

const CALENDAR_DAY_LABELS = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim']
const MAX_EVENTS_PER_DAY_MOBILE = 2
const MAX_EVENTS_PER_DAY_DESKTOP = 4

function ProgrammeCalendar({
    events,
    calendarDate,
    onCalendarDateChange,
}: {
    events: Evenement[]
    calendarDate: Date
    onCalendarDateChange: (d: Date) => void
}) {
    const year = calendarDate.getFullYear()
    const month = calendarDate.getMonth()
    const todayYMD = formatAppDateYMD(new Date())

    const byDay = useMemo(() => {
        const map: Record<number, Evenement[]> = {}
        const monthPrefix = `${year}-${String(month + 1).padStart(2, '0')}-`
        for (const ev of events) {
            const ymd = formatAppDateYMD(ev.date)
            if (!ymd.startsWith(monthPrefix)) continue
            const day = parseInt(ymd.slice(8, 10), 10)
            if (!map[day]) map[day] = []
            map[day].push(ev)
        }
        for (const day of Object.keys(map)) {
            map[Number(day)].sort(
                (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime(),
            )
        }
        return map
    }, [events, year, month])

    const firstDay = new Date(year, month, 1)
    const lastDay = new Date(year, month + 1, 0)
    const startOffset = (firstDay.getDay() + 6) % 7
    const totalCells = startOffset + lastDay.getDate()
    const rows = Math.ceil(totalCells / 7)

    const legendTypes = useMemo(() => {
        const seen = new Set<string>()
        for (const ev of events) {
            const ymd = formatAppDateYMD(ev.date)
            if (ymd.startsWith(`${year}-${String(month + 1).padStart(2, '0')}-`)) {
                seen.add(ev.type)
            }
        }
        return EVENT_TYPE_ORDER.filter(t => seen.has(t))
    }, [events, year, month])

    const [dayModal, setDayModal] = useState<{ ymd: string; events: Evenement[] } | null>(null)

    return (
        <div className="bg-white rounded-xl shadow-md border border-gray-100 overflow-hidden">
            <div className="flex items-center justify-between px-3 sm:px-6 py-3 sm:py-4 border-b border-gray-100">
                <button
                    type="button"
                    onClick={() => onCalendarDateChange(new Date(year, month - 1, 1))}
                    className="p-1.5 hover:bg-gray-100 rounded-md transition-colors"
                    aria-label="Mois précédent"
                >
                    <ChevronLeft className="w-5 h-5 text-gray-600" />
                </button>
                <h2 className="text-sm sm:text-base font-semibold text-gray-900 capitalize font-serif">
                    {calendarDate.toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })}
                </h2>
                <button
                    type="button"
                    onClick={() => onCalendarDateChange(new Date(year, month + 1, 1))}
                    className="p-1.5 hover:bg-gray-100 rounded-md transition-colors"
                    aria-label="Mois suivant"
                >
                    <ChevronRight className="w-5 h-5 text-gray-600" />
                </button>
            </div>

            {legendTypes.length > 0 && (
                <div className="px-3 sm:px-6 py-2 border-b border-gray-100 flex flex-wrap gap-1.5">
                    {legendTypes.map(t => (
                        <span
                            key={t}
                            className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] sm:text-xs font-medium font-serif ${TYPE_BADGE[t] || 'bg-gray-100 text-gray-700'}`}
                        >
                            {t}
                        </span>
                    ))}
                </div>
            )}

            <div className="grid grid-cols-7 border-b border-gray-100">
                {CALENDAR_DAY_LABELS.map(d => (
                    <div
                        key={d}
                        className="py-1.5 sm:py-2 text-center text-[10px] sm:text-xs font-semibold text-gray-400 uppercase tracking-wide font-serif"
                    >
                        <span className="hidden sm:inline">{d}</span>
                        <span className="sm:hidden">{d.charAt(0)}</span>
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-7">
                {Array.from({ length: rows * 7 }).map((_, i) => {
                    const dayNum = i - startOffset + 1
                    const isValid = dayNum >= 1 && dayNum <= lastDay.getDate()
                    const cellYMD = isValid
                        ? `${year}-${String(month + 1).padStart(2, '0')}-${String(dayNum).padStart(2, '0')}`
                        : ''
                    const isToday = isValid && cellYMD === todayYMD
                    const dayEvents = isValid ? (byDay[dayNum] || []) : []
                    const isLastRow = i >= (rows - 1) * 7

                    return (
                        <div
                            key={i}
                            role={isValid ? 'button' : undefined}
                            tabIndex={isValid ? 0 : undefined}
                            onClick={isValid ? () => setDayModal({ ymd: cellYMD, events: dayEvents }) : undefined}
                            onKeyDown={isValid ? e => {
                                if (e.key === 'Enter' || e.key === ' ') {
                                    e.preventDefault()
                                    setDayModal({ ymd: cellYMD, events: dayEvents })
                                }
                            } : undefined}
                            className={`min-h-[72px] sm:min-h-[100px] md:min-h-[110px] p-1 sm:p-2 border-b border-r border-gray-100 text-left
                                ${!isValid ? 'bg-gray-50' : 'cursor-pointer hover:bg-gray-50/80 transition-colors'}
                                ${isLastRow ? 'border-b-0' : ''}
                                ${(i + 1) % 7 === 0 ? 'border-r-0' : ''}`}
                        >
                            {isValid && (
                                <>
                                    <span
                                        className={`inline-flex items-center justify-center w-6 h-6 sm:w-7 sm:h-7 text-xs sm:text-sm font-medium rounded-full mb-0.5 sm:mb-1 font-serif
                                            ${isToday ? 'bg-gray-900 text-white' : 'text-gray-700'}`}
                                    >
                                        {dayNum}
                                    </span>
                                    <div className="space-y-0.5 sm:space-y-1">
                                        {dayEvents.slice(0, MAX_EVENTS_PER_DAY_MOBILE).map(ev => (
                                            <CalendarEventChip key={ev.id} event={ev} className="sm:hidden" />
                                        ))}
                                        {dayEvents.length > MAX_EVENTS_PER_DAY_MOBILE && (
                                            <p className="text-[10px] text-gray-500 font-serif sm:hidden px-0.5">
                                                +{dayEvents.length - MAX_EVENTS_PER_DAY_MOBILE}
                                            </p>
                                        )}
                                        {dayEvents.slice(0, MAX_EVENTS_PER_DAY_DESKTOP).map(ev => (
                                            <CalendarEventChip key={ev.id} event={ev} className="hidden sm:block" />
                                        ))}
                                        {dayEvents.length > MAX_EVENTS_PER_DAY_DESKTOP && (
                                            <p className="hidden sm:block text-[10px] text-gray-500 font-serif px-0.5">
                                                +{dayEvents.length - MAX_EVENTS_PER_DAY_DESKTOP}
                                            </p>
                                        )}
                                    </div>
                                </>
                            )}
                        </div>
                    )
                })}
            </div>

            <CalendarDayModal day={dayModal} onClose={() => setDayModal(null)} />
        </div>
    )
}

function CalendarDayModal({
    day,
    onClose,
}: {
    day: { ymd: string; events: Evenement[] } | null
    onClose: () => void
}) {
    const title = useMemo(() => {
        if (!day) return ''
        if (day.events.length > 0) return formatDate(day.events[0].date)
        return formatAppDate(parseAppDatetimeLocal(`${day.ymd}T12:00`), {
            weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
        })
    }, [day])

    return (
        <Dialog open={!!day} onOpenChange={open => { if (!open) onClose() }}>
            <DialogContent className="max-w-md max-h-[min(85vh,640px)] flex flex-col gap-0 p-0 overflow-hidden">
                <DialogHeader className="shrink-0 px-6 pt-6 pb-2">
                    <DialogTitle className="font-serif capitalize text-lg">{title}</DialogTitle>
                    {day && day.events.length > 0 && (
                        <p className="text-sm text-gray-500 font-serif">
                            {day.events.length} événement{day.events.length > 1 ? 's' : ''}
                        </p>
                    )}
                </DialogHeader>
                <div className="flex-1 min-h-0 overflow-y-auto px-6 pb-6">
                    {!day || day.events.length === 0 ? (
                        <p className="text-sm text-gray-500 font-serif py-6 text-center">
                            Aucun événement ce jour.
                        </p>
                    ) : (
                        <ul className="space-y-3">
                            {day.events.map(ev => {
                                const timeStr = formatTime(ev.date)
                                const barColor = TYPE_COLORS[ev.type] || 'bg-gray-400'
                                const cardClass = 'flex bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden'
                                const cardBody = (
                                    <>
                                        <div className={`w-1 flex-shrink-0 ${barColor}`} />
                                        <div className="flex-1 p-4 min-w-0">
                                            <span
                                                className={`inline-block text-[10px] font-medium px-2 py-0.5 rounded-full mb-2 font-serif ${TYPE_BADGE[ev.type] || 'bg-gray-100 text-gray-700'}`}
                                            >
                                                {ev.type}
                                            </span>
                                            <p className="text-base font-bold text-gray-900 font-serif capitalize leading-snug">
                                                {timeStr ? `${timeStr} · ` : ''}{ev.titre}
                                            </p>
                                            <div className="mt-2 space-y-1">
                                                <div className="flex items-center gap-2 text-sm text-gray-500">
                                                    <MapPin className="w-3.5 h-3.5 flex-shrink-0 text-indigo-400" />
                                                    <span className="font-serif">{ev.lieu}</span>
                                                </div>
                                                <p className="text-xs text-gray-400 font-serif">
                                                    {gradesLabel(ev.gradesAutorises)}
                                                </p>
                                            </div>
                                        </div>
                                    </>
                                )
                                return (
                                    <li key={ev.id}>
                                        {isTraverseeType(ev.type) ? (
                                            <Link
                                                href={`/traversee/${ev.lienUnique}`}
                                                className={`${cardClass} hover:shadow-md hover:border-gray-200 transition-all group`}
                                            >
                                                {cardBody}
                                            </Link>
                                        ) : (
                                            <div className={cardClass}>{cardBody}</div>
                                        )}
                                    </li>
                                )
                            })}
                        </ul>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    )
}

function CalendarEventChip({
    event,
    className = '',
}: {
    event: Evenement
    className?: string
}) {
    const time = formatAppHourShort(event.date)
    const color = TYPE_CALENDAR_COLORS[event.type] || 'bg-gray-900 hover:bg-gray-800'
    const chipClass = `block w-full text-left px-1 sm:px-2 py-0.5 sm:py-1 rounded text-white text-[10px] sm:text-xs transition-colors truncate font-serif leading-tight ${color} ${className}`
    const chipContent = (
        <>
            <span className="font-medium">{time}</span>
            <span className="opacity-90"> {event.titre}</span>
        </>
    )
    if (!isTraverseeType(event.type)) {
        return (
            <span className={chipClass} title={`${event.titre} · ${time}`}>
                {chipContent}
            </span>
        )
    }
    return (
        <Link
            href={`/traversee/${event.lienUnique}`}
            onClick={e => e.stopPropagation()}
            className={chipClass}
            title={`${event.titre} · ${time}`}
        >
            {chipContent}
        </Link>
    )
}

function EventCard({ event }: { event: Evenement }) {
    const timeStr = formatTime(event.date)
    const showInscrire = isTraverseeType(event.type)
    const rowClass = 'flex items-start justify-between gap-4 py-3.5 transition-colors'

    const content = (
        <>
            <div className="min-w-0 flex-1">
                <p className="text-sm font-medium font-serif capitalize">
                    <span className="text-red-600">{formatDate(event.date)}</span>
                    {timeStr && <span className="text-gray-500 font-normal"> · {timeStr}</span>}
                </p>
                <p className="text-sm text-gray-600 font-serif mt-0.5">{event.titre}</p>
                <p className="text-xs text-gray-400 font-serif mt-1">
                    {event.lieu}
                    <span className="mx-1.5">·</span>
                    {gradesLabel(event.gradesAutorises)}
                </p>
            </div>
            {showInscrire && (
                <span className="shrink-0 text-xs text-gray-500 group-hover:text-gray-900 pt-0.5">
                    S&apos;inscrire →
                </span>
            )}
        </>
    )

    if (showInscrire) {
        return (
            <Link
                href={`/traversee/${event.lienUnique}`}
                className={`${rowClass} group -mx-1 px-1 rounded-md hover:bg-gray-50/80`}
            >
                {content}
            </Link>
        )
    }

    return <div className={rowClass}>{content}</div>
}

function SiteNav() {
    return (
        <nav className="bg-white shadow-lg sticky top-0 z-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center h-16">
                    <Link href="/" className="flex items-center">
                        <img src="/logo.svg" alt="Logo ETU" className="h-10 w-10 mr-3" />
                        <span className="text-xl font-serif font-bold text-gray-900">ETU Bénin</span>
                    </Link>
                    <div className="hidden md:flex items-center space-x-6">
                        <Link href="/bibliotheque" className="text-gray-700 hover:text-gray-900 font-serif text-sm">
                            Bibliothèque
                        </Link>
                        <Link href="/videotheque" className="text-gray-700 hover:text-gray-900 font-serif text-sm flex items-center gap-1">
                            <Video className="w-4 h-4" /> Vidéothèque
                        </Link>
                    </div>
                </div>
            </div>
        </nav>
    )
}
