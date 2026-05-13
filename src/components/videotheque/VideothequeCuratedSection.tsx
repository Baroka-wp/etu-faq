import {
  MYSTERE_MAIN_VIDEOS,
  MYSTERE_PLAYLISTS,
  MYSTERE_SOURCE_LINE,
  MYSTERE_SUPPLEMENTARY_RESUMES,
  MYSTERE_SUPPLEMENTARY_VIDEOS,
} from '@/content/videotheque-mystere'
import { ExternalLink, Library } from 'lucide-react'

function youtubeWatchUrl(id: string) {
  return `https://www.youtube.com/watch?v=${id}`
}

function youtubeThumb(id: string) {
  return `https://img.youtube.com/vi/${id}/mqdefault.jpg`
}

export function VideothequeCuratedSection() {
  return (
    <section className="border-b border-gray-200 bg-gradient-to-b from-slate-50 to-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12 sm:py-16">
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-10">
          <div>
            <p className="text-sm font-medium text-indigo-600 tracking-wide uppercase mb-2">
              Sélection
            </p>
            <h2 className="text-2xl sm:text-3xl font-serif font-bold text-gray-900">
              Résumés des vidéos — Hippolite Fatoumbi / Au cœur du mystère
            </h2>
            <p className="mt-2 text-gray-600 max-w-2xl text-sm sm:text-base">
              Neuf conférences et entretiens avec des résumés pour orienter votre écoute. Les liens
              ouvrent YouTube dans un nouvel onglet.
            </p>
          </div>
          <div className="flex items-center gap-2 text-gray-500 text-sm shrink-0">
            <Library className="w-5 h-5 text-indigo-500" aria-hidden />
            <span>Contenu pédagogique</span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 mb-12">
          {MYSTERE_MAIN_VIDEOS.map((v, index) => (
            <article
              key={v.youtubeId}
              className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden flex flex-col hover:shadow-md transition-shadow"
            >
              <a
                href={youtubeWatchUrl(v.youtubeId)}
                target="_blank"
                rel="noopener noreferrer"
                className="block aspect-video bg-gray-900 relative group"
              >
                <img
                  src={youtubeThumb(v.youtubeId)}
                  alt=""
                  className="w-full h-full object-cover opacity-95 group-hover:opacity-100 transition-opacity"
                />
                <span className="absolute top-2 left-2 bg-black/70 text-white text-xs font-medium px-2 py-0.5 rounded">
                  Vidéo {index + 1}
                </span>
              </a>
              <div className="p-4 sm:p-5 flex flex-col flex-1">
                <h3 className="font-serif font-semibold text-gray-900 text-lg leading-snug mb-1">
                  {v.title}
                </h3>
                {v.meta ? (
                  <p className="text-xs text-gray-500 mb-3">{v.meta}</p>
                ) : null}
                <p
                  className={`text-gray-600 text-sm leading-relaxed flex-1 ${
                    v.meta ? '' : 'mt-2'
                  }`}
                >
                  {v.resume}
                </p>
                <a
                  href={youtubeWatchUrl(v.youtubeId)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-4 inline-flex items-center gap-1.5 text-sm font-medium text-indigo-600 hover:text-indigo-800"
                >
                  Voir sur YouTube
                  <ExternalLink className="w-4 h-4" aria-hidden />
                </a>
              </div>
            </article>
          ))}
        </div>

        <div className="rounded-xl border border-gray-200 bg-white p-5 sm:p-6 mb-12">
          <h3 className="font-serif font-semibold text-gray-900 text-lg mb-3">
            Chaînes et playlists
          </h3>
          <ul className="flex flex-col sm:flex-row sm:flex-wrap gap-3">
            {MYSTERE_PLAYLISTS.map((p) => (
              <li key={p.href}>
                <a
                  href={p.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-indigo-50 text-indigo-900 text-sm font-medium hover:bg-indigo-100 border border-indigo-100 transition-colors"
                >
                  {p.label}
                  <ExternalLink className="w-3.5 h-3.5 opacity-70" aria-hidden />
                </a>
              </li>
            ))}
          </ul>
        </div>

        <div className="mb-12">
          <h3 className="font-serif font-semibold text-gray-900 text-lg mb-4">
            Vidéos supplémentaires
          </h3>
          <div className="rounded-xl border border-gray-200 overflow-hidden bg-white">
            <div className="overflow-x-auto">
              <table className="w-full text-sm min-w-[520px]">
                <thead>
                  <tr className="bg-gray-50 text-left text-gray-600 border-b border-gray-200">
                    <th className="px-4 py-3 font-medium">Titre</th>
                    <th className="px-4 py-3 font-medium w-[140px]">Lien</th>
                    <th className="px-4 py-3 font-medium w-[100px]">Durée</th>
                  </tr>
                </thead>
                <tbody>
                  {MYSTERE_SUPPLEMENTARY_VIDEOS.map((row) => (
                    <tr key={row.title} className="border-b border-gray-100 last:border-0">
                      <td className="px-4 py-3 text-gray-900">{row.title}</td>
                      <td className="px-4 py-3">
                        {row.url ? (
                          <a
                            href={row.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-indigo-600 hover:underline inline-flex items-center gap-1"
                          >
                            YouTube
                            <ExternalLink className="w-3.5 h-3.5" aria-hidden />
                          </a>
                        ) : (
                          <span className="text-gray-400">—</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-gray-600">{row.duration ?? '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <div className="mb-8">
          <h3 className="font-serif font-semibold text-gray-900 text-lg mb-4">
            Résumés détaillés (sélection)
          </h3>
          <div className="space-y-3">
            {MYSTERE_SUPPLEMENTARY_RESUMES.map((r) => (
              <details
                key={r.slug}
                className="group rounded-xl border border-gray-200 bg-white open:shadow-sm"
              >
                <summary className="cursor-pointer list-none flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 px-4 py-3 sm:px-5 sm:py-4 hover:bg-gray-50 rounded-xl marker:content-none [&::-webkit-details-marker]:hidden">
                  <span className="font-medium text-gray-900 pr-6">{r.title}</span>
                  <span className="text-xs text-gray-500 shrink-0">{r.meta}</span>
                </summary>
                <div className="px-4 pb-4 sm:px-5 sm:pb-5 pt-0 border-t border-gray-100">
                  <p className="text-gray-600 text-sm leading-relaxed pt-4">{r.body}</p>
                </div>
              </details>
            ))}
          </div>
        </div>

        <p className="text-center text-xs sm:text-sm text-gray-500 border-t border-gray-200 pt-8">
          {MYSTERE_SOURCE_LINE}
        </p>
      </div>
    </section>
  )
}
