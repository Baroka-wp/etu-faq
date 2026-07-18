'use client'

import { useCallback, useEffect, useState } from 'react'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import {
  AlertCircle,
  ArrowLeft,
  Calendar,
  CalendarPlus,
  CheckCircle,
  Loader2,
  MapPin,
  Search,
  Users,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { formatAppDate, formatAppTime } from '@/lib/datetime'

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

interface Inscrit {
  id: string
  nom: string
  prenoms: string
  nomSacre: string | null
}

type ModalStep = 'search' | 'confirm' | 'success' | 'error'

const STORAGE_KEY = 'etu-traversee-nom-sacre'

const TYPE_BADGE: Record<string, string> = {
  'Traversée Grand Navire': 'bg-blue-50 text-blue-800',
  'Traversée Équipage': 'bg-sky-50 text-sky-800',
  "Traversée d'Initiation": 'bg-emerald-50 text-emerald-800',
  'Cours de Grade': 'bg-purple-50 text-purple-800',
  Cours: 'bg-indigo-50 text-indigo-800',
  Agape: 'bg-orange-50 text-orange-800',
  Rencontre: 'bg-pink-50 text-pink-800',
}

const GRADE_COLORS: Record<string, string> = {
  Explorateur: 'bg-green-50 text-green-800 border-green-200',
  Constructeur: 'bg-blue-50 text-blue-800 border-blue-200',
  Navigateur: 'bg-purple-50 text-purple-800 border-purple-200',
  Alchimiste: 'bg-amber-50 text-amber-800 border-amber-200',
}

function storedNomSacre() {
  if (typeof window === 'undefined') return ''
  try {
    return localStorage.getItem(STORAGE_KEY)?.trim() || ''
  } catch {
    return ''
  }
}

function rememberNomSacre(value: string) {
  try {
    localStorage.setItem(STORAGE_KEY, value.trim())
  } catch {
    // La mémorisation locale reste facultative.
  }
}

function formatDate(date: string) {
  return formatAppDate(date, { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })
}

function formatTime(date: string) {
  const time = formatAppTime(date)
  return time === '00:00' ? null : time
}

export default function TraverseePage() {
  const { lienUnique } = useParams<{ lienUnique: string }>()
  const [traversee, setTraversee] = useState<TraverseeData | null>(null)
  const [inscrits, setInscrits] = useState<Inscrit[]>([])
  const [loading, setLoading] = useState(true)
  const [listLoading, setListLoading] = useState(false)
  const [listUnlocked, setListUnlocked] = useState(false)
  const [listNomSacre, setListNomSacre] = useState('')
  const [listError, setListError] = useState('')
  const [directRegistering, setDirectRegistering] = useState(false)
  const [directMessage, setDirectMessage] = useState('')
  const [directMessageType, setDirectMessageType] = useState<'success' | 'error'>('success')
  const [notFound, setNotFound] = useState(false)

  const [showModal, setShowModal] = useState(false)
  const [step, setStep] = useState<ModalStep>('search')
  const [nomSacreInput, setNomSacreInput] = useState('')
  const [eventToken, setEventToken] = useState('')
  const [membreFound, setMembreFound] = useState<MembreFound | null>(null)
  const [dejaInscrit, setDejaInscrit] = useState(false)
  const [searching, setSearching] = useState(false)
  const [registering, setRegistering] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')

  const fetchTraversee = useCallback(async () => {
    try {
      const response = await fetch(`/api/traversees/${lienUnique}`)
      const body = await response.json()
      if (!response.ok || !body.success) {
        setNotFound(true)
        return
      }
      setTraversee(body.data)
    } catch {
      setNotFound(true)
    } finally {
      setLoading(false)
    }
  }, [lienUnique])

  const fetchInscrits = useCallback(async (nomSacre: string) => {
    const value = nomSacre.trim()
    if (!value) return
    setListLoading(true)
    setListError('')
    try {
      const response = await fetch(`/api/traversees/${lienUnique}/liste-inscrits`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nomSacre: value }),
      })
      const body = await response.json()
      if (!response.ok || !body.success) {
        setListError(body.error || 'Impossible d’afficher la liste.')
        setListUnlocked(false)
        return
      }
      setInscrits(body.data)
      setListUnlocked(true)
      rememberNomSacre(value)
      setDirectMessage('')
    } catch {
      setListError('La vérification est momentanément indisponible.')
      setListUnlocked(false)
    } finally {
      setListLoading(false)
    }
  }, [lienUnique])

  const registerVerifiedMember = async () => {
    const nomSacre = listNomSacre.trim()
    if (!nomSacre) return
    setDirectRegistering(true)
    setDirectMessage('')
    try {
      const searchResponse = await fetch(`/api/traversees/${lienUnique}/rechercher`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nomSacre }),
      })
      const searchBody = await searchResponse.json()
      if (!searchResponse.ok) {
        setDirectMessageType('error')
        setDirectMessage(searchBody.error || "L'inscription n'a pas pu être effectuée.")
        return
      }
      if (searchBody.dejaInscrit) {
        setDirectMessageType('success')
        setDirectMessage('Ce membre est déjà inscrit à cet événement.')
        return
      }

      const registrationResponse = await fetch(`/api/traversees/${lienUnique}/inscrire`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ eventToken: searchBody.eventToken }),
      })
      const registrationBody = await registrationResponse.json()
      if (!registrationResponse.ok) {
        setDirectMessageType('error')
        setDirectMessage(registrationBody.error || "L'inscription n'a pas pu être enregistrée.")
        return
      }

      rememberNomSacre(nomSacre)
      await Promise.all([fetchTraversee(), fetchInscrits(nomSacre)])
      setDirectMessageType('success')
      setDirectMessage('Inscription confirmée. La liste a été actualisée.')
    } catch {
      setDirectMessageType('error')
      setDirectMessage("L'inscription est momentanément indisponible. Veuillez réessayer.")
    } finally {
      setDirectRegistering(false)
    }
  }

  useEffect(() => {
    void fetchTraversee()
  }, [fetchTraversee])

  useEffect(() => {
    setListNomSacre(storedNomSacre())
  }, [])

  const openRegistration = () => {
    setNomSacreInput(storedNomSacre())
    setMembreFound(null)
    setEventToken('')
    setDejaInscrit(false)
    setErrorMessage('')
    setStep('search')
    setShowModal(true)
  }

  const searchMember = async () => {
    const nomSacre = nomSacreInput.trim()
    if (!nomSacre) return
    setSearching(true)
    setErrorMessage('')
    try {
      const response = await fetch(`/api/traversees/${lienUnique}/rechercher`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nomSacre }),
      })
      const body = await response.json()
      if (!response.ok) {
        setErrorMessage(body.error || 'Aucun membre trouvé avec ce nom sacré.')
        setStep('error')
        return
      }
      setMembreFound(body.data)
      setDejaInscrit(body.dejaInscrit)
      setEventToken(body.eventToken)
      setStep('confirm')
    } catch {
      setErrorMessage('La recherche est momentanément indisponible. Veuillez réessayer.')
      setStep('error')
    } finally {
      setSearching(false)
    }
  }

  const confirmRegistration = async () => {
    setRegistering(true)
    try {
      const response = await fetch(`/api/traversees/${lienUnique}/inscrire`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ eventToken }),
      })
      const body = await response.json()
      if (!response.ok) {
        setErrorMessage(body.error || "L'inscription n'a pas pu être enregistrée.")
        setStep('error')
        return
      }
      rememberNomSacre(nomSacreInput)
      setStep('success')
      await fetchTraversee()
      if (listUnlocked) await fetchInscrits(listNomSacre)
    } catch {
      setErrorMessage("L'inscription n'a pas pu être enregistrée. Veuillez réessayer.")
      setStep('error')
    } finally {
      setRegistering(false)
    }
  }

  const downloadICS = () => {
    if (!traversee) return
    const toICS = (date: string) => new Date(date).toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '')
    const end = new Date(new Date(traversee.date).getTime() + 2 * 60 * 60 * 1000).toISOString()
    const description = traversee.description.replace(/\n/g, '\\n').replace(/,/g, '\\,')
    const content = [
      'BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//ETU//Evenement//FR',
      'CALSCALE:GREGORIAN', 'METHOD:PUBLISH', 'BEGIN:VEVENT',
      `UID:${traversee.id}@etufaq`, `DTSTAMP:${toICS(new Date().toISOString())}`,
      `DTSTART:${toICS(traversee.date)}`, `DTEND:${toICS(end)}`,
      `SUMMARY:${traversee.type} ; ${traversee.titre}`,
      `DESCRIPTION:${description}`, `LOCATION:${traversee.lieu}`,
      'END:VEVENT', 'END:VCALENDAR',
    ].join('\r\n')
    const url = URL.createObjectURL(new Blob([content], { type: 'text/calendar; charset=utf-8' }))
    const anchor = document.createElement('a')
    anchor.href = url
    anchor.download = `evenement-${traversee.lienUnique}.ics`
    document.body.appendChild(anchor)
    anchor.click()
    anchor.remove()
    URL.revokeObjectURL(url)
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#faf9f6]">
        <Loader2 className="h-8 w-8 animate-spin text-gray-500" aria-label="Chargement" />
      </div>
    )
  }

  if (notFound || !traversee) {
    return (
      <div className="min-h-screen bg-[#faf9f6]">
        <SiteNav />
        <main className="mx-auto flex max-w-lg flex-col items-center px-5 py-24 text-center">
          <AlertCircle className="mb-5 h-12 w-12 text-gray-300" />
          <h1 className="text-2xl font-semibold text-gray-900">Événement introuvable</h1>
          <p className="mt-2 font-serif text-gray-600">Ce lien ne correspond à aucune planification active.</p>
          <Link href="/" className="mt-7 inline-flex items-center gap-2 text-sm text-gray-700">
            <ArrowLeft className="h-4 w-4" /> Retour à l’accueil
          </Link>
        </main>
      </div>
    )
  }

  const time = formatTime(traversee.date)
  const restricted = traversee.gradesAutorises.length > 0 && traversee.gradesAutorises.length < 4
  const count = traversee._count.inscriptions

  return (
    <div className="min-h-screen bg-[#faf9f6] pb-24 text-[#282724] sm:pb-10">
      <SiteNav />
      <main className="mx-auto max-w-2xl px-4 py-5 sm:px-6 sm:py-10">
        <Link href="/programme" className="mb-5 inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-900">
          <ArrowLeft className="h-4 w-4" /> Programme du mois
        </Link>

        <article className="overflow-hidden rounded-3xl border border-stone-200 bg-white shadow-[0_16px_50px_rgba(45,40,32,0.06)]">
          <div className="p-5 sm:p-8">
            <span className={`inline-flex rounded-full px-3 py-1 text-xs font-medium ${TYPE_BADGE[traversee.type] || 'bg-stone-100 text-stone-700'}`}>
              {traversee.type}
            </span>
            <h1 className="mt-4 text-2xl font-semibold leading-tight tracking-tight text-gray-950 sm:text-4xl">
              {traversee.titre}
            </h1>

            <div className="mt-6 grid gap-3 sm:grid-cols-2">
              <div className="flex items-start gap-3 rounded-2xl bg-stone-50 p-4">
                <Calendar className="mt-0.5 h-5 w-5 shrink-0 text-amber-700" />
                <div>
                  <p className="text-sm font-medium capitalize text-gray-900">{formatDate(traversee.date)}</p>
                  {time && <p className="mt-0.5 text-sm text-gray-500">à {time}</p>}
                </div>
              </div>
              <div className="flex items-start gap-3 rounded-2xl bg-stone-50 p-4">
                <MapPin className="mt-0.5 h-5 w-5 shrink-0 text-amber-700" />
                <div>
                  <p className="text-xs uppercase tracking-wider text-gray-400">Lieu</p>
                  <p className="mt-0.5 text-sm font-medium text-gray-900">{traversee.lieu}</p>
                </div>
              </div>
            </div>

            {restricted && (
              <div className="mt-5 flex flex-wrap items-center gap-2">
                <span className="mr-1 text-xs text-gray-500">Grades autorisés</span>
                {traversee.gradesAutorises.map((grade) => (
                  <span key={grade} className={`rounded-full border px-2.5 py-1 text-xs ${GRADE_COLORS[grade] || 'border-stone-200 bg-stone-50 text-stone-700'}`}>
                    {grade}
                  </span>
                ))}
              </div>
            )}

          </div>

          <section className="border-t border-stone-200 bg-[#fffdfa] p-5 sm:p-8" aria-labelledby="inscrits-title">
            <div>
              <h2 id="inscrits-title" className="flex items-center gap-2.5 text-lg font-semibold text-gray-950">
                <span className="inline-flex h-9 min-w-9 items-center justify-center rounded-full bg-gray-900 px-2.5 text-base font-bold text-white shadow-sm">
                  {count}
                </span>
                <span>personne{count > 1 ? 's' : ''} inscrite{count > 1 ? 's' : ''}</span>
              </h2>
              <p className="mt-1 text-sm text-gray-500">Saisissez un nom sacré valide pour consulter la liste.</p>
            </div>

            {!listUnlocked ? (
              <div className="mt-5 rounded-2xl border border-stone-200 bg-white p-4 sm:p-5">
                <label htmlFor="liste-nom-sacre" className="text-sm font-medium text-gray-800">Votre nom sacré</label>
                <div className="mt-2 flex flex-col gap-2 sm:flex-row">
                  <Input
                    id="liste-nom-sacre"
                    value={listNomSacre}
                    onChange={(event) => {
                      setListNomSacre(event.target.value)
                      setListError('')
                      setDirectMessage('')
                    }}
                    onKeyDown={(event) => event.key === 'Enter' && void fetchInscrits(listNomSacre)}
                    placeholder="Nom sacré"
                    autoComplete="off"
                    className="h-11 rounded-xl text-base"
                  />
                  <Button
                    onClick={() => void fetchInscrits(listNomSacre)}
                    disabled={!listNomSacre.trim() || listLoading}
                    className="h-11 shrink-0 bg-gray-900 px-5 text-white hover:bg-gray-800"
                  >
                    {listLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Search className="mr-2 h-4 w-4" />}
                    Voir la liste
                  </Button>
                </div>
                {listError && <p className="mt-3 text-sm text-red-600" role="alert">{listError}</p>}
              </div>
            ) : listLoading ? (
              <div className="flex items-center gap-2 py-8 text-sm text-gray-500">
                <Loader2 className="h-4 w-4 animate-spin" /> Chargement de la liste…
              </div>
            ) : inscrits.length === 0 ? (
              <div className="mt-5 rounded-2xl border border-dashed border-stone-300 px-4 py-8 text-center">
                <Users className="mx-auto h-7 w-7 text-stone-300" />
                <p className="mt-2 text-sm font-medium text-gray-700">Aucune inscription pour le moment</p>
                <p className="mt-1 text-xs text-gray-500">Vous pouvez être la première personne inscrite.</p>
              </div>
            ) : (
              <ol className="mt-5 grid max-h-72 gap-1.5 overflow-y-auto pr-1 sm:grid-cols-2" aria-label="Liste des personnes inscrites">
                {inscrits.map((inscrit, index) => (
                  <li key={inscrit.id} className="flex min-w-0 items-center gap-2.5 rounded-xl border border-stone-200 bg-white px-2.5 py-2">
                    <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-stone-100 text-[11px] font-semibold text-stone-500">
                      {index + 1}
                    </span>
                    <span className="min-w-0 font-serif text-[13px] leading-5 text-gray-800">
                      {inscrit.nom} {inscrit.prenoms}{inscrit.nomSacre ? ` (${inscrit.nomSacre})` : ''}
                    </span>
                  </li>
                ))}
              </ol>
            )}

            {listUnlocked ? (
              <Button
                onClick={() => void registerVerifiedMember()}
                disabled={directRegistering}
                className="mt-6 h-12 w-full bg-gray-900 text-white hover:bg-gray-800"
              >
                {directRegistering && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                S’inscrire
              </Button>
            ) : (
              <Button onClick={openRegistration} className="mt-6 hidden h-12 w-full bg-gray-900 text-white hover:bg-gray-800 sm:flex">
                S’inscrire à cet événement
              </Button>
            )}
            {directMessage && (
              <p className={`mt-3 text-center text-sm ${directMessageType === 'success' ? 'text-emerald-700' : 'text-red-600'}`} role="status">
                {directMessage}
              </p>
            )}
            <button onClick={downloadICS} className="mx-auto mt-3 flex items-center justify-center gap-1.5 py-1.5 text-xs text-gray-400 transition-colors hover:text-gray-700">
              <CalendarPlus className="h-4 w-4" /> Ajouter à mon calendrier
            </button>
          </section>
        </article>
      </main>

      {!listUnlocked && (
        <div className="fixed inset-x-0 bottom-0 z-40 border-t border-stone-200 bg-white/95 px-4 pb-[max(0.75rem,env(safe-area-inset-bottom))] pt-3 backdrop-blur sm:hidden">
          <div className="mx-auto flex max-w-2xl items-center gap-3">
            <div className="min-w-0 flex-1">
              <p className="text-xs text-gray-500">{count} inscrit{count > 1 ? 's' : ''}</p>
              <p className="truncate text-sm font-medium text-gray-900">{traversee.titre}</p>
            </div>
            <Button onClick={openRegistration} className="shrink-0 bg-gray-900 px-5 text-white hover:bg-gray-800">
              S’inscrire
            </Button>
          </div>
        </div>
      )}

      <Dialog open={showModal} onOpenChange={setShowModal}>
        <DialogContent className="w-[calc(100%-1.5rem)] max-h-[90dvh] overflow-y-auto rounded-3xl p-5 sm:max-w-md sm:p-6">
          <DialogHeader>
            <DialogTitle className="text-left text-xl">
              {step === 'success' ? 'Inscription confirmée' : step === 'error' ? 'Impossible de procéder' : 'Inscription'}
            </DialogTitle>
          </DialogHeader>

          {step === 'search' && (
            <div className="space-y-5 pt-1">
              <p className="font-serif text-sm leading-6 text-gray-600">
                Saisissez simplement le nom sacré du membre à inscrire. Aucun mot de passe n’est demandé.
              </p>
              <div className="space-y-2">
                <label htmlFor="nom-sacre" className="text-sm font-medium text-gray-800">Nom sacré</label>
                <Input
                  id="nom-sacre"
                  value={nomSacreInput}
                  onChange={(event) => setNomSacreInput(event.target.value)}
                  onKeyDown={(event) => event.key === 'Enter' && void searchMember()}
                  placeholder="Nom sacré"
                  autoComplete="off"
                  autoFocus
                  className="h-12 rounded-xl text-base"
                />
              </div>
              <Button onClick={() => void searchMember()} disabled={!nomSacreInput.trim() || searching} className="h-12 w-full bg-gray-900 text-white hover:bg-gray-800">
                {searching ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Search className="mr-2 h-4 w-4" />}
                Continuer
              </Button>
            </div>
          )}

          {step === 'confirm' && membreFound && (
            <div className="space-y-5 pt-1">
              <div className="rounded-2xl border border-stone-200 bg-stone-50 p-4">
                <p className="text-lg font-semibold text-gray-950">{membreFound.nomSacre || `${membreFound.nom} ${membreFound.prenoms}`}</p>
                <p className="mt-1 text-sm text-gray-600">{membreFound.nom} {membreFound.prenoms}</p>
                <span className={`mt-3 inline-flex rounded-full border px-2.5 py-1 text-xs ${GRADE_COLORS[membreFound.grade] || 'border-stone-200 bg-white text-stone-700'}`}>
                  {membreFound.grade}
                </span>
              </div>
              {dejaInscrit ? (
                <>
                  <div className="flex items-start gap-3 rounded-xl bg-amber-50 p-4 text-sm text-amber-900">
                    <AlertCircle className="mt-0.5 h-5 w-5 shrink-0" /> Ce membre figure déjà dans la liste des inscrits.
                  </div>
                  <Button variant="outline" onClick={() => setShowModal(false)} className="h-11 w-full">Fermer</Button>
                </>
              ) : (
                <div className="grid grid-cols-2 gap-3">
                  <Button variant="outline" onClick={() => setStep('search')} className="h-11">Modifier</Button>
                  <Button onClick={() => void confirmRegistration()} disabled={registering} className="h-11 bg-gray-900 text-white hover:bg-gray-800">
                    {registering && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Confirmer
                  </Button>
                </div>
              )}
            </div>
          )}

          {step === 'success' && (
            <div className="space-y-5 pt-1 text-center">
              <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-emerald-50">
                <CheckCircle className="h-7 w-7 text-emerald-600" />
              </span>
              <div>
                <p className="font-semibold text-gray-950">Le membre est bien inscrit.</p>
                <p className="mt-1 font-serif text-sm text-gray-600">La liste visible sur cette page vient d’être actualisée.</p>
              </div>
              <Button onClick={() => setShowModal(false)} className="h-11 w-full bg-gray-900 text-white hover:bg-gray-800">Terminer</Button>
            </div>
          )}

          {step === 'error' && (
            <div className="space-y-5 pt-1 text-center">
              <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-red-50">
                <AlertCircle className="h-7 w-7 text-red-600" />
              </span>
              <p className="font-serif text-sm leading-6 text-gray-600">{errorMessage}</p>
              <Button variant="outline" onClick={() => setStep('search')} className="h-11 w-full">Réessayer</Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}

function SiteNav() {
  return (
    <nav className="sticky top-0 z-30 border-b border-stone-200/80 bg-white/90 backdrop-blur">
      <div className="mx-auto flex h-15 max-w-2xl items-center justify-between px-4 sm:px-6">
        <Link href="/" className="flex items-center gap-2.5">
          <img src="/logo-etu.png" alt="Logo ETU" className="h-9 w-9 object-contain" />
          <span className="text-sm font-semibold tracking-wide text-gray-900">ETU Bénin</span>
        </Link>
        <Link href="/programme" className="text-sm text-gray-500 hover:text-gray-900">Programme</Link>
      </div>
    </nav>
  )
}
