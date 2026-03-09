'use client'

import { useState, useEffect, useCallback } from 'react'
import { useParams } from 'next/navigation'
import {
    Calendar, MapPin, Users, CheckCircle, AlertCircle, Search, ArrowLeft, Loader2, CalendarPlus
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
    Dialog, DialogContent, DialogHeader, DialogTitle
} from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'

interface TraverseeData {
    id: string
    type: string
    titre: string
    description: string
    date: string
    lieu: string
    lienUnique: string
    _count: { inscriptions: number }
}

interface MembreFound {
    id: string
    nom: string
    prenoms: string
    nomSacre: string | null
    grade: string
}

type ModalStep = 'search' | 'confirm' | 'success' | 'error'

const GRADE_COLORS: Record<string, string> = {
    Explorateur: 'bg-green-100 text-green-800 border-green-200',
    Constructeur: 'bg-blue-100 text-blue-800 border-blue-200',
    Navigateur: 'bg-purple-100 text-purple-800 border-purple-200',
    Alchimiste: 'bg-yellow-100 text-yellow-800 border-yellow-200',
}

function formatDate(dateStr: string) {
    return new Date(dateStr).toLocaleDateString('fr-FR', {
        weekday: 'long', day: 'numeric', month: 'long', year: 'numeric'
    })
}

function formatTime(dateStr: string) {
    const time = new Date(dateStr).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })
    return time !== '00:00' ? time : null
}

