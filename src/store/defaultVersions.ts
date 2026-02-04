// Ce fichier est généré automatiquement depuis CHANGELOG.md
// Ne pas modifier manuellement - Utilisez 'npm run generate-versions'

import type { Version } from '../types/version';

export const defaultVersions: Version[] = [
  {
    version: "1.3.0",
    releaseDate: "2026-02-04",
    description: "Système de templates PDF pour les archives et optimisation des notes techniques.",
    features: [
      "Templates PDF pour Archives",
      "Template \"Classique\" : format simple portrait, liste compacte",
      "Template \"Professionnel\" : format paysage avec en-tête stylisé, statistiques, badges de statut",
      "Choix du template et de l'orientation lors de l'export",
      "Configuration des paramètres par défaut dans Réglages > Export PDF",
      "Stockage des préférences dans Firestore (archiveDefaultTemplate, archiveDefaultOrientation)",
      "Notes techniques optimisées (Conducteur - Volet droit)",
      "Debounce de 800ms pour réduire les appels Firestore",
      "Indicateur de statut de sauvegarde (⏳ saving / ✅ saved / ❌ error)",
      "Templates rapides prédéfinis (🎤 Micro, 🎵 Jingle, 📞 Appel, 🎥 Vidéo, ⚠️ Attention)",
      "Section rétractable pour gagner de l'espace",
      "Toolbar enrichie (couleurs texte/fond, liens, titres H3)",
      "Prévention des conflits lors de modifications simultanées"
    ],
    bugfixes: [
      "Settings.tsx : Suppression des appels log() dans le JSX (erreur void → ReactNode)",
      "Settings.tsx : Suppression de la prop parentValue non définie dans TabsContentProps",
      "ShowPlanSidebar.tsx : Correction guest.contact.email → guest.email (type Guest)"
    ],
    improvements: [
      "Nouveau fichier archivePdfGenerator.ts refactorisé avec deux générateurs",
      "Ajout ARCHIVE_PDF_TEMPLATES dans pdfTemplates.ts",
      "Hook usePdfSettings étendu avec archiveDefaultTemplate et archiveDefaultOrientation",
      "Export des nouvelles fonctions dans src/utils/pdf/index.ts"
    ]
  },
  {
    version: "1.2.0",
    releaseDate: "2026-01-30",
    description: "Nouvelle version majeure du module Citations avec création manuelle et depuis conducteurs, corrections importantes et améliorations techniques.",
    features: [
      "Module Citations - Slice 2 : Créer une citation manuelle",
      "Ajout du formulaire de création de citation (QuoteForm.tsx)",
      "Ajout de la page de création (CreateQuote.tsx)",
      "Upload de fichiers audio optionnel (Firebase Storage)",
      "Validation des données avec Zod (quoteSchema.ts)",
      "Support des catégories, tags, contexte d'émission",
      "Gestion des auteurs avec avatar optionnel",
      "Création de citation depuis un conducteur :",
      "Bouton \"Nouvelle citation\" dans ShowPlanDetail (avec permission)",
      "Pré-remplissage automatique du contexte (émission, date)",
      "Sélection rapide des invités du conducteur comme auteurs",
      "Liaison automatique de la citation au conducteur (showPlanId, emissionId)"
    ],
    bugfixes: [
      "Module Citations : Fix erreur Firestore avec valeurs undefined",
      "Ajout de la fonction removeUndefined pour nettoyer les données",
      "Utilisation de spread operator conditionnel pour éviter les champs vides",
      "Correction de l'erreur \"Unsupported field value: undefined\"",
      "Auth : Fix boucle infinie dans useAuthCheck",
      "Extraction correcte de logout depuis Zustand avec sélecteurs",
      "Suppression de logout des dépendances du useEffect",
      "ProtectedRoute : Ajout du support requiredPermission",
      "Vérification des permissions avant l'accès aux routes protégées",
      "Redirection vers / si permission manquante"
    ],
    improvements: [
      "Mise à jour des types Quote pour rendre les champs plus flexibles (context, metadata, author optionnels)",
      "Ajout de champs showId, showPlanId, showName dans Context",
      "Ajout de la route /quotes/create avec permission quotes_create",
      "Intégration avec Firebase Storage pour les fichiers audio",
      "Passage de state via React Router pour pré-remplissage"
    ]
  },
  {
    version: "1.1.5",
    releaseDate: "2025-12-12",
    description: "",
    features: [],
    bugfixes: [],
    improvements: [
      "Mise à jour du store Zustand (useVersionStore) pour rendre la gestion de la version dynamique.",
      "La version actuelle est désormais synchronisée automatiquement avec package.json.",
      "Ajout d'une vérification pour éviter les erreurs si state est undefined lors de la réhydratation.",
      "Mise à jour de docs/VERSIONING.md pour inclure les nouvelles instructions liées à la gestion dynamique des versions."
    ]
  },
  {
    version: "1.1.4",
    releaseDate: "2025-12-12",
    description: "",
    features: [],
    bugfixes: [
      "Persistance des champs formulaire ShowPlan lors de l'ajout de segments",
      "Création du store useShowPlanFormStore pour gérer l'état global du formulaire",
      "Connexion directe de ShowPlanForm au store Zustand",
      "Les champs (titre, type, date, heure, description) restent maintenant persistants",
      "Reset automatique des données à la sortie du formulaire"
    ],
    improvements: [
      "Ajout de docs/VERSIONING.md - Guide complet de gestion des versions (SemVer)",
      "Ajout de docs/ARCHITECTURE_ANALYSIS.md - Analyse de l'architecture des composants",
      "Mise à jour de AGENT.md :",
      "Nouvelle section \"Gestion des Versions - Semantic Versioning\"",
      "Règle de confirmation de fix avec mise à jour automatique de version",
      "Règles de qualité du code renforcées",
      "Nouveau store Zustand : src/store/useShowPlanFormStore.ts",
      "Refactorisation de ShowPlanForm.tsx - Inputs contrôlés connectés au store",
      "Simplification de CreateShowPlan.tsx - Utilisation du store centralisé"
    ]
  },
  {
    version: "1.1.3",
    releaseDate: "2025-12-11",
    description: "",
    features: [],
    bugfixes: [],
    improvements: [
      "Ajout de AGENT.md - Guide complet pour les agents IA (1069 lignes)",
      "Ajout de docs/API_MIGRATION_GUIDE.md - Guide de migration des URLs API",
      "Ajout de documentation technique pour tous les modules (docs/modules/)",
      "archives.md, authentication.md, chat.md, dashboard.md",
      "emissions.md, guests.md, presenters.md, profile.md",
      "settings.md, show-plans.md, tasks.md, team.md, users.md",
      "Ajout de documentation métier (docs/business/)",
      "authentication-and-access.md",
      "emissions-and-content.md",
      "programming-and-scheduling.md",
      "talent-and-collaboration.md",
      "user-and-permissions.md",
      "Mise à jour du README.md avec documentation complète du projet",
      "Modifications temporaires des URLs API (à corriger)"
    ]
  }
];
