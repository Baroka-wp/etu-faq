import type { Metadata, Viewport } from 'next'

export const metadata: Metadata = {
  title: 'Suivi des projets — OMP',
  description: 'Comité de suivi des projets de l’Ordre des Marins Pêcheurs.',
  robots: { index: false, follow: false },
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  // Le contenu passe sous l'encoche : l'espace se tient comme une application.
  viewportFit: 'cover',
  themeColor: '#ffffff',
}

export default function ProjetsLayout({ children }: { children: React.ReactNode }) {
  return children
}
