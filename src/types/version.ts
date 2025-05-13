export interface Version {
  version: string;
  releaseDate: string;
  description: string;
  features: string[];
  bugfixes: string[];
  improvements: string[];
}

export interface VersionState {
  currentVersion: string;
  versions: Version[];
  isLoading: boolean;
  error: string | null;
  displayCount: number; // Nombre de versions à afficher par défaut
  fetchVersions: () => Promise<Version[]>;
  getVersionHistory: () => Version[];
  getLatestVersion: () => Version | null;
  setDisplayCount: (count: number) => void;
}