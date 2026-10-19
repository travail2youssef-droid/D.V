export const AGENCY_INFO = {
  name: "DigitalVerse",
  tagline: "Construisez plus qu'un site. Construisez votre avenir.",
  description: "DigitalVerse conçoit des sites web sur mesure et des solutions intelligentes pour aider les entreprises à se développer, gagner en efficacité et se démarquer.",
  badge: "AGENCE DIGITALE • WEB & IA",
  contactEmail: "contact@digitalverse.fr",
  phonePlaceholder: "+33 (0)1 80 00 00 00 (sur rendez-vous)",
  location: "Paris, France — Interventions en France & International",
};

export const SERVICES = [
  {
    id: "web-dev",
    title: "Création de sites web",
    iconName: "Code",
    description: "Des sites modernes, rapides et sur mesure, conçus pour valoriser votre entreprise et convertir vos visiteurs.",
    details: [
      "Architecture sur-mesure & design épuré",
      "Expérience mobile-first fluide",
      "Optimisation SEO & vitesse de chargement",
      "Déploiement initial clé en main"
    ],
    highlight: "Conception sur mesure"
  },
  {
    id: "ai-solutions",
    title: "Solutions IA",
    iconName: "Brain",
    description: "Des solutions intelligentes adaptées à vos besoins pour améliorer l'expérience client et optimiser vos opérations.",
    details: [
      "Agents conversationnels 24/7 sur mesure",
      "Entraînement sur vos données & FAQ",
      "Qualification automatique des prospects",
      "Intégration transparente sur votre site"
    ],
    highlight: "Technologie avancée"
  },
  {
    id: "automation",
    title: "Automatisation",
    iconName: "Zap",
    description: "Automatisez certaines tâches répétitives pour gagner du temps et améliorer votre efficacité au quotidien.",
    details: [
      "Flux multi-outils (CRM, Email, Notifs)",
      "Traitement documentaire intelligent",
      "Connexions API & webhooks fiables",
      "Gain de temps mesurable pour vos équipes"
    ],
    highlight: "Efficacité opérationnelle"
  },
  {
    id: "maintenance",
    title: "Maintenance & support",
    iconName: "ShieldCheck",
    description: "Un accompagnement technique fiable et réactif, sur le long terme pour garantir la continuité de votre activité.",
    details: [
      "Mises à jour régulières et correctifs",
      "Sauvegardes de sécurité programmées",
      "Assistance technique réactive",
      "Suivi de la disponibilité et des performances"
    ],
    highlight: "Sérénité totale"
  }
];

export const PRINCIPLES = [
  {
    id: "design",
    title: "Design soigné et professionnel",
    description: "Une esthétique épurée inspirée du luxe et de la haute technologie, pensée pour renforcer immédiatement votre crédibilité auprès de clients exigeants.",
    iconName: "Sparkles"
  },
  {
    id: "solutions",
    title: "Solutions adaptées aux besoins réels",
    description: "Aucun gadget superflu ni code inutile. Chaque brique technique ou intelligence artificielle résout un problème précis de votre entreprise.",
    iconName: "Target"
  },
  {
    id: "responsive",
    title: "Expérience fluide sur tous les appareils",
    description: "Chaque mise en page est rigoureusement testée sur smartphone, tablette et écran haute résolution pour garantir un confort visuel absolu.",
    iconName: "Smartphone"
  },
  {
    id: "transparency",
    title: "Accompagnement technique transparent",
    description: "Des tarifs forfaitaires clairs, aucun frais caché, un calendrier d'exécution défini ensemble et un interlocuteur technique dédié.",
    iconName: "Shield"
  }
];

