import Link from 'next/link'
import { notFound } from 'next/navigation'
import { db } from '@/lib/db'
import AdminSidebar from '@/components/AdminSidebar'
import Formulaire from './formulaire'

export const dynamic = 'force-dynamic'

export default async function AdministrationVideos({ searchParams }: {
  searchParams: Promise<{ modifier?: string; ajouter?: string }>
}) {
  const { modifier, ajouter } = await searchParams
  const formulaireOuvert = modifier !== undefined || ajouter === '1'
  const actif = modifier !== undefined
    ? await db.coursVideo.findUnique({ where: { id: modifier }, include: { ressources: { select: { id: true } } } })
    : null
  if (modifier !== undefined && !actif) notFound()

  const ressources = formulaireOuvert ? await db.book.findMany({
    select: { id: true, title: true, price: true, isFree: true, publie: true },
    orderBy: { title: 'asc' },
  }) : []
  const cours = formulaireOuvert ? [] : await db.coursVideo.findMany({
    select: { id: true, titre: true },
    orderBy: [{ date: 'desc' }, { id: 'asc' }],
  })
  return (
    <div className="min-h-screen bg-gray-50">
      <AdminSidebar activeTab="videotheque" />
      <main className="min-h-screen lg:ml-64">
        <header className="border-b border-gray-200 bg-white px-4 py-7 pl-20 lg:px-8">
          <div className="mx-auto flex max-w-6xl items-center justify-between gap-3">
            <h1 className="text-3xl font-semibold text-gray-950">Cours vidéo</h1>
            {!formulaireOuvert && <Link href="/admin/videotheque?ajouter=1" className="rounded-lg bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-800">Ajouter</Link>}
          </div>
        </header>
        <div className="mx-auto max-w-6xl p-4 sm:p-6 lg:p-8">
          {formulaireOuvert ? (
            <Formulaire key={actif?.id ?? 'nouveau'} cours={actif ?? undefined} ressources={ressources} />
          ) : (
          <section className="self-start rounded-xl border border-gray-200 bg-white p-5">
            <h2 className="mb-3 text-xl font-semibold">Cours publiés ({cours.length})</h2>
            <ul className="divide-y">{cours.map(c => <li key={c.id}>
              <Link href={'/admin/videotheque?modifier='+c.id} className="block py-3 text-gray-700 hover:underline">{c.titre}</Link>
            </li>)}</ul>
          </section>
          )}
        </div>
      </main>
    </div>
  )
}
