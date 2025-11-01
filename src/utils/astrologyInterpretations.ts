// Utilitaires pour les interprétations astrologiques

export function getHouseMeaning(houseStr: string): string {
  const houseMeanings: Record<string, string> = {
    'Maison 1': 'votre essence divine et votre mission d\'âme',
    'Maison 2': 'vos valeurs spirituelles et votre relation à l\'abondance',
    'Maison 3': 'votre communication sacrée et votre sagesse à partager',
    'Maison 4': 'votre temple intérieur et vos racines spirituelles',
    'Maison 5': 'votre créativité divine et votre enfant intérieur',
    'Maison 6': 'votre service spirituel et votre dévotion',
    'Maison 7': 'votre union sacrée et vos relations karmiques',
    'Maison 8': 'votre transformation spirituelle et votre renaissance',
    'Maison 9': 'votre quête de vérité et votre sagesse universelle',
    'Maison 10': 'votre mission divine et votre contribution au monde',
    'Maison 11': 'votre vision spirituelle et vos aspirations d\'âme',
    'Maison 12': 'votre connexion divine et votre dissolution de l\'ego'
  }
  return houseMeanings[houseStr] || 'votre évolution spirituelle'
}

export function getDegreeMeaning(degree: number): string {
  if (0 <= degree && degree <= 5) {
    return "Éveil spirituel - Connexion directe avec l'essence divine"
  } else if (6 <= degree && degree <= 15) {
    return "Mission d'âme - Appel à servir et guider autrui"
  } else if (16 <= degree && degree <= 25) {
    return "Maîtrise spirituelle - Intégration des enseignements divins"
  } else if (26 <= degree && degree <= 29) {
    return "Transcendance - Dissolution de l'ego et union avec le Tout"
  } else {
    return "Chemin spirituel unique - Mission d'âme particulière"
  }
}

