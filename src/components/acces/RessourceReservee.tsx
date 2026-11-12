'use client'

import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, BookOpen } from 'lucide-react'
import PorteAcces from './PorteAcces'
import { LIBELLES_TYPE, type TypeRessource } from '@/lib/ressources'

/** Ce que voit un visiteur devant une ressource qui ne lui est pas ouverte. */
export default function RessourceReservee({
  titre,
  auteur,
  imageUrl,
  type,
  gradesAutorises,
  lecteurConnu,
}: {
  titre: string
  auteur: string
  imageUrl: string
  type: string
  gradesAutorises: string[]
  lecteurConnu: string | null
}) {
  const router = useRouter()

  return (
    <div className="min-h-dvh bg-gray-50">
      <header className="border-b border-gray-200 bg-white">
        <div className="mx-auto flex h-16 max-w-3xl items-center justify-between px-4 sm:px-6">
          <Link href="/" className="flex items-center gap-2.5">
            <img src="/logo-etu.png" alt="" className="h-9 w-9 object-contain" />
            <span className="text-sm font-semibold text-gray-900">ETU Bénin</span>
          </Link>
          <Link href="/bibliotheque" className="inline-flex items-center gap-1.5 text-sm text-gray-600 hover:text-gray-900">
            <ArrowLeft className="h-4 w-4" aria-hidden /> Bibliothèque
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-4 py-8 sm:px-6 sm:py-10">
        <div className="flex gap-5">
          {imageUrl ? (
            <img src={imageUrl} alt="" className="h-40 w-28 shrink-0 rounded-lg object-cover shadow-sm" />
          ) : (
            <span className="flex h-40 w-28 shrink-0 items-center justify-center rounded-lg bg-gray-100 text-gray-400">
              <BookOpen className="h-7 w-7" aria-hidden />
            </span>
          )}
          <div className="min-w-0">
            <p className="text-xs uppercase tracking-wider text-gray-500">
              {LIBELLES_TYPE[type as TypeRessource] ?? type}
            </p>
            <h1 className="mt-1 text-2xl font-semibold tracking-tight text-gray-950 sm:text-3xl">{titre}</h1>
            <p className="mt-1 text-base text-gray-600">{auteur}</p>
          </div>
        </div>

        <div className="mt-8">
          <PorteAcces
            gradesAutorises={gradesAutorises}
            lecteurConnu={lecteurConnu}
            onOuvert={() => router.refresh()}
          />
        </div>
      </main>
    </div>
  )
}
