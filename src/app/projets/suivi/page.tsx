'use client'

import { useCallback, useEffect, useState } from 'react'
import Link from 'next/link'
import { ChevronRight, MessageSquare, Plus } from 'lucide-react'
import ComiteShell, { ComiteMembre } from '@/components/projets/ComiteShell'
import Avancement from '@/components/projets/Avancement'
import { PROJET_STATUT_LABELS, ProjetStatut } from '@/lib/projets'

type ProjetResume = {
  id: string
  titre: string
  resume: string | null
  statut: ProjetStatut
  proposePar: string | null
  taches: number
  tachesTerminees: number
  avancement: number
  commentaires: number
}

export default function ProjetsPage() {
  const [membre, setMembre] = useState<ComiteMembre | null>(null)
  const [projets, setProjets] = useState<ProjetResume[] | null>(null)
  const [erreur, setErreur] = useState('')
  const [formOuvert, setFormOuvert] = useState(false)
  const [titre, setTitre] = useState('')
  const [resume, setResume] = useState('')
  const [description, setDescription] = useState('')
  const [envoi, setEnvoi] = useState(false)

  const charger = useCallback(async () => {
    try {
      const [meResponse, projetsResponse] = await Promise.all([
        fetch('/api/projets/me'),
        fetch('/api/projets'),
      ])
      if (meResponse.status === 401 || projetsResponse.status === 401) {
        window.location.assign('/projets')
        return
      }
      const me = await meResponse.json()
      const liste = await projetsResponse.json()
      if (!projetsResponse.ok) throw new Error(liste.error)
      setMembre(me.membre)
      setProjets(liste.projets)
    } catch (error) {
      setErreur(error instanceof Error ? error.message : 'Chargement impossible')
    }
  }, [])

  useEffect(() => {
    void charger()
  }, [charger])

  const suggerer = async (event: React.FormEvent) => {
    event.preventDefault()
    if (!titre.trim() || envoi) return

    setEnvoi(true)
    setErreur('')
    try {
      const response = await fetch('/api/projets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ titre, resume, description }),
      })
      const body = await response.json()
      if (!response.ok) throw new Error(body.error)
      setTitre('')
      setResume('')
      setDescription('')
      setFormOuvert(false)
      await charger()
    } catch (error) {
      setErreur(error instanceof Error ? error.message : 'Enregistrement impossible')
    } finally {
      setEnvoi(false)
    }
  }

  return (
    <ComiteShell membre={membre}>
      <h1 className="text-2xl font-semibold tracking-tight text-gray-950 sm:text-3xl">Les projets</h1>
      <p className="mt-2 text-base leading-7 text-gray-600">
        Nous ne soumettons pas de propositions : nous suivons, et nous agissons.
      </p>

      {erreur && (
        <p role="alert" className="mt-5 rounded-lg bg-red-50 px-4 py-3 text-base text-red-800">{erreur}</p>
      )}

      {!projets ? (
        <p className="mt-10 text-base text-gray-500">Ouverture…</p>
      ) : (
        <ul className="mt-6 space-y-3">
          {projets.map((projet) => (
            <li key={projet.id}>
              <Link
                href={`/projets/suivi/${projet.id}`}
                className="block rounded-2xl border border-gray-200 bg-white p-5 shadow-sm transition hover:border-gray-300 hover:shadow-md focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gray-900"
              >
                <div className="flex items-start justify-between gap-3">
                  <h2 className="text-lg font-semibold leading-7 text-gray-950">{projet.titre}</h2>
                  <ChevronRight className="mt-1 h-5 w-5 shrink-0 text-gray-400" aria-hidden />
                </div>

                {projet.statut !== 'en_cours' && (
                  <p className="mt-2 inline-block rounded-full bg-gray-100 px-3 py-1 text-sm font-medium text-gray-700">
                    {PROJET_STATUT_LABELS[projet.statut]}
                  </p>
                )}

                {projet.resume && (
                  <p className="mt-2 text-base leading-7 text-gray-600">{projet.resume}</p>
                )}

                <div className="mt-4">
                  <Avancement
                    valeur={projet.avancement}
                    etiquette={projet.titre}
                    legende={
                      projet.taches === 0
                        ? 'Aucune tâche pour l’instant'
                        : `${projet.tachesTerminees} sur ${projet.taches} tâches`
                    }
                  />
                </div>

                {projet.commentaires > 0 && (
                  <p className="mt-3 flex items-center gap-2 text-sm text-gray-600">
                    <MessageSquare className="h-4 w-4" aria-hidden />
                    {projet.commentaires} commentaire{projet.commentaires > 1 ? 's' : ''}
                  </p>
                )}
              </Link>
            </li>
          ))}

          {projets.length === 0 && (
            <li className="rounded-2xl border border-dashed border-gray-300 p-6 text-base text-gray-600">
              Aucun projet suivi pour l’instant.
            </li>
          )}
        </ul>
      )}

      <section className="mt-8">
        {!formOuvert ? (
          <button
            type="button"
            onClick={() => setFormOuvert(true)}
            className="flex h-12 w-full items-center justify-center gap-2 rounded-xl border border-gray-300 bg-white text-base font-medium text-gray-800 transition hover:border-gray-400 hover:bg-gray-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gray-900"
          >
            <Plus className="h-5 w-5" aria-hidden />
            Suggérer un projet
          </button>
        ) : (
          <form onSubmit={suggerer} className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
            <h2 className="text-lg font-semibold text-gray-950">Nouveau projet</h2>

            <label htmlFor="projet-titre" className="mt-5 block text-base font-medium text-gray-800">Titre</label>
            <input
              id="projet-titre"
              value={titre}
              onChange={(event) => setTitre(event.target.value)}
              maxLength={160}
              autoFocus
              required
              className="mt-2 h-12 w-full rounded-xl border border-gray-300 px-4 text-base text-gray-950 focus:border-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-900/20"
            />

            <label htmlFor="projet-resume" className="mt-4 block text-base font-medium text-gray-800">En une phrase</label>
            <input
              id="projet-resume"
              value={resume}
              onChange={(event) => setResume(event.target.value)}
              maxLength={300}
              className="mt-2 h-12 w-full rounded-xl border border-gray-300 px-4 text-base text-gray-950 focus:border-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-900/20"
            />

            <label htmlFor="projet-description" className="mt-4 block text-base font-medium text-gray-800">
              Ce qu’il faut accomplir <span className="font-normal text-gray-500">(facultatif)</span>
            </label>
            <textarea
              id="projet-description"
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              rows={4}
              maxLength={4000}
              className="mt-2 w-full rounded-xl border border-gray-300 p-4 text-base leading-7 text-gray-950 focus:border-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-900/20"
            />

            {membre && !membre.isAdmin && (
              <p className="mt-4 text-sm leading-6 text-gray-600">
                Votre projet apparaîtra comme proposé, en attente d’ouverture par l’administrateur.
              </p>
            )}

            <div className="mt-5 flex flex-col gap-3 sm:flex-row-reverse">
              <button
                type="submit"
                disabled={envoi || !titre.trim()}
                className="h-12 w-full rounded-xl bg-gray-900 text-base font-medium text-white transition hover:bg-gray-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gray-900 disabled:opacity-40 sm:w-auto sm:px-6"
              >
                {envoi ? 'Enregistrement…' : 'Enregistrer'}
              </button>
              <button
                type="button"
                onClick={() => setFormOuvert(false)}
                className="h-12 w-full rounded-xl border border-gray-300 text-base text-gray-700 transition hover:bg-gray-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gray-900 sm:w-auto sm:px-6"
              >
                Annuler
              </button>
            </div>
          </form>
        )}
      </section>
    </ComiteShell>
  )
}
