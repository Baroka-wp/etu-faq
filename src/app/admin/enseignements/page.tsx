'use client'

import { useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { BookOpen, ExternalLink, Loader2, Search } from 'lucide-react'
import AdminSidebar from '@/components/AdminSidebar'
import { formatAppDate } from '@/lib/datetime'
import { RUBRIQUES_SEANCE, RubriqueSeance } from '@/lib/monographie'

interface Enseignement {
  id: string
  rubrique: RubriqueSeance
  theme: string
  date: string
  activite: string
  lieu: string | null
  lienUnique: string | null
}

const LIBELLES = Object.fromEntries(RUBRIQUES_SEANCE.map(({ cle, label }) => [cle, label])) as Record<
  RubriqueSeance,
  string
>

const BADGES: Record<RubriqueSeance, string> = {
  instruction: 'bg-amber-50 text-amber-800 border-amber-200',
  seminaire: 'bg-sky-50 text-sky-800 border-sky-200',
  sujetPlanche: 'bg-stone-100 text-stone-700 border-stone-200',
}

function sansAccents(value: string) {
  return value.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase()
}

export default function EnseignementsPage() {
  const router = useRouter()
  const [enseignements, setEnseignements] = useState<Enseignement[] | null>(null)
  const [erreur, setErreur] = useState('')
  const [rubrique, setRubrique] = useState<RubriqueSeance | ''>('')
  const [recherche, setRecherche] = useState('')

  useEffect(() => {
    const charger = async () => {
      try {
        const response = await fetch('/api/admin/enseignements')
        if (response.status === 401) {
          router.push('/admin-login')
          return
        }
        const body = await response.json()
        if (!response.ok) throw new Error(body.error)
        setEnseignements(body.data)
      } catch (error) {
        setErreur(error instanceof Error ? error.message : 'Chargement impossible')
      }
    }
    void charger()
  }, [router])

  const logout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' })
    router.push('/admin-login')
  }

  const filtres = useMemo(() => {
    if (!enseignements) return []
    const terme = sansAccents(recherche.trim())
    return enseignements.filter(
      (item) =>
        (!rubrique || item.rubrique === rubrique) &&
        (!terme || sansAccents(`${item.theme} ${item.activite}`).includes(terme)),
    )
  }, [enseignements, rubrique, recherche])

  // Regroupement par mois, du plus récent au plus ancien.
  const parMois = useMemo(() => {
    const groupes = new Map<string, Enseignement[]>()
    for (const item of filtres) {
      const cle = formatAppDate(item.date, { month: 'long', year: 'numeric' })
      groupes.set(cle, [...(groupes.get(cle) ?? []), item])
    }
    return [...groupes.entries()]
  }, [filtres])

  const compte = (cle: RubriqueSeance) => enseignements?.filter((item) => item.rubrique === cle).length ?? 0

  return (
    <div className="min-h-screen bg-gray-50">
      <AdminSidebar activeTab="enseignements" onTabChange={() => undefined} onLogout={logout} />
      <main className="min-h-screen lg:ml-64">
        <header className="border-b border-gray-200 bg-white px-4 py-7 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-4xl pl-12 lg:pl-0">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-gray-400">Transmission</p>
            <h1 className="mt-2 text-3xl font-semibold tracking-tight text-gray-950">Suivi des enseignements</h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-gray-600">
              Les instructions, séminaires et sujets de planche donnés lors des traversées, enregistrés au fil des séances.
            </p>
          </div>
        </header>

        <div className="mx-auto max-w-4xl space-y-6 p-4 sm:p-6 lg:p-8">
          {erreur && (
            <p role="alert" className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {erreur}
            </p>
          )}

          <div className="space-y-3">
            <div className="flex flex-wrap gap-2" role="group" aria-label="Filtrer par type">
              <button
                type="button"
                onClick={() => setRubrique('')}
                aria-pressed={rubrique === ''}
                className={`rounded-full border px-4 py-2 text-sm ${rubrique === '' ? 'border-gray-900 bg-gray-900 text-white' : 'border-gray-300 bg-white text-gray-700 hover:bg-gray-100'}`}
              >
                Tous · {enseignements?.length ?? 0}
              </button>
              {RUBRIQUES_SEANCE.map(({ cle, label }) => (
                <button
                  key={cle}
                  type="button"
                  onClick={() => setRubrique(cle)}
                  aria-pressed={rubrique === cle}
                  className={`rounded-full border px-4 py-2 text-sm ${rubrique === cle ? 'border-gray-900 bg-gray-900 text-white' : 'border-gray-300 bg-white text-gray-700 hover:bg-gray-100'}`}
                >
                  {label} · {compte(cle)}
                </button>
              ))}
            </div>
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" aria-hidden />
              <label htmlFor="recherche-enseignement" className="sr-only">Rechercher un thème</label>
              <input
                id="recherche-enseignement"
                value={recherche}
                onChange={(event) => setRecherche(event.target.value)}
                placeholder="Rechercher un thème ou une activité"
                className="h-11 w-full rounded-xl border border-gray-300 bg-white pl-9 pr-3 text-sm outline-none focus:border-gray-500"
              />
            </div>
          </div>

          {!enseignements ? (
            <div className="flex min-h-48 items-center justify-center">
              <Loader2 className="h-7 w-7 animate-spin text-gray-400" aria-label="Chargement" />
            </div>
          ) : filtres.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-gray-300 bg-white px-6 py-12 text-center">
              <BookOpen className="mx-auto h-8 w-8 text-gray-300" aria-hidden />
              <p className="mt-3 text-sm text-gray-600">
                {enseignements.length === 0
                  ? 'Aucun thème pour l’instant. Ils s’ajoutent dès que le contenu d’une séance est enregistré dans les planifications.'
                  : 'Aucun thème ne correspond à ce filtre.'}
              </p>
            </div>
          ) : (
            parMois.map(([mois, items]) => (
              <section key={mois} aria-label={mois}>
                <h2 className="mb-2 text-sm font-semibold capitalize text-gray-500">{mois}</h2>
                <ul className="divide-y divide-gray-200 overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
                  {items.map((item) => (
                    <li key={item.id} className="flex gap-4 p-4 sm:p-5">
                      <div className="w-12 shrink-0 text-center">
                        <p className="text-2xl font-semibold leading-none text-gray-950">
                          {formatAppDate(item.date, { day: 'numeric' })}
                        </p>
                        <p className="mt-1 text-xs capitalize text-gray-500">
                          {formatAppDate(item.date, { weekday: 'short' })}
                        </p>
                      </div>
                      <div className="min-w-0 flex-1">
                        <span className={`inline-flex rounded-full border px-2.5 py-0.5 text-xs font-medium ${BADGES[item.rubrique]}`}>
                          {LIBELLES[item.rubrique]}
                        </span>
                        <p className="mt-2 text-base font-medium leading-6 text-gray-950">{item.theme}</p>
                        <p className="mt-1 text-sm text-gray-500">
                          {item.activite}
                          {item.lieu ? ` · ${item.lieu}` : ''}
                        </p>
                      </div>
                      {item.lienUnique && (
                        <a
                          href={`/traversee/${item.lienUnique}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg text-gray-400 hover:bg-gray-100 hover:text-gray-700"
                          aria-label={`Ouvrir la page de ${item.activite}`}
                        >
                          <ExternalLink className="h-4 w-4" />
                        </a>
                      )}
                    </li>
                  ))}
                </ul>
              </section>
            ))
          )}
        </div>
      </main>
    </div>
  )
}