export function getSpiritualGuidance(planetName: string, sign: string): string {
  const guidance: Record<string, Record<string, string>> = {
    'Soleil': {
      'Bélier': 'Chaque semaine, lancez un projet qui vous passionne vraiment. Méditez 10 minutes par jour sur vos objectifs. Car votre mission spirituelle est : ÊTRE LE PREMIER À AGIR.',
      'Taureau': 'Créez un jardin ou un espace de beauté chez vous. Pratiquez la gratitude quotidienne. Car votre mission spirituelle est : APPORTER STABILITÉ AUX AUTRES.',
      'Gémeaux': 'Écrivez un article ou créez un podcast sur votre passion. Communiquez vos idées régulièrement. Car votre mission spirituelle est : PARTAGER VOTRE SAVOIR.',
      'Cancer': 'Organisez un repas en famille cette semaine. Créez un rituel de protection quotidien. Car votre mission spirituelle est : NOURRIR ET PROTÉGER.',
      'Lion': 'Exprimez votre créativité (art, théâtre, musique). Organisez un événement inspirant. Car votre mission spirituelle est : INSPIRER ET GUIDER.',
      'Vierge': 'Évitez le désordre dans votre espace de vie. Chaque semaine, aidez concrètement quelqu\'un. Car votre mission spirituelle est : SERVIR ET AMÉLIORER.',
      'Balance': 'Méditez sur l\'équilibre dans vos relations. Créez de l\'harmonie autour de vous. Car votre mission spirituelle est : UNIR ET RÉCONCILIER.',
      'Scorpion': 'Laissez partir une habitude toxique. Transformez une situation difficile. Car votre mission spirituelle est : TRANSFORMER ET GUÉRIR.',
      'Sagittaire': 'Planifiez un voyage ou une formation. Étudiez une philosophie qui vous inspire. Car votre mission spirituelle est : EXPLORER ET ENSEIGNER.',
      'Capricorne': 'Fixez-vous un objectif à long terme. Structurez votre routine quotidienne. Car votre mission spirituelle est : CONSTRUIRE ET DIRIGER.',
      'Verseau': 'Rejoignez un groupe qui partage vos valeurs. Innovez dans votre domaine. Car votre mission spirituelle est : RÉVOLUTIONNER ET LIBÉRER.',
      'Poissons': 'Méditez 20 minutes par jour. Aidez une cause humanitaire. Car votre mission spirituelle est : GUÉRIR ET UNIR.'
    },
    'Lune': {
      'Bélier': 'Canalisez votre colère par le sport. Prenez des décisions rapides chaque jour. Car votre besoin émotionnel est : AGIR IMMÉDIATEMENT.',
      'Taureau': 'Créez un rituel de bien-être quotidien. Mangez en pleine conscience. Car votre besoin émotionnel est : SÉCURITÉ ET CONFORT.',
      'Gémeaux': 'Tenez un journal de vos rêves. Lisez 30 minutes par jour. Car votre besoin émotionnel est : STIMULATION MENTALE.',
      'Cancer': 'Créez un sanctuaire chez vous. Cuisinez pour vos proches régulièrement. Car votre besoin émotionnel est : SÉCURITÉ ÉMOTIONNELLE.',
      'Lion': 'Exprimez vos émotions par l\'art. Recevez des compliments sincères. Car votre besoin émotionnel est : RECONNAISSANCE.',
      'Vierge': 'Organisez votre environnement quotidien. Aidez quelqu\'un pratiquement. Car votre besoin émotionnel est : ÊTRE UTILE.',
      'Balance': 'Méditez sur l\'équilibre émotionnel. Passez du temps avec vos proches. Car votre besoin émotionnel est : HARMONIE RELATIONNELLE.',
      'Scorpion': 'Explorez vos émotions profondes. Transformez une peur en force. Car votre besoin émotionnel est : INTENSITÉ ÉMOTIONNELLE.',
      'Sagittaire': 'Voyagez ou étudiez quelque chose de nouveau. Partagez vos expériences. Car votre besoin émotionnel est : EXPANSION.',
      'Capricorne': 'Structurez vos émotions quotidiennement. Travaillez sur vos objectifs. Car votre besoin émotionnel est : CONTRÔLE ET DISCIPLINE.',
      'Verseau': 'Rejoignez un groupe d\'intérêt. Libérez-vous des attentes. Car votre besoin émotionnel est : LIBERTÉ ÉMOTIONNELLE.',
      'Poissons': 'Méditez sur l\'amour universel. Aidez quelqu\'un dans le besoin. Car votre besoin émotionnel est : CONNEXION SPIRITUELLE.'
    },
    'Jupiter': {
      'Bélier': 'Votre domaine de croissance spirituelle : développer votre courage et votre leadership. Votre optimisme spirituel : être le premier à agir pour le bien commun.',
      'Taureau': 'Votre domaine de croissance spirituelle : créer de la beauté et de la stabilité. Votre optimisme spirituel : apporter la sécurité et l\'abondance aux autres.',
      'Gémeaux': 'Votre domaine de croissance spirituelle : partager votre savoir et connecter les gens. Votre optimisme spirituel : être le pont entre différents mondes.',
      'Cancer': 'Votre domaine de croissance spirituelle : développer votre intuition et protéger les autres. Votre optimisme spirituel : créer un foyer spirituel pour tous.',
      'Lion': 'Votre domaine de croissance spirituelle : exprimer votre créativité divine. Votre optimisme spirituel : illuminer et inspirer par votre exemple.',
      'Vierge': 'Votre domaine de croissance spirituelle : servir et améliorer le monde. Votre optimisme spirituel : perfectionner et apporter l\'ordre divin.',
      'Balance': 'Votre domaine de croissance spirituelle : créer l\'harmonie et l\'équilibre. Votre optimisme spirituel : unir les gens dans la beauté et la justice.',
      'Scorpion': 'Votre domaine de croissance spirituelle : transformer et guérir profondément. Votre optimisme spirituel : révéler la vérité et la renaissance.',
      'Sagittaire': 'Votre domaine de croissance spirituelle : explorer et enseigner la sagesse. Votre optimisme spirituel : élargir les horizons et chercher la vérité.',
      'Capricorne': 'Votre domaine de croissance spirituelle : construire et diriger avec sagesse. Votre optimisme spirituel : créer des institutions durables et justes.',
      'Verseau': 'Votre domaine de croissance spirituelle : révolutionner et libérer l\'humanité. Votre optimisme spirituel : apporter l\'innovation et servir l\'humanité.',
      'Poissons': 'Votre domaine de croissance spirituelle : guérir et unir dans l\'amour universel. Votre optimisme spirituel : dissoudre les frontières et ressentir l\'unité.'
    }
  }
  
  return guidance[planetName]?.[sign] || 'Écoutez votre intuition et agissez selon vos valeurs. Car votre mission spirituelle est : SUIVRE VOTRE VOIE INTÉRIEURE.'
}

