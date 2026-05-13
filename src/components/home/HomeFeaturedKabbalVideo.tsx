'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Clock, Play, Video } from 'lucide-react'
import { isFeaturedKabbal2026Title } from '@/lib/isFeaturedKabbal2026Title'

type Course = {
  id: string
  title: string
  videoUrl: string
  shortDescription: string
  thumbnailUrl: string | null
}

function getVideoEmbedUrl(url: string) {
  const youtubeMatch = url.match(
    /(?:youtube\.com\/(?:[^/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?/\s]{11})/
  )
  if (youtubeMatch) {
    return `https://www.youtube.com/embed/${youtubeMatch[1]}`
  }
  const driveMatch = url.match(/\/drive\.google\.com\/file\/d\/([^/]+)\/view/)
  if (driveMatch) {
    return `https://drive.google.com/file/d/${driveMatch[1]}/preview`
  }
  return url
}

export function HomeFeaturedKabbalVideo() {
  const [course, setCourse] = useState<Course | null | undefined>(undefined)

  useEffect(() => {
    let cancelled = false
    fetch('/api/cours')
      .then((r) => (r.ok ? r.json() : []))
      .then((courses: Course[]) => {
        if (cancelled) return
        setCourse(courses.find((c) => isFeaturedKabbal2026Title(c.title)) ?? null)
      })
      .catch(() => {
        if (!cancelled) setCourse(null)
      })
    return () => {
      cancelled = true
    }
  }, [])

  if (course === undefined || course === null) {
    return null
  }

  const embed = getVideoEmbedUrl(course.videoUrl)

  /** Titres affichés sur l’accueil (français soigné) — le cours en base peut garder d’autres variantes. */
  const displayTitle = 'Pourquoi étudier la Kabbale en 2026'
  const displaySubtitle =
    'Nous vous présentons pourquoi il est important d’apprendre la kabbale.'

  return (
    <section
      className="border-y border-stone-200 bg-gradient-to-b from-white to-slate-50"
      aria-labelledby="featured-kabbal-video-heading"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12 sm:py-16 lg:py-20">
        <p className="text-sm font-medium uppercase tracking-wide text-indigo-600 mb-6">
          Vidéo à la une
        </p>

        <header className="mb-6 sm:mb-8 max-w-4xl">
          <h2
            id="featured-kabbal-video-heading"
            className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 leading-tight tracking-tight"
          >
            {displayTitle}
          </h2>
          <p className="mt-3 sm:mt-4 text-base sm:text-lg text-gray-600 leading-relaxed font-sans">
            {displaySubtitle}
          </p>
          <p className="mt-4 inline-flex items-center gap-1.5 text-sm text-gray-500 font-sans">
            <Clock className="h-4 w-4 shrink-0" aria-hidden />
            Vidéo
          </p>
        </header>

        <div className="relative aspect-video w-full max-w-7xl overflow-hidden rounded-2xl bg-black shadow-2xl ring-1 ring-black/10">
          <iframe
            src={embed}
            title={displayTitle}
            className="absolute inset-0 h-full w-full"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        </div>

        <div className="mt-8 flex flex-col sm:flex-row flex-wrap gap-3">
          <Link
            href="/videotheque"
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-gray-900 px-5 py-3 text-sm font-semibold text-white shadow-md transition hover:bg-gray-800"
          >
            <Video className="h-4 w-4 shrink-0" aria-hidden />
            Toute la vidéothèque
          </Link>
          <a
            href={course.videoUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center gap-2 rounded-xl border-2 border-gray-300 bg-white px-5 py-3 text-sm font-semibold text-gray-800 transition hover:border-gray-400 hover:bg-gray-50"
          >
            <Play className="h-4 w-4 shrink-0" aria-hidden />
            Ouvrir sur YouTube
          </a>
        </div>
      </div>
    </section>
  )
}
