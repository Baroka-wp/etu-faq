import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "ETU Bénin - École Transcendantaliste Universelle",
  description: "Depuis 1977, l'École Transcendantaliste Universelle (ETU) transmet les enseignements initiatiques de la Kabbale, de l'Évangile ésotérique et de l'Astrologie sacrée. Formation spirituelle en ligne ou en présentiel au Bénin et en Afrique de l'Ouest.",
  keywords: ["ETU", "École Transcendantaliste Universelle", "Kabbale", "Formation spirituelle", "Initiation", "Astrologie", "Ésotérisme", "Bénin", "Afrique", "Transcendantalisme"],
  authors: [{ name: "ETU Bénin" }],
  icons: {
    icon: [
      { url: '/icon-192.png', type: 'image/png', sizes: '192x192' },
      { url: '/icon-512.png', type: 'image/png', sizes: '512x512' },
    ],
    apple: '/apple-touch-icon.png',
  },
  manifest: '/site.webmanifest',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr" suppressHydrationWarning>
      <body suppressHydrationWarning className="antialiased bg-background text-foreground">
        {children}
      </body>
    </html>
  );
}
