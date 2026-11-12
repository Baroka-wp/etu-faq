import Link from 'next/link'
import { demandeCode, joursAccesRestants } from '@/lib/acces-video'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { SESSION_COOKIES, verifySessionToken } from '@/lib/security/session'
import { sessionAspirantValide } from '@/lib/security/aspirant'
import AchatRessource from './achat-ressource'
import { getLecteurServeur, peutVoirRessource } from '@/lib/acces-lecteur'
import { ArrowLeft, Play } from 'lucide-react'
import { db } from '@/lib/db'

const dateFr = new Intl.DateTimeFormat('fr-FR', { dateStyle: 'long', timeZone: 'UTC' })

export const metadata = { title: 'Étude de la Kabbale · ETU Bénin' }

export default async function Videotheque({ searchParams }: {
  searchParams: Promise<{ seance?: string }>
}) {
  const { seance } = await searchParams
  const session = await verifySessionToken((await cookies()).get(SESSION_COOKIES.user)?.value, 'user')
  const dossier = session && await db.inscription.findUnique({
    where: { id: session.sub }, select: { statut: true, codeExpireLe: true },
  })
  if (dossier?.statut !== 'Actif' || !sessionAspirantValide(session, dossier)) {
    redirect('/member-login?retour=/videotheque' + (seance ? '&seance=' + encodeURIComponent(seance) : ''))
  }
  const jours = joursAccesRestants(dossier.codeExpireLe!)
  const cours = await db.coursVideo.findMany({ orderBy: [{ date: 'asc' }, { id: 'asc' }] })
  if (!cours.length) return <main className="p-8"><Link href="/">← Accueil</Link><h1 className="my-4 text-3xl">Étude de la Kabbale</h1><p>Aucun cours publié.</p></main>
  const active = cours.find((item) => item.id === seance) ?? cours[0]
  const ressources = await db.book.findMany({
    where: { publie: true, coursVideo: { some: { id: active.id } } },
    select: { id: true, gradesAutorises: true, slug: true, title: true, isFree: true, price: true, acces: true },
    orderBy: { title: 'asc' },
  })
  const lecteur = ressources.some(r => !r.isFree && r.acces === 'restreint') ? await getLecteurServeur() : null
  const drive = 'https://drive.google.com/file/d/' + active.driveId

  return (
    <main className="min-h-screen bg-stone-50 text-stone-900">
      <header className="sticky top-0 z-30 bg-[#831843] text-white shadow-sm">
        <div className="mx-auto flex h-20 max-w-7xl items-center justify-between gap-3 px-5 sm:px-10">
          <Link href="/" className="inline-flex items-center gap-2 text-sm text-pink-100 hover:underline"><ArrowLeft size={16} /> ETU Bénin</Link>
          <div className="text-right"><h1 className="font-serif text-xl sm:text-3xl">Étude de la Kabbale</h1>
          <p className="text-xs text-pink-100 sm:text-sm">Formation préenregistrée · {jours} jour{jours > 1 ? 's' : ''} restant{jours > 1 ? 's' : ''} · <a href={demandeCode(true)} className="underline">Renouveler</a></p></div>
        </div>
      </header>
      <div className="mx-auto grid max-w-7xl gap-7 px-5 py-7 sm:px-10 lg:grid-cols-[minmax(0,1fr)_18rem]">
        <section aria-label="Lecture de la séance" className="sticky top-20 z-10 min-w-0 self-start rounded-xl border border-stone-200 bg-white p-1 shadow-lg shadow-stone-900/10 lg:top-24">
          <iframe key={active.id} src={drive + '/preview'} title={active.titre}
            className="block aspect-video max-h-[45dvh] w-full rounded-lg bg-stone-900" allow="autoplay; fullscreen" allowFullScreen />
        </section>
        <nav aria-label="Séances de la formation" className="rounded-xl border border-stone-200 bg-white p-4 shadow-lg shadow-stone-900/10 lg:sticky lg:top-24 lg:col-start-2 lg:row-start-1 lg:row-span-3 lg:self-start">
          <h2 className="mb-3 font-serif text-xl">{cours.length} vidéo{cours.length > 1 ? 's' : ''}</h2>
          <div className="max-h-64 overflow-y-auto lg:max-h-[calc(100dvh-11rem)]">
            {cours.map((item) => (
              <Link key={item.id} href={'/videotheque?seance=' + item.id} aria-current={item.id === active.id ? 'page' : undefined}
                className={'flex items-center gap-3 rounded-md px-4 py-3 text-sm ' + (item.id === active.id ? 'bg-[#831843] text-white' : 'hover:bg-pink-50')}>
                <Play size={14} aria-hidden /> {item.titre}
              </Link>
            ))}
          </div>
        </nav>
        <div className="min-w-0 lg:col-start-1">
          <h2 className="mt-1 font-serif text-3xl">{active.titre}</h2>
          <p className="mt-1 text-sm text-stone-600">{dateFr.format(new Date(active.date))}</p>
          {active.presentiel && <p className="mt-1 text-stone-600">Séance en présentiel</p>}
          {ressources.length > 0 && <section className="mt-6 rounded-xl border border-stone-200 bg-white p-5">
            <h3 className="font-serif text-xl">Ressources du cours</h3>
            <ul className="mt-2 divide-y">{ressources.map(r => <li key={r.slug} className="flex flex-wrap items-center gap-3 py-3">
              <Link className="min-w-40 flex-1 text-[#831843] hover:underline" href={'/bibliotheque/' + r.slug}>
                {r.title}{r.acces === 'restreint' && ' · Accès réservé'}
              </Link>
              <span className="text-sm">{r.isFree ? 'Gratuit' : r.price ? r.price.toLocaleString('fr-FR') + ' FCFA' : 'Payant'}</span>
              {!r.isFree && (peutVoirRessource(lecteur, r)
                ? <AchatRessource titre={r.title} prix={r.price} />
                : <Link href={'/bibliotheque/' + r.slug}
                className="rounded-lg bg-[#831843] px-4 py-2 text-sm font-medium text-white hover:bg-[#691336]"
                aria-label={'Acheter ' + r.title}>L’acheter</Link>)}
            </li>)}</ul>
          </section>}
        </div>
        {active.notes.length > 0 && (
          <section className="rounded-xl border border-stone-200 bg-white p-5 sm:p-8 lg:col-start-1">
            <h2 className="mb-6 font-serif text-2xl">Notes de la séance</h2>
            <div className="max-w-[66ch] space-y-5 font-serif text-[1.0625rem] leading-8 text-stone-800">
              {active.notes.split(/\n\s*\n/).map((note, i) => {
                const lignes = note.trim().split('\n')
                if (lignes.every(ligne => /^\s*[-•]\s+/.test(ligne))) {
                  return <ul key={i} className="list-disc space-y-4 pl-5 marker:text-[#831843]">{lignes.map((ligne, j) => {
                    const texte = ligne.replace(/^\s*[-•]\s+/, '')
                    const phrase = texte.match(/^(.{1,140}?[.!?])\s+(.*)$/)
                    return <li key={j} className="pl-1">{phrase ? <><strong>{phrase[1]}</strong> {phrase[2]}</> : texte}</li>
                  })}</ul>
                }
                if (/^[aà] retenir$/i.test(note.trim())) return <h3 key={i} className="font-semibold text-[#831843]">À retenir</h3>
                return <p key={i} className="whitespace-pre-line">{note}</p>
              })}
            </div>
          </section>
        )}
      </div>
    </main>
  )
}
