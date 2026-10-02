'use client'

import { useCallback, useEffect, useState } from 'react'
import { Check, Clipboard, Layers, Loader2, Lock, Pencil, Plus, Trash2, X } from 'lucide-react'
import { GRADES, LIBELLES_TYPE, type TypeRessource } from '@/lib/ressources'
import type { Ressource } from './OngletRessources'

interface Collection {
  id: string
  titre: string
  slug: string
  description: string | null
  acces: 'public' | 'restreint'
  gradesAutorises: string[]
  publie: boolean
  codes: number
  ressources: Array<{ id: string; titre: string; type: TypeRessource; imageUrl: string }>
}

const VIDE = {
  titre: '',
  description: '',
  acces: 'restreint' as 'public' | 'restreint',
  gradesAutorises: [] as string[],
  publie: true,
  ressourceIds: [] as string[],
}

export default function OngletCollections({
  onMessage,
}: {
  onMessage: (message: { type: 'success' | 'error'; texte: string }) => void
}) {
  const [collections, setCollections] = useState<Collection[] | null>(null)
  const [ressources, setRessources] = useState<Ressource[]>([])
  const [edition, setEdition] = useState<{ id: string | null; form: typeof VIDE } | null>(null)
  const [enCours, setEnCours] = useState(false)
  const [copie, setCopie] = useState<string | null>(null)

  const charger = useCallback(async () => {
    try {
      const [reponseCollections, reponseRessources] = await Promise.all([
        fetch('/api/admin/collections'),
        fetch('/api/admin/bibliotheque'),
      ])
      setCollections((await reponseCollections.json()).data ?? [])
      setRessources((await reponseRessources.json()).books ?? [])
    } catch {
      onMessage({ type: 'error', texte: 'Collections indisponibles' })
    }
  }, [onMessage])

  useEffect(() => {
    void charger()
  }, [charger])

  const ouvrir = (collection?: Collection) => {
    setEdition(
      collection
        ? {
            id: collection.id,
            form: {
              titre: collection.titre,
              description: collection.description ?? '',
              acces: collection.acces,
              gradesAutorises: collection.gradesAutorises ?? [],
              publie: collection.publie,
              ressourceIds: collection.ressources.map((item) => item.id),
            },
          }
        : { id: null, form: { ...VIDE } },
    )
  }

  const majForm = (champs: Partial<typeof VIDE>) =>
    setEdition((courant) => (courant ? { ...courant, form: { ...courant.form, ...champs } } : courant))

  const basculerRessource = (id: string) => {
    if (!edition) return
    const { ressourceIds } = edition.form
    majForm({
      ressourceIds: ressourceIds.includes(id)
        ? ressourceIds.filter((item) => item !== id)
        : [...ressourceIds, id],
    })
  }

  const enregistrer = async (evenement: React.FormEvent) => {
    evenement.preventDefault()
    if (!edition || enCours) return
    setEnCours(true)
    try {
      const reponse = await fetch(
        edition.id ? `/api/admin/collections/${edition.id}` : '/api/admin/collections',
        {
          method: edition.id ? 'PATCH' : 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(edition.form),
        },
      )
      const corps = await reponse.json()
      if (!reponse.ok) throw new Error(corps.error)
      setEdition(null)
      await charger()
      onMessage({ type: 'success', texte: edition.id ? 'Collection modifiée' : 'Collection créée' })
    } catch (erreur) {
      onMessage({ type: 'error', texte: erreur instanceof Error ? erreur.message : 'Enregistrement impossible' })
    } finally {
      setEnCours(false)
    }
  }

  const supprimer = async (collection: Collection) => {
    if (!window.confirm(`Supprimer la collection « ${collection.titre} » ? Les ressources sont conservées.`)) return
    try {
      const reponse = await fetch(`/api/admin/collections/${collection.id}`, { method: 'DELETE' })
      if (!reponse.ok) throw new Error((await reponse.json()).error)
      await charger()
      onMessage({ type: 'success', texte: 'Collection supprimée' })
    } catch (erreur) {
      onMessage({ type: 'error', texte: erreur instanceof Error ? erreur.message : 'Suppression impossible' })
    }
  }

  const copierLien = async (collection: Collection) => {
    const lien = `${window.location.origin}/collection/${collection.slug}`
    await navigator.clipboard.writeText(lien)
    setCopie(collection.id)
    window.setTimeout(() => setCopie(null), 2000)
  }

  return (
    <div>
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm text-gray-600">
          Un ensemble de ressources, partagé par un lien unique.
        </p>
        <button
          onClick={() => ouvrir()}
          className="inline-flex h-11 shrink-0 items-center gap-2 rounded-xl bg-gray-900 px-4 text-sm font-medium text-white hover:bg-gray-800"
        >
          <Plus className="h-4 w-4" /> Nouvelle collection
        </button>
      </div>

      {!collections ? (
        <p className="py-10 text-center text-sm text-gray-500">Chargement…</p>
      ) : collections.length === 0 ? (
        <p className="mt-6 rounded-2xl border border-dashed border-gray-300 bg-white px-6 py-10 text-center text-sm text-gray-600">
          Aucune collection. Réunissez plusieurs ressources pour les partager d’un seul lien.
        </p>
      ) : (
        <ul className="mt-4 space-y-3">
          {collections.map((collection) => (
            <li key={collection.id} className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <h3 className="flex items-center gap-2 text-base font-semibold text-gray-950">
                    <Layers className="h-4 w-4 text-gray-400" aria-hidden />
                    {collection.titre}
                  </h3>
                  {collection.description && (
                    <p className="mt-1 text-sm text-gray-600">{collection.description}</p>
                  )}
                  <p className="mt-2 flex flex-wrap items-center gap-1.5 text-xs">
                    <span className="rounded-full bg-gray-100 px-2 py-0.5 text-gray-700">
                      {collection.ressources.length} ressource(s)
                    </span>
                    {collection.acces === 'restreint' ? (
                      <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2 py-0.5 text-amber-800">
                        <Lock className="h-3 w-3" aria-hidden /> Nom sacré ou code
                        {collection.gradesAutorises.length > 0 && ` · ${collection.gradesAutorises.join(', ')}`}
                      </span>
                    ) : (
                      <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-emerald-700">Ouverte à tous</span>
                    )}
                    {collection.codes > 0 && (
                      <span className="rounded-full bg-gray-100 px-2 py-0.5 text-gray-700">{collection.codes} code(s)</span>
                    )}
                    {!collection.publie && <span className="rounded-full bg-gray-200 px-2 py-0.5 text-gray-700">Masquée</span>}
                  </p>
                </div>
                <div className="flex shrink-0 gap-1">
                  <button onClick={() => void copierLien(collection)} className="rounded-lg p-2 text-gray-500 hover:bg-gray-100 hover:text-gray-900" aria-label="Copier le lien">
                    {copie === collection.id ? <Check className="h-4 w-4 text-emerald-600" /> : <Clipboard className="h-4 w-4" />}
                  </button>
                  <button onClick={() => ouvrir(collection)} className="rounded-lg p-2 text-gray-500 hover:bg-gray-100 hover:text-gray-900" aria-label="Modifier">
                    <Pencil className="h-4 w-4" />
                  </button>
                  <button onClick={() => supprimer(collection)} className="rounded-lg p-2 text-gray-400 hover:bg-red-50 hover:text-red-700" aria-label="Supprimer">
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
              <p className="mt-2 truncate text-xs text-gray-400">/collection/{collection.slug}</p>
            </li>
          ))}
        </ul>
      )}

      {edition && (
        <div className="fixed inset-0 z-[80] flex items-center justify-center bg-black/40 p-4" onMouseDown={() => setEdition(null)}>
          <div className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-lg bg-white shadow-xl" onMouseDown={(e) => e.stopPropagation()}>
            <div className="flex items-start justify-between border-b border-gray-200 p-5">
              <h2 className="text-lg font-semibold text-gray-900">
                {edition.id ? 'Modifier la collection' : 'Nouvelle collection'}
              </h2>
              <button onClick={() => setEdition(null)} className="rounded-md p-2 text-gray-400 hover:bg-gray-100" aria-label="Fermer">
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={enregistrer} className="space-y-4 p-5">
              <label className="block text-sm font-medium text-gray-700">
                Titre *
                <input required value={edition.form.titre} onChange={(e) => majForm({ titre: e.target.value })}
                  className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm outline-none focus:border-gray-500" />
              </label>
              <label className="block text-sm font-medium text-gray-700">
                Description
                <textarea rows={2} value={edition.form.description} onChange={(e) => majForm({ description: e.target.value })}
                  className="mt-1 w-full resize-none rounded-md border border-gray-300 px-3 py-2 text-sm outline-none focus:border-gray-500" />
              </label>

              <fieldset className="rounded-lg border border-gray-200 bg-gray-50 p-3">
                <legend className="px-1 text-sm font-medium text-gray-700">Accès</legend>
                <div className="flex gap-4">
                  {(['public', 'restreint'] as const).map((valeur) => (
                    <label key={valeur} className="flex items-center gap-2 text-sm text-gray-800">
                      <input type="radio" name="acces-collection" checked={edition.form.acces === valeur}
                        onChange={() => majForm({ acces: valeur })} className="h-4 w-4" />
                      {valeur === 'public' ? 'Ouverte à tous' : 'Nom sacré ou code'}
                    </label>
                  ))}
                </div>
                {edition.form.acces === 'restreint' && (
                  <div className="mt-3 flex flex-wrap gap-1.5">
                    {GRADES.map((grade) => {
                      const actif = edition.form.gradesAutorises.includes(grade)
                      return (
                        <button key={grade} type="button" aria-pressed={actif}
                          onClick={() => majForm({
                            gradesAutorises: actif
                              ? edition.form.gradesAutorises.filter((item) => item !== grade)
                              : [...edition.form.gradesAutorises, grade],
                          })}
                          className={`rounded-full border px-3 py-1 text-xs ${actif ? 'border-gray-800 bg-gray-800 text-white' : 'border-gray-300 bg-white text-gray-600'}`}>
                          {grade}
                        </button>
                      )
                    })}
                  </div>
                )}
              </fieldset>

              <div>
                <p className="text-sm font-medium text-gray-700">
                  Ressources ({edition.form.ressourceIds.length} choisie(s))
                </p>
                <ul className="mt-2 max-h-56 divide-y divide-gray-100 overflow-y-auto rounded-lg border border-gray-200">
                  {ressources.map((ressource) => (
                    <li key={ressource.id}>
                      <label className="flex cursor-pointer items-center gap-3 px-3 py-2 hover:bg-gray-50">
                        <input type="checkbox" checked={edition.form.ressourceIds.includes(ressource.id)}
                          onChange={() => basculerRessource(ressource.id)} className="h-4 w-4 rounded border-gray-300" />
                        <span className="min-w-0 flex-1">
                          <span className="block truncate text-sm text-gray-900">{ressource.title}</span>
                          <span className="block text-xs text-gray-500">{LIBELLES_TYPE[ressource.type] ?? ressource.type}</span>
                        </span>
                      </label>
                    </li>
                  ))}
                </ul>
              </div>

              <label className="flex items-center gap-2 text-sm text-gray-700">
                <input type="checkbox" checked={edition.form.publie} onChange={(e) => majForm({ publie: e.target.checked })} className="h-4 w-4 rounded border-gray-300" />
                Lien actif
              </label>

              <div className="flex justify-end gap-2 pt-1">
                <button type="button" onClick={() => setEdition(null)} className="rounded-lg border border-gray-300 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">Annuler</button>
                <button disabled={enCours} className="inline-flex items-center gap-2 rounded-lg bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-800 disabled:opacity-50">
                  {enCours && <Loader2 className="h-4 w-4 animate-spin" />}
                  Enregistrer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
