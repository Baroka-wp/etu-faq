import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Vidéothèque | ETU Bénin',
  description:
    'Vidéothèque de l’École Transcendantaliste Universelle Bénin ; enseignements et conférences en vidéo.',
}

export default function VideothequeLayout({ children }: { children: React.ReactNode }) {
  return children
}