export function getPersonalityAnalysis(planetName: string, sign: string): string {
  // Normaliser les noms de planètes
  const normalizedPlanetName = planetName.toLowerCase()
  let planetKey = planetName
  
  if (normalizedPlanetName === 'sun' || normalizedPlanetName === 'soleil') {
    planetKey = 'Soleil'
  } else if (normalizedPlanetName === 'moon' || normalizedPlanetName === 'lune') {
    planetKey = 'Lune'
  } else if (normalizedPlanetName === 'jupiter') {
    planetKey = 'Jupiter'
  } else if (normalizedPlanetName === 'ascendant') {
    planetKey = 'Ascendant'
  } else if (normalizedPlanetName === 'saturn' || normalizedPlanetName === 'saturne') {
    planetKey = 'Saturne'
  } else if (normalizedPlanetName === 'mars') {
    planetKey = 'Mars'
  }
  
  const analysis: Record<string, Record<string, string>> = {
    'Soleil': {
      'Bélier': 'Vous vous présentez au monde comme un leader naturel, énergique et direct. Votre identité profonde : être le premier à agir, prendre des initiatives, et inspirer les autres par votre courage.',
      'Taureau': 'Vous vous présentez au monde comme une personne stable, fiable et sensuelle. Votre identité profonde : créer de la beauté, apporter la sécurité, et construire des fondations solides.',
      'Gémeaux': 'Vous vous présentez au monde comme quelqu\'un de curieux, communicatif et adaptable. Votre identité profonde : connecter les gens, partager des idées, et être le pont entre différents mondes.',
      'Cancer': 'Vous vous présentez au monde comme une personne protectrice, intuitive et émotionnelle. Votre identité profonde : nourrir et protéger, créer un foyer, et être le refuge des autres.',
      'Lion': 'Vous vous présentez au monde comme quelqu\'un de créatif, généreux et charismatique. Votre identité profonde : illuminer les autres, exprimer votre créativité, et être le centre de l\'attention.',
      'Vierge': 'Vous vous présentez au monde comme une personne méthodique, serviable et perfectionniste. Votre identité profonde : améliorer et perfectionner, servir les autres, et apporter l\'ordre.',
      'Balance': 'Vous vous présentez au monde comme quelqu\'un de diplomatique, élégant et harmonieux. Votre identité profonde : créer l\'équilibre, unir les gens, et apporter la beauté dans les relations.',
      'Scorpion': 'Vous vous présentez au monde comme une personne intense, mystérieuse et transformatrice. Votre identité profonde : transformer et guérir, aller au fond des choses, et révéler la vérité.',
      'Sagittaire': 'Vous vous présentez au monde comme quelqu\'un d\'optimiste, aventureux et philosophe. Votre identité profonde : explorer et enseigner, chercher la vérité, et élargir les horizons.',
      'Capricorne': 'Vous vous présentez au monde comme une personne ambitieuse, responsable et structurée. Votre identité profonde : construire et diriger, atteindre les sommets, et créer des institutions durables.',
      'Verseau': 'Vous vous présentez au monde comme quelqu\'un d\'original, indépendant et visionnaire. Votre identité profonde : révolutionner et libérer, apporter l\'innovation, et servir l\'humanité.',
      'Poissons': 'Vous vous présentez au monde comme une personne intuitive, empathique et spirituelle. Votre identité profonde : guérir et unir, ressentir profondément, et dissoudre les frontières.'
    },
    'Lune': {
      'Bélier': 'Vos émotions sont spontanées et directes. Vous réagissez immédiatement aux situations. Votre besoin émotionnel : agir rapidement, être le premier, et canaliser votre colère par l\'action.',
      'Taureau': 'Vos émotions sont stables et profondes. Vous avez besoin de sécurité et de confort. Votre besoin émotionnel : créer un environnement paisible, manger en pleine conscience, et vous entourer de beauté.',
      'Gémeaux': 'Vos émotions sont changeantes et intellectuelles. Vous avez besoin de stimulation mentale. Votre besoin émotionnel : communiquer vos sentiments, lire et apprendre, et partager vos expériences.',
      'Cancer': 'Vos émotions sont profondes et protectrices. Vous avez besoin de sécurité émotionnelle. Votre besoin émotionnel : créer un sanctuaire chez vous, cuisiner pour vos proches, et protéger ceux que vous aimez.',
      'Lion': 'Vos émotions sont dramatiques et expressives. Vous avez besoin de reconnaissance. Votre besoin émotionnel : être applaudi, recevoir des compliments, et exprimer vos émotions par l\'art.',
      'Vierge': 'Vos émotions sont analytiques et perfectionnistes. Vous avez besoin d\'être utile. Votre besoin émotionnel : organiser votre environnement, aider concrètement, et améliorer les situations.',
      'Balance': 'Vos émotions sont harmonieuses et relationnelles. Vous avez besoin d\'équilibre. Votre besoin émotionnel : créer l\'harmonie, passer du temps avec vos proches, et éviter les conflits.',
      'Scorpion': 'Vos émotions sont intenses et transformatrices. Vous avez besoin d\'intimité. Votre besoin émotionnel : explorer vos émotions profondes, transformer vos peurs, et créer des liens authentiques.',
      'Sagittaire': 'Vos émotions sont optimistes et expansives. Vous avez besoin de liberté. Votre besoin émotionnel : voyager, apprendre de nouvelles choses, et partager vos expériences.',
      'Capricorne': 'Vos émotions sont contrôlées et structurées. Vous avez besoin de discipline. Votre besoin émotionnel : structurer vos émotions, travailler sur vos objectifs, et maintenir votre réputation.',
      'Verseau': 'Vos émotions sont détachées et originales. Vous avez besoin de liberté. Votre besoin émotionnel : rejoindre des groupes, libérer vos émotions, et être authentique.',
      'Poissons': 'Vos émotions sont intuitives et empathiques. Vous avez besoin de connexion spirituelle. Votre besoin émotionnel : méditer, aider les autres, et ressentir l\'amour universel.'
    },
    'Jupiter': {
      'Bélier': 'Vos talents naturels : leadership, prise d\'initiative, motivation des autres. Votre domaine d\'excellence : être le premier, lancer des projets, et inspirer par l\'action.',
      'Taureau': 'Vos talents naturels : création de beauté, construction de sécurité, développement de ressources. Votre domaine d\'excellence : créer de la valeur, apporter la stabilité, et développer l\'abondance.',
      'Gémeaux': 'Vos talents naturels : communication, apprentissage, connexion des idées. Votre domaine d\'excellence : enseigner, écrire, et créer des liens entre les gens.',
      'Cancer': 'Vos talents naturels : protection, intuition, création de foyer. Votre domaine d\'excellence : nourrir les autres, créer un environnement sécurisant, et développer l\'intuition.',
      'Lion': 'Vos talents naturels : créativité, leadership, générosité. Votre domaine d\'excellence : exprimer votre créativité, diriger des projets, et inspirer par votre exemple.',
      'Vierge': 'Vos talents naturels : analyse, service, perfectionnement. Votre domaine d\'excellence : améliorer les processus, servir les autres, et créer l\'ordre.',
      'Balance': 'Vos talents naturels : diplomatie, création d\'harmonie, justice. Votre domaine d\'excellence : résoudre les conflits, créer de la beauté, et unir les gens.',
      'Scorpion': 'Vos talents naturels : transformation, guérison, recherche de vérité. Votre domaine d\'excellence : transformer les situations, guérir les blessures, et révéler les secrets.',
      'Sagittaire': 'Vos talents naturels : exploration, enseignement, philosophie. Votre domaine d\'excellence : voyager, enseigner, et élargir les horizons.',
      'Capricorne': 'Vos talents naturels : construction, leadership, discipline. Votre domaine d\'excellence : construire des institutions, diriger des équipes, et atteindre des sommets.',
      'Verseau': 'Vos talents naturels : innovation, humanitarisme, originalité. Votre domaine d\'excellence : révolutionner les systèmes, servir l\'humanité, et apporter l\'innovation.',
      'Poissons': 'Vos talents naturels : intuition, guérison, compassion. Votre domaine d\'excellence : guérir les autres, développer la spiritualité, et ressentir l\'amour universel.'
    },
    'Ascendant': {
      'Bélier': 'Vous donnez l\'impression d\'être énergique, courageux et direct. Les autres vous voient comme un leader naturel qui n\'a pas peur de prendre des initiatives.',
      'Taureau': 'Vous donnez l\'impression d\'être stable, fiable et sensuel. Les autres vous voient comme quelqu\'un de terre-à-terre et de confiance.',
      'Gémeaux': 'Vous donnez l\'impression d\'être curieux, communicatif et adaptable. Les autres vous voient comme quelqu\'un d\'intelligent et de sociable.',
      'Cancer': 'Vous donnez l\'impression d\'être protecteur, intuitif et émotionnel. Les autres vous voient comme quelqu\'un de maternel et de sensible.',
      'Lion': 'Vous donnez l\'impression d\'être créatif, généreux et charismatique. Les autres vous voient comme quelqu\'un de confiant et d\'inspirant.',
      'Vierge': 'Vous donnez l\'impression d\'être méthodique, serviable et perfectionniste. Les autres vous voient comme quelqu\'un de fiable et de dévoué.',
      'Balance': 'Vous donnez l\'impression d\'être diplomatique, élégant et harmonieux. Les autres vous voient comme quelqu\'un de charmant et d\'équilibré.',
      'Scorpion': 'Vous donnez l\'impression d\'être intense, mystérieux et magnétique. Les autres vous voient comme quelqu\'un de profond et d\'intriguant.',
      'Sagittaire': 'Vous donnez l\'impression d\'être optimiste, aventureux et philosophe. Les autres vous voient comme quelqu\'un d\'enthousiaste et de sage.',
      'Capricorne': 'Vous donnez l\'impression d\'être ambitieux, responsable et sérieux. Les autres vous voient comme quelqu\'un de mature et de digne de confiance.',
      'Verseau': 'Vous donnez l\'impression d\'être original, indépendant et visionnaire. Les autres vous voient comme quelqu\'un d\'unique et d\'innovant.',
      'Poissons': 'Vous donnez l\'impression d\'être intuitif, empathique et spirituel. Les autres vous voient comme quelqu\'un de mystique et de compatissant.'
    },
    'Saturne': {
      'Bélier': 'Vos défis : canaliser votre impatience, apprendre la patience, et diriger sans dominer. Votre leçon : développer la discipline dans l\'action et la maîtrise de soi.',
      'Taureau': 'Vos défis : éviter la rigidité, accepter le changement, et partager vos ressources. Votre leçon : développer la flexibilité et apprendre à lâcher prise.',
      'Gémeaux': 'Vos défis : approfondir vos connaissances, éviter la superficialité, et vous concentrer. Votre leçon : développer la profondeur et la persévérance dans l\'apprentissage.',
      'Cancer': 'Vos défis : gérer vos émotions, éviter la dépendance, et créer des limites. Votre leçon : développer l\'indépendance émotionnelle et la maturité.',
      'Lion': 'Vos défis : partager la scène, éviter l\'ego, et accepter la critique. Votre leçon : développer l\'humilité et apprendre à servir les autres.',
      'Vierge': 'Vos défis : éviter le perfectionnisme, accepter l\'imperfection, et déléguer. Votre leçon : développer la tolérance et apprendre à faire confiance.',
      'Balance': 'Vos défis : prendre des décisions, éviter l\'indécision, et affirmer vos besoins. Votre leçon : développer la fermeté et apprendre à dire non.',
      'Scorpion': 'Vos défis : contrôler vos obsessions, éviter la manipulation, et accepter la vulnérabilité. Votre leçon : développer la transparence et la confiance.',
      'Sagittaire': 'Vos défis : éviter l\'arrogance, accepter vos limites, et approfondir vos croyances. Votre leçon : développer l\'humilité et la sagesse.',
      'Capricorne': 'Vos défis : éviter le contrôle excessif, accepter l\'aide, et développer l\'émotion. Votre leçon : développer la sensibilité et apprendre à recevoir.',
      'Verseau': 'Vos défis : éviter la rébellion excessive, accepter l\'autorité, et développer l\'engagement. Votre leçon : développer la responsabilité et l\'engagement.',
      'Poissons': 'Vos défis : éviter l\'évasion, accepter la réalité, et créer des limites. Votre leçon : développer la structure et apprendre à dire non.'
    },
    'Mars': {
      'Bélier': 'Votre énergie est explosive et directe. Vous agissez rapidement et avec courage. Votre façon de vous affirmer : être le premier, prendre des initiatives, et défendre vos droits.',
      'Taureau': 'Votre énergie est persistante et stable. Vous agissez avec détermination et patience. Votre façon de vous affirmer : construire progressivement, défendre vos valeurs, et maintenir votre position.',
      'Gémeaux': 'Votre énergie est versatile et communicative. Vous agissez par la parole et l\'intelligence. Votre façon de vous affirmer : argumenter, négocier, et utiliser votre esprit.',
      'Cancer': 'Votre énergie est protectrice et émotionnelle. Vous agissez pour défendre vos proches. Votre façon de vous affirmer : protéger, nourrir, et créer un environnement sécurisant.',
      'Lion': 'Votre énergie est créative et dramatique. Vous agissez avec passion et générosité. Votre façon de vous affirmer : exprimer votre créativité, diriger, et inspirer les autres.',
      'Vierge': 'Votre énergie est méthodique et serviable. Vous agissez avec précision et dévouement. Votre façon de vous affirmer : améliorer, servir, et créer l\'ordre.',
      'Balance': 'Votre énergie est diplomatique et harmonieuse. Vous agissez pour créer l\'équilibre. Votre façon de vous affirmer : négocier, créer l\'harmonie, et résoudre les conflits.',
      'Scorpion': 'Votre énergie est intense et transformatrice. Vous agissez avec détermination et passion. Votre façon de vous affirmer : transformer, guérir, et défendre vos convictions.',
      'Sagittaire': 'Votre énergie est expansive et optimiste. Vous agissez avec enthousiasme et aventure. Votre façon de vous affirmer : explorer, enseigner, et défendre vos croyances.',
      'Capricorne': 'Votre énergie est disciplinée et ambitieuse. Vous agissez avec stratégie et persévérance. Votre façon de vous affirmer : construire, diriger, et atteindre vos objectifs.',
      'Verseau': 'Votre énergie est originale et indépendante. Vous agissez pour défendre vos valeurs. Votre façon de vous affirmer : innover, révolutionner, et défendre la liberté.',
      'Poissons': 'Votre énergie est intuitive et empathique. Vous agissez avec compassion et sensibilité. Votre façon de vous affirmer : guérir, aider, et ressentir profondément.'
    }
  }
  
  return analysis[planetKey]?.[sign] || 'Analyse de personnalité en cours de développement.'
}