export default function TraverseePage() {
    const params = useParams()
    const lienUnique = params.lienUnique as string

    const [traversee, setTraversee] = useState<TraverseeData | null>(null)
    const [loading, setLoading] = useState(true)
    const [notFound, setNotFound] = useState(false)

    // Modal state
    const [showModal, setShowModal] = useState(false)
    const [step, setStep] = useState<ModalStep>('search')
    const [nomSacreInput, setNomSacreInput] = useState('')
    const [membreFound, setMembreFound] = useState<MembreFound | null>(null)
    const [dejaInscrit, setDejaInscrit] = useState(false)
    const [searching, setSearching] = useState(false)
    const [registering, setRegistering] = useState(false)
    const [errorMessage, setErrorMessage] = useState('')

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

    const openModal = () => {
        setStep('search')
        setNomSacreInput('')
        setMembreFound(null)
        setDejaInscrit(false)
        setErrorMessage('')
        setShowModal(true)
    }

    const handleSearch = async () => {
        if (!nomSacreInput.trim()) return
        setSearching(true)
        try {
            const res = await fetch(
                `/api/traversees/${lienUnique}/rechercher?nomSacre=${encodeURIComponent(nomSacreInput.trim())}`
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
                setStep('success')
                fetchTraversee() // update count
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
            `SUMMARY:Traversée — ${traversee.titre}`,
            `DESCRIPTION:${desc}`,
            `LOCATION:${traversee.lieu}`,
            'END:VEVENT', 'END:VCALENDAR',
        ]
        const blob = new Blob([lines.join('\r\n')], { type: 'text/calendar; charset=utf-8' })
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `traversee-${traversee.lienUnique}.ics`
        document.body.appendChild(a)
        a.click()
        document.body.removeChild(a)
        URL.revokeObjectURL(url)
    }

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
            </div>
        )
    }

    if (notFound || !traversee) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 text-center px-4">
                <AlertCircle className="w-16 h-16 text-gray-300 mb-4" />
                <h1 className="text-2xl font-bold text-gray-800 mb-2">Événement introuvable</h1>
                <p className="text-gray-500">Ce lien ne correspond à aucune traversée active.</p>
            </div>
        )
    }

    const timeStr = formatTime(traversee.date)

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
            {/* Simple header */}
            <header className="border-b border-white/10">
                <div className="max-w-3xl mx-auto px-4 py-4 flex items-center gap-3">
                    <img
                        src="https://z-cdn-media.chatglm.cn/files/68e00202-7aa7-4b85-a148-a40fdb4ac3f7_logo.png?auth_key=1791497410-4f07e789ecd94c959d996139b8c142b3-0-310a7d57abdef550ba4f1b3ace27306a"
                        alt="ETU"
                        className="w-8 h-8 opacity-90"
                    />
                    <span className="text-white font-semibold text-lg">ETU</span>
                </div>
            </header>

            <main className="max-w-2xl mx-auto px-4 py-12">
                {/* Event Card */}
                <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
                    {/* Card header */}
                    <div className="bg-gradient-to-r from-gray-900 to-gray-700 text-white p-8">
                        <div className="flex items-center gap-2 text-gray-400 text-sm mb-3">
                            <span className="uppercase tracking-widest text-xs font-medium">{traversee.type}</span>
                        </div>
                        <h1 className="text-3xl font-bold leading-tight">{traversee.titre}</h1>

                        <div className="mt-6 space-y-2">
                            <div className="flex items-center gap-3 text-gray-300">
                                <Calendar className="w-4 h-4 flex-shrink-0" />
                                <span className="capitalize">
                                    {formatDate(traversee.date)}
                                    {timeStr && <span className="text-gray-400 ml-2">à {timeStr}</span>}
                                </span>
                            </div>
                            <div className="flex items-center gap-3 text-gray-300">
                                <MapPin className="w-4 h-4 flex-shrink-0" />
                                <span>{traversee.lieu}</span>
                            </div>
                            <div className="flex items-center gap-3 text-gray-400">
                                <Users className="w-4 h-4 flex-shrink-0" />
                                <span>{traversee._count.inscriptions} inscrit(s)</span>
                            </div>
                        </div>
                    </div>

                    {/* Card body */}
                    <div className="p-8">
                        <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">
                            Description
                        </h2>
                        <p className="text-gray-700 leading-relaxed whitespace-pre-line">
                            {traversee.description}
                        </p>

                        <Button
                            onClick={openModal}
                            className="mt-8 w-full bg-gray-900 hover:bg-gray-700 text-white py-6 text-base font-semibold rounded-xl"
                        >
                            S'inscrire à cette traversée
                        </Button>
                        <p className="text-center text-xs text-gray-400 mt-3">
                            Réservé aux membres actifs de l'ordre
                        </p>
                        <button
                            onClick={downloadICS}
                            className="mt-4 w-full flex items-center justify-center gap-2 text-sm text-gray-500 hover:text-gray-800 transition-colors py-2"
                        >
                            <CalendarPlus className="w-4 h-4" />
                            Ajouter à mon calendrier
                        </button>
                    </div>
                </div>
            </main>

            {/* Registration Modal */}
            <Dialog
                open={showModal}
                onOpenChange={(open) => {
                    if (!open && (step === 'search' || step === 'error')) setShowModal(false)
                    else if (open) setShowModal(true)
                }}
            >
                <DialogContent className="max-w-md">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            {step === 'success' ? (
                                <><CheckCircle className="w-5 h-5 text-green-500" /> Inscription confirmée</>
                            ) : step === 'error' ? (
                                <><AlertCircle className="w-5 h-5 text-red-500" /> Erreur</>
                            ) : (
                                <>S'inscrire à la traversée</>
                            )}
                        </DialogTitle>
                    </DialogHeader>

                    {/* Step: Search */}
                    {step === 'search' && (
                        <div className="space-y-4 py-2">
                            <p className="text-sm text-gray-600">
                                Saisissez votre nom sacré pour vous inscrire.
                            </p>
                            <div className="space-y-2">
                                <label className="block text-sm font-medium text-gray-700">
                                    Nom sacré
                                </label>
                                <div className="flex gap-2">
                                    <Input
                                        value={nomSacreInput}
                                        onChange={e => setNomSacreInput(e.target.value)}
                                        onKeyDown={e => e.key === 'Enter' && handleSearch()}
                                        placeholder="Entrez votre nom sacré..."
                                        autoFocus
                                    />
                                    <Button
                                        onClick={handleSearch}
                                        disabled={!nomSacreInput.trim() || searching}
                                        className="bg-gray-900 hover:bg-gray-700 text-white gap-2 whitespace-nowrap"
                                    >
                                        {searching
                                            ? <Loader2 className="w-4 h-4 animate-spin" />
                                            : <Search className="w-4 h-4" />
                                        }
                                        Rechercher
                                    </Button>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Step: Confirm */}
                    {step === 'confirm' && membreFound && (
                        <div className="space-y-4 py-2">
                            {dejaInscrit ? (
                                <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 text-center">
                                    <AlertCircle className="w-8 h-8 text-yellow-500 mx-auto mb-2" />
                                    <p className="font-semibold text-gray-800">Déjà inscrit</p>
                                    <p className="text-sm text-gray-600 mt-1">
                                        <strong>{membreFound.nom} {membreFound.prenoms}</strong> est déjà inscrit(e) à cette traversée.
                                    </p>
                                </div>
                            ) : (
                                <>
                                    <p className="text-sm text-gray-600">Nous avons trouvé le membre suivant. Est-ce bien vous ?</p>
                                    <div className="bg-gray-50 border border-gray-200 rounded-xl p-4">
                                        <div className="flex items-start gap-4">
                                            <div className="w-12 h-12 rounded-full bg-gray-900 text-white flex items-center justify-center font-bold text-lg flex-shrink-0">
                                                {membreFound.nom.charAt(0)}{membreFound.prenoms.charAt(0)}
                                            </div>
                                            <div>
                                                <p className="font-bold text-gray-900 text-lg">
                                                    {membreFound.nom} {membreFound.prenoms}
                                                </p>
                                                {membreFound.nomSacre && (
                                                    <p className="text-sm text-gray-500 italic">"{membreFound.nomSacre}"</p>
                                                )}
                                                <Badge className={`mt-2 text-xs ${GRADE_COLORS[membreFound.grade] || 'bg-gray-100 text-gray-700'}`}>
                                                    {membreFound.grade}
                                                </Badge>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex gap-3 pt-2">
                                        <Button
                                            variant="outline"
                                            onClick={() => setStep('search')}
                                            className="flex-1"
                                        >
                                            <ArrowLeft className="w-4 h-4 mr-2" />
                                            Ce n'est pas moi
                                        </Button>
                                        <Button
                                            onClick={handleConfirm}
                                            disabled={registering}
                                            className="flex-1 bg-gray-900 hover:bg-gray-700 text-white"
                                        >
                                            {registering
                                                ? <><Loader2 className="w-4 h-4 animate-spin mr-2" />Inscription...</>
                                                : <><CheckCircle className="w-4 h-4 mr-2" />Confirmer</>
                                            }
                                        </Button>
                                    </div>
                                </>
                            )}
                            {dejaInscrit && (
                                <Button
                                    variant="outline"
                                    onClick={() => setShowModal(false)}
                                    className="w-full"
                                >
                                    Fermer
                                </Button>
                            )}
                        </div>
                    )}

                    {/* Step: Success */}
                    {step === 'success' && membreFound && (
                        <div className="space-y-4 py-2 text-center">
                            <div className="flex justify-center">
                                <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center">
                                    <CheckCircle className="w-9 h-9 text-green-500" />
                                </div>
                            </div>
                            <div>
                                <p className="font-bold text-gray-900 text-lg">
                                    Inscription réussie !
                                </p>
                                <p className="text-sm text-gray-600 mt-1">
                                    <strong>{membreFound.nom} {membreFound.prenoms}</strong> est bien inscrit(e) à<br />
                                    <span className="font-medium text-gray-800">{traversee.titre}</span>
                                </p>
                            </div>
                            <div className="bg-gray-50 rounded-lg p-3 text-sm text-gray-600">
                                <Calendar className="w-4 h-4 inline mr-1" />
                                {formatDate(traversee.date)}
                                <span className="mx-2">·</span>
                                <MapPin className="w-4 h-4 inline mr-1" />
                                {traversee.lieu}
                            </div>
                            <Button
                                onClick={downloadICS}
                                variant="outline"
                                className="w-full gap-2"
                            >
                                <CalendarPlus className="w-4 h-4" />
                                Ajouter à mon calendrier
                            </Button>
                            <Button onClick={() => setShowModal(false)} className="w-full bg-gray-900 text-white hover:bg-gray-700">
                                Fermer
                            </Button>
                        </div>
                    )}

                    {/* Step: Error */}
                    {step === 'error' && (
                        <div className="space-y-4 py-2 text-center">
                            <div className="flex justify-center">
                                <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center">
                                    <AlertCircle className="w-9 h-9 text-red-500" />
                                </div>
                            </div>
                            <div>
                                <p className="font-bold text-gray-900">Impossible de procéder</p>
                                <p className="text-sm text-gray-600 mt-1">{errorMessage}</p>
                            </div>
                            <Button
                                variant="outline"
                                onClick={() => setStep('search')}
                                className="w-full"
                            >
                                <ArrowLeft className="w-4 h-4 mr-2" />
                                Réessayer
                            </Button>
                        </div>
                    )}
                </DialogContent>
            </Dialog>
        </div>
    )
}
