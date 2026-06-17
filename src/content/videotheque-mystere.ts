/** Contenu éditorial ; Hippolite Fatoumbi / Au cœur du mystère (vidéothèque). */

export type MystereVideo = {
  youtubeId: string
  title: string
  meta?: string
  resume: string
}

export const MYSTERE_MAIN_VIDEOS: MystereVideo[] = [
  {
    youtubeId: '0wldC4bm2Gk',
    title: 'La vérité cachée sur les anges',
    resume:
      "Un ange n'est qu'un rayon de la divinité ; un attribut, une énergie divine. La terre est gouvernée par les anges de Mercure, ceux qui nous instruisent pour que la loi ne soit plus gravée sur la pierre mais dans nos cœurs. Il y a trois types d'anges liés à chaque être humain : l'ange physique (santé, bien-être corporel), l'ange émotionnel (émotions, peurs, amour) et l'ange mental (inspirations lumineuses, idées). Ils agissent principalement sur le plan émotionnel. Le péché n'est rien d'autre que la recherche du bonheur par des voies d'erreur. Les anges de l'ombre sont attirés par la paresse et l'inactivité.",
  },
  {
    youtubeId: 't9eIinp4ImU',
    title: "Créer l'amour, le seul héritage de l'homme sur terre",
    resume:
      "L'unique but de la vie est d'apprendre à aimer. Le sacrifice est à la base de tout progrès spirituel ; donner aux autres crée de la lumière à son propre actif. Le Christ, en répandant son sang sur la terre, a permis aux forces lucifériennes qui gouvernaient ce monde de perdre leur pouvoir. Quand on partage sa lumière, on est protégé. L'être humain qui ne reçoit pas d'énergie divine sombre dans la destruction. La souffrance est le prix de la libération de l'âme, mais l'amour permet de transcender le temps et de réduire le temps d'évolution.",
  },
  {
    youtubeId: 'gHTTLQUUA2U',
    title: "Au cœur du mystère ; Corruption de l'âme",
    resume:
      "Explication des mécanismes de corruption de l'âme : le manque de connaissance, l'attachement aux plaisirs temporaires, le refus du sacrifice. Comment les épreuves de la vie peuvent soit détruire soit purifier l'âme selon notre réponse. La nécessité de marcher consciemment vers la lumière pour éviter la corruption.",
  },
  {
    youtubeId: 'dflGKjwWVWQ',
    title: 'La vie ; un voyage effrayant mais nécessaire',
    meta: 'BENIN TV ; 9 mai 2024 ; 52 min',
    resume:
      "Nous venons d'un monde de lumière et atterrissons dans un monde de ténèbres (1 % de la réalité divine). La vie est un voyage en barque (symbole du Kebath : Ka = âme, Bath = barque). Le péché = quête du bonheur par des voies d'erreur. La réincarnation permet de rectifier ce qui a été dénaturé par notre désir d'élévation. Chaque âme fait un contrat avant de venir sur terre avec d'autres âmes qui joueront un rôle précis dans son évolution. Trois états dangereux : les âmes errantes, la luxure, la cupidité. Le Christ est venu porter la lumière à un monde immergé dans les ténèbres.",
  },
  {
    youtubeId: 'Bz5CkZ4DVO8',
    title: 'La bonne question',
    meta: 'BENIN TV ; 12K vues',
    resume:
      "L'importance de poser les bonnes questions dans la démarche spirituelle. Trop de gens cherchent des réponses toutes faites sans d'abord se poser les vraies questions sur le sens de leur vie, leurs contrats d'âme, et leur destination spirituelle. La question juste est le point de départ de toute évolution authentique.",
  },
  {
    youtubeId: 'n03NGpVmIQc',
    title: 'Pratiques de délivrance et de voyance : avantages et inconvénients',
    meta: 'Hippolite Fatoumbi ; 29 décembre 2023 ; 49 min',
    resume:
      "La voyance révèle un cliché provisoire, pas une fatalité ; l'image vue peut être modifiée si on change son mode de fonctionnement. Consulter un voyant peut ouvrir des portes à des forces lucifériennes. L'exorcisme classique ne fait que déplacer le problème : il faut transformer (transmuter) l'énergie négative en lumière, pas la chasser. Le vrai remède : prendre sa vie en main, cultiver fidélité, loyauté et courage. Quand on aide quelqu'un sans qu'il comprenne la leçon, on hérite de son karma. Les pasteurs qui délivrent les gens sans éducation spirituelle finissent par s'effondrer car ils portent le poids karmique de leurs bénéficiaires.",
  },
  {
    youtubeId: 'Ksa67HGP578',
    title: 'Être le héros de notre vie',
    meta: 'BENIN TV ; Replay',
    resume:
      "Héros vient de H (Homme grand) + Éros (désir). Le héros est celui qui prend conscience que chaque difficulté extérieure représente un défaut intérieur à surmonter. Il ne confond pas l'ennemi extérieur avec l'ennemi intérieur. Trois outils du héros : humilité, amour en toute circonstance, et la force (volonté, émotions, raison, actions). La quête de ses droits conduit aux forces de l'ombre ; la quête de ses devoirs conduit à la lumière. L'amour vrai (agapè) ne peut s'acquérir que par le sacrifice ; aimer ceux qui nous blessent est la voie la plus rapide d'élévation.",
  },
  {
    youtubeId: 'l1ZlK5S-MZM',
    title: 'Les outils de protections spirituelles ; Guéra Shields',
    resume:
      "Présentation des différents outils et méthodes de protection spirituelle : prières, visualisations de boucliers lumineux, utilisation d'éléments naturels (sel, encens, eau bénite), méditation, et le rôle des anges gardiens. Explication de comment construire et maintenir une protection énergétique au quotidien.",
  },
  {
    youtubeId: 'luikybD3ACI',
    title: "Exposé philosophique de l'Ordre des Marins Pêcheurs",
    resume:
      "Présentation de l'École Transcendantaliste Universelle et de son ordre, l'OMP. Les fondements philosophiques reposent sur la Kabbale et l'interprétation ésotérique des textes sacrés. Le cours comprend : philosophie ésotérique (22 leçons), interprétation de l'Évangile (50 leçons), interprétation de l'Apocalypse (22 leçons), interprétation de la Genèse (50 leçons), et l'étude des noms des anges divins. L'objectif : maîtriser les lois du système solaire et accéder à un état de conscience DIVIN, qualifié d'Arbre de Vie.",
  },
]