export const PRICING_PLANS = {
  websites: [
    {
      id: "vitrine-starter",
      category: "site",
      name: "Vitrine Starter",
      price: "300 €",
      billing: "paiement unique",
      description: "Une présence professionnelle en ligne pour présenter votre activité avec élégance.",
      recommended: false,
      inclusions: [
        "Site vitrine sur-mesure (sections clés)",
        "Design personnalisé adapté à votre identité",
        "Mise en page 100% responsive (Mobile, Tablette, PC)",
        "Formulaire de contact fonctionnel",
        "Configuration SEO on-page essentielle",
        "Mise en ligne et déploiement initial"
      ],
      notice: "Hébergement, nom de domaine et maintenance continue spécifiés sur devis ou via l'offre Care.",
      ctaText: "Choisir Vitrine Starter",
      popular: false
    },
    {
      id: "vitrine-care",
      category: "maintenance",
      name: "Vitrine Care",
      price: "60 €",
      billing: "/mois",
      description: "Un suivi technique régulier pour maintenir votre site vitrine en parfait état de fonctionnement.",
      recommended: false,
      inclusions: [
        "Maintenance technique préventive",
        "Mises à jour logicielles compatibles",
        "Sauvegardes régulières programmées",
        "Correction des anomalies dans le périmètre convenu",
        "Assistance technique par email sous 48h",
        "Périmètre d'intervention clairement défini"
      ],
      notice: "Création initiale du site non incluse. Engagement sans contrainte cachée.",
      ctaText: "Choisir Vitrine Care",
      popular: false
    },
    {
      id: "business-fonctionnel",
      category: "site",
      name: "Business Fonctionnel",
      price: "600 €",
      billing: "paiement unique",
      description: "Un site plus complet avec des fonctionnalités sur mesure adaptées à votre activité.",
      recommended: true,
      badgeText: "Recommandé pour les PME",
      inclusions: [
        "Tout le périmètre du site vitrine étendu",
        "Architecture multi-pages ou sections complexes",
        "Fonctionnalités avancées convenues au devis",
        "Formulaires intelligents ou prise de RDV intégrée",
        "Phase de tests approfondis & validation UX",
        "Déploiement et accompagnement à la prise en main"
      ],
      notice: "Paiement en ligne complexe, portail client et modules IA spécifiques devisés séparément.",
      ctaText: "Choisir Business Fonctionnel",
      popular: true
    },
    {
      id: "business-care",
      category: "maintenance",
      name: "Business Care",
      price: "200 €",
      billing: "/mois",
      description: "Un accompagnement technique continu pour un site plus complet et sollicité.",
      recommended: false,
      inclusions: [
        "Maintenance proactive du site fonctionnel",
        "Assistance technique prioritaire sous 24h ouvrées",
        "Correctifs et résolution rapide de bugs",
        "Sauvegardes cloud fréquentes et contrôles de sécurité",
        "Quota mensuel d'ajustements mineurs inclus",
        "Rapport de santé trimestriel"
      ],
      notice: "Création initiale non comprise. Ajustements majeurs hors quota sur devis.",
      ctaText: "Choisir Business Care",
      popular: false
    }
  ],
  aiAgents: [
    {
      id: "agent-chatbot",
      category: "ai",
      name: "Chatbot IA Entreprise",
      price: "40 €",
      billing: "/mois",
      description: "Un agent conversationnel IA entraîné sur votre entreprise pour accueillir, guider et convertir vos visiteurs 24/7.",
      recommended: false,
      inclusions: [
        "Agent conversationnel IA configuré sur mesure",
        "Entraînement sur votre documentation, offres & FAQ",
        "Widget de chat élégant intégré à votre site web",
        "Collecte intelligente des coordonnées des prospects",
        "Mises à jour régulières de la base de connaissances",
        "Accès à l'historique des conversations"
      ],
      notice: "Consommation API opérateur standard incluse. Déploiement initial configuré par notre équipe.",
      ctaText: "Choisir Chatbot IA",
      popular: false
    },
    {
      id: "agent-automation",
      category: "ai",
      name: "Automatisations Personnalisées",
      price: "100 €",
      billing: "/mois",
      description: "Des flux d'automatisation sur mesure pour éliminer les tâches répétitives et interconnecter vos outils.",
      recommended: true,
      badgeText: "Productivité maximale",
      inclusions: [
        "Scénarios d'automatisation sur mesure (flux Make/n8n/API)",
        "Interconnexion CRM, formulaires web, emails & notifications",
        "Traitement automatique de données et qualification de leads",
        "Monitoring continu des flux et alertes de statut",
        "Ajustements mensuels et maintenance des connecteurs",
        "Support technique dédié pour vos processus"
      ],
      notice: "Licences des logiciels tiers externes (CRM, Make, etc.) à la charge du client.",
      ctaText: "Choisir Automatisations",
      popular: true
    }
  ]
};

export const PROJECTS = [
  {
    id: "velora",
    title: "Maison Vélora",
    category: "Site vitrine & e-commerce",
    type: "Concept de marque",
    description: "Une expérience digitale haut de gamme alliant sobriété architecturale, présentation raffinée de collections et parcours d'acquisition sans friction.",
    image: "/assets/project-velora.png",
    accent: "Luxe & Minimalisme",
    features: ["Catalogue sur-mesure", "Parcours client épuré", "Performances Web Vitals 98+"]
  },
  {
    id: "pulse",
    title: "Pulse",
    category: "Site corporate & IA",
    type: "Concept technologique",
    description: "Une plateforme d'entreprise d'avant-garde intégrant un assistant conversationnel pour qualifier les demandes et orienter les décideurs vers la bonne offre.",
    image: "/assets/project-pulse.png",
    accent: "Interaction IA en temps réel",
    features: ["Agent de diagnostic intégré", "Interface immersive sombre", "Lead generation avancée"]
  },
  {
    id: "nexora",
    title: "Nexora",
    category: "Automatisation & IA",
    type: "Concept dashboard opérationnel",
    description: "Une console de contrôle centralisée permettant à une équipe de visualiser le rendement de ses automatisations et d'orchestrer ses agents en direct.",
    image: "/assets/project-nexora.png",
    accent: "Data Viz & Automatisations",
    features: ["Monitoring temps réel", "Connexions multi-systèmes", "Analytics graphiques red-line"]
  }
];

