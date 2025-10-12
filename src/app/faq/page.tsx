'use client'

import { useState } from 'react'
import { ChevronDown, ChevronUp, MessageCircle, Facebook, User, Menu, X, ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import ClientOnly from '@/components/ClientOnly'

interface FAQItem {
    question: string
    answer: string
}

interface FAQSection {
    title: string
    subtitle: string
    items: FAQItem[]
}

const faqData: FAQSection[] = [
    {
        title: "La Formation et Sa Promesse",
        subtitle: "Pourquoi s'inscrire ?",
        items: [
            {
                question: "Qu'est-ce que je vais vraiment apprendre et transformer dans cette formation ?",
                answer: "Au-delà des sujets, cette formation est une invitation à l'éveil. Vous apprendrez à :\n• Comprendre les lois invisibles qui régissent votre vie et l'univers (Kabbale, Hermétisme)\n• Activer vos potentiels cachés et votre connexion aux mondes subtils (Angiologie, Alchimie)\n• Lire le langage de l'âme et les cycles de votre évolution (Astrologie, Ésotérisme Chrétien)\n• Devenir le canal de votre propre Maître intérieur, en cessant de chercher la validation à l'extérieur\n\nL'objectif n'est pas d'accumuler des connaissances, mais de vivre une transformation intérieure qui changera votre perception de vous-même et du monde."
            },
            {
                question: "Cette formation est-elle faite pour moi ? Ai-je besoin de connaissances préalables ?",
                answer: "Le 'Degré Explorateur' est spécifiquement conçu pour les aspirants et les néophytes. Aucune connaissance préalable n'est requise. La seule chose dont vous avez besoin est une aspiration sincère à comprendre le sens de votre vie et un désir d'élévation spirituelle. Si vous ressentez cet appel, cette formation est pour vous."
            }
        ]
    },
    {
        title: "L'École et Son Enseignement",
        subtitle: "La Confiance et la Sécurité",
        items: [
            {
                question: "Qu'est-ce que l'École Transcendantaliste Universelle (ETU) ?",
                answer: "L'ETU est une école de sagesse initiatique fondée en juillet 1977 par KABALEB (Enrique LLOP). Sa mission est de rendre accessibles les enseignements sacrés qui étaient jadis réservés aux initiés. Présente dans plusieurs pays, l'ETU Bénin est une branche vivante de cette tradition, dédiée à l'éveil des âmes."
            },
            {
                question: "Quelle est la source de cet enseignement ? Est-il authentique ?",
                answer: "L'enseignement de l'ETU est d'une filiation directe. KABALEB a été le canal par lequel les 'Frères Aînés du Monde Divin' ont transmis ces connaissances. Son œuvre majeure a été de révéler les codes kabbalistiques et les symbolismes cachés dans les Évangiles et l'Ancien Testament. Vous recevez donc un enseignement pur, non altéré, dont la source remonte à la tradition primordiale de l'Occident."
            },
            {
                question: "Cet enseignement est-il une religion ou une secte ? Est-il compatible avec ma foi ?",
                answer: "C'est une question essentielle. L'ETU n'est ni une religion, ni une secte. C'est une école de sagesse et de développement spirituel. L'enseignement est universel et vise à réveiller la divinité en chaque être, quelle que soit sa religion d'origine. Bien au contraire de créer une dépendance, il vous rend libre et autonome. Il est conçu pour enrichir votre foi personnelle, et non la remplacer."
            }
        ]
    },
    {
        title: "Modalités Pratiques et Investissement",
        subtitle: "Le Comment",
        items: [
            {
                question: "Comment se déroulent les cours en pratique ?",
                answer: "La formation s'étale sur une période de six (06) mois. Les cours sont dispensés en ligne tous les dimanches, de 21h à 23h (heure locale), pour vous permettre de vous organiser sereinement."
            },
            {
                question: "Quel est l'investissement financier demandé et pourquoi ?",
                answer: "L'investissement pour votre éveil se décompose ainsi :\n• Frais d'inscription unique : 12 000 FCFA (pour le retrait et le traitement de votre fiche d'inscription)\n• Mensualités : 10 000 FCFA au début de chaque mois, pendant 6 mois (soit 60 000 FCFA au total)\n\nCet investissement couvre les frais de structure, l'encadrement par les instructeurs et la transmission d'un savoir initiatique de grande valeur. Il est aussi un premier acte d'engagement et de conscience sur votre chemin."
            },
            {
                question: "Pouvez-vous m'expliquer plus en détail la 'discipline de l'Initiation' (154 jours et 154 000 FCFA) ?",
                answer: "Il s'agit là du cœur de la démarche alchimique de l'École. Ce n'est pas une 'cotisation', mais un puissant exercice spirituel.\n\nL'acte de mettre de côté chaque jour une petite somme (1000 FCFA) pendant 154 jours, tout en menant une discipline de prières, crée une transformation intérieure. Cela développe la constance, la foi, le détachement et la capacité à manifester dans la matière. Les 154 000 FCFA ne sont pas le but, mais le résultat visible de votre discipline spirituelle. C'est la preuve de votre capacité à atteindre un objectif que vous vous êtes fixé, une clé indispensable pour l'Initiation."
            },
            {
                question: "Comment accéder aux supports de cours ?",
                answer: "Pour respecter l'environnement et faciliter l'accès, tous les supports de cours sont numériques. Ils seront directement téléchargeables sur la plateforme de la formation, dont l'URL vous sera communiquée dès votre inscription."
            },
            {
                question: "Et si je ne peux pas payer d'un coup, y a t'il des modalités ?",
                answer: "Nous sommes humains et compréhensifs. La priorité est votre aspiration. Si vous rencontrez des difficultés, contactez-nous directement et confidentiellement. Des arrangements peuvent être étudiés au cas par cas pour ne laisser personne sur le chemin pour des raisons matérielles."
            }
        ]
    },
    {
        title: "Le Chemin Après la Formation",
        subtitle: "L'Avenir",
        items: [
            {
                question: "Que se passe-t-il après le Degré Explorateur ? Y a-t-il une suite ?",
                answer: "Le 'Degré Explorateur' est la porte d'entrée. Une fois que vous avez complété cette étape et la discipline d'Initiation, vous accédez au 'Degré Initié'. Le chemin ne s'arrête pas là ; il continue de s'élever à travers différents degrés au sein de l'ETU, vous accompagnant à chaque étape de votre évolution spirituelle."
            }
        ]
    },
    {
        title: "Inscription et Contact",
        subtitle: "Le Pas Suivant",
        items: [
            {
                question: "Je suis convaincu(e) ! Comment je m'inscris ?",
                answer: "Nous sommes heureux de vous accueillir ! Le processus est simple :\n1. Contactez-nous par téléphone/WhatsApp au (+229) 67153974 pour exprimer votre motivation\n2. Retirez et remplissez votre fiche d'inscription en réglant les frais de 12 000 FCFA\n3. Rejoignez la communauté WhatsApp pour recevoir les premiers liens et commencer à vibrer avec le groupe"
            },
            {
                question: "J'ai encore une question qui n'est pas ici.",
                answer: "N'hésitez surtout pas ! Nous sommes là pour vous. Rejoignez notre communauté WhatsApp ou appelez-nous directement. Votre question est importante et mérite une réponse claire."
            }
        ]
    }
]

export default function FAQPage() {
    const [openItems, setOpenItems] = useState<{ [key: string]: boolean }>({})
    const [isMenuOpen, setIsMenuOpen] = useState(false)

    const toggleItem = (sectionIndex: number, itemIndex: number) => {
        const key = `${sectionIndex}-${itemIndex}`
        setOpenItems(prev => ({ ...prev, [key]: !prev[key] }))
    }

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
                                <Link href="/" className="flex items-center">
                                    <img
                                        src="https://z-cdn-media.chatglm.cn/files/68e00202-7aa7-4b85-a148-a40fdb4ac3f7_logo.png?auth_key=1791497410-4f07e789ecd94c959d996139b8c142b3-0-310a7d57abdef550ba4f1b3ace27306a"
                                        alt="Logo ETU"
                                        className="h-10 w-10 mr-3"
                                    />
                                    <span className="text-xl font-serif font-bold text-gray-900">ETU Bénin</span>
                                </Link>
                            </div>

                            {/* Desktop Menu */}
                            <div className="hidden md:flex items-center space-x-8">
                                <Link href="/" className="text-gray-700 hover:text-gray-900 font-serif">Accueil</Link>
                                <Link href="/faq" className="text-gray-700 hover:text-gray-900 font-serif border-b-2 border-gray-800">FAQ</Link>
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
                                    <Link href="/" className="block px-3 py-2 text-gray-700 hover:text-gray-900 font-serif">Accueil</Link>
                                    <Link href="/faq" className="block px-3 py-2 text-gray-700 hover:text-gray-900 font-serif bg-gray-100 rounded">FAQ</Link>
                                    <Link href="/inscription" className="block px-3 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-900 transition-colors font-serif">
                                        S'inscrire
                                    </Link>
                                </div>
                            </div>
                        )}
                    </div>
                </nav>

                {/* Hero Section */}
                <section className="max-w-4xl mx-auto px-4 sm:px-6 py-12 sm:py-16">
                    <div className="text-center mb-8 sm:mb-12">
                        <Link href="/" className="flex items-center justify-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors mb-6">
                            <ArrowLeft className="w-5 h-5" />
                            <span className="text-sm font-serif">Retour à l'accueil</span>
                        </Link>

                        <div className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-6 lg:space-x-8">
                            <img
                                src="https://z-cdn-media.chatglm.cn/files/68e00202-7aa7-4b85-a148-a40fdb4ac3f7_logo.png?auth_key=1791497410-4f07e789ecd94c959d996139b8c142b3-0-310a7d57abdef550ba4f1b3ace27306a"
                                alt="Logo ETU - École Transcendantaliste Universelle"
                                className="w-24 h-24 sm:w-32 sm:h-32 lg:w-40 lg:h-40"
                            />
                            <div className="text-center sm:text-left space-y-1 sm:space-y-2">
                                <h1 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-serif text-gray-900 leading-tight">
                                    École Transcendantaliste Universelle
                                </h1>
                                <p className="text-sm sm:text-base md:text-lg lg:text-xl font-serif text-gray-600 uppercase tracking-wider">
                                    Ordre des Marins Pêcheurs
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="border-t border-gray-200 pt-12"></div>

                    <div className="text-center space-y-4 sm:space-y-6">
                        <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-serif text-gray-900 tracking-wide leading-tight">
                            Foire Aux Questions
                        </h2>
                        <p className="text-base sm:text-lg md:text-xl text-gray-500 leading-relaxed max-w-3xl mx-auto font-serif px-4">
                            Cette FAQ est conçue pour répondre à toutes vos interrogations et vous accompagner dans votre décision de rejoindre l'École Transcendantaliste Universelle (ETU) Bénin pour une transformation profonde.
                        </p>
                    </div>
                </section>

                {/* FAQ Sections */}
                <main className="max-w-4xl mx-auto px-4 sm:px-6 pb-16">
                    {faqData.map((section, sectionIndex) => (
                        <section key={sectionIndex} className="mb-8">
                            <div className="border border-gray-200 rounded-lg overflow-hidden">
                                <div className="bg-gray-50 px-4 sm:px-6 py-4 border-b border-gray-200">
                                    <h3 className="text-lg sm:text-xl md:text-2xl font-serif text-gray-900">{section.title}</h3>
                                    <p className="text-sm sm:text-base md:text-lg font-serif text-gray-600 mt-1">{section.subtitle}</p>
                                </div>

                                <div className="divide-y divide-gray-200">
                                    {section.items.map((item, itemIndex) => {
                                        const isOpen = openItems[`${sectionIndex}-${itemIndex}`]
                                        return (
                                            <div key={itemIndex}>
                                                <button
                                                    onClick={() => toggleItem(sectionIndex, itemIndex)}
                                                    className="w-full px-4 sm:px-6 py-4 sm:py-6 text-left flex items-center justify-between hover:bg-gray-50 transition-colors"
                                                >
                                                    <span className="text-base sm:text-lg font-serif text-gray-900 pr-4 leading-relaxed">{item.question}</span>
                                                    {isOpen ? (
                                                        <ChevronUp className="w-5 h-5 text-gray-500 flex-shrink-0" />
                                                    ) : (
                                                        <ChevronDown className="w-5 h-5 text-gray-500 flex-shrink-0" />
                                                    )}
                                                </button>

                                                {isOpen && (
                                                    <div className="px-4 sm:px-6 pb-4 sm:pb-6">
                                                        <div className="text-base sm:text-lg text-gray-700 leading-relaxed font-serif">
                                                            {item.answer.split('\n').map((paragraph, pIndex) => (
                                                                <p key={pIndex} className="mb-3">
                                                                    {paragraph.startsWith('•') ? (
                                                                        <span className="flex items-start">
                                                                            <span className="text-gray-600 mr-3 text-xl">•</span>
                                                                            <span>{paragraph.substring(1).trim()}</span>
                                                                        </span>
                                                                    ) : paragraph.match(/^\d+\./) ? (
                                                                        <span className="flex items-start">
                                                                            <span className="text-gray-600 mr-3 font-semibold text-lg">{paragraph.split('.')[0]}.</span>
                                                                            <span>{paragraph.split('.').slice(1).join('.').trim()}</span>
                                                                        </span>
                                                                    ) : (
                                                                        paragraph
                                                                    )}
                                                                </p>
                                                            ))}
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        )
                                    })}
                                </div>
                            </div>
                        </section>
                    ))}

                    {/* Appel à l'action après les questions */}
                    <div className="mt-8 sm:mt-12 bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-200 rounded-xl p-6 sm:p-8 text-center">
                        <h3 className="text-xl sm:text-2xl font-serif text-gray-900 mb-3 sm:mb-4">
                            Avez-vous d'autres questions ?
                        </h3>
                        <p className="text-base sm:text-lg text-gray-700 mb-4 sm:mb-6 font-serif">
                            Nous serons ravis d'y répondre ! Écrivez-nous à ce numéro WhatsApp :
                        </p>
                        <a
                            href="https://wa.me/22967153974"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center space-x-2 sm:space-x-3 bg-gray-800 hover:bg-gray-900 text-white px-6 sm:px-8 py-3 sm:py-4 rounded-lg transition-colors text-base sm:text-lg font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-1"
                        >
                            <MessageCircle className="w-5 h-5 sm:w-6 sm:h-6" />
                            <span>+229 67 15 39 74</span>
                        </a>
                    </div>
                </main>

                {/* CTA Section */}
                <section className="bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 py-16 sm:py-20">
                    <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center">
                        <h2 className="text-3xl sm:text-4xl lg:text-5xl font-serif text-gray-900 mb-6 sm:mb-8">
                            Prêt(e) à commencer votre élévation spirituelle ?
                        </h2>
                        <p className="text-lg sm:text-xl text-gray-600 mb-10 sm:mb-12 font-serif max-w-2xl mx-auto">
                            Rejoignez notre communauté pour commencer votre transformation intérieure
                        </p>

                        <div className="flex justify-center mb-12 sm:mb-16">
                            <Link
                                href="/inscription"
                                className="group relative inline-flex items-center justify-center px-8 sm:px-12 py-4 sm:py-6 text-lg sm:text-xl font-semibold text-white bg-gray-800 hover:bg-gray-900 border border-gray-700 rounded-2xl shadow-2xl hover:shadow-3xl transition-all duration-300 transform hover:-translate-y-2 hover:scale-105"
                            >
                                <User className="w-6 h-6 sm:w-7 sm:h-7 mr-3" />
                                <span>S'inscrire maintenant</span>
                            </Link>
                        </div>

                        {/* Section réseaux sociaux */}
                        <div className="border-t border-gray-200/50 pt-8 sm:pt-12">
                            <p className="text-sm sm:text-base text-gray-500 mb-6 font-serif">
                                Suivez-nous sur nos réseaux
                            </p>
                            <div className="flex justify-center space-x-6">
                                <a
                                    href="https://wa.me/22967153974"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center justify-center w-12 h-12 sm:w-14 sm:h-14 bg-gray-800 hover:bg-gray-900 text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
                                    title="Rejoindre notre WhatsApp"
                                >
                                    <MessageCircle className="w-6 h-6 sm:w-7 sm:h-7" />
                                </a>

                                <a
                                    href="https://www.facebook.com/profile.php?id=61570538836966"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center justify-center w-12 h-12 sm:w-14 sm:h-14 bg-gray-700 hover:bg-gray-800 text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
                                    title="Suivre sur Facebook"
                                >
                                    <Facebook className="w-6 h-6 sm:w-7 sm:h-7" />
                                </a>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Footer */}
                <footer className="bg-white border-t border-gray-200 py-8 sm:py-12">
                    <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center">
                        <p className="text-gray-600 text-base sm:text-lg mb-2 sm:mb-3 font-serif">
                            École Transcendantaliste Universelle - Depuis 1977
                        </p>
                        <p className="text-gray-500 text-sm sm:text-base font-serif">
                            © 2024 ETU Bénin. Tous droits réservés.
                        </p>
                    </div>
                </footer>
            </div>
        </ClientOnly>
    )
}
