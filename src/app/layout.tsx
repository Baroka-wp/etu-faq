import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "FAQ - École Transcendantaliste Universelle",
  description: "Foire aux questions de l'École Transcendantaliste Universelle (ETU) Bénin - Formation spirituelle et initiatique.",
  keywords: ["ETU", "École Transcendantaliste", "Formation spirituelle", "Initiation", "Kabbale", "FAQ"],
  authors: [{ name: "ETU Bénin" }],
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