export const MYSTERE_PLAYLISTS: { label: string; href: string }[] = [
  { label: 'Chaîne principale (YouTube)', href: 'https://www.youtube.com/c/hippolytefatoumbi' },
  { label: 'Playlist ETU', href: 'https://www.youtube.com/playlist?list=PLxAMBF7fU8soo1BMmSBCarG18XZFb-R0I' },
  { label: 'Playlist replays', href: 'https://www.youtube.com/playlist?list=PLYI_vH9CKTevNjwpNV__hZYIXsyXvmHVw' },
]

export type SupplementaryRow = {
  title: string
  url: string | null
  duration: string | null
}

export const MYSTERE_SUPPLEMENTARY_VIDEOS: SupplementaryRow[] = [
  { title: 'Les Anges ; Mythe ou réalité', url: 'https://www.youtube.com/watch?v=j9Ba5OOHdK4', duration: '47 min' },
  { title: "L'Amour, Principe Divin", url: 'https://www.youtube.com/watch?v=7X99tY55UAU', duration: '43 min' },
  { title: 'Être le héros de notre vie', url: 'https://www.youtube.com/watch?v=_v3jiQnZMZs', duration: '45 min' },
  { title: "L'essentiel de la Kabbale en 30 minutes", url: 'https://www.youtube.com/watch?v=SjNgDcjXmsw', duration: '30 min' },
  { title: "L'essentiel de la Kabbale ; version longue", url: 'https://www.youtube.com/watch?v=Ujtg0E9YqNM', duration: '56 min' },
  { title: 'Pratiques spirituelles africaines ; Lucifériennes ?', url: 'https://www.youtube.com/watch?v=7kFvxR7dmgA', duration: '45 min' },
  { title: 'Qu’est-ce que le Travail Spirituel', url: null, duration: '55 min' },
  { title: 'Sorcellerie ; Au cœur du mystère', url: 'https://www.youtube.com/watch?v=AMkb2k6MEXo', duration: '55 min' },
  { title: 'Les clés hermétiques de la vie', url: 'https://www.youtube.com/watch?v=CLe0WdVXLeI', duration: '68 min' },
  { title: 'Spiritualité et Nous ; Kabbale et société', url: 'https://www.youtube.com/watch?v=LfaqkoD17dY', duration: ';' },
  { title: 'Les deux forces qui dirigent le monde manifeste', url: 'https://www.youtube.com/watch?v=GtCXMpche6s', duration: ';' },
  { title: "4 Mondes, 5 Niveaux d'âme, 13 Attributs de Miséricorde", url: 'https://www.youtube.com/watch?v=xYXdKdJNnaA', duration: ';' },
  { title: "Alchimie Interne par les 72 Anges de la Kabbale (1/3)", url: null, duration: '29 min' },
  { title: "Alchimie Interne par les 72 Anges de la Kabbale (2/3)", url: null, duration: '29 min' },
]

