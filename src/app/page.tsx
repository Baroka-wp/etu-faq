'use client'

import { useState } from 'react'
import { ChevronDown, ChevronUp, MessageCircle, Facebook, User, Menu, X } from 'lucide-react'
import Link from 'next/link'
import ClientOnly from '@/components/ClientOnly'

export default function HomePage() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  return (
    <ClientOnly fallback={
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-4 text-gray-600">Chargement...</p>
        </div>
      </div>
    }>
      <div className="min-h-screen bg-white">
        {/* Navigation */}
        <nav className="bg-white shadow-lg sticky top-0 z-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <div className="flex items-center">
                <img
                  src="https://z-cdn-media.chatglm.cn/files/68e00202-7aa7-4b85-a148-a40fdb4ac3f7_logo.png?auth_key=1791497410-4f07e789ecd94c959d996139b8c142b3-0-310a7d57abdef550ba4f1b3ace27306a"
                  alt="Logo ETU"
                  className="h-10 w-10 mr-3"
                />
                <span className="text-xl font-serif font-bold text-gray-900">ETU Bénin</span>
              </div>

              {/* Desktop Menu */}
              <div className="hidden md:flex items-center space-x-8">
                <a href="#accueil" className="text-gray-700 hover:text-gray-900 font-serif">Accueil</a>
                <a href="#histoire" className="text-gray-700 hover:text-gray-900 font-serif">Notre Histoire</a>
                <a href="#mission" className="text-gray-700 hover:text-gray-900 font-serif">Mission</a>
                <a href="#enseignements" className="text-gray-700 hover:text-gray-900 font-serif">Enseignements</a>
                <Link href="/faq" className="text-gray-700 hover:text-gray-900 font-serif">FAQ</Link>
                <Link href="/inscription" className="bg-gray-800 text-white px-4 py-2 rounded-lg hover:bg-gray-900 transition-colors font-serif">
                  S'inscrire
                </Link>
              </div>

              {/* Mobile menu button */}
              <div className="md:hidden">
                <button
                  onClick={() => setIsMenuOpen(!isMenuOpen)}
                  className="text-gray-700 hover:text-gray-900"
                >
                  {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
                </button>
              </div>
            </div>

            {/* Mobile Menu */}
            {isMenuOpen && (
              <div className="md:hidden">
                <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 bg-white border-t">
                  <a href="#accueil" className="block px-3 py-2 text-gray-700 hover:text-gray-900 font-serif">Accueil</a>
                  <a href="#histoire" className="block px-3 py-2 text-gray-700 hover:text-gray-900 font-serif">Notre Histoire</a>
                  <a href="#mission" className="block px-3 py-2 text-gray-700 hover:text-gray-900 font-serif">Mission</a>
                  <a href="#enseignements" className="block px-3 py-2 text-gray-700 hover:text-gray-900 font-serif">Enseignements</a>
                  <Link href="/faq" className="block px-3 py-2 text-gray-700 hover:text-gray-900 font-serif">FAQ</Link>
                  <Link href="/inscription" className="block px-3 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-900 transition-colors font-serif">
                    S'inscrire
                  </Link>
                </div>
              </div>
            )}
          </div>
        </nav>

        {/* Section d'Accueil : Héros */}
        <section id="accueil" className="bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 py-16 sm:py-20">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 text-center">
            <div className="flex flex-col sm:flex-row items-center justify-center space-y-6 sm:space-y-0 sm:space-x-8 mb-12">
              <img
                src="https://z-cdn-media.chatglm.cn/files/68e00202-7aa7-4b85-a148-a40fdb4ac3f7_logo.png?auth_key=1791497410-4f07e789ecd94c959d996139b8c142b3-0-310a7d57abdef550ba4f1b3ace27306a"
                alt="Logo ETU - École Transcendantaliste Universelle"
                className="w-24 h-24 sm:w-32 sm:h-32 lg:w-40 lg:h-40"
              />
              <div className="text-center sm:text-left">
                <h1 className="text-3xl sm:text-4xl lg:text-5xl font-serif text-gray-900 leading-tight mb-4">
                  École Transcendantaliste Universelle
                </h1>
                <p className="text-lg sm:text-xl font-serif text-gray-600 uppercase tracking-wider">
                  Ordre des Marins Pêcheurs
                </p>
              </div>
            </div>

            <div className="max-w-4xl mx-auto">
              <blockquote className="text-xl sm:text-2xl lg:text-3xl font-serif text-gray-800 italic mb-8 leading-relaxed">
                « Un jour, tout ce qui est caché sera dévoilé », disait le Christ. Ce Jour est maintenant arrivé.
              </blockquote>

              <p className="text-lg sm:text-xl text-gray-700 mb-8 leading-relaxed">
                L'ETU a été instituée pour dévoiler les Enseignements dispensés par les hautes Écoles Initiatiques et couverts du sceau du secret. Notre mission est de vous transmettre les clés pour comprendre les lois divines et préparer l'humanité à l'ère du Verseau.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link href="/inscription" className="bg-gray-800 text-white px-8 py-4 rounded-lg hover:bg-gray-900 transition-colors text-lg font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-1">
                  <User className="w-5 h-5 inline mr-2" />
                  S'inscrire maintenant
                </Link>
                <Link href="/faq" className="bg-white text-gray-800 px-8 py-4 rounded-lg border-2 border-gray-300 hover:border-gray-400 transition-colors text-lg font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-1">
                  En savoir plus
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Notre Histoire */}
        <section id="histoire" className="py-16 sm:py-20 bg-white">
          <div className="max-w-6xl mx-auto px-4 sm:px-6">
            <div className="text-center mb-12">
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-serif text-gray-900 mb-6">
                Notre Histoire
              </h2>
              <div className="w-24 h-1 bg-gray-800 mx-auto"></div>
            </div>

            <div className="max-w-4xl mx-auto">
              <div className="bg-gray-50 rounded-xl p-8 sm:p-12">
                <h3 className="text-2xl sm:text-3xl font-serif text-gray-900 mb-6">
                  L'Origine de l'École
                </h3>
                <p className="text-lg text-gray-700 leading-relaxed mb-6">
                  <strong>CECI EST LA VOLONTE DES FRÈRES AÎNÉS</strong> du Monde Divin et KABALEB a été le canal à travers lequel ils ont transmis les enseignements que nous avons le privilège de vous transmettre.
                </p>
                <p className="text-lg text-gray-700 leading-relaxed">
                  KABALEB, de son vrai nom Enrique LLOP, né le 22 Février 1927 à Gerone en Espagne, a créé l'École Transcendantaliste Universelle en Juillet 1977. Aujourd'hui, elle est implantée en Europe (Espagne, France, Suisse, Belgique, Allemagne, Italie), en Afrique (Côte d'Ivoire, Bénin, Burkina Faso, Cameroun et Gabon) et bientôt en Amérique (Canada et Argentine).
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Notre Mission & Philosophie */}
        <section id="mission" className="py-16 sm:py-20 bg-gray-50">
          <div className="max-w-6xl mx-auto px-4 sm:px-6">
            <div className="text-center mb-12">
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-serif text-gray-900 mb-6">
                Notre Mission & Philosophie
              </h2>
              <div className="w-24 h-1 bg-gray-800 mx-auto"></div>
            </div>

            {/* Le But de l'ETU - Section principale */}
            <div className="mb-12">
              <div className="bg-white rounded-lg p-8 sm:p-12 border border-gray-200 hover:border-gray-300 transition-all duration-300">
                <h3 className="text-2xl sm:text-3xl font-serif text-gray-900 mb-8 text-center">Le But de l'ETU</h3>
                <div className="max-w-4xl mx-auto">
                  <p className="text-lg sm:text-xl text-gray-700 leading-relaxed mb-6 text-center">
                    À l'aube de ce 3ème millénaire, tous ceux qui manifestent le désir d'être parmi le Peuple Élu le peuvent, si leur volonté, principal attribut divin, se manifeste dans le sens du progrès spirituel de l'humanité.
                  </p>
                  <p className="text-lg sm:text-xl text-gray-700 leading-relaxed text-center">
                    Le but de l'ETU est donc de transmettre à l'humanité les enseignements qui lui permettront d'entrer dans l'ère du Verseau qui sera l'ère de la communication, de la manifestation de l'Amour, du règne du Fils.
                  </p>
                </div>
              </div>
            </div>

            {/* Le Transcendantalisme - Section détaillée */}
            <div className="grid lg:grid-cols-2 gap-8">
              <div className="bg-white rounded-lg p-8 border border-gray-200 hover:border-gray-300 transition-all duration-300 group">
                <h3 className="text-2xl font-serif text-gray-900 mb-6 group-hover:text-gray-800 transition-colors">Qu'est-ce que le Transcendantalisme ?</h3>
                <p className="text-lg text-gray-700 leading-relaxed mb-6">
                  Le transcendantalisme est un mouvement de type moral et philosophique. Par sa philosophie, il se propose d'amener l'homme à une compréhension plus grande des problèmes de l'existence, situant sa conscience à un plus haut niveau dans les régions métaphysiques.
                </p>
                <p className="text-lg text-gray-700 leading-relaxed mb-6">
                  Il lui permet, à travers les connaissances diffusées par l'ETU, d'être plus objectif dans ses actes, plus généreux et plus juste.
                </p>
                <p className="text-lg text-gray-700 leading-relaxed">
                  La conséquence de cette compréhension sera la conquête d'un niveau moral plus élevé, qui fera de lui un Être de refus, de renoncement, introduisant l'idée de rendre service à autrui, du sacrifice volontaire, et des restrictions matérielles comme idéal. Les armes du transcendantalisme sont morales, intellectuelles, spirituelles. Plus qu'un mouvement physique, c'est un état d'esprit. Est transcendantaliste celui qui, par ses idées et ses actions, contribue à l'évolution de l'humanité.
                </p>
              </div>

              <div className="bg-white rounded-lg p-8 border border-gray-200 hover:border-gray-300 transition-all duration-300 group">
                <h3 className="text-2xl font-serif text-gray-900 mb-6 group-hover:text-gray-800 transition-colors">Qui est le Transcendantaliste ?</h3>
                <p className="text-lg text-gray-700 leading-relaxed">
                  Le transcendantaliste est celui qui cherche une mission concrète et positive dans la vie ; celui qui se sent frustré partout où règne l'injustice ; celui qui cherche la lumière que l'enseignement peut lui donner. Il est heureux de servir sans rien demander en échange, satisfait du plaisir de servir. C'est celui qui doute, qui s'interroge sur son propre destin et celui de l'humanité, un assoiffé d'éternité, car le transcendantalisme répond à toutes les questions qu'il se pose.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Nos Enseignements */}
        <section id="enseignements" className="py-16 sm:py-20 bg-white">
          <div className="max-w-6xl mx-auto px-4 sm:px-6">
            <div className="text-center mb-12">
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-serif text-gray-900 mb-6">
                Nos Enseignements & Formations
              </h2>
              <div className="w-24 h-1 bg-gray-800 mx-auto"></div>
            </div>

            {/* Introduction aux Enseignements */}
            <div className="max-w-5xl mx-auto mb-12">
              <div className="bg-gray-50 rounded-lg p-8 sm:p-12 border border-gray-200 hover:border-gray-300 transition-all duration-300">
                <h3 className="text-2xl sm:text-3xl font-serif text-gray-900 mb-8 text-center">Découvrez nos parcours d'étude</h3>
                <div className="max-w-4xl mx-auto">
                  <p className="text-lg sm:text-xl text-gray-700 leading-relaxed mb-6">
                    Nos enseignements sont principalement articulés autour de la <strong className="text-gray-900">Kabbale</strong>, une doctrine mystérieuse et sacrée. Elle est une « Tradition Ésotérique », une Méthode permettant d'appréhender les LOIS de notre Système Solaire et de les utiliser afin de mieux comprendre :
                  </p>
                  <ol className="list-decimal list-inside text-lg sm:text-xl text-gray-700 space-y-3 mb-8">
                    <li className="hover:text-gray-900 transition-colors duration-200">Notre sphère d'existence.</li>
                    <li className="hover:text-gray-900 transition-colors duration-200">Notre situation physique, psychique, mentale et spirituelle.</li>
                    <li className="hover:text-gray-900 transition-colors duration-200">La manière de nous dégager de notre « condition humaine » en accédant à un état de Conscience Élevé, qualifié de DIVIN.</li>
                  </ol>
                  <p className="text-lg sm:text-xl text-gray-700 leading-relaxed">
                    Cette Méthode représente notre Univers au moyen d'un schéma appelé « <strong className="text-gray-900">ARBRE DE VIE</strong> », qui permet de comprendre comment circule la Force Divine, comment elle se différencie en plusieurs types d'énergies, et comment celles-ci sont hiérarchisées.
                  </p>
                </div>
              </div>
            </div>

            {/* Les Programmes par Grade */}
            <div className="mb-12">
              <div className="bg-white rounded-lg p-8 sm:p-12 border border-gray-200">
                <h3 className="text-2xl sm:text-3xl font-serif text-gray-900 mb-8 text-center">Les Programmes par Grade</h3>
                <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                  <div className="bg-gray-50 rounded-lg p-6 border border-gray-200 hover:border-gray-300 hover:bg-gray-100 transition-all duration-300 group cursor-pointer">
                    <div className="bg-gray-800 text-white rounded-full w-12 h-12 flex items-center justify-center text-lg font-bold mx-auto mb-4 group-hover:bg-gray-700 transition-colors duration-300">1</div>
                    <h4 className="text-lg font-serif font-semibold text-gray-900 mb-3 text-center group-hover:text-gray-800 transition-colors duration-300">Grade 1: NÉOPHYTE</h4>
                    <p className="text-gray-700 text-sm leading-relaxed text-center group-hover:text-gray-800 transition-colors duration-300">Les mystères de l'œuvre divine (la philosophie exotérique). Le cours est composé de 24 leçons.</p>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-6 border border-gray-200 hover:border-gray-300 hover:bg-gray-100 transition-all duration-300 group cursor-pointer">
                    <div className="bg-gray-800 text-white rounded-full w-12 h-12 flex items-center justify-center text-lg font-bold mx-auto mb-4 group-hover:bg-gray-700 transition-colors duration-300">2</div>
                    <h4 className="text-lg font-serif font-semibold text-gray-900 mb-3 text-center group-hover:text-gray-800 transition-colors duration-300">Grade 2: CONSTRUCTEUR</h4>
                    <p className="text-gray-700 text-sm leading-relaxed text-center group-hover:text-gray-800 transition-colors duration-300">22 Travaux de Grade + 12 leçons d'Évangile.</p>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-6 border border-gray-200 hover:border-gray-300 hover:bg-gray-100 transition-all duration-300 group cursor-pointer">
                    <div className="bg-gray-800 text-white rounded-full w-12 h-12 flex items-center justify-center text-lg font-bold mx-auto mb-4 group-hover:bg-gray-700 transition-colors duration-300">3</div>
                    <h4 className="text-lg font-serif font-semibold text-gray-900 mb-3 text-center group-hover:text-gray-800 transition-colors duration-300">Grade 3: NAVIGATEUR</h4>
                    <p className="text-gray-700 text-sm leading-relaxed text-center group-hover:text-gray-800 transition-colors duration-300">22 Travaux de Grade + 22 leçons d'Évangile.</p>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-6 border border-gray-200 hover:border-gray-300 hover:bg-gray-100 transition-all duration-300 group cursor-pointer">
                    <div className="bg-gray-800 text-white rounded-full w-12 h-12 flex items-center justify-center text-lg font-bold mx-auto mb-4 group-hover:bg-gray-700 transition-colors duration-300">4</div>
                    <h4 className="text-lg font-serif font-semibold text-gray-900 mb-3 text-center group-hover:text-gray-800 transition-colors duration-300">Grade 4: ALCHIMISTE</h4>
                    <p className="text-gray-700 text-sm leading-relaxed text-center group-hover:text-gray-800 transition-colors duration-300">44 Travaux de Grade + 28 leçons d'Évangile.</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Les Cours Thématiques Détaillés */}
            <div className="mb-12">
              <div className="bg-white rounded-lg p-8 sm:p-12 border border-gray-200">
                <h3 className="text-2xl sm:text-3xl font-serif text-gray-900 mb-8 text-center">Les Cours Thématiques Détaillés</h3>
                
                {/* Cours 1: Philosophie Ésotérique Chrétienne */}
                <div className="mb-8">
                  <div className="bg-gray-50 rounded-lg p-6 border border-gray-200 hover:border-gray-300 transition-all duration-300 group">
                    <h4 className="text-xl font-serif font-semibold text-gray-900 mb-4 group-hover:text-gray-800 transition-colors duration-300">1. Philosophie Ésotérique Chrétienne (22 leçons)</h4>
                    <p className="text-gray-700 leading-relaxed mb-4">
                      Ce cours introduit la Kabbale, l'organisation cosmique et les symbolismes bibliques. Il expose de façon cohérente et simple les lois établies par Dieu pour le fonctionnement de notre Univers. La connaissance de ces Lois permet à l'homme d'agir à l'unisson avec elles et de se mouvoir dans un espace où le malheur, le mal, les accidents et la maladie, produits de l'ignorance, n'ont pas de place. C'est une véritable « Science du Comportement ».
                    </p>
                    <p className="text-gray-700 leading-relaxed mb-4">
                      Le contenu de cet Enseignement provient de la Tradition Hermétique, présenté de manière globale et logique pour permettre à l'Étudiant, quelle que soit son appartenance, de mieux comprendre les enseignements de sa propre religion ou école.
                    </p>
                    <div className="bg-white rounded-lg p-4 border border-gray-200">
                      <h5 className="font-semibold text-gray-900 mb-3">Programme du cours :</h5>
                      <div className="grid md:grid-cols-2 gap-2 text-sm text-gray-700">
                        <div className="hover:text-gray-900 transition-colors duration-200">– Leçon 1 : La création (Cours Gratuit)</div>
                        <div className="hover:text-gray-900 transition-colors duration-200">– Leçon 2 : La création (suite)</div>
                        <div className="hover:text-gray-900 transition-colors duration-200">– Leçon 3 : La Création (fin)</div>
                        <div className="hover:text-gray-900 transition-colors duration-200">– Leçon 4 : Le cycle Vital</div>
                        <div className="hover:text-gray-900 transition-colors duration-200">– Leçon 5 : Le cycle vital (suite)</div>
                        <div className="hover:text-gray-900 transition-colors duration-200">– Leçon 6 : Le cycle vital (suite)</div>
                        <div className="hover:text-gray-900 transition-colors duration-200">– Leçon 7 : Le cycle vital (suite)</div>
                        <div className="hover:text-gray-900 transition-colors duration-200">– Leçon 8 : Le cycle vital (suite)</div>
                        <div className="hover:text-gray-900 transition-colors duration-200">– Leçon 9 : Le cycle vital (suite)</div>
                        <div className="hover:text-gray-900 transition-colors duration-200">– Leçon 10 : Le cycle vital (fin)</div>
                        <div className="hover:text-gray-900 transition-colors duration-200">– Leçon 11 : L'Organisation</div>
                        <div className="hover:text-gray-900 transition-colors duration-200">– Leçon 12 : L'Organisation (suite)</div>
                        <div className="hover:text-gray-900 transition-colors duration-200">– Leçon 13 : L'Organisation (suite)</div>
                        <div className="hover:text-gray-900 transition-colors duration-200">– Leçon 14 : L'Organisation (suite)</div>
                        <div className="hover:text-gray-900 transition-colors duration-200">– Leçon 15 : L'Organisation (suite et fin)</div>
                        <div className="hover:text-gray-900 transition-colors duration-200">– Leçon 16 : Le travail humain</div>
                        <div className="hover:text-gray-900 transition-colors duration-200">– Leçon 17 : Le travail humain (suite)</div>
                        <div className="hover:text-gray-900 transition-colors duration-200">– Leçon 18 : Le travail humain (suite)</div>
                        <div className="hover:text-gray-900 transition-colors duration-200">– Leçon 19 : Le travail humain (suite)</div>
                        <div className="hover:text-gray-900 transition-colors duration-200">– Leçon 20 : Le travail divin</div>
                        <div className="hover:text-gray-900 transition-colors duration-200">– Leçon 21 : Le travail divin (suite et fin)</div>
                        <div className="hover:text-gray-900 transition-colors duration-200">– Leçon 22 : Analyse finale</div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Cours 2: Interprétation Ésotérique de l'Évangile */}
                <div className="mb-8">
                  <div className="bg-gray-50 rounded-lg p-6 border border-gray-200 hover:border-gray-300 transition-all duration-300 group">
                    <h4 className="text-xl font-serif font-semibold text-gray-900 mb-4 group-hover:text-gray-800 transition-colors duration-300">2. Interprétation Ésotérique de l'Évangile (50 leçons)</h4>
                    <p className="text-gray-700 leading-relaxed mb-4">
                      Ce cours révèle tous les symbolismes bibliques contenus dans les Évangiles.
                    </p>
                    <div className="bg-white rounded-lg p-4 border border-gray-200">
                      <h5 className="font-semibold text-gray-900 mb-3">Programme du cours :</h5>
                      <div className="grid md:grid-cols-2 gap-2 text-sm text-gray-700">
                        <div className="hover:text-gray-900 transition-colors duration-200">– Leçon 1 : Processus d'élaboration de la personnalité christique et de sa sauvegarde.</div>
                        <div className="hover:text-gray-900 transition-colors duration-200">– Leçon 2 : Aplanir les sentiers intérieurs</div>
                        <div className="hover:text-gray-900 transition-colors duration-200">– Leçon 3 : Jésus à l'aube de sa mission terrestre</div>
                        <div className="hover:text-gray-900 transition-colors duration-200">– Leçon 4 : L'art d'être chrétien</div>
                        <div className="hover:text-gray-900 transition-colors duration-200">– Leçon 5 : Intérioriser les lois cosmiques et les extérioriser en comportement naturel</div>
                        <div className="hover:text-gray-900 transition-colors duration-200">– Leçon 6 : Dépasser la Loi et instaurer la Foi et l'Amour</div>
                        <div className="hover:text-gray-900 transition-colors duration-200">– Leçon 7 : Le Christianisme : une voie intérieure. L'humilité : première vertu du disciple.</div>
                        <div className="hover:text-gray-900 transition-colors duration-200">– Leçon 8 : Le travail humain et les mystères de l'Amour – Christ</div>
                        <div className="hover:text-gray-900 transition-colors duration-200">– Leçon 9 : Directives pour le disciple du Christ – La femme dans l'œuvre du Christ</div>
                        <div className="hover:text-gray-900 transition-colors duration-200">– Leçon 10 : Le mystère de l'âme humaine - Le symbolisme de la décapitation de Jean Baptiste.</div>
                        <div className="hover:text-gray-900 transition-colors duration-200">– Leçon 11 à 50 : Interprétation Ésotérique de l'évangile (Suite)</div>
                        <div className="hover:text-gray-900 transition-colors duration-200">– Conclusion</div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Autres Enseignements */}
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="bg-gray-50 rounded-lg p-6 border border-gray-200 hover:border-gray-300 hover:bg-gray-100 transition-all duration-300 group cursor-pointer">
                    <h4 className="text-lg font-serif font-semibold text-gray-900 mb-3 group-hover:text-gray-800 transition-colors duration-300">3. Astrologie et Kabbale (22 leçons)</h4>
                    <p className="text-gray-700 text-sm leading-relaxed group-hover:text-gray-800 transition-colors duration-300">Associe l'étude de l'Astrologie à celle de la Kabbale et révèle les clés de l'interprétation des thèmes.</p>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-6 border border-gray-200 hover:border-gray-300 hover:bg-gray-100 transition-all duration-300 group cursor-pointer">
                    <h4 className="text-lg font-serif font-semibold text-gray-900 mb-3 group-hover:text-gray-800 transition-colors duration-300">4. Haute Kabbale appliquée à l'Astrologie et au Tarot (60 leçons)</h4>
                    <p className="text-gray-700 text-sm leading-relaxed group-hover:text-gray-800 transition-colors duration-300">Le disciple est alors en possession de tous les Arcanes lui permettant d'être utile au monde et d'être un agent de la Divine Volonté.</p>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-6 border border-gray-200 hover:border-gray-300 hover:bg-gray-100 transition-all duration-300 group cursor-pointer">
                    <h4 className="text-lg font-serif font-semibold text-gray-900 mb-3 group-hover:text-gray-800 transition-colors duration-300">5. Interprétation ésotérique de l'Apocalypse (22 leçons)</h4>
                    <p className="text-gray-700 text-sm leading-relaxed group-hover:text-gray-800 transition-colors duration-300">Découverte des symbolismes cachés dans le livre de l'Apocalypse.</p>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-6 border border-gray-200 hover:border-gray-300 hover:bg-gray-100 transition-all duration-300 group cursor-pointer">
                    <h4 className="text-lg font-serif font-semibold text-gray-900 mb-3 group-hover:text-gray-800 transition-colors duration-300">6. Interprétation ésotérique de la Genèse (50 leçons)</h4>
                    <p className="text-gray-700 text-sm leading-relaxed group-hover:text-gray-800 transition-colors duration-300">Analyse approfondie des premiers chapitres de la Bible.</p>
                  </div>
                </div>

                <div className="mt-6 bg-gray-50 rounded-lg p-6 border border-gray-200 hover:border-gray-300 transition-all duration-300 group">
                  <h4 className="text-lg font-serif font-semibold text-gray-900 mb-3 group-hover:text-gray-800 transition-colors duration-300">7. Étude des noms des anges divins</h4>
                  <p className="text-gray-700 leading-relaxed group-hover:text-gray-800 transition-colors duration-300">Par ce cours, le disciple apprend à maîtriser les noms, les sons, et peut les utiliser pour améliorer sa condition de vie ou les rejeter s'ils ne sont pas en harmonie avec elle.</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Notre Action Spirituelle et Sociale */}
        <section className="py-16 sm:py-20 bg-gray-50">
          <div className="max-w-6xl mx-auto px-4 sm:px-6">
            <div className="text-center mb-12">
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-serif text-gray-900 mb-6">
                Notre Action Spirituelle et Sociale
              </h2>
              <div className="w-24 h-1 bg-gray-800 mx-auto"></div>
            </div>

            <div className="max-w-4xl mx-auto">
              <div className="bg-white rounded-lg p-8 border border-gray-200 hover:border-gray-300 transition-all duration-300">
                <h3 className="text-2xl font-serif text-gray-900 mb-6">Au-delà des cours, une action concrète</h3>
                <p className="text-lg text-gray-700 leading-relaxed mb-6">
                  L'ETU met également à la disposition du disciple des prières, des rituels, des textes sacrés pouvant l'aider dans la quête de son identité spirituelle. C'est ainsi que sont mis en place des groupes de prières qui œuvrent pour la guérison des malades (Serviteurs Silencieux du Christ – SSC – et Médecins du Christ – MC).
                </p>
                <p className="text-lg text-gray-700 leading-relaxed mb-6">
                  Par son action sociale, les membres de l'ETU rendent visite aux malades, aux prisonniers, aux enfants abandonnés et aux handicapés et leur offrent des présents.
                </p>
                <p className="text-lg text-gray-700 leading-relaxed">
                  L'ETU formera finalement des groupes d'étudiants pour travailler à préparer et organiser le Monde de Demain, à travers son ordre initiatique et mystique. L'étudiant pourra faire partie de l'OIM-ETU après les premiers cours, soit après un an à partir de la date de son adhésion, s'il est régulier.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Appel à l'Action */}
        <section className="py-16 sm:py-20 bg-gradient-to-br from-blue-900 via-indigo-900 to-purple-900 text-white">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 text-center">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-serif mb-8">
              Le monde a besoin de vous
            </h2>
            <div className="max-w-4xl mx-auto">
              <blockquote className="text-xl sm:text-2xl font-serif italic mb-8 leading-relaxed">
                « Voilà cher Frère et chère Sœur, nous avons fait ce que l'on nous a demandé de faire. Si à travers ces lignes tu te sens appelé, alors ne perds pas une minute. Car si Dieu a créé le monde, ce sont les hommes qui le bâtissent et la qualité du monde dépendra de la qualité des hommes.
              </blockquote>
              <p className="text-lg sm:text-xl mb-8 leading-relaxed">
                À nous, à qui le flambeau a été transmis, nous te tendons la main pour qu'ensemble nous semions à travers le monde les graines de l'AMOUR pour un avenir radieux pour notre planète bleue.
              </p>
              <p className="text-lg sm:text-xl mb-12 leading-relaxed font-semibold">
                Quoi que tu veuilles faire, fais-le rapidement ! Ne remets pas à demain ce que tu peux faire aujourd'hui.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link href="/inscription" className="bg-white text-gray-900 px-8 py-4 rounded-lg hover:bg-gray-100 transition-colors text-lg font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-1">
                  <User className="w-5 h-5 inline mr-2" />
                  S'inscrire maintenant
                </Link>
                <Link href="/faq" className="bg-transparent text-white px-8 py-4 rounded-lg border-2 border-white hover:bg-white hover:text-gray-900 transition-colors text-lg font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-1">
                  En savoir plus
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="bg-white border-t border-gray-200 py-8 sm:py-12">
          <div className="max-w-6xl mx-auto px-4 sm:px-6">
            <div className="grid md:grid-cols-3 gap-8">
              <div>
                <div className="flex items-center mb-4">
                  <img
                    src="https://z-cdn-media.chatglm.cn/files/68e00202-7aa7-4b85-a148-a40fdb4ac3f7_logo.png?auth_key=1791497410-4f07e789ecd94c959d996139b8c142b3-0-310a7d57abdef550ba4f1b3ace27306a"
                    alt="Logo ETU"
                    className="h-10 w-10 mr-3"
                  />
                  <span className="text-xl font-serif font-bold text-gray-900">ETU Bénin</span>
                </div>
                <p className="text-gray-600 font-serif">
                  École Transcendantaliste Universelle - Depuis 1977
                </p>
              </div>

              <div>
                <h3 className="text-lg font-serif font-semibold text-gray-900 mb-4">Navigation</h3>
                <ul className="space-y-2">
                  <li><a href="#accueil" className="text-gray-600 hover:text-gray-900 font-serif">Accueil</a></li>
                  <li><a href="#histoire" className="text-gray-600 hover:text-gray-900 font-serif">Notre Histoire</a></li>
                  <li><a href="#mission" className="text-gray-600 hover:text-gray-900 font-serif">Mission</a></li>
                  <li><Link href="/faq" className="text-gray-600 hover:text-gray-900 font-serif">FAQ</Link></li>
                </ul>
              </div>

              <div>
                <h3 className="text-lg font-serif font-semibold text-gray-900 mb-4">Contact</h3>
                <div className="space-y-4">
                  <a
                    href="https://wa.me/22967153974"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center text-gray-600 hover:text-gray-900 font-serif"
                  >
                    <MessageCircle className="w-5 h-5 mr-2" />
                    +229 67 15 39 74
                  </a>
                  <a
                    href="https://www.facebook.com/profile.php?id=61570538836966"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center text-gray-600 hover:text-gray-900 font-serif"
                  >
                    <Facebook className="w-5 h-5 mr-2" />
                    Facebook
                  </a>
                </div>
              </div>
            </div>

            <div className="border-t border-gray-200 mt-8 pt-8 text-center">
              <p className="text-gray-500 text-sm font-serif">
                © 2024 ETU Bénin. Tous droits réservés.
              </p>
            </div>
          </div>
        </footer>
      </div>
    </ClientOnly>
  )
}