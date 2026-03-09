'use client'

import { useState } from 'react'
import Link from 'next/link'
import {
    Calendar, MapPin, Users, Search, Loader2, CalendarPlus,
    ChevronRight, AlertCircle, BookOpen, Lock
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'

// ── Types ─────────────────────────────────────────────────────────────────────
interface Membre {
    id: string
    nom: string
    prenoms: string
    nomSacre: string | null
    grade: string
}

interface Evenement {
    id: string
    type: string
    titre: string
    description: string
    date: string
    lieu: string
    lienUnique: string
    gradesAutorises: string[]
    _count: { inscriptions: number }
}

// ── Couleurs ──────────────────────────────────────────────────────────────────
const TYPE_COLORS: Record<string, string> = {
    'Traversée Grand Navire':   'bg-blue-500',
    'Traversée Équipage':       'bg-sky-500',
    "Traversée d'Initiation":   'bg-emerald-500',
    'Cours de Grade':           'bg-purple-600',
    'Cours':                    'bg-indigo-500',
    'Agape':                    'bg-orange-500',
    'Rencontre':                'bg-pink-500',
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

const GRADE_BADGE: Record<string, string> = {
    Explorateur:  'bg-green-100 text-green-800 border-green-300',
    Constructeur: 'bg-blue-100 text-blue-800 border-blue-300',
    Navigateur:   'bg-purple-100 text-purple-800 border-purple-300',
    Alchimiste:   'bg-yellow-100 text-yellow-800 border-yellow-300',
}

// ── Helpers ───────────────────────────────────────────────────────────────────
function formatDate(dateStr: string) {
    return new Date(dateStr).toLocaleDateString('fr-FR', {
        weekday: 'short', day: 'numeric', month: 'long'
    })
}

function formatTime(dateStr: string) {
    const t = new Date(dateStr).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })
    return t !== '00:00' ? t : null
}

function groupByMonth(events: Evenement[]): Record<string, Evenement[]> {
    return events.reduce((acc, e) => {
        const key = new Date(e.date).toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })
        if (!acc[key]) acc[key] = []
        acc[key].push(e)
        return acc
    }, {} as Record<string, Evenement[]>)
}

