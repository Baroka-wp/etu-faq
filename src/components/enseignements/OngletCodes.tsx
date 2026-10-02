'use client'

import { useCallback, useEffect, useState } from 'react'
import { Check, Clipboard, KeyRound, Loader2, Plus, Trash2, X } from 'lucide-react'
import { formatAppDate } from '@/lib/datetime'
import { LIBELLES_TYPE, type TypeRessource } from '@/lib/ressources'
import type { Ressource } from './OngletRessources'

interface CodeAcces {
  id: string
  code: string
  libelle: string
  note: string | null
  actif: boolean
  expiresAt: string | null
  utilisations: number
  derniereUtilisation: string | null
  collection: { id: string; titre: string; slug: string } | null
  ressources: Array<{ id: string; titre: string; type: TypeRessource }>
}

interface CollectionBreve {
  id: string
  titre: string
}

const VIDE = {
  libelle: '',
  note: '',
  collectionId: '',
  expiresAt: '',
  ressourceIds: [] as string[],
}

function expire(code: CodeAcces): boolean {
  return Boolean(code.expiresAt && new Date(code.expiresAt).getTime() < Date.now())
}

export default function OngletCodes({
  onMessage,
}: {
  onMessage: (message: { type: 'success' | 'error'; texte: string }) => void
}) {
  const [codes, setCodes] = useState<CodeAcces[] | null>(null)
  const [collections, setCollections] = useState<CollectionBreve[]>([])
  const [ressources, setRessources] = useState<Ressource[]>([])
  const [creation, setCreation] = useState<typeof VIDE | null>(null)
  const [enCours, setEnCours] = useState(false)
  const [copie, setCopie] = useState<string | null>(null)

  const charger = useCallback(async () => {
    try {
      const [reponseCodes, reponseCollections, reponseRessources] = await Promise.all([
        fetch('/api/admin/codes-acces'),
        fetch('/api/admin/collections'),
        fetch('/api/admin/bibliotheque'),
      ])
      setCodes((await reponseCodes.json()).data ?? [])
      setCollections((await reponseCollections.json()).data ?? [])
      setRessources((await reponseRessources.json()).books ?? [])
    } catch {
      onMessage({ type: 'error', texte: 'Codes indisponibles' })
    }
  }, [onMessage])

  useEffect(() => {
    void charger()
  }, [charger])

  const creer = async (evenement: React.FormEvent) => {
    evenement.preventDefault()
    if (!creation || enCours) return
    setEnCours(true)
    try {
      const reponse = await fetch('/api/admin/codes-acces', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(creation),
      })
      const corps = await reponse.json()
      if (!reponse.ok) throw new Error(corps.error)
      setCreation(null)
      await charger()
      onMessage({ type: 'success', texte: `Code ${corps.data.code} créé` })
    } catch (erreur) {
      onMessage({ type: 'error', texte: erreur instanceof Error ? erreur.message : 'Création impossible' })
    } finally {
      setEnCours(false)
    }
  }

  const basculerActif = async (code: CodeAcces) => {
    try {
      const reponse = await fetch(`/api/admin/codes-acces/${code.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ actif: !code.actif }),
      })
      if (!reponse.ok) throw new Error((await reponse.json()).error)
      await charger()
    } catch (erreur) {
      onMessage({ type: 'error', texte: erreur instanceof Error ? erreur.message : 'Modification impossible' })
    }
  }

  const supprimer = async (code: CodeAcces) => {
    if (!window.confirm(`Supprimer le code ${code.code} remis à ${code.libelle} ?`)) return
    try {
      const reponse = await fetch(`/api/admin/codes-acces/${code.id}`, { method: 'DELETE' })
      if (!reponse.ok) throw new Error((await reponse.json()).error)
      await charger()
      onMessage({ type: 'success', texte: 'Code supprimé' })
    } catch (erreur) {
      onMessage({ type: 'error', texte: erreur instanceof Error ? erreur.message : 'Suppression impossible' })
    }
  }

  const copier = async (code: CodeAcces) => {
    await navigator.clipboard.writeText(code.code)
    setCopie(code.id)
    window.setTimeout(() => setCopie(null), 2000)
  }

  return (
    <div>
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm text-gray-600">
          Un code par personne, pour les aspirants qui n’ont pas de nom sacré.
        </p>
        <button
          onClick={() => setCreation({ ...VIDE })}
          className="inline-flex h-11 shrink-0 items-center gap-2 rounded-xl bg-gray-900 px-4 text-sm font-medium text-white hover:bg-gray-800"
        >
          <Plus className="h-4 w-4" /> Nouveau code
        </button>
      </div>

      {!codes ? (
        <p className="py-10 text-center text-sm text-gray-500">Chargement…</p>
      ) : codes.length === 0 ? (
        <p className="mt-6 rounded-2xl border border-dashed border-gray-300 bg-white px-6 py-10 text-center text-sm text-gray-600">
          Aucun code remis pour l’instant.
        </p>
      ) : (
        <ul className="mt-4 divide-y divide-gray-200 overflow-hidden rounded-2xl border border-gray-200 bg-white">
          {codes.map((code) => (
            <li key={code.id} className="flex flex-wrap items-center gap-3 p-4">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-gray-100 text-gray-500">
                <KeyRound className="h-4 w-4" aria-hidden />
              </span>
              <div className="min-w-0 flex-1">
                <p className="flex items-center gap-2">
                  <span className="font-mono text-base font-semibold tracking-wider text-gray-950">{code.code}</span>
                  <button onClick={() => void copier(code)} className="rounded p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-700" aria-label="Copier le code">
                    {copie === code.id ? <Check className="h-3.5 w-3.5 text-emerald-600" /> : <Clipboard className="h-3.5 w-3.5" />}
                  </button>
                </p>
                <p className="mt-0.5 truncate text-sm text-gray-700">{code.libelle}</p>
                <p className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-gray-500">
                  <span>
                    {code.collection
                      ? `Collection : ${code.collection.titre}`
                      : `${code.ressources.length} ressource(s)`}
                  </span>
                  {code.expiresAt && (
                    <span className={expire(code) ? 'font-medium text-red-700' : undefined}>
                      · {expire(code) ? 'expiré le ' : "jusqu'au "}
                      {formatAppDate(code.expiresAt, { day: 'numeric', month: 'long', year: 'numeric' })}
                    </span>
                  )}
                  <span>· {code.utilisations} ouverture(s)</span>
                  {code.derniereUtilisation && (
                    <span>· dernière le {formatAppDate(code.derniereUtilisation, { day: 'numeric', month: 'long' })}</span>
                  )}
                </p>
              </div>
              <div className="flex shrink-0 items-center gap-2">
                <button
                  onClick={() => void basculerActif(code)}
                  aria-pressed={code.actif}
                  className={`rounded-full border px-3 py-1.5 text-xs font-medium ${
                    code.actif ? 'border-emerald-200 bg-emerald-50 text-emerald-800' : 'border-gray-300 bg-gray-100 text-gray-600'
                  }`}
                >
                  {code.actif ? 'Actif' : 'Suspendu'}
                </button>
                <button onClick={() => supprimer(code)} className="rounded-lg p-2 text-gray-400 hover:bg-red-50 hover:text-red-700" aria-label="Supprimer le code">
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}

      {creation && (
        <div className="fixed inset-0 z-[80] flex items-center justify-center bg-black/40 p-4" onMouseDown={() => setCreation(null)}>
          <div className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-lg bg-white shadow-xl" onMouseDown={(e) => e.stopPropagation()}>
            <div className="flex items-start justify-between border-b border-gray-200 p-5">
              <h2 className="text-lg font-semibold text-gray-900">Nouveau code d’accès</h2>
              <button onClick={() => setCreation(null)} className="rounded-md p-2 text-gray-400 hover:bg-gray-100" aria-label="Fermer">
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={creer} className="space-y-4 p-5">
              <label className="block text-sm font-medium text-gray-700">
                Remis à *
                <input required autoFocus value={creation.libelle} placeholder="Nom de la personne"
                  onChange={(e) => setCreation({ ...creation, libelle: e.target.value })}
                  className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm outline-none focus:border-gray-500" />
              </label>

              <label className="block text-sm font-medium text-gray-700">
                Collection ouverte par ce code
                <select value={creation.collectionId}
                  onChange={(e) => setCreation({ ...creation, collectionId: e.target.value })}
                  className="mt-1 h-10 w-full rounded-md border border-gray-300 bg-white px-2 text-sm outline-none focus:border-gray-500">
                  <option value="">Aucune — je choisis des ressources</option>
                  {collections.map((collection) => (
                    <option key={collection.id} value={collection.id}>{collection.titre}</option>
                  ))}
                </select>
              </label>

              {!creation.collectionId && (
                <div>
                  <p className="text-sm font-medium text-gray-700">
                    Ressources ouvertes ({creation.ressourceIds.length})
                  </p>
                  <ul className="mt-2 max-h-48 divide-y divide-gray-100 overflow-y-auto rounded-lg border border-gray-200">
                    {ressources.map((ressource) => (
                      <li key={ressource.id}>
                        <label className="flex cursor-pointer items-center gap-3 px-3 py-2 hover:bg-gray-50">
                          <input type="checkbox" checked={creation.ressourceIds.includes(ressource.id)}
                            onChange={() =>
                              setCreation({
                                ...creation,
                                ressourceIds: creation.ressourceIds.includes(ressource.id)
                                  ? creation.ressourceIds.filter((item) => item !== ressource.id)
                                  : [...creation.ressourceIds, ressource.id],
                              })
                            }
                            className="h-4 w-4 rounded border-gray-300" />
                          <span className="min-w-0 flex-1">
                            <span className="block truncate text-sm text-gray-900">{ressource.title}</span>
                            <span className="block text-xs text-gray-500">{LIBELLES_TYPE[ressource.type] ?? ressource.type}</span>
                          </span>
                        </label>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              <label className="block text-sm font-medium text-gray-700">
                Valable jusqu’au <span className="font-normal text-gray-500">(facultatif)</span>
                <input type="date" value={creation.expiresAt}
                  onChange={(e) => setCreation({ ...creation, expiresAt: e.target.value })}
                  className="mt-1 h-10 w-full rounded-md border border-gray-300 px-3 text-sm outline-none focus:border-gray-500" />
              </label>

              <label className="block text-sm font-medium text-gray-700">
                Note interne
                <textarea rows={2} value={creation.note}
                  onChange={(e) => setCreation({ ...creation, note: e.target.value })}
                  className="mt-1 w-full resize-none rounded-md border border-gray-300 px-3 py-2 text-sm outline-none focus:border-gray-500" />
              </label>

              <div className="flex justify-end gap-2 pt-1">
                <button type="button" onClick={() => setCreation(null)} className="rounded-lg border border-gray-300 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">Annuler</button>
                <button disabled={enCours} className="inline-flex items-center gap-2 rounded-lg bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-800 disabled:opacity-50">
                  {enCours && <Loader2 className="h-4 w-4 animate-spin" />}
                  Créer le code
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