export function getProgressGuidance(planetName: string, sign: string, actionType: 'immediate' | '30days'): string {
  const progressGuidance: Record<string, Record<string, Record<string, string>>> = {
    'Soleil': {
      'Bélier': {
        'immediate': 'Lancez un projet qui vous passionne cette semaine. Prenez une initiative concrète dans votre domaine.',
        '30days': 'Développez votre leadership naturel. Organisez un événement ou dirigez une équipe pour exprimer votre essence.'
      },
      'Taureau': {
        'immediate': 'Créez un espace de beauté chez vous. Commencez un projet artistique ou jardinage.',
        '30days': 'Construisez quelque chose de durable. Lancez un projet à long terme qui apporte stabilité et beauté.'
      },
      'Gémeaux': {
        'immediate': 'Écrivez un article ou créez du contenu sur votre passion. Communiquez vos idées.',
        '30days': 'Développez votre réseau de contacts. Organisez des rencontres pour connecter les gens.'
      },
      'Cancer': {
        'immediate': 'Organisez un repas en famille. Créez un rituel de protection quotidien.',
        '30days': 'Développez votre intuition. Créez un sanctuaire spirituel chez vous.'
      },
      'Lion': {
        'immediate': 'Exprimez votre créativité (art, théâtre, musique). Organisez un événement inspirant.',
        '30days': 'Développez votre charisme. Lancez un projet qui illumine et inspire les autres.'
      },
      'Vierge': {
        'immediate': 'Aidez concrètement quelqu\'un cette semaine. Organisez votre espace de vie.',
        '30days': 'Développez vos compétences de service. Créez un système d\'organisation efficace.'
      },
      'Balance': {
        'immediate': 'Méditez sur l\'équilibre dans vos relations. Créez de l\'harmonie autour de vous.',
        '30days': 'Développez vos talents diplomatiques. Résolvez un conflit ou unissez des personnes.'
      },
      'Scorpion': {
        'immediate': 'Laissez partir une habitude toxique. Transformez une situation difficile.',
        '30days': 'Développez votre pouvoir de transformation. Guérissez une blessure profonde.'
      },
      'Sagittaire': {
        'immediate': 'Planifiez un voyage ou une formation. Étudiez une philosophie qui vous inspire.',
        '30days': 'Développez votre sagesse. Enseignez ou partagez vos connaissances avec d\'autres.'
      },
      'Capricorne': {
        'immediate': 'Fixez-vous un objectif à long terme. Structurez votre routine quotidienne.',
        '30days': 'Développez votre autorité naturelle. Construisez quelque chose d\'important et durable.'
      },
      'Verseau': {
        'immediate': 'Rejoignez un groupe qui partage vos valeurs. Innovez dans votre domaine.',
        '30days': 'Développez votre vision humanitaire. Lancez un projet qui révolutionne ou libère.'
      },
      'Poissons': {
        'immediate': 'Méditez 20 minutes par jour. Aidez une cause humanitaire.',
        '30days': 'Développez votre connexion spirituelle. Créez un projet de guérison ou d\'unité.'
      }
    },
    'Lune': {
      'Bélier': {
        'immediate': 'Canalisez votre colère par le sport. Prenez une décision rapide aujourd\'hui.',
        '30days': 'Développez votre spontanéité. Créez un rituel d\'action quotidien.'
      },
      'Taureau': {
        'immediate': 'Créez un rituel de bien-être quotidien. Mangez en pleine conscience.',
        '30days': 'Développez votre sens de la beauté. Créez un environnement paisible et sensuel.'
      },
      'Gémeaux': {
        'immediate': 'Tenez un journal de vos rêves. Lisez 30 minutes par jour.',
        '30days': 'Développez votre communication émotionnelle. Partagez vos expériences avec d\'autres.'
      },
      'Cancer': {
        'immediate': 'Créez un sanctuaire chez vous. Cuisinez pour vos proches.',
        '30days': 'Développez votre intuition. Créez un foyer émotionnel sécurisant.'
      },
      'Lion': {
        'immediate': 'Exprimez vos émotions par l\'art. Recevez des compliments sincères.',
        '30days': 'Développez votre créativité émotionnelle. Créez quelque chose de beau et inspirant.'
      },
      'Vierge': {
        'immediate': 'Organisez votre environnement. Aidez quelqu\'un pratiquement.',
        '30days': 'Développez votre sens du service. Créez un système de bien-être pour vous et les autres.'
      },
      'Balance': {
        'immediate': 'Méditez sur l\'équilibre émotionnel. Passez du temps avec vos proches.',
        '30days': 'Développez votre harmonie intérieure. Créez des relations équilibrées et belles.'
      },
      'Scorpion': {
        'immediate': 'Explorez vos émotions profondes. Transformez une peur en force.',
        '30days': 'Développez votre intensité émotionnelle. Créez des liens authentiques et profonds.'
      },
      'Sagittaire': {
        'immediate': 'Voyagez ou étudiez quelque chose de nouveau. Partagez vos expériences.',
        '30days': 'Développez votre optimisme. Créez une vision d\'avenir inspirante.'
      },
      'Capricorne': {
        'immediate': 'Structurez vos émotions. Travaillez sur vos objectifs.',
        '30days': 'Développez votre discipline émotionnelle. Créez une fondation solide pour vos rêves.'
      },
      'Verseau': {
        'immediate': 'Rejoignez un groupe d\'intérêt. Libérez-vous des attentes.',
        '30days': 'Développez votre authenticité. Créez des connexions libres et originales.'
      },
      'Poissons': {
        'immediate': 'Méditez sur l\'amour universel. Aidez quelqu\'un dans le besoin.',
        '30days': 'Développez votre compassion. Créez un projet de guérison ou d\'unité.'
      }
    },
    'Jupiter': {
      'Bélier': {
        'immediate': 'Identifiez 3 domaines où vous pouvez être le premier. Lancez une initiative.',
        '30days': 'Développez votre leadership. Créez un projet qui inspire et motive les autres.'
      },
      'Taureau': {
        'immediate': 'Identifiez 3 domaines où vous pouvez créer de la beauté. Commencez un projet artistique.',
        '30days': 'Développez vos talents créatifs. Construisez quelque chose de durable et précieux.'
      },
      'Gémeaux': {
        'immediate': 'Identifiez 3 domaines où vous pouvez enseigner. Écrivez ou créez du contenu.',
        '30days': 'Développez vos talents de communication. Créez des liens entre les gens et les idées.'
      },
      'Cancer': {
        'immediate': 'Identifiez 3 domaines où vous pouvez protéger. Créez un environnement sécurisant.',
        '30days': 'Développez votre intuition. Créez un foyer spirituel pour vous et les autres.'
      },
      'Lion': {
        'immediate': 'Identifiez 3 domaines où vous pouvez exprimer votre créativité. Organisez un événement.',
        '30days': 'Développez vos talents créatifs. Créez quelque chose qui illumine et inspire.'
      },
      'Vierge': {
        'immediate': 'Identifiez 3 domaines où vous pouvez servir. Aidez concrètement quelqu\'un.',
        '30days': 'Développez vos talents d\'analyse. Créez un système qui améliore la vie des autres.'
      },
      'Balance': {
        'immediate': 'Identifiez 3 domaines où vous pouvez créer l\'harmonie. Résolvez un conflit.',
        '30days': 'Développez vos talents diplomatiques. Créez de la beauté et de la justice.'
      },
      'Scorpion': {
        'immediate': 'Identifiez 3 domaines où vous pouvez transformer. Guérissez une blessure.',
        '30days': 'Développez vos talents de guérison. Révélez la vérité et transformez les situations.'
      },
      'Sagittaire': {
        'immediate': 'Identifiez 3 domaines où vous pouvez explorer. Planifiez un voyage ou une formation.',
        '30days': 'Développez vos talents d\'enseignement. Élargissez les horizons et cherchez la vérité.'
      },
      'Capricorne': {
        'immediate': 'Identifiez 3 domaines où vous pouvez construire. Fixez-vous un objectif ambitieux.',
        '30days': 'Développez vos talents de leadership. Créez des institutions durables et justes.'
      },
      'Verseau': {
        'immediate': 'Identifiez 3 domaines où vous pouvez innover. Rejoignez un groupe progressiste.',
        '30days': 'Développez vos talents visionnaires. Révolutionnez les systèmes et servez l\'humanité.'
      },
      'Poissons': {
        'immediate': 'Identifiez 3 domaines où vous pouvez guérir. Aidez une cause humanitaire.',
        '30days': 'Développez vos talents spirituels. Créez de l\'unité et de la compassion.'
      }
    }
  }
  
  return progressGuidance[planetName]?.[sign]?.[actionType] || 'Conseil de progrès en cours de développement.'
}

