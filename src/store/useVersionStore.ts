import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { collection, getDocs, query, orderBy, doc, getDoc } from 'firebase/firestore';
import { db } from '../api/firebase/firebase';
import type { Version, VersionState } from '../types/version';
import semver from 'semver';

export const useVersionStore = create<VersionState>()(
  persist(
    (set, get) => ({
      currentVersion: '1.1.1', // Version actuelle de l'application
      versions: [],
      isLoading: false,
      error: null,

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
              isLoading: false 
            });
            return defaultVersions;
          }
          
          const versions = snapshot.docs.map(doc => ({
            ...doc.data() as Version,
            version: doc.id
          }));
          
          set({ 
            versions,
            isLoading: false 
          });
          return versions;
        } catch (error) {
          console.error('Erreur lors de la récupération des versions:', error);
          set({ 
            error: 'Erreur lors de la récupération des versions',
            isLoading: false,
            versions: defaultVersions // Utiliser les versions par défaut en cas d'erreur
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
      }
    }),
    {
      name: 'version-storage',
      partialize: (state) => ({
        currentVersion: state.currentVersion,
        versions: state.versions
      }),
    }
  )
);

// Versions par défaut utilisées si Firestore n'est pas disponible
const defaultVersions: Version[] = [
  {
    version: '1.1.1',
    releaseDate: '2025-05-05',
    description: 'Correction des erreurs de gestion des permissions et amélioration de la stabilité',
    features: [
      'Nouveau système de gestion des erreurs pour les permissions utilisateur',
      'Amélioration de la gestion des présentateurs'
    ],
    bugfixes: [
      'Correction du problème de rendu des objets d\'erreur dans les composants React',
      'Correction des erreurs lors de la suppression des présentateurs',
      'Résolution du problème avec useUpdatePermissions lors de l\'appel dans les gestionnaires d\'événements'
    ],
    improvements: [
      'Meilleure gestion des types pour les messages d\'erreur',
      'Notifications plus claires lors des opérations sur les présentateurs',
      'Optimisation des appels API pour la gestion des permissions'
    ]
  },
  {
    version: '1.1.0',
    releaseDate: '2025-05-01',
    description: 'Ajout de fonctionnalités d\'invitation et d\'information de version',
    features: [
      'Génération de liens d\'invitation temporaires pour les nouveaux utilisateurs',
      'Dialogue d\'information de version accessible depuis le menu utilisateur',
      'Correction du bug de validation des tokens d\'invitation'
    ],
    bugfixes: [
      'Correction du problème de validation des tokens d\'invitation',
      'Amélioration de la gestion des erreurs lors de la création de compte'
    ],
    improvements: [
      'Interface utilisateur améliorée pour la gestion des versions',
      'Meilleure expérience utilisateur pour l\'invitation de nouveaux membres'
    ]
  },
  {
    version: '1.0.0',
    releaseDate: '2025-04-30',
    description: 'Version initiale de RadioManager',
    features: [
      'Gestion des conducteurs radio',
      'Planification des émissions',
      'Gestion des invités et présentateurs',
      'Chat d\'équipe intégré',
      'Système de tâches collaboratif',
      'Archives des émissions passées'
    ],
    bugfixes: [],
    improvements: []
  },
  {
    version: '0.9.0',
    releaseDate: '2025-04-15',
    description: 'Version bêta de RadioManager',
    features: [
      'Interface utilisateur complète',
      'Système d\'authentification',
      'Gestion des permissions',
      'Création et édition de conducteurs'
    ],
    bugfixes: [],
    improvements: []
  },
  {
    version: '0.5.0',
    releaseDate: '2025-03-20',
    description: 'Version alpha de RadioManager',
    features: [
      'Prototype de l\'interface utilisateur',
      'Fonctionnalités de base pour la gestion des émissions'
    ],
    bugfixes: [],
    improvements: []
  }
];