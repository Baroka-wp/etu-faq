'use client'

import { use, useCallback, useEffect, useState } from 'react'
import { Plus } from 'lucide-react'
import ComiteShell, { ComiteMembre } from '@/components/projets/ComiteShell'
import Avancement from '@/components/projets/Avancement'
import TacheLigne, { Tache } from '@/components/projets/TacheLigne'
import { formatAppDate } from '@/lib/datetime'
import { PROJET_STATUTS, PROJET_STATUT_LABELS, ProjetStatut } from '@/lib/projets'

type Commentaire = { id: string; auteur: string; contenu: string; createdAt: string }

type Projet = {
  id: string
  titre: string
  resume: string | null
  description: string | null
  statut: ProjetStatut
  proposePar: string | null
  avancement: number
  tachesTerminees: number
  taches: Tache[]
  commentaires: Commentaire[]
}

export default function ProjetPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const [membre, setMembre] = useState<ComiteMembre | null>(null)
  const [membres, setMembres] = useState<Array<{ id: string; nom: string }>>([])
  const [projet, setProjet] = useState<Projet | null>(null)
  const [erreur, setErreur] = useState('')
  const [occupe, setOccupe] = useState(false)

  const [formOuvert, setFormOuvert] = useState(false)
  const [titre, setTitre] = useState('')
  const [description, setDescription] = useState('')
  const [assigneId, setAssigneId] = useState('')
  const [echeance, setEcheance] = useState('')
  const [mot, setMot] = useState('')

  const chargerProjet = useCallback(async () => {
    const response = await fetch(`/api/projets/${id}`)
    if (response.status === 401) {
      window.location.assign('/projets')
      return
    }
    const body = await response.json()
    if (!response.ok) throw new Error(body.error)
    setProjet(body.projet)
  }, [id])

  useEffect(() => {
    const charger = async () => {
      try {
        const [meResponse, membresResponse] = await Promise.all([
          fetch('/api/projets/me'),
          fetch('/api/projets/membres'),
        ])
        if (meResponse.status === 401) {
          window.location.assign('/projets')
          return
        }
        setMembre((await meResponse.json()).membre)
        setMembres((await membresResponse.json()).membres ?? [])
        await chargerProjet()
      } catch (error) {
        setErreur(error instanceof Error ? error.message : 'Chargement impossible')
      }
    }
    void charger()
  }, [chargerProjet])

  const ajouterTache = async (event: React.FormEvent) => {
    event.preventDefault()
    if (!titre.trim() || occupe) return
    setOccupe(true)
    setErreur('')
    try {
      const response = await fetch(`/api/projets/${id}/taches`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ titre, description, assigneId, echeance }),
      })
      const body = await response.json()
      if (!response.ok) throw new Error(body.error)
      setTitre('')
      setDescription('')
      setAssigneId('')
      setEcheance('')
      setFormOuvert(false)
      await chargerProjet()
    } catch (error) {
      setErreur(error instanceof Error ? error.message : 'Ajout impossible')
    } finally {
      setOccupe(false)
    }
  }

  const changerStatut = async (statut: ProjetStatut) => {
    setOccupe(true)
    setErreur('')
    try {
      const response = await fetch(`/api/projets/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ statut }),
      })
      if (!response.ok) throw new Error((await response.json()).error)
      await chargerProjet()
    } catch (error) {
      setErreur(error instanceof Error ? error.message : 'Modification impossible')
    } finally {
      setOccupe(false)
    }
  }

  const commenterProjet = async (event: React.FormEvent) => {
    event.preventDefault()
    if (!mot.trim() || occupe) return
    setOccupe(true)
    setErreur('')
    try {
      const response = await fetch('/api/projets/commentaires', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ projetId: id, contenu: mot }),
      })
      if (!response.ok) throw new Error((await response.json()).error)
      setMot('')
      await chargerProjet()
    } catch (error) {
      setErreur(error instanceof Error ? error.message : 'Envoi impossible')
    } finally {
      setOccupe(false)
    }
  }

  return (
    <ComiteShell membre={membre} retourHref="/projets/suivi" titre={projet?.titre}>
      {erreur && (
        <p role="alert" className="mb-5 rounded-lg bg-red-50 px-4 py-3 text-base text-red-800">{erreur}</p>
      )}

      {!projet ? (
        <p className="mt-10 text-base text-gray-500">Ouverture…</p>
      ) : (
        <>
          <section className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
            <h1 className="text-2xl font-semibold leading-8 tracking-tight text-gray-950">{projet.titre}</h1>
            {projet.resume && <p className="mt-2 text-base leading-7 text-gray-600">{projet.resume}</p>}
            {projet.description && (
              <p className="mt-3 whitespace-pre-line text-base leading-7 text-gray-700">{projet.description}</p>
            )}

            <div className="mt-5">
              <Avancement
                valeur={projet.avancement}
                etiquette={projet.titre}
                legende={
                  projet.taches.length === 0
                    ? 'Aucune tâche pour l’instant'
                    : `${projet.tachesTerminees} sur ${projet.taches.length} tâches · ${projet.avancement}%`
                }
              />
            </div>

            {membre?.isAdmin ? (
              <fieldset className="mt-5">
                <legend className="text-sm font-semibold uppercase tracking-wide text-gray-500">État du projet</legend>
                <div className="mt-3 flex flex-wrap gap-2">
                  {PROJET_STATUTS.map((statut) => (
                    <button
                      key={statut}
                      type="button"
                      disabled={occupe}
                      aria-pressed={statut === projet.statut}
                      onClick={() => changerStatut(statut)}
                      className={`h-11 rounded-xl border px-4 text-base transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gray-900 disabled:opacity-40 ${
                        statut === projet.statut
                          ? 'border-gray-900 bg-gray-900 font-medium text-white'
                          : 'border-gray-300 text-gray-700 hover:bg-gray-100'
                      }`}
                    >
                      {PROJET_STATUT_LABELS[statut]}
                    </button>
                  ))}
                </div>
              </fieldset>
            ) : (
              <p className="mt-5 text-base text-gray-600">
                {PROJET_STATUT_LABELS[projet.statut]}
                {projet.proposePar && ` · proposé par ${projet.proposePar}`}
              </p>
            )}
          </section>

          <section className="mt-8">
            <h2 className="text-lg font-semibold text-gray-950">
              Tâches <span className="font-normal text-gray-500">({projet.taches.length})</span>
            </h2>

            <ul className="mt-4 space-y-3">
              {projet.taches.map((tache) => (
                <TacheLigne
                  key={tache.id}
                  tache={tache}
                  membres={membres}
                  isAdmin={Boolean(membre?.isAdmin)}
                  onChange={chargerProjet}
                />
              ))}
              {projet.taches.length === 0 && (
                <li className="rounded-2xl border border-dashed border-gray-300 p-6 text-base leading-7 text-gray-600">
                  Rien n’est encore inscrit. La première tâche vous revient.
                </li>
              )}
            </ul>

            <div className="mt-4">
              {!formOuvert ? (
                <button
                  type="button"
                  onClick={() => setFormOuvert(true)}
                  className="flex h-12 w-full items-center justify-center gap-2 rounded-xl border border-gray-300 bg-white text-base font-medium text-gray-800 transition hover:border-gray-400 hover:bg-gray-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gray-900"
                >
                  <Plus className="h-5 w-5" aria-hidden />
                  Ajouter une tâche
                </button>
              ) : (
                <form onSubmit={ajouterTache} className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
                  <h3 className="text-lg font-semibold text-gray-950">Nouvelle tâche</h3>

                  <label htmlFor="tache-titre" className="mt-5 block text-base font-medium text-gray-800">
                    Que faut-il faire ?
                  </label>
                  <input
                    id="tache-titre"
                    value={titre}
                    onChange={(event) => setTitre(event.target.value)}
                    maxLength={200}
                    autoFocus
                    required
                    className="mt-2 h-12 w-full rounded-xl border border-gray-300 px-4 text-base text-gray-950 focus:border-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-900/20"
                  />

                  <label htmlFor="tache-description" className="mt-4 block text-base font-medium text-gray-800">
                    Précisions <span className="font-normal text-gray-500">(facultatif)</span>
                  </label>
                  <textarea
                    id="tache-description"
                    value={description}
                    onChange={(event) => setDescription(event.target.value)}
                    rows={3}
                    maxLength={2000}
                    className="mt-2 w-full rounded-xl border border-gray-300 p-4 text-base leading-7 text-gray-950 focus:border-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-900/20"
                  />

                  <div className="mt-4 grid gap-4 sm:grid-cols-2">
                    <div>
                      <label htmlFor="tache-assigne" className="block text-base font-medium text-gray-800">
                        Confiée à
                      </label>
                      <select
                        id="tache-assigne"
                        value={assigneId}
                        onChange={(event) => setAssigneId(event.target.value)}
                        className="mt-2 h-12 w-full rounded-xl border border-gray-300 bg-white px-3 text-base text-gray-950 focus:border-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-900/20"
                      >
                        <option value="">Personne</option>
                        {membres.map((personne) => (
                          <option key={personne.id} value={personne.id}>{personne.nom}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label htmlFor="tache-echeance" className="block text-base font-medium text-gray-800">
                        Délai
                      </label>
                      <input
                        id="tache-echeance"
                        type="date"
                        value={echeance}
                        onChange={(event) => setEcheance(event.target.value)}
                        className="mt-2 h-12 w-full rounded-xl border border-gray-300 bg-white px-3 text-base text-gray-950 focus:border-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-900/20"
                      />
                    </div>
                  </div>

                  <div className="mt-5 flex flex-col gap-3 sm:flex-row-reverse">
                    <button
                      type="submit"
                      disabled={occupe || !titre.trim()}
                      className="h-12 w-full rounded-xl bg-gray-900 text-base font-medium text-white transition hover:bg-gray-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gray-900 disabled:opacity-40 sm:w-auto sm:px-6"
                    >
                      Inscrire
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
            </div>
          </section>

          <section className="mt-8">
            <h2 className="text-lg font-semibold text-gray-950">Échanges sur le projet</h2>

            {projet.commentaires.length > 0 && (
              <ul className="mt-4 space-y-3">
                {projet.commentaires.map((commentaire) => (
                  <li key={commentaire.id} className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
                    <p className="text-base leading-7 text-gray-800">{commentaire.contenu}</p>
                    <p className="mt-1 text-sm text-gray-600">
                      {commentaire.auteur} · {formatAppDate(commentaire.createdAt, { day: 'numeric', month: 'long' })}
                    </p>
                  </li>
                ))}
              </ul>
            )}

            <form onSubmit={commenterProjet} className="mt-4 flex flex-col gap-3 sm:flex-row">
              <label htmlFor="projet-mot" className="sr-only">Ajouter un commentaire sur le projet</label>
              <input
                id="projet-mot"
                value={mot}
                onChange={(event) => setMot(event.target.value)}
                placeholder="Ajouter un mot"
                maxLength={2000}
                enterKeyHint="send"
                className="h-12 flex-1 rounded-xl border border-gray-300 px-4 text-base text-gray-950 placeholder:text-gray-500 focus:border-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-900/20"
              />
              <button
                type="submit"
                disabled={occupe || !mot.trim()}
                className="h-12 rounded-xl bg-gray-900 px-6 text-base font-medium text-white transition hover:bg-gray-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gray-900 disabled:opacity-40"
              >
                Envoyer
              </button>
            </form>
          </section>
        </>
      )}
    </ComiteShell>
  )
}
