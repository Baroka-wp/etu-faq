'use client'

import { useState } from 'react'
import { ArrowLeft, Heart, MessageCircle } from 'lucide-react'
import Link from 'next/link'
import DonModal from '@/components/DonModal'

const activites = [
  {
    titre: 'Enfants abandonnés',
    image: '/img_2.png',
  },
  {
    titre: 'Orphelins',
    image: '/img_4.png',
  },
  {
    titre: 'Femmes en maternité',
    image: '/img_1.png',
  },
  {
    titre: 'Assistance aux malades',
    image: '/img_3.png',
  },
]

export default function CharitePage() {
  const [donModalOpen, setDonModalOpen] = useState(false)

  return (
    <div className="min-h-screen bg-white overflow-x-hidden">

      {/* ── HERO BANNIÈRE ── */}
      <section className="relative h-[90vh] min-h-[560px] max-h-[780px]">
        <img
          src="/img_1.png"
          alt="Actions caritatives ETU Bénin"
          className="absolute inset-0 w-full h-full object-cover object-center"
        />
        {/* Overlay dégradé gauche→droite + bas */}
        <div className="absolute inset-0 bg-gradient-to-r from-black/75 via-black/40 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />

        {/* Nav retour */}
        <div className="absolute top-0 left-0 right-0 px-6 sm:px-10 pt-6 z-10">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-white/80 hover:text-white transition-colors text-sm font-serif group"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            Retour à l'accueil
          </Link>
        </div>

        {/* Contenu hero — ancré à gauche */}
        <div className="absolute inset-0 flex items-end pb-16 sm:pb-20 px-6 sm:px-14 lg:px-20">
          <div className="max-w-lg">
            {/* Tag */}
            <div className="inline-flex items-center gap-2 bg-white/10 border border-white/20 backdrop-blur-sm rounded-full px-4 py-1.5 mb-5">
              <Heart className="w-3.5 h-3.5 text-rose-300" />
              <span className="text-xs font-serif text-white/90 tracking-wide uppercase">Fraternité & Service</span>
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-serif font-bold text-white leading-tight mb-5">
              Agir pour<br />
              <span className="text-rose-300">ceux qui</span><br />
              en ont besoin
            </h1>
            <p className="text-base font-serif text-white/70 leading-relaxed mb-8 max-w-sm">
              L'ETU s'engage concrètement auprès des plus vulnérables au Bénin et en Afrique de l'Ouest.
            </p>
            <button
              onClick={() => setDonModalOpen(true)}
              className="inline-flex items-center gap-2 bg-white text-gray-900 px-6 py-3 rounded-xl text-sm font-serif font-semibold hover:bg-stone-100 transition-all shadow-xl"
            >
              <Heart className="w-4 h-4 text-rose-400" />
              Faire un don
            </button>
          </div>
        </div>
      </section>

      {/* ── SECTION INTRO ASYMÉTRIQUE ── */}
      <section className="max-w-7xl mx-auto px-6 sm:px-10 lg:px-16 py-20 lg:py-28">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
          {/* Texte à gauche */}
          <div>
            <p className="text-xs font-serif uppercase tracking-widest text-rose-400 mb-4">Notre mission</p>
            <h2 className="text-3xl sm:text-4xl font-serif font-bold text-gray-900 leading-snug mb-6">
              Un service discret,<br />animé par la foi
            </h2>
            <p className="text-base font-serif text-gray-600 leading-relaxed mb-5">
              Depuis sa fondation, l'École Transcendantaliste Universelle place la fraternité
              au cœur de sa démarche. Servir son prochain n'est pas une option ; c'est
              l'expression concrète des valeurs que nous enseignons.
            </p>
            <p className="text-base font-serif text-gray-600 leading-relaxed">
              Nos membres se mobilisent régulièrement sur le terrain, apportant aide matérielle,
              présence humaine et soutien spirituel à ceux qui en ont le plus besoin.
            </p>
          </div>

          {/* Image droite avec décalage visuel */}
          <div className="relative">
            <div className="relative rounded-2xl overflow-hidden shadow-2xl lg:translate-y-6">
              <img
                src="/img_2.png"
                alt="Membres ETU en action au centre de santé"
                className="w-full h-72 sm:h-96 object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
            </div>
            {/* Badge flottant */}
            <div className="absolute -bottom-5 -left-5 bg-white rounded-2xl shadow-lg px-5 py-4 border border-stone-100">
              <p className="text-2xl font-serif font-bold text-gray-900">4</p>
              <p className="text-xs font-serif text-gray-500 mt-0.5">domaines d'action</p>
            </div>
            {/* Accent décoratif */}
            <div className="absolute -top-4 -right-4 w-24 h-24 rounded-full bg-rose-50 border border-rose-100 -z-10" />
          </div>
        </div>
      </section>

      {/* ── ACTIVITÉS — GRILLE PHOTO ── */}
      <section className="py-20 lg:py-28 bg-stone-50">
        <div className="max-w-7xl mx-auto px-6 sm:px-10 lg:px-16">
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-6 mb-12">
            <div>
              <p className="text-xs font-serif uppercase tracking-widest text-rose-400 mb-3">Ce que nous faisons</p>
              <h2 className="text-3xl sm:text-4xl font-serif font-bold text-gray-900">Nos domaines d'action</h2>
            </div>
            <button
              onClick={() => setDonModalOpen(true)}
              className="self-start sm:self-auto inline-flex items-center gap-2 bg-gray-900 hover:bg-black text-white px-6 py-3 rounded-xl text-sm font-serif font-semibold transition-all shadow-lg"
            >
              <Heart className="w-4 h-4 text-rose-300" />
              Faire un don
            </button>
          </div>

          {/* Grille asymétrique 3 colonnes */}
          <div className="grid grid-cols-3 gap-3 sm:gap-4">

            {/* Colonne gauche — grande carte portrait */}
            <div
              className="col-span-1 relative rounded-2xl overflow-hidden cursor-pointer group h-[480px] sm:h-[560px]"
              onClick={() => setDonModalOpen(true)}
            >
              <img src={activites[0].image} alt={activites[0].titre} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/10 to-transparent" />
              <div className="absolute bottom-0 left-0 p-5">
                <p className="text-white font-serif font-bold text-base mb-3">{activites[0].titre}</p>
                <span className="inline-flex items-center gap-1.5 bg-white/20 backdrop-blur-sm border border-white/30 text-white text-xs font-serif px-3 py-1.5 rounded-full">
                  <Heart className="w-3 h-3 text-rose-300" /> Soutenir
                </span>
              </div>
            </div>

            {/* Colonne centrale — 2 cartes empilées */}
            <div className="col-span-1 flex flex-col gap-3 sm:gap-4">
              {[activites[1], activites[2]].map(({ titre, image }) => (
                <div
                  key={titre}
                  className="relative rounded-2xl overflow-hidden cursor-pointer group flex-1"
                  style={{ minHeight: 0 }}
                  onClick={() => setDonModalOpen(true)}
                >
                  <img src={image} alt={titre} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
                  <div className="absolute bottom-0 left-0 p-4">
                    <p className="text-white font-serif font-semibold text-sm leading-snug">{titre}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Colonne droite — grande carte portrait + badge don */}
            <div
              className="col-span-1 relative rounded-2xl overflow-hidden cursor-pointer group h-[480px] sm:h-[560px]"
              onClick={() => setDonModalOpen(true)}
            >
              <img src={activites[3].image} alt={activites[3].titre} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/10 to-transparent" />
              <div className="absolute bottom-0 left-0 p-5">
                <p className="text-white font-serif font-bold text-base mb-3">{activites[3].titre}</p>
                <span className="inline-flex items-center gap-1.5 bg-white/20 backdrop-blur-sm border border-white/30 text-white text-xs font-serif px-3 py-1.5 rounded-full">
                  <Heart className="w-3 h-3 text-rose-300" /> Soutenir
                </span>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ── BREAK IMAGE PLEINE LARGEUR ── */}
      <section className="relative h-64 sm:h-80 lg:h-96 overflow-hidden">
        <img
          src="/img_3.png"
          alt="Clinique communautaire l'Espoir — ETU Bénin"
          className="w-full h-full object-cover object-center"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-black/20 to-transparent" />
        <div className="absolute inset-0 flex items-center px-8 sm:px-14 lg:px-20">
          <div>
            <p className="text-xs font-serif uppercase tracking-widest text-rose-300 mb-2">Sur le terrain</p>
            <p className="text-xl sm:text-2xl lg:text-3xl font-serif font-bold text-white max-w-md leading-snug">
              Chaque jour, nos membres sont présents là où le besoin se fait sentir.
            </p>
          </div>
        </div>
      </section>

      {/* ── SECTION DON — SPLIT ASYMÉTRIQUE ── */}
      <section className="max-w-7xl mx-auto px-6 sm:px-10 lg:px-16 py-20 lg:py-28">
        <div className="grid lg:grid-cols-5 gap-12 items-center">
          {/* Image — 3 colonnes, décalée */}
          <div className="lg:col-span-3 relative">
            <div className="rounded-2xl overflow-hidden shadow-2xl">
              <img
                src="/img_1.png"
                alt="Solidarité ETU Bénin"
                className="w-full h-80 lg:h-[440px] object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-transparent to-black/20 rounded-2xl" />
            </div>
            {/* Citation flottante */}
            <div className="absolute -bottom-6 right-4 lg:-right-8 bg-white rounded-2xl shadow-xl border border-stone-100 px-6 py-5 max-w-xs">
              <p className="text-sm font-serif italic text-gray-700 leading-relaxed">
                « Servir son prochain,<br />c'est servir le Divin. »
              </p>
              <p className="text-xs font-serif text-gray-400 mt-2 uppercase tracking-widest">ETU ; OMP Bénin</p>
            </div>
          </div>

          {/* Texte + CTA — 2 colonnes */}
          <div className="lg:col-span-2 lg:pl-6 pt-8 lg:pt-0">
            <p className="text-xs font-serif uppercase tracking-widest text-rose-400 mb-4">Agir ensemble</p>
            <h2 className="text-3xl sm:text-4xl font-serif font-bold text-gray-900 leading-snug mb-5">
              Votre soutien<br />fait la différence
            </h2>
            <p className="text-sm font-serif text-gray-600 leading-relaxed mb-8">
              Chaque don, quelle qu'en soit la valeur, nous permet de poursuivre
              et d'élargir nos actions auprès des plus vulnérables. Il n'y a pas
              de petit geste quand il vient du cœur.
            </p>

            {/* Modalités simplifiées */}
            <div className="space-y-3 mb-8">
              <div className="flex items-start gap-3 bg-stone-50 rounded-xl px-4 py-3 border border-stone-100">
                <div className="w-1.5 h-1.5 rounded-full bg-rose-400 mt-2 flex-shrink-0" />
                <div>
                  <p className="text-xs font-serif font-semibold text-gray-800">Mobile Money ; Bénin</p>
                  <p className="text-sm font-serif font-bold text-gray-900 tracking-wide">+229 01 67 15 39 74</p>
                </div>
              </div>
              <div className="flex items-start gap-3 bg-stone-50 rounded-xl px-4 py-3 border border-stone-100">
                <div className="w-1.5 h-1.5 rounded-full bg-rose-400 mt-2 flex-shrink-0" />
                <div>
                  <p className="text-xs font-serif font-semibold text-gray-800">Depuis l'étranger</p>
                  <p className="text-xs font-serif text-gray-600">MoneyGram · Western Union · Virement</p>
                </div>
              </div>
            </div>

            <button
              onClick={() => setDonModalOpen(true)}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-gray-900 hover:bg-black text-white px-8 py-3.5 rounded-xl text-sm font-serif font-semibold transition-all shadow-lg hover:shadow-xl"
            >
              <MessageCircle className="w-4 h-4" />
              Nous contacter sur WhatsApp
            </button>
          </div>
        </div>
      </section>

      <DonModal open={donModalOpen} onClose={() => setDonModalOpen(false)} />

      {/* Footer */}
      <footer className="px-6 py-6 text-center border-t border-stone-100">
        <p className="text-xs text-gray-400 font-serif">
          ETU Bénin ; École Transcendantaliste Universelle ; Depuis 1977
        </p>
      </footer>
    </div>
  )
}
