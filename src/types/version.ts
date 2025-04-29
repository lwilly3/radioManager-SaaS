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
  fetchVersions: () => Promise<void>;
  getVersionHistory: () => Version[];
  getLatestVersion: () => Version | null;
}