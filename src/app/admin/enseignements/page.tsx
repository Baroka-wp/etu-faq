'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { ArrowRight, KeyRound, Layers, Library, Lock, NotebookPen } from 'lucide-react'

interface Compteurs {
  ressources: number
  restreintes: number
  collections: number
  codesActifs: number
  codesTotal: number
  themes: number
}

const ETAPES = [
  {
    numero: 1,
    titre: 'Déposer une ressource',
    texte:
      'Un livre, une monographie ou tout autre document. Vous décidez qui peut l’ouvrir : tout le monde, ou seulement les membres par leur nom sacré, au besoin réservés à certains grades. Un prix peut y être attaché.',
    href: '/admin/enseignements/ressources',
    lien: 'Voir les ressources',
  },
  {
    numero: 2,
    titre: 'Réunir en collection',
    texte:
      'Plusieurs ressources rassemblées sous un seul lien à partager. La collection porte son propre accès, indépendamment de chaque ressource.',
    href: '/admin/enseignements/collections',
    lien: 'Voir les collections',
  },
  {
    numero: 3,
    titre: 'Remettre un code',
    texte:
      'Pour un aspirant, qui n’a pas encore de nom sacré : un code nominatif ouvre une collection ou des ressources choisies, avec une date de fin si besoin. Vous voyez qui s’en est servi.',
    href: '/admin/enseignements/codes',
    lien: 'Voir les codes',
  },
]

export default function AccueilEnseignements() {
  const [compteurs, setCompteurs] = useState<Compteurs | null>(null)

  useEffect(() => {
    const charger = async () => {
      try {
        const [ressources, collections, codes, themes] = await Promise.all([
          fetch('/api/admin/bibliotheque').then((r) => r.json()),
          fetch('/api/admin/collections').then((r) => r.json()),
          fetch('/api/admin/codes-acces').then((r) => r.json()),
          fetch('/api/admin/enseignements').then((r) => r.json()),
        ])
        const listeRessources = ressources.books ?? []
        const listeCodes = codes.data ?? []
        setCompteurs({
          ressources: listeRessources.length,
          restreintes: listeRessources.filter((item: { acces: string }) => item.acces === 'restreint').length,
          collections: (collections.data ?? []).length,
          codesActifs: listeCodes.filter((item: { actif: boolean }) => item.actif).length,
          codesTotal: listeCodes.length,
          themes: (themes.data ?? []).length,
        })
      } catch {
        setCompteurs(null)
      }
    }
    void charger()
  }, [])

  const chiffre = (valeur: number | undefined) => (compteurs ? valeur : '—')

  return (
    <>
      <section className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm sm:p-6">
        <h2 className="text-lg font-semibold text-gray-950">Comment cette partie fonctionne</h2>
        <ol className="mt-5 space-y-5">
          {ETAPES.map((etape) => (
            <li key={etape.numero} className="flex gap-4">
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gray-900 text-sm font-semibold text-white">
                {etape.numero}
              </span>
              <div className="min-w-0">
                <h3 className="text-base font-medium text-gray-950">{etape.titre}</h3>
                <p className="mt-1 text-sm leading-6 text-gray-600">{etape.texte}</p>
                <Link
                  href={etape.href}
                  className="mt-2 inline-flex items-center gap-1.5 text-sm font-medium text-gray-700 hover:text-gray-950"
                >
                  {etape.lien} <ArrowRight className="h-4 w-4" aria-hidden />
                </Link>
              </div>
            </li>
          ))}
        </ol>
        <p className="mt-6 border-t border-gray-200 pt-4 text-sm leading-6 text-gray-600">
          À côté de cela, <strong className="font-medium text-gray-900">les thèmes enseignés</strong> tiennent le relevé
          de ce qui a été donné en séance. Ils se remplissent tout seuls : dès qu’une instruction, un séminaire ou un
          sujet de planche est saisi dans les planifications, le thème entre au relevé.
        </p>
      </section>

      <section className="grid gap-3 sm:grid-cols-2">
        <Carte
          href="/admin/enseignements/ressources"
          icone={Library}
          titre="Ressources"
          valeur={chiffre(compteurs?.ressources)}
          detail={
            compteurs && compteurs.restreintes > 0
              ? `dont ${compteurs.restreintes} à accès restreint`
              : 'livres, monographies, documents'
          }
        />
        <Carte
          href="/admin/enseignements/collections"
          icone={Layers}
          titre="Collections"
          valeur={chiffre(compteurs?.collections)}
          detail="ensembles partagés par un lien"
        />
        <Carte
          href="/admin/enseignements/codes"
          icone={KeyRound}
          titre="Codes d’accès"
          valeur={chiffre(compteurs?.codesActifs)}
          detail={
            compteurs && compteurs.codesTotal !== compteurs.codesActifs
              ? `actifs sur ${compteurs.codesTotal} remis`
              : 'codes nominatifs actifs'
          }
        />
        <Carte
          href="/admin/enseignements/themes"
          icone={NotebookPen}
          titre="Thèmes enseignés"
          valeur={chiffre(compteurs?.themes)}
          detail="relevé des séances passées"
        />
      </section>

      <p className="flex items-start gap-2 text-sm leading-6 text-gray-500">
        <Lock className="mt-0.5 h-4 w-4 shrink-0 text-gray-400" aria-hidden />
        Une ressource ouverte à tous apparaît dans la bibliothèque publique. Une ressource restreinte n’y est pas
        listée : elle s’ouvre par le nom sacré d’un membre ou par un code.
      </p>
    </>
  )
}

function Carte({
  href,
  icone: Icone,
  titre,
  valeur,
  detail,
}: {
  href: string
  icone: typeof Library
  titre: string
  valeur: number | string | undefined
  detail: string
}) {
  return (
    <Link
      href={href}
      className="group rounded-2xl border border-gray-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-gray-300 hover:shadow-md"
    >
      <div className="flex items-start justify-between gap-4">
        <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-gray-900 text-white">
          <Icone className="h-5 w-5" aria-hidden />
        </span>
        <ArrowRight className="h-5 w-5 text-gray-300 transition group-hover:translate-x-1 group-hover:text-gray-700" aria-hidden />
      </div>
      <h2 className="mt-4 text-base font-semibold text-gray-950">{titre}</h2>
      <p className="mt-2 text-sm text-gray-500">
        <span className="mr-2 text-2xl font-bold text-gray-950">{valeur}</span>
        {detail}
      </p>
    </Link>
  )
}
