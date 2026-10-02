'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import { BookOpen, ImagePlus, Loader2, Lock, Pencil, Plus, Search, Trash2, X } from 'lucide-react'
import {
  GRADES,
  LIBELLES_TYPE,
  TYPES_RESSOURCE,
  type TypeRessource,
  slugifierTitre,
} from '@/lib/ressources'

export interface Ressource {
  id: string
  title: string
  slug: string
  author: string
  description: string
  price: number | null
  isFree: boolean
  category: string
  imageUrl: string
  driveUrl: string
  whatsappMessage: string
  type: TypeRessource
  acces: 'public' | 'restreint'
  gradesAutorises: string[]
  publie: boolean
}

const VIDE = {
  title: '', slug: '', author: '', description: '', price: '', isFree: true,
  category: 'etu', imageUrl: '', driveUrl: '', whatsappMessage: '',
  type: 'livre' as TypeRessource, acces: 'public' as 'public' | 'restreint',
  gradesAutorises: [] as string[], publie: true,
}

function sansAccents(valeur: string) {
  return valeur.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase()
}

export default function OngletRessources({
  onMessage,
}: {
  onMessage: (message: { type: 'success' | 'error'; texte: string }) => void
}) {
  const [ressources, setRessources] = useState<Ressource[] | null>(null)
  const [recherche, setRecherche] = useState('')
  const [filtreType, setFiltreType] = useState<TypeRessource | ''>('')
  const [edition, setEdition] = useState<{ id: string | null; form: typeof VIDE } | null>(null)
  const [enCours, setEnCours] = useState(false)
  const [televersement, setTeleversement] = useState(false)

  const charger = useCallback(async () => {
    try {
      const reponse = await fetch('/api/admin/bibliotheque')
      const corps = await reponse.json()
      setRessources(corps.books ?? [])
    } catch {
      onMessage({ type: 'error', texte: 'Bibliothèque indisponible' })
    }
  }, [onMessage])

  useEffect(() => {
    void charger()
  }, [charger])

  const liste = useMemo(() => {
    if (!ressources) return []
    const terme = sansAccents(recherche.trim())
    return ressources.filter(
      (item) =>
        (!filtreType || item.type === filtreType) &&
        (!terme || sansAccents(`${item.title} ${item.author}`).includes(terme)),
    )
  }, [ressources, recherche, filtreType])

  const ouvrir = (ressource?: Ressource) => {
    setEdition(
      ressource
        ? {
            id: ressource.id,
            form: {
              title: ressource.title,
              slug: ressource.slug,
              author: ressource.author,
              description: ressource.description,
              price: ressource.price !== null ? String(ressource.price) : '',
              isFree: ressource.isFree,
              category: ressource.category,
              imageUrl: ressource.imageUrl ?? '',
              driveUrl: ressource.driveUrl ?? '',
              whatsappMessage: ressource.whatsappMessage ?? '',
              type: ressource.type,
              acces: ressource.acces,
              gradesAutorises: ressource.gradesAutorises ?? [],
              publie: ressource.publie,
            },
          }
        : { id: null, form: { ...VIDE } },
    )
  }

  const majForm = (champs: Partial<typeof VIDE>) => {
    setEdition((courant) => (courant ? { ...courant, form: { ...courant.form, ...champs } } : courant))
  }

  const televerser = async (fichier: File) => {
    setTeleversement(true)
    try {
      const donnees = new FormData()
      donnees.append('file', fichier)
      const reponse = await fetch('/api/admin/bibliotheque/upload', { method: 'POST', body: donnees })
      const corps = await reponse.json()
      if (!reponse.ok || !corps.secure_url) throw new Error(corps.error)
      majForm({ imageUrl: corps.secure_url })
    } catch (erreur) {
      onMessage({ type: 'error', texte: erreur instanceof Error ? erreur.message : 'Téléversement impossible' })
    } finally {
      setTeleversement(false)
    }
  }

  const enregistrer = async (evenement: React.FormEvent) => {
    evenement.preventDefault()
    if (!edition || enCours) return
    const { id, form } = edition
    setEnCours(true)
    try {
      const corpsRequete = {
        ...form,
        slug: form.slug.trim() || slugifierTitre(form.title),
        price: form.isFree ? null : Number(form.price) || 0,
      }
      const reponse = await fetch(id ? `/api/admin/bibliotheque/${id}` : '/api/admin/bibliotheque', {
        method: id ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(corpsRequete),
      })
      const corps = await reponse.json()
      if (!reponse.ok) throw new Error(corps.error)
      setEdition(null)
      await charger()
      onMessage({ type: 'success', texte: id ? 'Ressource modifiée' : 'Ressource ajoutée' })
    } catch (erreur) {
      onMessage({ type: 'error', texte: erreur instanceof Error ? erreur.message : 'Enregistrement impossible' })
    } finally {
      setEnCours(false)
    }
  }

  const supprimer = async (ressource: Ressource) => {
    if (!window.confirm(`Supprimer « ${ressource.title} » de la bibliothèque ?`)) return
    try {
      const reponse = await fetch(`/api/admin/bibliotheque/${ressource.id}`, { method: 'DELETE' })
      if (!reponse.ok) throw new Error((await reponse.json()).error)
      await charger()
      onMessage({ type: 'success', texte: 'Ressource supprimée' })
    } catch (erreur) {
      onMessage({ type: 'error', texte: erreur instanceof Error ? erreur.message : 'Suppression impossible' })
    }
  }

  return (
    <div>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" aria-hidden />
          <label htmlFor="recherche-ressource" className="sr-only">Rechercher une ressource</label>
          <input
            id="recherche-ressource"
            value={recherche}
            onChange={(e) => setRecherche(e.target.value)}
            placeholder="Titre ou auteur"
            className="h-11 w-full rounded-xl border border-gray-300 bg-white pl-9 pr-3 text-sm outline-none focus:border-gray-500"
          />
        </div>
        <label htmlFor="filtre-type" className="sr-only">Filtrer par type</label>
        <select
          id="filtre-type"
          value={filtreType}
          onChange={(e) => setFiltreType(e.target.value as TypeRessource | '')}
          className="h-11 rounded-xl border border-gray-300 bg-white px-3 text-sm outline-none focus:border-gray-500"
        >
          <option value="">Tous les types</option>
          {TYPES_RESSOURCE.map((type) => (
            <option key={type} value={type}>{LIBELLES_TYPE[type]}</option>
          ))}
        </select>
        <button
          onClick={() => ouvrir()}
          className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-gray-900 px-4 text-sm font-medium text-white hover:bg-gray-800"
        >
          <Plus className="h-4 w-4" /> Ajouter
        </button>
      </div>

      {!ressources ? (
        <p className="py-10 text-center text-sm text-gray-500">Chargement…</p>
      ) : liste.length === 0 ? (
        <p className="mt-6 rounded-2xl border border-dashed border-gray-300 bg-white px-6 py-10 text-center text-sm text-gray-600">
          Aucune ressource ne correspond.
        </p>
      ) : (
        <ul className="mt-4 divide-y divide-gray-200 overflow-hidden rounded-2xl border border-gray-200 bg-white">
          {liste.map((ressource) => (
            <li key={ressource.id} className="flex items-center gap-4 p-4">
              {ressource.imageUrl ? (
                <img src={ressource.imageUrl} alt="" className="h-16 w-12 shrink-0 rounded object-cover" />
              ) : (
                <span className="flex h-16 w-12 shrink-0 items-center justify-center rounded bg-gray-100 text-gray-400">
                  <BookOpen className="h-5 w-5" aria-hidden />
                </span>
              )}
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-gray-950">{ressource.title}</p>
                <p className="mt-0.5 truncate text-xs text-gray-500">{ressource.author}</p>
                <p className="mt-1 flex flex-wrap items-center gap-1.5 text-xs">
                  <span className="rounded-full bg-gray-100 px-2 py-0.5 text-gray-700">{LIBELLES_TYPE[ressource.type]}</span>
                  {ressource.acces === 'restreint' && (
                    <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2 py-0.5 text-amber-800">
                      <Lock className="h-3 w-3" aria-hidden /> Restreint
                      {ressource.gradesAutorises.length > 0 && ` · ${ressource.gradesAutorises.join(', ')}`}
                    </span>
                  )}
                  {!ressource.publie && <span className="rounded-full bg-gray-200 px-2 py-0.5 text-gray-700">Masquée</span>}
                  <span className="text-gray-500">
                    {ressource.isFree ? 'Gratuit' : `${ressource.price ?? 0} FCFA`}
                  </span>
                </p>
              </div>
              <div className="flex shrink-0 gap-1">
                <button onClick={() => ouvrir(ressource)} className="rounded-lg p-2 text-gray-500 hover:bg-gray-100 hover:text-gray-900" aria-label={`Modifier ${ressource.title}`}>
                  <Pencil className="h-4 w-4" />
                </button>
                <button onClick={() => supprimer(ressource)} className="rounded-lg p-2 text-gray-400 hover:bg-red-50 hover:text-red-700" aria-label={`Supprimer ${ressource.title}`}>
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}

      {edition && (
        <div className="fixed inset-0 z-[80] flex items-center justify-center bg-black/40 p-4" onMouseDown={() => setEdition(null)}>
          <div className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-lg bg-white shadow-xl" onMouseDown={(e) => e.stopPropagation()}>
            <div className="flex items-start justify-between border-b border-gray-200 p-5">
              <h2 className="text-lg font-semibold text-gray-900">
                {edition.id ? 'Modifier la ressource' : 'Nouvelle ressource'}
              </h2>
              <button onClick={() => setEdition(null)} className="rounded-md p-2 text-gray-400 hover:bg-gray-100" aria-label="Fermer">
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={enregistrer} className="space-y-4 p-5">
              <div className="grid gap-3 sm:grid-cols-2">
                <label className="block text-sm font-medium text-gray-700">
                  Type
                  <select
                    value={edition.form.type}
                    onChange={(e) => majForm({ type: e.target.value as TypeRessource })}
                    className="mt-1 h-10 w-full rounded-md border border-gray-300 bg-white px-2 text-sm outline-none focus:border-gray-500"
                  >
                    {TYPES_RESSOURCE.map((type) => (
                      <option key={type} value={type}>{LIBELLES_TYPE[type]}</option>
                    ))}
                  </select>
                </label>
                <label className="block text-sm font-medium text-gray-700">
                  Catégorie
                  <select
                    value={edition.form.category}
                    onChange={(e) => majForm({ category: e.target.value })}
                    className="mt-1 h-10 w-full rounded-md border border-gray-300 bg-white px-2 text-sm outline-none focus:border-gray-500"
                  >
                    <option value="etu">Édition ETU</option>
                    <option value="recommended">Recommandé</option>
                  </select>
                </label>
              </div>

              <label className="block text-sm font-medium text-gray-700">
                Titre *
                <input required value={edition.form.title} onChange={(e) => majForm({ title: e.target.value })}
                  className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm outline-none focus:border-gray-500" />
              </label>
              <label className="block text-sm font-medium text-gray-700">
                Auteur *
                <input required value={edition.form.author} onChange={(e) => majForm({ author: e.target.value })}
                  className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm outline-none focus:border-gray-500" />
              </label>
              <label className="block text-sm font-medium text-gray-700">
                Description *
                <textarea required rows={3} value={edition.form.description} onChange={(e) => majForm({ description: e.target.value })}
                  className="mt-1 w-full resize-none rounded-md border border-gray-300 px-3 py-2 text-sm outline-none focus:border-gray-500" />
              </label>

              <fieldset className="rounded-lg border border-gray-200 bg-gray-50 p-3">
                <legend className="px-1 text-sm font-medium text-gray-700">Accès</legend>
                <div className="flex gap-4">
                  {(['public', 'restreint'] as const).map((valeur) => (
                    <label key={valeur} className="flex items-center gap-2 text-sm text-gray-800">
                      <input type="radio" name="acces" checked={edition.form.acces === valeur}
                        onChange={() => majForm({ acces: valeur })} className="h-4 w-4" />
                      {valeur === 'public' ? 'Ouvert à tous' : 'Nom sacré ou code'}
                    </label>
                  ))}
                </div>
                {edition.form.acces === 'restreint' && (
                  <div className="mt-3">
                    <p className="text-xs text-gray-600">Grades admis (aucun coché = tous les membres)</p>
                    <div className="mt-2 flex flex-wrap gap-1.5">
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
                  </div>
                )}
              </fieldset>

              <div className="grid gap-3 sm:grid-cols-2">
                <label className="flex items-center gap-2 text-sm text-gray-700">
                  <input type="checkbox" checked={edition.form.isFree} onChange={(e) => majForm({ isFree: e.target.checked })} className="h-4 w-4 rounded border-gray-300" />
                  Gratuit
                </label>
                {!edition.form.isFree && (
                  <label className="block text-sm font-medium text-gray-700">
                    Prix (FCFA)
                    <input type="number" min={0} value={edition.form.price} onChange={(e) => majForm({ price: e.target.value })}
                      className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm outline-none focus:border-gray-500" />
                  </label>
                )}
              </div>

              <label className="block text-sm font-medium text-gray-700">
                Lien du fichier (Drive)
                <input value={edition.form.driveUrl} onChange={(e) => majForm({ driveUrl: e.target.value })} placeholder="https://…"
                  className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm outline-none focus:border-gray-500" />
              </label>

              <div className="flex items-end gap-4">
                {edition.form.imageUrl ? (
                  <div className="relative h-24 w-16 overflow-hidden rounded border border-gray-200">
                    <img src={edition.form.imageUrl} alt="Couverture" className="h-full w-full object-cover" />
                    <button type="button" onClick={() => majForm({ imageUrl: '' })} className="absolute right-0.5 top-0.5 rounded-full bg-white/90 p-1 text-gray-600 hover:text-red-600" aria-label="Retirer la couverture">
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                ) : (
                  <label className="flex h-24 w-16 cursor-pointer flex-col items-center justify-center gap-1 rounded border border-dashed border-gray-300 text-center text-[10px] text-gray-500 hover:border-gray-400">
                    {televersement ? <Loader2 className="h-4 w-4 animate-spin" /> : <ImagePlus className="h-4 w-4" aria-hidden />}
                    Couverture
                    <input type="file" accept="image/jpeg,image/png,image/webp" className="sr-only" disabled={televersement}
                      onChange={(e) => { const f = e.target.files?.[0]; if (f) void televerser(f); e.target.value = '' }} />
                  </label>
                )}
                <label className="flex items-center gap-2 text-sm text-gray-700">
                  <input type="checkbox" checked={edition.form.publie} onChange={(e) => majForm({ publie: e.target.checked })} className="h-4 w-4 rounded border-gray-300" />
                  Visible dans la bibliothèque
                </label>
              </div>

              <div className="flex justify-end gap-2 pt-1">
                <button type="button" onClick={() => setEdition(null)} className="rounded-lg border border-gray-300 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">
                  Annuler
                </button>
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
