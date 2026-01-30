import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { collection, getDocs, query, orderBy } from 'firebase/firestore';
import { db } from '../api/firebase/firebase';
import type { Version, VersionState } from '../types/version';
import semver from 'semver';
import packageJson from '../../package.json'; // Importer la version depuis package.json
import { defaultVersions } from './defaultVersions'; // Versions générées depuis CHANGELOG.md

export const useVersionStore = create<VersionState>()(
  persist(
    (set, get) => ({
      currentVersion: packageJson.version, // Utiliser la version dynamique
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
      resetVersion: () => {
        set({ currentVersion: packageJson.version }); // Forcer la version actuelle
      },
    }),
    {
      name: 'version-storage',
      partialize: (state) => ({
        currentVersion: state.currentVersion,
        versions: state.versions,
        displayCount: state.displayCount,
      }),
      onRehydrateStorage: () => (state) => {
        // Vérifier si 'state' est défini avant d'accéder à ses propriétés
        if (state && state.currentVersion !== packageJson.version) {
          state.currentVersion = packageJson.version;
        }
      },
    }
  )
);

// Note: defaultVersions est maintenant importé depuis ./defaultVersions.ts
// Ce fichier est généré automatiquement par scripts/generate-versions.js depuis CHANGELOG.md