export type SupplementaryResume = {
  slug: string
  title: string
  meta: string
  body: string
}

export const MYSTERE_SUPPLEMENTARY_RESUMES: SupplementaryResume[] = [
  {
    slug: 'anges-mythe',
    title: 'Les Anges ; Mythe ou réalité',
    meta: 'Émission « Au cœur du mystère » ; 26 mars 2024 ; 47 min',
    body:
      "Un ange est un être de lumière chargé d'aider et d'inspirer les êtres humains. Sans eux, aucune activité humaine n'est possible. Il existe des anges et des êtres lucifériens (anges déchus) : les anges travaillent avec le cœur, les lucifériens avec le mental. Lucifer = « porteur de lumière » ; il instruit les humains pour les aider à évoluer, mais par la voie de l'information et de la raison, pas par l'amour. La liberté est le don le plus précieux de Dieu : nous pouvons choisir à chaque instant entre la lumière et les ténèbres. Connaître ses trois anges gardiens (physique, émotionnel, mental) est fondamental pour avancer spirituellement. Le nom imprononçable de Dieu (YHWH) contient les quatre clés du fonctionnement de l'univers.",
  },
  {
    slug: 'amour-principe',
    title: "L'Amour, Principe Divin",
    meta: '20 janvier 2022 ; 43 min',
    body:
      "L'amour est un état de conscience généré par un acte de sacrifice. Sans sacrifice, il n'y a pas d'amour possible. Le sacrifice crée la joie (le gemissement de la mer précède le cri de l'enfant). L'être humain est divin en essence ; il n'a pas été « créé », il est Dieu en train de se réaliser. Le sacrifice est la clé de la recréation divine en nous. La foi sans connaissance mène à la superstition ; la connaissance sans foi mène au doute. Les deux réunis donnent la certitude. Le chemin rapide d'élévation spirituelle : aimer ceux qui nous blessent, pardonner, rendre les autres heureux.",
  },
  {
    slug: 'kabbale-30',
    title: "L'essentiel de la Kabbale en 30 minutes",
    meta: '30 décembre 2023 ; 30 min',
    body:
      "La Kabbale est la tradition initiatique de l'Occident chrétien ; le fondement même du christianisme. Toute la Bible est écrite à partir de la Kabbale. L'Arbre de Vie résume l'ensemble : dix sphères (sephiroth) qui représentent les centres d'énergie divine. De Kether (couronne) à Malkhuth (royaume), chaque sphère correspond à un aspect de la création divine. Le Tétragramme (YHWH) est la clé de toutes les sciences ésotériques : Yod = Père, Hé = Fils, Vav = Saint-Esprit, Hé final = l'Esprit d'intelligence. Ne pas prononcer le nom de Dieu mais le vivre. L'objectif de la Kabbale : éviter de s'éparpiller, comprendre le mécanisme de la création, et recréer le monde selon les principes divins.",
  },
  {
    slug: 'pratiques-africaines',
    title: 'Pratiques spirituelles africaines ; Lucifériennes ?',
    meta: '30 novembre 2020 ; 45 min',
    body:
      "Les entités lucifériennes sont des anges déchus qui ont refusé le décret divin de baisser leurs vibrations. Ils ne sont pas démoniaques ; ils portent de l'information et de la lumière, mais par le mental (pas le cœur). Lucifer = porteur de lumière, celui qui instruit par la raison et l'information. Toutes les religions et voies initiatiques mènent à Dieu. La vraie question n'est pas « pratique africaine = luciférien ? » mais « est-ce que ma pratique est dans la lumière ou dans l'ombre ? » Plus c'est facile et gratuit, plus on est dans la voie luciférienne. Plus il y a effort et sacrifice, plus on est dans la voie divine.",
  },
  {
    slug: 'cles-hermetiques',
    title: 'Les clés hermétiques de la vie',
    meta: '14 octobre 2019 ; 68 min',
    body:
      "L'être humain est fait à l'image de Dieu et doit travailler pour devenir Sa ressemblance. La liberté est le don le plus précieux. Le sacrifice est la clé de l'élévation spirituelle. Nous avons créé le diable par notre imagination collective. La Vierge Marie est une création collective qui existe réellement. Notre univers est une création de notre conscience. Le Christ est celui qui a assez d'amour pour voir le Père en toute chose. L'objectif : redevenir des dieux en devenir, contribuer à structurer le monde de Dieu.",
  },
]

export const MYSTERE_SOURCE_LINE =
  'Source : www.guerashiel.com | Hippolite Fatoumbi ; École Transcendantaliste Universelle'