// Fonction pour obtenir les symboles des planètes
export function getPlanetSymbol(planetName: string): string {
  const normalizedName = planetName.toLowerCase()
  const symbols: Record<string, string> = {
    'soleil': '☉', 'sun': '☉',
    'lune': '☽', 'moon': '☽',
    'mercure': '☿', 'mercury': '☿',
    'vénus': '♀', 'venus': '♀',
    'mars': '♂',
    'jupiter': '♃',
    'saturne': '♄', 'saturn': '♄',
    'uranus': '♅',
    'neptune': '♆',
    'pluton': '♇', 'pluto': '♇',
    'noeud nord': '☊', 'north node': '☊', 'mean_node': '☊',
    'ascendant': 'Ac',
    'descendant': 'Dc',
    'noeud sud': '☋', 'south node': '☋'
  }
  return symbols[normalizedName] || '●'
}

// Fonction pour obtenir les couleurs des planètes
export function getPlanetColor(planetName: string): string {
  const normalizedName = planetName.toLowerCase()
  const colors: Record<string, string> = {
    'soleil': 'text-orange-500', 'sun': 'text-orange-500',
    'lune': 'text-blue-500', 'moon': 'text-blue-500',
    'mercure': 'text-teal-500', 'mercury': 'text-teal-500',
    'vénus': 'text-pink-500', 'venus': 'text-pink-500',
    'mars': 'text-red-500',
    'jupiter': 'text-purple-500',
    'saturne': 'text-gray-600', 'saturn': 'text-gray-600',
    'uranus': 'text-cyan-500',
    'neptune': 'text-indigo-500',
    'pluton': 'text-red-700', 'pluto': 'text-red-700',
    'noeud nord': 'text-green-500', 'north node': 'text-green-500', 'mean_node': 'text-green-500',
    'ascendant': 'text-blue-600',
    'descendant': 'text-blue-600',
    'noeud sud': 'text-green-500', 'south node': 'text-green-500'
  }
  return colors[normalizedName] || 'text-gray-500'
}
