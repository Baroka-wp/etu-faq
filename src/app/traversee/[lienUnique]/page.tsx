'use client'

import { useCallback, useEffect, useState } from 'react'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import {
  AlertCircle,
  ArrowLeft,
  BookOpen,
  Calendar,
  CalendarPlus,
  CheckCircle,
  Loader2,
  MapPin,
  MessageCircle,
  Search,
  Users,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { formatAppDate, formatAppTime } from '@/lib/datetime'
import {
  MONOGRAPHIE_DEPOT,
  RUBRIQUES_SEANCE,
  formatPrixFcfa,
  lienDemandeMonographie,
  sujetMonographie,
} from '@/lib/monographie'
import { nomInitiatique } from '@/lib/titre-initiatique'

interface TraverseeData {
  id: string
  type: string
  titre: string
  description: string
  date: string
  lieu: string
  lienUnique: string
  gradesAutorises: string[]
  instruction: string | null
  seminaire: string | null
  sujetPlanche: string | null
  monographieActive: boolean
  monographiePrix: number
  monographieImageUrl: string | null
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
  grade: string
}

type ModalStep = 'search' | 'verifying' | 'confirm' | 'monographie' | 'success' | 'error'

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

function forgetNomSacre() {
  try {
    localStorage.removeItem(STORAGE_KEY)
  } catch {
    // Rien à oublier si le stockage est indisponible.
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
  const [notFound, setNotFound] = useState(false)

  // Liste des inscrits : ouverte directement si le nom sacré est déjà mémorisé.
  const [nomMemorise, setNomMemorise] = useState('')
  const [listUnlocked, setListUnlocked] = useState(false)
  const [listLoading, setListLoading] = useState(false)
  const [listNomSacre, setListNomSacre] = useState('')
  const [listError, setListError] = useState('')
  const [moiInscrit, setMoiInscrit] = useState(false)

  const [showModal, setShowModal] = useState(false)
  const [step, setStep] = useState<ModalStep>('search')
  const [nomSacreInput, setNomSacreInput] = useState('')
  const [eventToken, setEventToken] = useState('')
  const [membreFound, setMembreFound] = useState<MembreFound | null>(null)
  const [dejaInscrit, setDejaInscrit] = useState(false)
  const [searching, setSearching] = useState(false)
  const [registering, setRegistering] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')
  const [numeroCopie, setNumeroCopie] = useState(false)
  // Fenêtre de la monographie ouverte depuis la page, hors inscription.
  const [monographieSeule, setMonographieSeule] = useState(false)
  const [couvertureAgrandie, setCouvertureAgrandie] = useState(false)

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

  const fetchInscrits = useCallback(async (nomSacre: string, silencieux = false) => {
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
        // Un nom mémorisé devenu invalide est oublié : on repropose la saisie.
        if (silencieux && response.status === 404) {
          forgetNomSacre()
          setNomMemorise('')
        } else {
          setListError(body.error || 'Impossible d’afficher la liste.')
        }
        setListUnlocked(false)
        return
      }
      setInscrits(body.data)
      setMoiInscrit(body.dejaInscrit === true)
      setListUnlocked(true)
      rememberNomSacre(value)
      setNomMemorise(value)
    } catch {
      if (!silencieux) setListError('La vérification est momentanément indisponible.')
      setListUnlocked(false)
    } finally {
      setListLoading(false)
    }
  }, [lienUnique])

  useEffect(() => {
    void fetchTraversee()
  }, [fetchTraversee])

  useEffect(() => {
    const memorise = storedNomSacre()
    if (!memorise) return
    setNomMemorise(memorise)
    void fetchInscrits(memorise, true)
  }, [fetchInscrits])

  const changerDeNom = () => {
    forgetNomSacre()
    setNomMemorise('')
    setListUnlocked(false)
    setInscrits([])
    setMoiInscrit(false)
    setListNomSacre('')
  }

  const searchMember = async (valeur: string) => {
    const nomSacre = valeur.trim()
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
      setNomSacreInput(nomSacre)
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

  const ouvrirMonographie = () => {
    setCouvertureAgrandie(false)
    setMonographieSeule(true)
    setNumeroCopie(false)
    setStep('monographie')
    setShowModal(true)
  }

  /** « S'inscrire » : on confirme d'abord l'identité, jamais d'inscription directe. */
  const openRegistration = () => {
    setCouvertureAgrandie(false)
    setMonographieSeule(false)
    setMembreFound(null)
    setEventToken('')
    setDejaInscrit(false)
    setErrorMessage('')
    setShowModal(true)
    const memorise = storedNomSacre()
    if (memorise) {
      setNomSacreInput(memorise)
      setStep('verifying')
      void searchMember(memorise)
    } else {
      setNomSacreInput('')
      setStep('search')
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
      setStep(traversee?.monographieActive ? 'monographie' : 'success')
      await Promise.all([fetchTraversee(), fetchInscrits(nomSacreInput)])
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
  const rubriques = RUBRIQUES_SEANCE.filter(({ cle }) => traversee[cle])
  const ouvertureAuto = Boolean(nomMemorise) && !listUnlocked && listLoading

  return (
    <div className="min-h-screen bg-[#faf9f6] pb-24 text-[#282724] sm:pb-10">
      <SiteNav />
      <main className="mx-auto max-w-2xl px-4 py-5 sm:px-6 sm:py-10">
        <Link href="/programme" className="mb-5 inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-900">
          <ArrowLeft className="h-4 w-4" /> Programme du mois
        </Link>

        <article className="border-t border-stone-200">
          <div className="py-6 sm:py-8">
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

            {rubriques.length > 0 && (
              <dl className="mt-6 space-y-4">
                {rubriques.map(({ cle, label }) => (
                  <div key={cle}>
                    <dt className="text-xs font-semibold uppercase tracking-wider text-amber-800">{label}</dt>
                    <dd className="mt-1 whitespace-pre-line font-serif text-base leading-7 text-gray-800">
                      {traversee[cle]}
                    </dd>
                  </div>
                ))}
              </dl>
            )}

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

          <section className="border-t border-stone-200 py-6 sm:py-8" aria-labelledby="inscrits-title">
            <h2 id="inscrits-title" className="flex items-center gap-2.5 text-lg font-semibold text-gray-950">
              <span className="inline-flex h-9 min-w-9 items-center justify-center rounded-full bg-gray-900 px-2.5 text-base font-bold text-white shadow-sm">
                {count}
              </span>
              <span>personne{count > 1 ? 's' : ''} inscrite{count > 1 ? 's' : ''}</span>
            </h2>

            {ouvertureAuto ? (
              <div className="flex items-center gap-2 py-6 text-sm text-gray-500">
                <Loader2 className="h-4 w-4 animate-spin" /> Chargement de la liste…
              </div>
            ) : !listUnlocked ? (
              // Première visite : on demande le nom sacré une seule fois.
              <div className="mt-5 rounded-2xl border border-stone-200 bg-white p-4 sm:p-5">
                <label htmlFor="liste-nom-sacre" className="text-sm font-medium text-gray-800">Votre nom sacré</label>
                <p className="mt-0.5 text-sm text-gray-500">Pour consulter la liste. Il sera retenu sur cet appareil.</p>
                <div className="mt-3 flex flex-col gap-2 sm:flex-row">
                  <Input
                    id="liste-nom-sacre"
                    value={listNomSacre}
                    onChange={(event) => {
                      setListNomSacre(event.target.value)
                      setListError('')
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
            ) : inscrits.length === 0 ? (
              <p className="mt-4 flex items-center gap-2 text-sm text-gray-500">
                <Users className="h-4 w-4" aria-hidden /> Aucune inscription pour le moment.
              </p>
            ) : (
              <ol className="mt-4 divide-y divide-stone-100" aria-label="Liste des personnes inscrites">
                {inscrits.map((inscrit, index) => {
                  const { principal, civil } = nomInitiatique(inscrit)
                  return (
                    <li key={inscrit.id} className="flex items-baseline gap-3 py-2">
                      <span className="w-6 shrink-0 text-right text-sm tabular-nums text-stone-400">{index + 1}</span>
                      <span className="min-w-0 font-serif text-[15px] leading-6">
                        <span className="text-gray-900">{principal}</span>
                        {civil && <span className="text-gray-500"> ({civil})</span>}
                      </span>
                    </li>
                  )
                })}
              </ol>
            )}

            {moiInscrit ? (
              <div className="mt-6 border-t border-stone-200 pt-5">
                <p className="flex items-center gap-2 text-sm font-medium text-emerald-800">
                  <CheckCircle className="h-4 w-4 shrink-0" aria-hidden /> Vous êtes inscrit à cette traversée.
                </p>
                {traversee.monographieActive && (
                  <Button onClick={ouvrirMonographie} className="mt-5 hidden h-12 w-full bg-amber-800 text-white hover:bg-amber-900 sm:flex">
                    <BookOpen className="mr-2 h-4 w-4" aria-hidden />
                    Obtenir la monographie
                  </Button>
                )}
              </div>
            ) : (
              <Button onClick={openRegistration} className="mt-6 hidden h-12 w-full bg-gray-900 text-white hover:bg-gray-800 sm:flex">
                S’inscrire à cet événement
              </Button>
            )}

            <div className="mt-3 flex flex-wrap items-center justify-center gap-x-5 gap-y-1">
              <button onClick={downloadICS} className="flex items-center gap-1.5 py-1.5 text-xs text-gray-400 transition-colors hover:text-gray-700">
                <CalendarPlus className="h-4 w-4" /> Ajouter à mon calendrier
              </button>
              {listUnlocked && (
                <button onClick={changerDeNom} className="py-1.5 text-xs text-gray-400 transition-colors hover:text-gray-700">
                  Ce n’est pas vous ? Changer de nom sacré
                </button>
              )}
            </div>
          </section>
        </article>
      </main>

      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-stone-200 bg-white/95 px-4 pb-[max(0.75rem,env(safe-area-inset-bottom))] pt-3 backdrop-blur sm:hidden">
        <div className="mx-auto flex max-w-2xl items-center gap-3">
          <div className="min-w-0 flex-1">
            <p className="text-xs text-gray-500">{count} inscrit{count > 1 ? 's' : ''}</p>
            <p className="truncate text-sm font-medium text-gray-900">{traversee.titre}</p>
          </div>
          {!moiInscrit ? (
            <Button onClick={openRegistration} className="h-11 shrink-0 bg-gray-900 px-5 text-white hover:bg-gray-800">
              S’inscrire
            </Button>
          ) : traversee.monographieActive ? (
            <Button onClick={ouvrirMonographie} className="h-11 shrink-0 bg-amber-800 px-4 text-white hover:bg-amber-900">
              <BookOpen className="mr-2 h-4 w-4" aria-hidden /> Obtenir la monographie
            </Button>
          ) : (
            <span className="flex shrink-0 items-center gap-1.5 text-sm font-medium text-emerald-800">
              <CheckCircle className="h-4 w-4" aria-hidden /> Inscrit
            </span>
          )}
        </div>
      </div>

      <Dialog open={showModal} onOpenChange={setShowModal}>
        <DialogContent className="w-[calc(100%-1.5rem)] max-h-[90dvh] overflow-y-auto rounded-3xl p-5 sm:max-w-md sm:p-6">
          <DialogHeader>
            <DialogTitle className="text-left text-xl">
              {step === 'success'
                ? 'Inscription confirmée'
                : step === 'monographie'
                  ? monographieSeule ? 'Monographie' : 'Vous êtes inscrit'
                  : step === 'error'
                    ? 'Impossible de procéder'
                    : step === 'confirm'
                      ? 'Est-ce bien vous ?'
                      : 'Inscription'}
            </DialogTitle>
          </DialogHeader>

          {step === 'verifying' && (
            <div className="flex items-center gap-2 py-8 text-sm text-gray-500">
              <Loader2 className="h-4 w-4 animate-spin" /> Vérification de votre nom sacré…
            </div>
          )}

          {step === 'search' && (
            <div className="space-y-5 pt-1">
              <p className="font-serif text-sm leading-6 text-gray-600">
                Saisissez votre nom sacré. Aucun mot de passe n’est demandé.
              </p>
              <div className="space-y-2">
                <label htmlFor="nom-sacre" className="text-sm font-medium text-gray-800">Nom sacré</label>
                <Input
                  id="nom-sacre"
                  value={nomSacreInput}
                  onChange={(event) => setNomSacreInput(event.target.value)}
                  onKeyDown={(event) => event.key === 'Enter' && void searchMember(nomSacreInput)}
                  placeholder="Nom sacré"
                  autoComplete="off"
                  autoFocus
                  className="h-12 rounded-xl text-base"
                />
              </div>
              <Button onClick={() => void searchMember(nomSacreInput)} disabled={!nomSacreInput.trim() || searching} className="h-12 w-full bg-gray-900 text-white hover:bg-gray-800">
                {searching ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Search className="mr-2 h-4 w-4" />}
                Continuer
              </Button>
            </div>
          )}

          {step === 'confirm' && membreFound && (
            <div className="space-y-5 pt-1">
              <div className="rounded-2xl border border-stone-200 bg-stone-50 p-5 text-center">
                <p className="text-xs uppercase tracking-wider text-gray-500">Nom sacré</p>
                <p className="mt-1 text-2xl font-semibold tracking-wide text-gray-950">
                  {membreFound.nomSacre || `${membreFound.nom} ${membreFound.prenoms}`}
                </p>
                <p className="mt-1 text-sm text-gray-600">{membreFound.nom} {membreFound.prenoms}</p>
                <span className={`mt-3 inline-flex rounded-full border px-2.5 py-1 text-xs ${GRADE_COLORS[membreFound.grade] || 'border-stone-200 bg-white text-stone-700'}`}>
                  {membreFound.grade}
                </span>
              </div>
              {dejaInscrit ? (
                <>
                  <div className="flex items-start gap-3 rounded-xl bg-amber-50 p-4 text-sm text-amber-900">
                    <AlertCircle className="mt-0.5 h-5 w-5 shrink-0" /> Vous figurez déjà dans la liste des inscrits.
                  </div>
                  <Button variant="outline" onClick={() => setShowModal(false)} className="h-11 w-full">Fermer</Button>
                </>
              ) : (
                <div className="grid grid-cols-2 gap-3">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setNomSacreInput('')
                      setStep('search')
                    }}
                    className="h-11"
                  >
                    Ce n’est pas moi
                  </Button>
                  <Button onClick={() => void confirmRegistration()} disabled={registering} className="h-11 bg-gray-900 text-white hover:bg-gray-800">
                    {registering && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Oui, m’inscrire
                  </Button>
                </div>
              )}
            </div>
          )}

          {step === 'monographie' && couvertureAgrandie && traversee.monographieImageUrl && (
            <button
              type="button"
              onClick={() => setCouvertureAgrandie(false)}
              className="block w-full cursor-zoom-out pt-1"
              aria-label="Réduire la couverture"
            >
              <img
                src={traversee.monographieImageUrl}
                alt={`Couverture de la monographie : ${sujetMonographie(traversee)}`}
                className="mx-auto max-h-[70dvh] w-full rounded-lg object-contain"
              />
              <span className="mt-3 block text-center text-xs text-gray-500">Toucher l’image pour la réduire</span>
            </button>
          )}

          {step === 'monographie' && !couvertureAgrandie && (
            <div className="space-y-5 pt-1">
              <p className="font-serif text-sm leading-6 text-gray-600">
                {monographieSeule
                  ? 'Cette séance s’appuie sur une monographie.'
                  : 'Cette séance s’appuie sur une monographie. Souhaitez-vous l’acquérir ?'}
              </p>
              <div className="flex gap-4 rounded-2xl border border-stone-200 bg-stone-50 p-4">
                {traversee.monographieImageUrl ? (
                  <button
                    type="button"
                    onClick={() => setCouvertureAgrandie(true)}
                    className="shrink-0 cursor-zoom-in rounded-md focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gray-900"
                    aria-label="Agrandir la couverture"
                  >
                    <img
                      src={traversee.monographieImageUrl}
                      alt="Couverture de la monographie"
                      className="h-36 w-24 rounded-md object-cover shadow-sm"
                    />
                  </button>
                ) : (
                  <span className="flex h-36 w-24 shrink-0 items-center justify-center rounded-md bg-white text-stone-400">
                    <BookOpen className="h-7 w-7" aria-hidden />
                  </span>
                )}
                <div className="min-w-0">
                  <p className="text-xs uppercase tracking-wider text-gray-500">Monographie</p>
                  <p className="mt-1 font-medium leading-6 text-gray-950">{sujetMonographie(traversee)}</p>
                  <p className="mt-2 text-lg font-semibold text-gray-950">{formatPrixFcfa(traversee.monographiePrix)}</p>
                  <p className="mt-1 text-xs leading-5 text-gray-500">Version papier uniquement, à retirer au Temple ou à l’École.</p>
                </div>
              </div>
              <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4">
                <p className="text-sm font-medium text-amber-950">Pour l’obtenir</p>
                <ol className="mt-2 space-y-2 text-sm leading-6 text-amber-950">
                  <li>
                    1. Faites le dépôt de {formatPrixFcfa(traversee.monographiePrix)} au{' '}
                    <a href={`tel:${MONOGRAPHIE_DEPOT.numero}`} className="whitespace-nowrap font-semibold underline underline-offset-2">
                      {MONOGRAPHIE_DEPOT.affichage}
                    </a>{' '}
                    ({MONOGRAPHIE_DEPOT.titulaire}).
                  </li>
                  <li>2. Touchez « L’obtenir » et envoyez la capture d’écran du dépôt sur WhatsApp.</li>
                </ol>
                <button
                  type="button"
                  onClick={() => {
                    void navigator.clipboard?.writeText(MONOGRAPHIE_DEPOT.numero).then(() => setNumeroCopie(true))
                  }}
                  className="mt-3 text-xs font-medium text-amber-900 underline underline-offset-2"
                >
                  {numeroCopie ? 'Numéro copié' : 'Copier le numéro'}
                </button>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <Button
                  variant="outline"
                  onClick={() => (monographieSeule ? setShowModal(false) : setStep('success'))}
                  className="h-12"
                >
                  Je l’ai déjà
                </Button>
                <a
                  href={lienDemandeMonographie({
                    nomSacre: membreFound?.nomSacre || nomSacreInput || nomMemorise || null,
                    sujet: sujetMonographie(traversee),
                    evenement: traversee.titre,
                    date: formatDate(traversee.date),
                    prix: traversee.monographiePrix,
                  })}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => (monographieSeule ? setShowModal(false) : setStep('success'))}
                  className="inline-flex h-12 items-center justify-center gap-2 rounded-md bg-[#25D366] px-4 text-sm font-medium text-white hover:bg-[#1ebe5b]"
                >
                  <MessageCircle className="h-4 w-4" aria-hidden /> L’obtenir
                </a>
              </div>
              <p className="text-center text-xs text-gray-500">« L’obtenir » ouvre WhatsApp avec un message déjà rédigé ; joignez-y la capture.</p>
            </div>
          )}

          {step === 'success' && (
            <div className="space-y-5 pt-1 text-center">
              <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-emerald-50">
                <CheckCircle className="h-7 w-7 text-emerald-600" />
              </span>
              <div>
                <p className="font-semibold text-gray-950">Vous êtes bien inscrit.</p>
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
              <Button
                variant="outline"
                onClick={() => {
                  setNomSacreInput('')
                  setStep('search')
                }}
                className="h-11 w-full"
              >
                Réessayer
              </Button>
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