export const PROCESS_STEPS = [
  {
    step: "01",
    title: "Échange et compréhension du besoin",
    description: "Nous étudions vos objectifs, vos cibles et les spécificités de votre secteur pour définir un périmètre d'intervention clair et adapté."
  },
  {
    step: "02",
    title: "Conception et validation du design",
    description: "Élaboration d'une direction artistique moderne, cohérente et épurée. Chaque écran clé est validé avec vous avant l'écriture du code."
  },
  {
    step: "03",
    title: "Développement et tests rigoureux",
    description: "Intégration soignée avec des standards modernes de performance, d'accessibilité et de sécurité, testée sur tous les appareils."
  },
  {
    step: "04",
    title: "Mise en ligne et accompagnement",
    description: "Déploiement sur votre environnement, contrôles finaux et suivi technique pour que votre présence digitale démarre sur des bases solides."
  }
];

export const FAQ_ITEMS = [
  {
    question: "Combien coûte la création d'un site web ?",
    answer: "Nos offres démarrent à 300 € (paiement unique) pour notre forfait Vitrine Starter, adapté à une présentation soignée de votre activité. Notre offre Business Fonctionnel à 600 € répond aux besoins de structures nécessitant des pages et fonctionnalités plus avancées. Pour tout projet dépassant ce cadre (e-commerce lourd, intégrations API sur-mesure, portails clients), nous établissons un devis précis et transparent après analyse de votre cahier des charges."
  },
  {
    question: "Quel est le délai de réalisation ?",
    answer: "Le délai moyen est généralement de 7 à 14 jours ouvrés pour un site Vitrine Starter, et de 2 à 4 semaines pour un projet Business Fonctionnel. Ces délais dépendent de la réactivité dans les échanges et de la fourniture des éléments textuels et graphiques nécessaires. Un calendrier précis vous est communiqué dès la validation du projet."
  },
  {
    question: "Le site sera-t-il adapté aux mobiles ?",
    answer: "Absolument. Tous nos sites sont conçus selon les principes du responsive design moderne. Ils offrent une navigation fluide et ergonomique sur smartphone, tablette, ordinateur portable et grands écrans."
  },
  {
    question: "L'hébergement et le nom de domaine sont-ils inclus ?",
    answer: "Par souci de transparence et pour que vous restiez le seul propriétaire légal de votre nom de domaine et de vos données, l'hébergement et le nom de domaine ne sont pas dissimulés dans nos forfaits de création. Nous vous conseillons sur le choix du meilleur prestataire adapté à votre budget (OVH, Vercel, Hostinger, etc.) et nous assurons pour vous l'ensemble de la configuration technique initiale."
  },
  {
    question: "Que comprend la maintenance ?",
    answer: "Nos forfaits de maintenance mensuelle (Vitrine Care à 60 €/mois ou Business Care à 200 €/mois) couvrent la surveillance technique, les sauvegardes régulières, les mises à jour logicielles de sécurité compatibles et la correction des éventuelles anomalies techniques survenues dans le périmètre contractuel. Ils vous évitent toute charge mentale technique."
  },
  {
    question: "Puis-je demander des fonctionnalités supplémentaires en cours de route ?",
    answer: "Oui. Si votre besoin évolue ou si vous souhaitez ajouter un module spécifique (réservation avancée, multilingue, espace privé), nous étudions la faisabilité et vous soumettons un avenant clair avant tout développement."
  },
  {
    question: "Proposez-vous des solutions d'intelligence artificielle ?",
    answer: "Oui, c'est l'un de nos cœurs d'expertise. Nous concevons des chatbots d'accueil et de conversion entraînés sur votre propre base de connaissances (à partir de 40 €/mois), ainsi que des systèmes d'automatisation de tâches et de flux de données (à partir de 100 €/mois)."
  },
  {
    question: "Comment obtenir un devis personnalisé ?",
    answer: "Vous pouvez lancer une commande directement depuis le site grâce à notre formulaire guidé, ou nous transmettre votre demande via le formulaire de contact en bas de page. Notre assistant IA ou un conseiller de l'équipe prendra contact avec vous sous 24h ouvrées."
  }
];