// ── Page ──────────────────────────────────────────────────────────────────────
export default function ProgrammePage() {
    const [nomSacreInput, setNomSacreInput] = useState('')
    const [loading, setLoading] = useState(false)
    const [membre, setMembre] = useState<Membre | null>(null)
    const [evenements, setEvenements] = useState<Evenement[]>([])
    const [error, setError] = useState('')

    const handleAccess = async () => {
        if (!nomSacreInput.trim()) return
        setLoading(true)
        setError('')
        setMembre(null)
        setEvenements([])
        try {
            const res = await fetch(`/api/programme?nomSacre=${encodeURIComponent(nomSacreInput.trim())}`)
            const data = await res.json()
            if (!res.ok) {
                setError(data.error || 'Une erreur est survenue')
            } else {
                setMembre(data.membre)
                setEvenements(data.evenements)
            }
        } catch {
            setError('Une erreur est survenue. Veuillez réessayer.')
        } finally {
            setLoading(false)
        }
    }

    // ICS export de tous les événements visibles
    const downloadAllICS = () => {
        if (evenements.length === 0) return
        const toICS = (d: string) => new Date(d).toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '')
        const lines = [
            'BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//ETU//Programme//FR',
            'CALSCALE:GREGORIAN', 'METHOD:PUBLISH',
        ]
        evenements.forEach(e => {
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
        a.href = url; a.download = 'mon-programme-etu.ics'
        document.body.appendChild(a); a.click()
        document.body.removeChild(a); URL.revokeObjectURL(url)
    }

    const grouped = groupByMonth(evenements)
    const months = Object.keys(grouped)

    return (
        <div className="min-h-screen bg-white">
            <SiteNav />

            {/* ── Hero ── */}
            <section className="bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 py-14 sm:py-20">
                <div className="max-w-2xl mx-auto px-4 sm:px-6 text-center">
                    <div className="inline-flex items-center gap-2 bg-white/70 backdrop-blur-sm border border-indigo-100 rounded-full px-4 py-1.5 mb-5">
                        <Lock className="w-3.5 h-3.5 text-indigo-400" />
                        <span className="text-xs font-medium text-indigo-700 font-serif">Espace membres</span>
                    </div>
                    <h1 className="text-3xl sm:text-4xl font-serif font-bold text-gray-900 mb-3">
                        Mon Programme
                    </h1>
                    <p className="text-gray-500 font-serif text-base sm:text-lg">
                        Consultez les prochains événements auxquels vous êtes autorisé(e) à participer.
                    </p>
                </div>
            </section>

            <main className="max-w-2xl mx-auto px-4 sm:px-6 py-10">

                {/* ── Formulaire d'accès ── */}
                {!membre ? (
                    <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="w-11 h-11 bg-gray-900 rounded-xl flex items-center justify-center flex-shrink-0">
                                <Lock className="w-5 h-5 text-white" />
                            </div>
                            <div>
                                <h2 className="text-lg font-bold text-gray-900 font-serif">Accès au programme</h2>
                                <p className="text-sm text-gray-500 font-serif">Saisissez votre nom sacré pour voir vos événements</p>
                            </div>
                        </div>

                        {error && (
                            <div className="flex items-start gap-2 bg-red-50 border border-red-200 rounded-xl p-4 mb-5">
                                <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                                <p className="text-sm text-red-700 font-serif">{error}</p>
                            </div>
                        )}

                        <div className="flex gap-3">
                            <Input
                                value={nomSacreInput}
                                onChange={e => setNomSacreInput(e.target.value)}
                                onKeyDown={e => e.key === 'Enter' && handleAccess()}
                                placeholder="Votre nom sacré…"
                                autoFocus
                                className="flex-1 font-serif"
                            />
                            <Button
                                onClick={handleAccess}
                                disabled={!nomSacreInput.trim() || loading}
                                className="bg-gray-800 hover:bg-gray-900 text-white gap-2 whitespace-nowrap font-serif"
                            >
                                {loading
                                    ? <Loader2 className="w-4 h-4 animate-spin" />
                                    : <Search className="w-4 h-4" />
                                }
                                Accéder
                            </Button>
                        </div>
                    </div>
                ) : (
                    /* ── Programme ── */
                    <div className="space-y-6">
                        {/* Carte membre */}
                        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
                            <div className="flex items-center gap-4">
                                <div className="w-14 h-14 rounded-full bg-gray-900 text-white flex items-center justify-center font-bold text-xl flex-shrink-0 font-serif">
                                    {membre.nom.charAt(0)}{membre.prenoms.charAt(0)}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="font-bold text-gray-900 text-lg font-serif truncate">{membre.nom} {membre.prenoms}</p>
                                    {membre.nomSacre && (
                                        <p className="text-sm text-gray-500 italic font-serif">"{membre.nomSacre}"</p>
                                    )}
                                    <Badge className={`mt-1 text-xs border ${GRADE_BADGE[membre.grade] || 'bg-gray-100 text-gray-700'}`}>
                                        {membre.grade}
                                    </Badge>
                                </div>
                                <div className="text-right flex-shrink-0">
                                    <p className="text-2xl font-bold text-gray-900 font-serif">{evenements.length}</p>
                                    <p className="text-xs text-gray-500 font-serif">événement(s)<br />à venir</p>
                                </div>
                            </div>

                            {/* Actions */}
                            <div className="mt-5 pt-5 border-t border-gray-100 flex gap-2 flex-wrap">
                                {evenements.length > 0 && (
                                    <button
                                        onClick={downloadAllICS}
                                        className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-gray-900 transition-colors px-3 py-2 rounded-lg border border-gray-200 hover:border-gray-400 font-serif"
                                    >
                                        <CalendarPlus className="w-4 h-4" />
                                        Ajouter tout au calendrier
                                    </button>
                                )}
                                <button
                                    onClick={() => { setMembre(null); setEvenements([]); setNomSacreInput('') }}
                                    className="text-xs text-gray-400 hover:text-gray-700 px-3 py-2 rounded-lg border border-gray-200 hover:border-gray-400 transition-colors font-serif"
                                >
                                    Changer de compte
                                </button>
                            </div>
                        </div>

                        {/* Liste événements */}
                        {evenements.length === 0 ? (
                            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-12 text-center">
                                <Calendar className="w-14 h-14 text-gray-200 mx-auto mb-4" />
                                <p className="text-gray-600 font-semibold font-serif">Aucun événement à venir</p>
                                <p className="text-gray-400 text-sm mt-1 font-serif">Il n'y a pas d'événement planifié pour votre grade pour le moment.</p>
                            </div>
                        ) : (
                            months.map(month => (
                                <div key={month}>
                                    {/* Séparateur mois */}
                                    <div className="flex items-center gap-3 mb-4">
                                        <span className="text-gray-500 text-sm font-semibold capitalize font-serif">{month}</span>
                                        <div className="flex-1 h-px bg-gray-200" />
                                    </div>

                                    <div className="space-y-3">
                                        {grouped[month].map(ev => {
                                            const timeStr = formatTime(ev.date)
                                            const barColor = TYPE_COLORS[ev.type] || 'bg-gray-400'

                                            return (
                                                <div key={ev.id} className="bg-white rounded-xl shadow-md border border-gray-100 overflow-hidden hover:shadow-lg transition-shadow">
                                                    <div className="flex">
                                                        {/* Barre colorée type */}
                                                        <div className={`w-1.5 flex-shrink-0 ${barColor}`} />

                                                        <div className="flex-1 p-4">
                                                            <div className="flex items-start justify-between gap-3">
                                                                <div className="flex-1 min-w-0">
                                                                    <div className="flex items-center gap-2 mb-1.5">
                                                                        <Badge className={`text-xs ${TYPE_BADGE[ev.type] || 'bg-gray-100 text-gray-700'}`}>
                                                                            {ev.type}
                                                                        </Badge>
                                                                    </div>
                                                                    <h3 className="font-bold text-gray-900 text-base leading-tight font-serif">{ev.titre}</h3>

                                                                    <div className="mt-2 space-y-1">
                                                                        <div className="flex items-center gap-2 text-sm text-gray-500">
                                                                            <Calendar className="w-3.5 h-3.5 flex-shrink-0 text-indigo-400" />
                                                                            <span className="capitalize font-serif">{formatDate(ev.date)}</span>
                                                                            {timeStr && <span className="text-gray-400 font-serif">· {timeStr}</span>}
                                                                        </div>
                                                                        <div className="flex items-center gap-2 text-sm text-gray-500">
                                                                            <MapPin className="w-3.5 h-3.5 flex-shrink-0 text-indigo-400" />
                                                                            <span className="font-serif">{ev.lieu}</span>
                                                                        </div>
                                                                        <div className="flex items-center gap-2 text-xs text-gray-400">
                                                                            <Users className="w-3 h-3 flex-shrink-0" />
                                                                            <span className="font-serif">{ev._count.inscriptions} inscrit(s)</span>
                                                                        </div>
                                                                    </div>
                                                                </div>

                                                                {/* Bouton s'inscrire */}
                                                                <a
                                                                    href={`/traversee/${ev.lienUnique}`}
                                                                    className="flex-shrink-0 flex items-center gap-1 px-3 py-2 bg-gray-800 hover:bg-gray-900 text-white text-xs font-medium rounded-lg transition-colors font-serif shadow-sm hover:shadow-md"
                                                                >
                                                                    S'inscrire
                                                                    <ChevronRight className="w-3.5 h-3.5" />
                                                                </a>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            )
                                        })}
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                )}
            </main>
        </div>
    )
}

// ── Barre de navigation commune ───────────────────────────────────────────────
function SiteNav() {
    return (
        <nav className="bg-white shadow-lg sticky top-0 z-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center h-16">
                    <Link href="/" className="flex items-center">
                        <img
                            src="/logo.svg"
                            alt="Logo ETU"
                            className="h-10 w-10 mr-3"
                        />
                        <span className="text-xl font-serif font-bold text-gray-900">ETU Bénin</span>
                    </Link>
                    <div className="hidden md:flex items-center space-x-6">
                        <Link href="/faq" className="text-gray-700 hover:text-gray-900 font-serif text-sm">FAQ</Link>
                        <Link href="/bibliotheque" className="text-gray-700 hover:text-gray-900 font-serif text-sm">Bibliothèque</Link>
                        <Link href="/cours-enregistres" className="text-gray-700 hover:text-gray-900 font-serif text-sm flex items-center gap-1">
                            <BookOpen className="w-4 h-4" /> Cours
                        </Link>
                        <Link href="/programme" className="text-gray-700 hover:text-gray-900 font-serif text-sm font-semibold">Mon programme</Link>
                        <Link href="/inscription" className="bg-gray-800 text-white px-4 py-2 rounded-lg hover:bg-gray-900 transition-colors font-serif text-sm">
                            S'inscrire
                        </Link>
                    </div>
                </div>
            </div>
        </nav>
    )
}
