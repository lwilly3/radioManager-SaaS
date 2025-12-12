import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { collection, getDocs, query, orderBy } from 'firebase/firestore';
import { db } from '../api/firebase/firebase';
import type { Version, VersionState } from '../types/version';
import semver from 'semver';

export const useVersionStore = create<VersionState>()(
  persist(
    (set, get) => ({
      currentVersion: '1.1.4', // Version actuelle de l'application mise à jour
      versions: [],
      isLoading: false,
      error: null,
      displayCount: 5, // Nombre de versions à afficher par défaut

      fetchVersions: async () => {
        set({ isLoading: true, error: null });
        try {
          // Récupérer les versions depuis Firestore
          const versionsRef = collection(db, 'versions');
          const q = query(versionsRef, orderBy('releaseDate', 'desc'));
          const snapshot = await getDocs(q);

          if (snapshot.empty) {
            // Si aucune version n'est trouvée, utiliser les versions par défaut
            set({
              versions: defaultVersions,
              isLoading: false,
            });
            return defaultVersions;
          }

          const versions = snapshot.docs.map((doc) => ({
            ...(doc.data() as Version),
            version: doc.id,
          }));

          set({
            versions,
            isLoading: false,
          });
          return versions;
        } catch (error) {
          console.error('Erreur lors de la récupération des versions:', error);
          set({
            error: 'Erreur lors de la récupération des versions',
            isLoading: false,
            versions: defaultVersions, // Utiliser les versions par défaut en cas d'erreur
          });
          return defaultVersions;
        }
      },

      getVersionHistory: () => {
        return [...get().versions].sort((a, b) =>
          semver.compare(b.version, a.version)
        );
      },

      getLatestVersion: () => {
        const versions = get().versions;
        if (versions.length === 0) return null;

        return versions.reduce((latest, current) => {
          if (!latest) return current;
          return semver.gt(current.version, latest.version) ? current : latest;
        }, null as Version | null);
      },

      setDisplayCount: (count: number) => set({ displayCount: count }),
    }),
    {
      name: 'version-storage',
      partialize: (state) => ({
        currentVersion: state.currentVersion,
        versions: state.versions,
        displayCount: state.displayCount,
      }),
    }
  )
);

// Versions par défaut utilisées si Firestore n'est pas disponible
// Convention : Garder les 10 dernières versions, du plus récent au plus ancien
// Format de date : YYYY-MM-DD
const defaultVersions: Version[] = [
  {
    version: '1.1.4',
    releaseDate: '2025-12-12',
    description:
      'Correction de la persistance des champs formulaire et documentation versioning',
    features: [
      'Guide complet de gestion des versions (SemVer)',
      'Documentation architecture des composants',
    ],
    bugfixes: [
      'Correction de la persistance des champs formulaire ShowPlan lors de l\'ajout de segments',
      'Les champs (titre, type, date, heure, description) restent maintenant persistants',
    ],
    improvements: [
      'Création du store useShowPlanFormStore pour gérer l\'état global du formulaire',
      'Connexion directe de ShowPlanForm au store Zustand',
      'Reset automatique des données à la sortie du formulaire',
      'Mise à jour de AGENT.md avec règles de versioning automatique',
    ],
  },
  {
    version: '1.1.3',
    releaseDate: '2025-12-11',
    description:
      'Documentation complète du projet et guide pour agents IA',
    features: [
      'AGENT.md - Guide complet pour les agents IA (conventions, règles, bonnes pratiques)',
      'Documentation technique pour tous les modules (docs/modules/)',
      'Documentation métier complète (docs/business/)',
      'Guide de migration des URLs API',
    ],
    bugfixes: [],
    improvements: [
      'Mise à jour du README.md avec documentation complète',
      'Stratégie de branches Git (develop/main)',
    ],
  },
  {
    version: '1.1.2',
    releaseDate: '2025-12-01',
    description:
      "Corrections de bugs sur l'ajout d'invités et l'attribution de privilèges",
    features: [],
    bugfixes: [
      "Correction de l'ajout d'invités lors de la création de conducteur",
      "Correction de l'attribution de privilèges",
    ],
    improvements: [],
  },
  {
    version: '1.1.1',
    releaseDate: '2025-11-15',
    description:
      'Correction des erreurs de gestion des permissions et amélioration de la stabilité',
    features: [
      'Nouveau système de gestion des erreurs pour les permissions utilisateur',
      'Amélioration de la gestion des présentateurs',
    ],
    bugfixes: [
      "Correction du problème de rendu des objets d'erreur dans les composants React",
      'Correction des erreurs lors de la suppression des présentateurs',
      "Résolution du problème avec useUpdatePermissions lors de l'appel dans les gestionnaires d'événements",
    ],
    improvements: [
      "Meilleure gestion des types pour les messages d'erreur",
      'Notifications plus claires lors des opérations sur les présentateurs',
      'Optimisation des appels API pour la gestion des permissions',
    ],
  },
  {
    version: '1.1.0',
    releaseDate: '2025-11-01',
    description:
      "Ajout de fonctionnalités d'invitation et d'information de version",
    features: [
      "Génération de liens d'invitation temporaires pour les nouveaux utilisateurs",
      "Dialogue d'information de version accessible depuis le menu utilisateur",
      'Réinitialisation de mot de passe pour les administrateurs',
      'Page de définition de nouveau mot de passe pour les utilisateurs',
    ],
    bugfixes: [
      "Correction du problème de validation des tokens d'invitation",
      'Amélioration de la gestion des erreurs lors de la création de compte',
    ],
    improvements: [
      'Interface utilisateur améliorée pour la gestion des versions',
      "Meilleure expérience utilisateur pour l'invitation de nouveaux membres",
      "Limitation de l'affichage par défaut aux 5 dernières versions",
    ],
  },
  {
    version: '1.0.0',
    releaseDate: '2025-10-01',
    description: 'Version initiale de RadioManager - Release officielle',
    features: [
      'Gestion des conducteurs radio (création, édition, suppression)',
      'Planification des émissions avec segments',
      'Gestion des invités et présentateurs',
      "Chat d'équipe intégré (Firebase)",
      'Système de tâches collaboratif (Kanban)',
      'Archives des émissions passées',
      'Système de permissions (46 permissions)',
      'Authentification JWT',
    ],
    bugfixes: [],
    improvements: [],
  },
  {
    version: '0.9.0',
    releaseDate: '2025-09-15',
    description: 'Version bêta de RadioManager',
    features: [
      'Interface utilisateur complète',
      "Système d'authentification",
      'Gestion des permissions',
      'Création et édition de conducteurs',
    ],
    bugfixes: [],
    improvements: [],
  },
  {
    version: '0.5.0',
    releaseDate: '2025-08-01',
    description: 'Version alpha de RadioManager',
    features: [
      "Prototype de l'interface utilisateur",
      'Fonctionnalités de base pour la gestion des émissions',
    ],
    bugfixes: [],
    improvements: [],
  },
];