'use client'

import { useState, useEffect, useCallback } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import {
    Calendar, MapPin, Users, CheckCircle, AlertCircle, Search,
    ArrowLeft, Loader2, CalendarPlus, BookOpen, List
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
    Dialog, DialogContent, DialogHeader, DialogTitle
} from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { formatAppDate, formatAppTime } from '@/lib/datetime'

// ── Interfaces ────────────────────────────────────────────────────────────────
interface TraverseeData {
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

interface MembreFound {
    id: string
    nom: string
    prenoms: string
    nomSacre: string | null
    grade: string
}

type ModalStep = 'confirm-saved' | 'search' | 'confirm' | 'success' | 'error'

const LS_NOM_SACRE_KEY = 'etu-traversee-nom-sacre'

function getStoredNomSacre(): string | null {
    if (typeof window === 'undefined') return null
    try {
        const v = localStorage.getItem(LS_NOM_SACRE_KEY)
        return v && v.trim() ? v.trim() : null
    } catch {
        return null
    }
}

function setStoredNomSacre(value: string) {
    try {
        localStorage.setItem(LS_NOM_SACRE_KEY, value.trim())
    } catch {
        /* ignore */
    }
}

function clearStoredNomSacre() {
    try {
        localStorage.removeItem(LS_NOM_SACRE_KEY)
    } catch {
        /* ignore */
    }
}

type ListePhase = 'confirm-storage' | 'input' | 'loading' | 'result' | 'error'

interface InscritListeItem {
    nom: string
    prenoms: string
    nomSacre?: string | null
}

// ── Couleurs ──────────────────────────────────────────────────────────────────
const TYPE_BADGE: Record<string, string> = {
    'Traversée Grand Navire':   'bg-blue-100 text-blue-800',
    'Traversée Équipage':       'bg-sky-100 text-sky-800',
    "Traversée d'Initiation":   'bg-emerald-100 text-emerald-800',
    'Cours de Grade':           'bg-purple-100 text-purple-800',
    'Cours':                    'bg-indigo-100 text-indigo-800',
    'Agape':                    'bg-orange-100 text-orange-800',
    'Rencontre':                'bg-pink-100 text-pink-800',
}

const GRADE_COLORS: Record<string, string> = {
    Explorateur:  'bg-green-100 text-green-800 border-green-200',
    Constructeur: 'bg-blue-100 text-blue-800 border-blue-200',
    Navigateur:   'bg-purple-100 text-purple-800 border-purple-200',
    Alchimiste:   'bg-yellow-100 text-yellow-800 border-yellow-200',
}

// ── Helpers ───────────────────────────────────────────────────────────────────
function formatDate(dateStr: string) {
    return formatAppDate(dateStr, {
        weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
    })
}

function formatTime(dateStr: string) {
    const time = formatAppTime(dateStr)
    return time !== '00:00' ? time : null
}

// ── Page ──────────────────────────────────────────────────────────────────────
export default function TraverseePage() {
    const params = useParams()
    const lienUnique = params.lienUnique as string

    const [traversee, setTraversee] = useState<TraverseeData | null>(null)
    const [loading, setLoading] = useState(true)
    const [notFound, setNotFound] = useState(false)

    const [showModal, setShowModal] = useState(false)
    const [step, setStep] = useState<ModalStep>('search')
    const [nomSacreInput, setNomSacreInput] = useState('')
    const [membreFound, setMembreFound] = useState<MembreFound | null>(null)
    const [dejaInscrit, setDejaInscrit] = useState(false)
    const [searching, setSearching] = useState(false)
    const [registering, setRegistering] = useState(false)
    const [errorMessage, setErrorMessage] = useState('')

    const [showListeModal, setShowListeModal] = useState(false)
    const [listePhase, setListePhase] = useState<ListePhase>('input')
    const [listeNomInput, setListeNomInput] = useState('')
    const [listeInscrits, setListeInscrits] = useState<InscritListeItem[]>([])
    const [listeError, setListeError] = useState('')
    const [verifiedListeNomSacre, setVerifiedListeNomSacre] = useState('')
    const [listeStoredNomPreview, setListeStoredNomPreview] = useState<string | null>(null)

    const fetchTraversee = useCallback(async () => {
        try {
            const res = await fetch(`/api/traversees/${lienUnique}`)
            if (!res.ok) { setNotFound(true); return }
            const data = await res.json()
            if (data.success) setTraversee(data.data)
            else setNotFound(true)
        } catch {
            setNotFound(true)
        } finally {
            setLoading(false)
        }
    }, [lienUnique])

    useEffect(() => { fetchTraversee() }, [fetchTraversee])

    const runSearchInscription = useCallback(async (nomSacre: string) => {
        const trimmed = nomSacre.trim()
        if (!trimmed) return
        setSearching(true)
        setErrorMessage('')
        try {
            const res = await fetch(
                `/api/traversees/${lienUnique}/rechercher?nomSacre=${encodeURIComponent(trimmed)}`
            )
            const data = await res.json()
            if (!res.ok) {
                setErrorMessage(data.error || 'Aucun membre trouvé')
                setStep('error')
            } else {
                setMembreFound(data.data)
                setDejaInscrit(data.dejaInscrit)
                setStep('confirm')
            }
        } catch {
            setErrorMessage('Une erreur est survenue. Veuillez réessayer.')
            setStep('error')
        } finally {
            setSearching(false)
        }
    }, [lienUnique])

    const openModal = () => {
        setMembreFound(null)
        setDejaInscrit(false)
        setErrorMessage('')
        const stored = getStoredNomSacre()
        if (stored) {
            setNomSacreInput(stored)
            setStep('confirm-saved')
        } else {
            setNomSacreInput('')
            setStep('search')
        }
        setShowModal(true)
    }

    const handleSearch = () => {
        void runSearchInscription(nomSacreInput)
    }

    const openListeModal = () => {
        setListeInscrits([])
        setListeError('')
        setVerifiedListeNomSacre('')
        setListeNomInput('')
        const stored = getStoredNomSacre()
        if (stored) {
            setListeStoredNomPreview(stored)
            setListePhase('confirm-storage')
        } else {
            setListeStoredNomPreview(null)
            setListePhase('input')
        }
        setShowListeModal(true)
    }

    const fetchListeInscrits = async (nomSacre: string) => {
        const trimmed = nomSacre.trim()
        if (!trimmed) return
        setListePhase('loading')
        setListeError('')
        try {
            const res = await fetch(`/api/traversees/${lienUnique}/liste-inscrits`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ nomSacre: trimmed })
            })
            const data = await res.json()
            if (!res.ok) {
                setListeError(data.error || 'Impossible d’afficher la liste')
                setListePhase('error')
                return
            }
            setListeInscrits(data.data || [])
            setVerifiedListeNomSacre(trimmed)
            setStoredNomSacre(trimmed)
            setListePhase('result')
        } catch {
            setListeError('Une erreur est survenue. Veuillez réessayer.')
            setListePhase('error')
        }
    }

    const handleListeValiderInput = () => {
        void fetchListeInscrits(listeNomInput)
    }

    const openInscriptionFromListe = () => {
        setShowListeModal(false)
        setNomSacreInput(verifiedListeNomSacre)
        setMembreFound(null)
        setDejaInscrit(false)
        setErrorMessage('')
        setStep('search')
        setShowModal(true)
        void runSearchInscription(verifiedListeNomSacre)
    }

    const handleConfirm = async () => {
        setRegistering(true)
        try {
            const res = await fetch(`/api/traversees/${lienUnique}/inscrire`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ nomSacre: nomSacreInput.trim() })
            })
            const data = await res.json()
            if (res.ok) {
                setStoredNomSacre(nomSacreInput.trim())
                setStep('success')
                fetchTraversee()
            } else {
                setErrorMessage(data.error || 'Une erreur est survenue')
                setStep('error')
            }
        } catch {
            setErrorMessage('Une erreur est survenue. Veuillez réessayer.')
            setStep('error')
        } finally {
            setRegistering(false)
        }
    }

    const downloadICS = () => {
        if (!traversee) return
        const toICS = (d: string) => new Date(d).toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '')
        const end = new Date(new Date(traversee.date).getTime() + 2 * 60 * 60 * 1000).toISOString()
        const desc = traversee.description.replace(/\n/g, '\\n').replace(/,/g, '\\,')
        const lines = [
            'BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//ETU//Traversee//FR',
            'CALSCALE:GREGORIAN', 'METHOD:PUBLISH',
            'BEGIN:VEVENT',
            `UID:${traversee.id}@etufaq`,
            `DTSTAMP:${toICS(new Date().toISOString())}`,
            `DTSTART:${toICS(traversee.date)}`,
            `DTEND:${toICS(end)}`,
            `SUMMARY:${traversee.type} ; ${traversee.titre}`,
            `DESCRIPTION:${desc}`,
            `LOCATION:${traversee.lieu}`,
            'END:VEVENT', 'END:VCALENDAR',
        ]
        const blob = new Blob([lines.join('\r\n')], { type: 'text/calendar; charset=utf-8' })
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url; a.download = `traversee-${traversee.lienUnique}.ics`
        document.body.appendChild(a); a.click()
        document.body.removeChild(a); URL.revokeObjectURL(url)
    }

    // ── États de chargement / not found ──────────────────────────────────────
    if (loading) {
        return (
            <div className="min-h-screen bg-white flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto" />
                    <p className="mt-4 text-gray-600 font-serif">Chargement…</p>
                </div>
            </div>
        )
    }

    if (notFound || !traversee) {
        return (
            <div className="min-h-screen bg-white">
                <SiteNav />
                <div className="flex flex-col items-center justify-center py-32 text-center px-4">
                    <AlertCircle className="w-16 h-16 text-gray-300 mb-4" />
                    <h1 className="text-2xl font-serif font-bold text-gray-800 mb-2">Événement introuvable</h1>
                    <p className="text-gray-500 font-serif">Ce lien ne correspond à aucune planification active.</p>
                    <Link href="/" className="mt-6 inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 font-serif">
                        <ArrowLeft className="w-4 h-4" /> Retour à l'accueil
                    </Link>
                </div>
            </div>
        )
    }

    const timeStr = formatTime(traversee.date)
    const isRestricted = traversee.gradesAutorises.length > 0 && traversee.gradesAutorises.length < 4

    return (
        <div className="min-h-screen bg-white">
            <SiteNav />

            {/* ── Hero / Bannière ── */}
            <section className="bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 py-12 sm:py-16">
                <div className="max-w-3xl mx-auto px-4 sm:px-6">
                    {/* Type badge */}
                    <div className="mb-4">
                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium font-serif ${TYPE_BADGE[traversee.type] || 'bg-gray-100 text-gray-700'}`}>
                            {traversee.type}
                        </span>
                    </div>

                    {/* Titre */}
                    <h1 className="text-3xl sm:text-4xl font-serif font-bold text-gray-900 leading-tight mb-6">
                        {traversee.titre}
                    </h1>

                    {/* Méta */}
                    <div className="flex flex-wrap gap-5 text-gray-600 mb-4">
                        <div className="flex items-center gap-2">
                            <Calendar className="w-5 h-5 text-indigo-400" />
                            <span className="font-serif capitalize">
                                {formatDate(traversee.date)}
                                {timeStr && <span className="text-gray-400 ml-1">· {timeStr}</span>}
                            </span>
                        </div>
                        <div className="flex items-center gap-2">
                            <MapPin className="w-5 h-5 text-indigo-400" />
                            <span className="font-serif">{traversee.lieu}</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <Users className="w-5 h-5 text-indigo-400" />
                            <span className="font-serif">{traversee._count.inscriptions} inscrit(s)</span>
                        </div>
                    </div>

                    {/* Grades autorisés */}
                    {isRestricted && (
                        <div className="flex flex-wrap gap-2 mt-4">
                            <span className="text-sm text-gray-500 font-serif mr-1 self-center">Réservé aux grades :</span>
                            {traversee.gradesAutorises.map(g => (
                                <span key={g} className={`px-2.5 py-0.5 rounded-full text-xs font-medium border ${GRADE_COLORS[g] || 'bg-gray-100 text-gray-700'}`}>
                                    {g}
                                </span>
                            ))}
                        </div>
                    )}

                    <div className="mt-6 flex justify-center">
                        <Button
                            type="button"
                            onClick={openListeModal}
                            className="bg-gray-800 text-white px-8 py-4 rounded-lg hover:bg-gray-900 transition-colors text-base font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 font-serif"
                        >
                            <List className="w-5 h-5 mr-2" />
                            Voir la liste des inscrits
                        </Button>
                    </div>
                </div>
            </section>

            {/* ── Corps ── */}
            <section className="max-w-3xl mx-auto px-4 sm:px-6 py-10">
                <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8 mb-6">
                    <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-widest font-serif mb-4">
                        Description
                    </h2>
                    <p className="text-gray-700 font-serif leading-relaxed whitespace-pre-line text-lg">
                        {traversee.description}
                    </p>
                </div>

                {/* CTA inscription */}
                <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-8 text-center border border-indigo-100">
                    <h3 className="text-xl font-serif font-bold text-gray-900 mb-2">
                        Participer à cet événement
                    </h3>
                    <p className="text-gray-500 font-serif text-sm mb-6">
                        {isRestricted
                            ? `Réservé aux membres : ${traversee.gradesAutorises.join(', ')}`
                            : 'Ouvert à tous les membres actifs de l\'ordre'
                        }
                    </p>
                    <button
                        onClick={openModal}
                        className="w-full sm:w-auto bg-gray-800 text-white px-8 py-4 rounded-lg hover:bg-gray-900 transition-colors text-base font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 font-serif"
                    >
                        S'inscrire à cet événement
                    </button>
                    <div className="mt-4">
                        <button
                            onClick={downloadICS}
                            className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-800 transition-colors font-serif"
                        >
                            <CalendarPlus className="w-4 h-4" />
                            Ajouter à mon calendrier
                        </button>
                    </div>
                </div>
            </section>

            {/* ── Modal d'inscription ── */}
            <Dialog
                open={showModal}
                onOpenChange={(open) => {
                    if (!open && (step === 'search' || step === 'error' || step === 'confirm-saved')) setShowModal(false)
                    else if (open) setShowModal(true)
                }}
            >
                <DialogContent className="w-[94vw] sm:max-w-md top-[6%] translate-y-0 max-h-[88dvh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2 font-serif">
                            {step === 'success' ? (
                                <><CheckCircle className="w-5 h-5 text-green-500" /> Inscription confirmée</>
                            ) : step === 'error' ? (
                                <><AlertCircle className="w-5 h-5 text-red-500" /> Impossible de procéder</>
                            ) : (
                                <>S'inscrire à l'événement</>
                            )}
                        </DialogTitle>
                    </DialogHeader>

                    {/* Étape : nom sacré mémorisé sur l’appareil */}
                    {step === 'confirm-saved' && (
                        <div className="space-y-4 py-2">
                            <p className="text-sm text-gray-600 font-serif">
                                Un nom sacré est mémorisé sur cet appareil pour les inscriptions aux traversées.
                                Est-ce toujours vous ?
                            </p>
                            <p className="text-sm font-medium text-gray-900 font-serif text-center bg-gray-50 rounded-lg py-2 px-3 border border-gray-100">
                                « {nomSacreInput} »
                            </p>
                            <div className="flex flex-col sm:flex-row gap-2">
                                <Button
                                    className="flex-1 bg-gray-800 hover:bg-gray-900 text-white font-serif"
                                    onClick={() => void runSearchInscription(nomSacreInput)}
                                    disabled={searching}
                                >
                                    {searching ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Oui, c’est moi'}
                                </Button>
                                <Button
                                    variant="outline"
                                    className="flex-1 font-serif"
                                    onClick={() => {
                                        clearStoredNomSacre()
                                        setNomSacreInput('')
                                        setStep('search')
                                    }}
                                >
                                    Non, autre nom
                                </Button>
                            </div>
                        </div>
                    )}

                    {/* Étape : recherche */}
                    {step === 'search' && (
                        <div className="space-y-4 py-2">
                            <p className="text-sm text-gray-600 font-serif">
                                Saisissez votre nom sacré pour vous inscrire.
                            </p>
                            <div className="space-y-2">
                                <label className="block text-sm font-medium text-gray-700 font-serif">Nom sacré</label>
                                <div className="flex gap-2">
                                    <Input
                                        value={nomSacreInput}
                                        onChange={e => setNomSacreInput(e.target.value)}
                                        onKeyDown={e => e.key === 'Enter' && handleSearch()}
                                        placeholder="Entrez votre nom sacré…"
                                        autoFocus
                                    />
                                    <Button
                                        onClick={handleSearch}
                                        disabled={!nomSacreInput.trim() || searching}
                                        className="bg-gray-800 hover:bg-gray-900 text-white gap-2 whitespace-nowrap"
                                    >
                                        {searching ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
                                        Rechercher
                                    </Button>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Étape : confirmation */}
                    {step === 'confirm' && membreFound && (
                        <div className="space-y-4 py-2">
                            {dejaInscrit ? (
                                <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 text-center">
                                    <AlertCircle className="w-8 h-8 text-yellow-500 mx-auto mb-2" />
                                    <p className="font-semibold text-gray-800 font-serif">Déjà inscrit</p>
                                    <p className="text-sm text-gray-600 mt-1 font-serif">
                                        <strong>{membreFound.nom} {membreFound.prenoms}</strong> est déjà inscrit(e) à cet événement.
                                    </p>
                                </div>
                            ) : (
                                <>
                                    <p className="text-sm text-gray-600 font-serif">Nous avons trouvé ce membre. Est-ce bien vous ?</p>
                                    <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border border-indigo-100 rounded-xl p-4">
                                        <div className="flex items-start gap-4">
                                            <div className="w-12 h-12 rounded-full bg-gray-900 text-white flex items-center justify-center font-bold text-lg flex-shrink-0 font-serif">
                                                {membreFound.nom.charAt(0)}{membreFound.prenoms.charAt(0)}
                                            </div>
                                            <div>
                                                <p className="font-bold text-gray-900 text-lg font-serif">
                                                    {membreFound.nom} {membreFound.prenoms}
                                                </p>
                                                {membreFound.nomSacre && (
                                                    <p className="text-sm text-gray-500 italic font-serif">"{membreFound.nomSacre}"</p>
                                                )}
                                                <Badge className={`mt-2 text-xs border ${GRADE_COLORS[membreFound.grade] || 'bg-gray-100 text-gray-700'}`}>
                                                    {membreFound.grade}
                                                </Badge>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex gap-3 pt-2">
                                        <Button variant="outline" onClick={() => setStep('search')} className="flex-1 font-serif">
                                            <ArrowLeft className="w-4 h-4 mr-2" />
                                            Ce n'est pas moi
                                        </Button>
                                        <Button
                                            onClick={handleConfirm}
                                            disabled={registering}
                                            className="flex-1 bg-gray-800 hover:bg-gray-900 text-white font-serif"
                                        >
                                            {registering
                                                ? <><Loader2 className="w-4 h-4 animate-spin mr-2" />Inscription…</>
                                                : <><CheckCircle className="w-4 h-4 mr-2" />Confirmer</>
                                            }
                                        </Button>
                                    </div>
                                </>
                            )}
                            {dejaInscrit && (
                                <Button variant="outline" onClick={() => setShowModal(false)} className="w-full font-serif">
                                    Fermer
                                </Button>
                            )}
                        </div>
                    )}

                    {/* Étape : succès */}
                    {step === 'success' && membreFound && traversee && (
                        <div className="space-y-4 py-2 text-center">
                            <div className="flex justify-center">
                                <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center">
                                    <CheckCircle className="w-9 h-9 text-green-500" />
                                </div>
                            </div>
                            <div>
                                <p className="font-bold text-gray-900 text-lg font-serif">Inscription réussie !</p>
                                <p className="text-sm text-gray-600 mt-1 font-serif">
                                    <strong>{membreFound.nom} {membreFound.prenoms}</strong> est bien inscrit(e) à<br />
                                    <span className="font-medium text-gray-800">{traversee.titre}</span>
                                </p>
                            </div>
                            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg p-3 text-sm text-gray-600 font-serif">
                                <Calendar className="w-4 h-4 inline mr-1 text-indigo-400" />
                                {formatDate(traversee.date)}
                                <span className="mx-2">·</span>
                                <MapPin className="w-4 h-4 inline mr-1 text-indigo-400" />
                                {traversee.lieu}
                            </div>
                            <Button
                                onClick={downloadICS}
                                variant="outline"
                                className="w-full gap-2 font-serif"
                            >
                                <CalendarPlus className="w-4 h-4" />
                                Ajouter à mon calendrier
                            </Button>
                            <Button
                                onClick={() => setShowModal(false)}
                                className="w-full bg-gray-800 text-white hover:bg-gray-900 font-serif"
                            >
                                Fermer
                            </Button>
                        </div>
                    )}

                    {/* Étape : erreur */}
                    {step === 'error' && (
                        <div className="space-y-4 py-2 text-center">
                            <div className="flex justify-center">
                                <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center">
                                    <AlertCircle className="w-9 h-9 text-red-500" />
                                </div>
                            </div>
                            <div>
                                <p className="font-bold text-gray-900 font-serif">Impossible de procéder</p>
                                <p className="text-sm text-gray-600 mt-1 font-serif">{errorMessage}</p>
                            </div>
                            <Button variant="outline" onClick={() => setStep('search')} className="w-full font-serif">
                                <ArrowLeft className="w-4 h-4 mr-2" />
                                Réessayer
                            </Button>
                        </div>
                    )}
                </DialogContent>
            </Dialog>

            {/* Modal : liste des inscrits (après vérification nom sacré) */}
            <Dialog
                open={showListeModal}
                onOpenChange={(open) => {
                    if (!open) {
                        setShowListeModal(false)
                        setListePhase('input')
                        setListeNomInput('')
                        setListeInscrits([])
                        setListeError('')
                        setListeStoredNomPreview(null)
                    } else {
                        setShowListeModal(true)
                    }
                }}
            >
                <DialogContent className="w-[98vw] max-w-[98vw] top-[2%] translate-y-0 h-auto max-h-[94dvh] overflow-y-auto font-serif p-4 sm:p-6">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2 font-serif">
                            <List className="w-5 h-5" />
                            Liste des inscrits
                        </DialogTitle>
                    </DialogHeader>

                    {listePhase === 'confirm-storage' && (
                        <div className="pt-1">
                            <div className="max-w-2xl rounded-xl border border-gray-200 bg-white p-5 sm:p-6 shadow-sm">
                                <p className="text-sm text-gray-600 leading-relaxed">
                                    Un nom sacré est déjà enregistré sur cet appareil. Voulez-vous l’utiliser pour afficher la liste des inscrits ?
                                </p>
                                <p className="mt-3 text-base font-semibold text-gray-900 bg-gray-50 rounded-lg py-2 px-3 border border-gray-100">
                                    {listeStoredNomPreview}
                                </p>
                                <div className="mt-4 flex flex-col sm:flex-row gap-2">
                                    <Button
                                        className="flex-1 bg-gray-800 hover:bg-gray-900 text-white"
                                        onClick={() => {
                                            if (listeStoredNomPreview) void fetchListeInscrits(listeStoredNomPreview)
                                        }}
                                    >
                                        Afficher la liste
                                    </Button>
                                    <Button
                                        variant="outline"
                                        className="flex-1"
                                        onClick={() => {
                                            clearStoredNomSacre()
                                            setListeNomInput('')
                                            setListePhase('input')
                                        }}
                                    >
                                        Utiliser un autre nom
                                    </Button>
                                </div>
                            </div>
                        </div>
                    )}

                    {listePhase === 'input' && (
                        <div className="pt-1">
                            <div className="max-w-2xl rounded-xl border border-gray-200 bg-white p-5 sm:p-6 shadow-sm">
                                <p className="text-sm text-gray-600 leading-relaxed">
                                    Saisissez votre nom sacré pour afficher la liste des inscrits.
                                </p>

                                <div className="mt-4 space-y-2">
                                    <label className="block text-sm font-semibold text-gray-800">Nom sacré</label>
                                    <div className="flex flex-col sm:flex-row gap-3 items-stretch">
                                        <Input
                                            value={listeNomInput}
                                            onChange={e => setListeNomInput(e.target.value)}
                                            onKeyDown={e => e.key === 'Enter' && handleListeValiderInput()}
                                            placeholder="Votre nom sacré..."
                                            autoFocus
                                            className="h-11 text-base bg-white border-gray-200"
                                        />
                                        <Button
                                            onClick={handleListeValiderInput}
                                            disabled={!listeNomInput.trim()}
                                            className="h-11 px-6 bg-gray-800 hover:bg-gray-900 text-white gap-2 whitespace-nowrap"
                                        >
                                            <Search className="w-4 h-4" />
                                            Valider
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {listePhase === 'loading' && (
                        <div className="flex flex-col items-center justify-center py-10 gap-3">
                            <Loader2 className="w-8 h-8 animate-spin text-gray-700" />
                            <p className="text-sm text-gray-600">Vérification…</p>
                        </div>
                    )}

                    {listePhase === 'error' && (
                        <div className="space-y-4 py-2 text-center">
                            <AlertCircle className="w-10 h-10 text-red-500 mx-auto" />
                            <p className="text-sm text-gray-600">{listeError}</p>
                            <Button variant="outline" className="w-full" onClick={() => setListePhase('input')}>
                                Réessayer
                            </Button>
                        </div>
                    )}

                    {listePhase === 'result' && (
                        <div className="space-y-4 py-2">
                            <p className="text-sm text-gray-600">
                                {listeInscrits.length} personne{listeInscrits.length > 1 ? 's' : ''} inscrite{listeInscrits.length > 1 ? 's' : ''}.
                            </p>
                            <ul className="max-h-56 overflow-y-auto border border-gray-100 rounded-lg divide-y divide-gray-100 bg-gray-50/50">
                                {listeInscrits.map((row, i) => (
                                    <li key={`${row.nom}-${row.prenoms}-${i}`} className="px-3 py-2 text-sm text-gray-800">
                                        <span className="font-medium">{row.nom}</span>
                                        {' '}
                                        <span className="text-gray-600">
                                            {row.prenoms}
                                            {row.nomSacre ? ` (${row.nomSacre})` : ''}
                                        </span>
                                    </li>
                                ))}
                            </ul>
                            <div className="flex flex-col gap-2">
                                <Button
                                    className="w-full bg-gray-800 hover:bg-gray-900 text-white"
                                    onClick={openInscriptionFromListe}
                                >
                                    S’inscrire à cet événement
                                </Button>
                                <Button variant="outline" className="w-full" onClick={() => setShowListeModal(false)}>
                                    Fermer
                                </Button>
                            </div>
                        </div>
                    )}
                </DialogContent>
            </Dialog>
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
                </div>
            </div>
        </nav>
    )
}
