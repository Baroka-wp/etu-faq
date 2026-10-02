'use client'

import { use, useCallback, useEffect, useState } from 'react'
import Link from 'next/link'
import { AlertCircle, BookOpen, Download, KeyRound, Loader2, Lock, UserRound } from 'lucide-react'
import { LIBELLES_TYPE, type TypeRessource } from '@/lib/ressources'

interface RessourcePubliee {
  id: string
  slug: string
  titre: string
  auteur: string
  description: string | null
  type: TypeRessource
  imageUrl: string
  prix: number | null
  gratuit: boolean
  driveUrl: string | null
  accessible: boolean
  gradesAutorises: string[]
}

interface Donnees {
  ouverte: boolean
  lecteur: { genre: 'membre' | 'code'; nom: string } | null
  collection: {
    titre: string
    description: string | null
    nombre: number
    gradesAutorises?: string[]
    ressources?: RessourcePubliee[]
  }
}

export default function PageCollection({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params)
  const [donnees, setDonnees] = useState<Donnees | null>(null)
  const [introuvable, setIntrouvable] = useState(false)
  // Le code est le cas courant : les membres passent par le lien du bas.
  const [mode, setMode] = useState<'nomSacre' | 'code'>('code')
  const [saisie, setSaisie] = useState('')
  const [erreur, setErreur] = useState('')
  const [envoi, setEnvoi] = useState(false)

  const charger = useCallback(async () => {
    try {
      const reponse = await fetch(`/api/collections/${slug}`)
      if (reponse.status === 404) {
        setIntrouvable(true)
        return
      }
      setDonnees(await reponse.json())
    } catch {
      setIntrouvable(true)
    }
  }, [slug])

  useEffect(() => {
    void charger()
  }, [charger])

  const ouvrir = async (evenement: React.FormEvent) => {
    evenement.preventDefault()
    if (!saisie.trim() || envoi) return
    setEnvoi(true)
    setErreur('')
    try {
      const reponse = await fetch('/api/acces', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(mode === 'nomSacre' ? { nomSacre: saisie } : { code: saisie }),
      })
      const corps = await reponse.json()
      if (!reponse.ok) throw new Error(corps.error)
      await charger()
      setSaisie('')
    } catch (erreurOuverture) {
      setErreur(erreurOuverture instanceof Error ? erreurOuverture.message : 'Accès refusé')
    } finally {
      setEnvoi(false)
    }
  }

  const sortir = async () => {
    await fetch('/api/acces', { method: 'DELETE' })
    await charger()
  }

  if (introuvable) {
    return (
      <main className="flex min-h-dvh flex-col items-center justify-center bg-gray-50 px-6 text-center">
        <AlertCircle className="h-10 w-10 text-gray-300" aria-hidden />
        <h1 className="mt-4 text-2xl font-semibold text-gray-950">Collection introuvable</h1>
        <p className="mt-2 text-base text-gray-600">Ce lien ne correspond à aucune collection active.</p>
        <Link href="/bibliotheque" className="mt-6 text-base text-gray-700 underline underline-offset-4">
          Voir la bibliothèque
        </Link>
      </main>
    )
  }

  if (!donnees) {
    return (
      <main className="flex min-h-dvh items-center justify-center bg-gray-50">
        <Loader2 className="h-7 w-7 animate-spin text-gray-400" aria-label="Chargement" />
      </main>
    )
  }

  const { collection, ouverte, lecteur } = donnees

  return (
    <div className="min-h-dvh bg-gray-50">
      <header className="border-b border-gray-200 bg-white">
        <div className="mx-auto flex h-16 max-w-3xl items-center justify-between px-4 sm:px-6">
          <Link href="/" className="flex items-center gap-2.5">
            <img src="/logo-etu.png" alt="" className="h-9 w-9 object-contain" />
            <span className="text-sm font-semibold text-gray-900">ETU Bénin</span>
          </Link>
          {lecteur && (
            <div className="flex items-center gap-3 text-sm text-gray-600">
              <span className="truncate">{lecteur.nom}</span>
              <button onClick={sortir} className="text-gray-500 underline underline-offset-2 hover:text-gray-900">
                Sortir
              </button>
            </div>
          )}
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-4 py-8 sm:px-6 sm:py-10">
        <h1 className="text-2xl font-semibold tracking-tight text-gray-950 sm:text-3xl">{collection.titre}</h1>
        {collection.description && (
          <p className="mt-3 text-base leading-7 text-gray-600">{collection.description}</p>
        )}
        <p className="mt-2 text-sm text-gray-500">
          {collection.nombre} ressource{collection.nombre > 1 ? 's' : ''}
        </p>

        {!ouverte ? (
          <section className="mt-8 rounded-2xl border border-gray-200 bg-white p-5 shadow-sm sm:p-6">
            <h2 className="flex items-center gap-2 text-lg font-semibold text-gray-950">
              <Lock className="h-5 w-5 text-gray-400" aria-hidden /> Collection réservée
            </h2>
            <p className="mt-2 text-base leading-7 text-gray-600">
              {mode === 'code'
                ? 'Entrez le code qui vous a été remis.'
                : 'Entrez votre nom sacré.'}
            </p>

            <form onSubmit={ouvrir} className="mt-5 flex flex-col gap-3 sm:flex-row">
              <label htmlFor="saisie-acces" className="sr-only">
                {mode === 'nomSacre' ? 'Votre nom sacré' : 'Votre code'}
              </label>
              <input
                id="saisie-acces"
                value={saisie}
                onChange={(evenement) => setSaisie(evenement.target.value)}
                placeholder={mode === 'nomSacre' ? 'Nom sacré' : 'Code à 8 caractères'}
                autoComplete="off"
                autoCapitalize={mode === 'code' ? 'characters' : 'none'}
                autoFocus
                className={`h-12 flex-1 rounded-xl border border-gray-300 px-4 text-base text-gray-950 focus:border-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-900/20 ${mode === 'code' ? 'font-mono uppercase tracking-widest' : ''}`}
              />
              <button
                type="submit"
                disabled={envoi || !saisie.trim()}
                className="h-12 rounded-xl bg-gray-900 px-6 text-base font-medium text-white transition hover:bg-gray-800 disabled:opacity-40"
              >
                {envoi ? 'Vérification…' : 'Ouvrir'}
              </button>
            </form>

            {erreur && (
              <p role="alert" className="mt-4 rounded-lg bg-red-50 px-4 py-3 text-base text-red-800">
                {erreur}
              </p>
            )}

            <button
              type="button"
              onClick={() => {
                setMode(mode === 'code' ? 'nomSacre' : 'code')
                setErreur('')
                setSaisie('')
              }}
              className="mt-5 inline-flex items-center gap-2 text-sm text-gray-500 underline underline-offset-4 transition hover:text-gray-900"
            >
              {mode === 'code' ? (
                <>
                  <UserRound className="h-4 w-4" aria-hidden /> Je suis membre
                </>
              ) : (
                <>
                  <KeyRound className="h-4 w-4" aria-hidden /> J’ai un code
                </>
              )}
            </button>
            {lecteur && (
              <p className="mt-4 text-sm text-gray-500">
                Vous êtes reconnu comme {lecteur.nom}, mais cette collection ne vous est pas ouverte.
              </p>
            )}
            {collection.gradesAutorises && collection.gradesAutorises.length > 0 && (
              <p className="mt-2 text-sm text-gray-500">
                Réservée aux grades : {collection.gradesAutorises.join(', ')}.
              </p>
            )}
          </section>
        ) : (
          <ul className="mt-8 space-y-3">
            {(collection.ressources ?? []).map((ressource) => (
              <li
                key={ressource.id}
                className="flex gap-4 rounded-2xl border border-gray-200 bg-white p-4 shadow-sm"
              >
                {ressource.imageUrl ? (
                  <img src={ressource.imageUrl} alt="" className="h-28 w-20 shrink-0 rounded object-cover" />
                ) : (
                  <span className="flex h-28 w-20 shrink-0 items-center justify-center rounded bg-gray-100 text-gray-400">
                    <BookOpen className="h-6 w-6" aria-hidden />
                  </span>
                )}
                <div className="min-w-0 flex-1">
                  <p className="text-xs uppercase tracking-wider text-gray-500">
                    {LIBELLES_TYPE[ressource.type] ?? ressource.type}
                  </p>
                  <h2 className="mt-1 text-base font-semibold leading-6 text-gray-950">{ressource.titre}</h2>
                  <p className="mt-0.5 text-sm text-gray-600">{ressource.auteur}</p>
                  {ressource.description && (
                    <p className="mt-2 line-clamp-3 text-sm leading-6 text-gray-600">{ressource.description}</p>
                  )}
                  <div className="mt-3 flex flex-wrap items-center gap-3">
                    {!ressource.accessible ? (
                      <span className="inline-flex items-center gap-1.5 text-sm text-gray-500">
                        <Lock className="h-4 w-4" aria-hidden />
                        Réservée
                        {ressource.gradesAutorises.length > 0 && ` aux ${ressource.gradesAutorises.join(', ')}`}
                      </span>
                    ) : ressource.driveUrl ? (
                      <a
                        href={ressource.driveUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex h-11 items-center gap-2 rounded-xl bg-gray-900 px-4 text-base font-medium text-white hover:bg-gray-800"
                      >
                        <Download className="h-4 w-4" aria-hidden /> Télécharger
                      </a>
                    ) : (
                      <span className="text-sm text-gray-500">Document à venir</span>
                    )}
                    <span className="text-sm text-gray-600">
                      {ressource.gratuit ? 'Gratuit' : ressource.prix ? `${ressource.prix} FCFA` : ''}
                    </span>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </main>
    </div>
  )
}
