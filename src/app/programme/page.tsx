'use client'

import { useCallback, useEffect, useState } from 'react'
import Link from 'next/link'
import { CalendarDays, ChevronLeft, ChevronRight, Home, Loader2 } from 'lucide-react'
import ProgrammeCalendar, {
  type ProgrammeActivity,
  type ProgrammeCategory,
} from '@/components/programme/ProgrammeCalendar'

const MOIS = ['Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin', 'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre']
const CATEGORIES: Record<ProgrammeCategory, string> = {
  TEMPLE: 'Programme du Temple',
  ECOLE: 'Programme pédagogique',
}

export default function ProgrammePublicPage() {
  const maintenant = new Date()
  const [date, setDate] = useState(new Date(maintenant.getFullYear(), maintenant.getMonth(), 1))
  const [categorie, setCategorie] = useState<ProgrammeCategory>('TEMPLE')
  const [activites, setActivites] = useState<ProgrammeActivity[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const annee = date.getFullYear()
  const mois = date.getMonth() + 1
  const activitesAffichees = activites.filter((activite) => activite.categorie === categorie)
  const nombreDates = activitesAffichees.reduce((total, activite) => total + activite.jours.length, 0)

  const chargerProgramme = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const response = await fetch(`/api/programmes-mensuels?annee=${annee}&mois=${mois}`)
      const data = await response.json()
      if (!response.ok) throw new Error(data.error)
      setActivites(data.data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Programme indisponible')
    } finally {
      setLoading(false)
    }
  }, [annee, mois])

  useEffect(() => { chargerProgramme() }, [chargerProgramme])

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="sticky top-0 z-50 border-b border-gray-200 bg-white/95 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <Link href="/" className="flex items-center gap-3">
            <img src="/logo-etu.png" alt="Logo ETU" className="h-10 w-10 object-contain" />
            <span className="font-serif text-xl font-bold text-gray-900">ETU Bénin</span>
          </Link>
          <div className="flex items-center gap-3 sm:gap-6">
            <Link href="/" className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900"><Home className="h-4 w-4" /> <span className="hidden sm:inline">Accueil</span></Link>
            <Link href="/faq" className="text-sm text-gray-600 hover:text-gray-900">FAQ</Link>
            <Link href="/inscription" className="rounded-lg bg-gray-800 px-4 py-2 text-sm font-medium text-white hover:bg-gray-900">S'inscrire</Link>
          </div>
        </div>
      </nav>

      <header className="border-b border-gray-200 bg-white">
        <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
          <div className="flex items-start gap-4">
            <div className="rounded-lg bg-gray-100 p-3"><CalendarDays className="h-7 w-7 text-gray-700" /></div>
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-gray-500">ETU Bénin</p>
              <h1 className="mt-1 font-serif text-3xl font-bold text-gray-900 sm:text-4xl">Programme du mois</h1>
              <p className="mt-2 max-w-2xl text-gray-600">Consultez les activités du Temple et le programme pédagogique de l'École.</p>
            </div>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-[1500px] space-y-6 px-4 py-8 sm:px-6 lg:px-8">
        <section className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex rounded-lg bg-gray-100 p-1">
              {(Object.keys(CATEGORIES) as ProgrammeCategory[]).map((item) => (
                <button
                  key={item}
                  onClick={() => setCategorie(item)}
                  className={`flex-1 rounded-md px-5 py-2 text-sm font-medium transition ${categorie === item ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-800'}`}
                >
                  {CATEGORIES[item]}
                </button>
              ))}
            </div>
            <div className="flex items-center self-center rounded-lg border border-gray-300 bg-white">
              <button onClick={() => setDate(new Date(annee, mois - 2, 1))} className="p-2 text-gray-500 hover:bg-gray-50" aria-label="Mois précédent"><ChevronLeft className="h-4 w-4" /></button>
              <span className="min-w-40 px-3 text-center text-sm font-semibold text-gray-800">{MOIS[mois - 1]} {annee}</span>
              <button onClick={() => setDate(new Date(annee, mois, 1))} className="p-2 text-gray-500 hover:bg-gray-50" aria-label="Mois suivant"><ChevronRight className="h-4 w-4" /></button>
            </div>
          </div>
        </section>

        {error && <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>}

        <section className="overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm">
          <div className="border-b border-gray-200 px-5 py-4">
            <h2 className="font-semibold text-gray-900">{CATEGORIES[categorie]} · {MOIS[mois - 1]} {annee}</h2>
            {!loading && <p className="mt-1 text-sm text-gray-500">{nombreDates > 0 ? `${nombreDates} activité(s) programmée(s)` : 'Les dates de ce mois ne sont pas encore publiées.'}</p>}
          </div>
          <div className="overflow-x-auto bg-gray-50 p-4">
            {loading ? (
              <div className="flex min-h-80 items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-gray-400" /></div>
            ) : (
              <ProgrammeCalendar categorie={categorie} annee={annee} mois={mois} activites={activitesAffichees} />
            )}
          </div>
        </section>
      </main>
    </div>
  )
}
