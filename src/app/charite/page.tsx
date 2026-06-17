'use client'

import { useState } from 'react'
import { ArrowLeft, Heart, Baby, Home, Users, Stethoscope } from 'lucide-react'
import Link from 'next/link'
import DonModal from '@/components/DonModal'

const activites = [
  {
    icon: Baby,
    titre: 'Enfants abandonnés',
    description:
      "Nous intervenons auprès des enfants abandonnés en leur apportant soutien matériel, affectif et spirituel. Notre engagement est de veiller à ce qu'aucun enfant ne se retrouve seul face à la vie.",
  },
  {
    icon: Home,
    titre: 'Orphelins',
    description:
      "L'ETU accompagne les orphelins en leur offrant une présence bienveillante, des ressources essentielles et un environnement de fraternité où ils peuvent grandir dans la dignité.",
  },
  {
    icon: Users,
    titre: 'Femmes vulnérables en maternité',
    description:
      "Nous soutenons les femmes en situation de vulnérabilité lors de leur maternité : aide matérielle, accompagnement moral et assistance pratique pour traverser cette période avec sérénité.",
  },
  {
    icon: Stethoscope,
    titre: 'Assistance aux malades',
    description:
      "Les membres de l'Ordre visitent et assistent les malades, qu'ils soient hospitalisés ou en convalescence à domicile, en leur apportant réconfort, prière et soutien concret.",
  },
]

export default function CharitePage() {
  const [donModalOpen, setDonModalOpen] = useState(false)

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-stone-100">
      {/* Header */}
      <header className="px-6 py-4">
        <Link
          href="/"
          className="inline-flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors text-sm font-serif group"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          <span>Retour à l'accueil</span>
        </Link>
      </header>

      {/* Hero */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 pt-8 pb-16 text-center">
        <div className="flex items-center justify-center mb-6">
          <div className="w-16 h-16 rounded-2xl bg-rose-50 border border-rose-100 flex items-center justify-center">
            <Heart className="w-8 h-8 text-rose-400" />
          </div>
        </div>
        <h1 className="text-3xl sm:text-4xl font-serif font-bold text-gray-900 mb-4">
          Activités caritatives
        </h1>
        <p className="text-base sm:text-lg font-serif text-gray-600 max-w-2xl mx-auto leading-relaxed">
          L'École Transcendantaliste Universelle place la fraternité et le service au cœur de sa démarche spirituelle.
          Nos membres s'engagent concrètement auprès des plus vulnérables.
        </p>
      </section>

      {/* Activités */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 pb-20">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {activites.map(({ icon: Icon, titre, description }) => (
            <div
              key={titre}
              className="bg-white rounded-2xl border border-stone-200 shadow-sm p-7 flex flex-col gap-4 hover:shadow-md transition-shadow"
            >
              <div className="w-11 h-11 rounded-xl bg-stone-50 border border-stone-100 flex items-center justify-center flex-shrink-0">
                <Icon className="w-5 h-5 text-gray-700" />
              </div>
              <div>
                <h2 className="text-base font-serif font-semibold text-gray-900 mb-2">{titre}</h2>
                <p className="text-sm font-serif text-gray-600 leading-relaxed">{description}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Citation + appel au don */}
        <div className="mt-14 text-center">
          <blockquote className="text-base sm:text-lg font-serif italic text-gray-500 max-w-xl mx-auto leading-relaxed">
            « Servir son prochain, c'est servir le Divin. »
          </blockquote>
          <p className="mt-3 text-xs font-serif text-gray-400 uppercase tracking-widest mb-10">
            ETU Bénin — Ordre des Marins Pêcheurs
          </p>

          <div className="bg-white rounded-2xl border border-stone-200 shadow-sm p-8 max-w-xl mx-auto">
            <div className="w-12 h-12 rounded-xl bg-rose-50 border border-rose-100 flex items-center justify-center mx-auto mb-4">
              <Heart className="w-6 h-6 text-rose-400" />
            </div>
            <h3 className="text-base font-serif font-semibold text-gray-900 mb-2">Contribuer à ces actions</h3>
            <p className="text-sm font-serif text-gray-500 leading-relaxed mb-6">
              Votre soutien financier, quelle qu'en soit la forme, nous permet de poursuivre et d'étendre ces actions auprès des plus vulnérables.
            </p>
            <button
              onClick={() => setDonModalOpen(true)}
              className="inline-flex items-center gap-2 bg-gray-900 hover:bg-black text-white px-7 py-3 rounded-xl text-sm font-serif font-semibold transition-all shadow-lg hover:shadow-xl"
            >
              <Heart className="w-4 h-4 text-rose-300" />
              Faire un don
            </button>
          </div>
        </div>
      </section>

      <DonModal open={donModalOpen} onClose={() => setDonModalOpen(false)} />

      {/* Footer */}
      <footer className="px-6 py-6 text-center border-t border-stone-200">
        <p className="text-xs text-gray-400 font-serif">
          ETU Bénin — École Transcendantaliste Universelle — Depuis 1977
        </p>
      </footer>
    </div>
  )
}
