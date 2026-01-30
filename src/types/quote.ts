// Types pour le module Citations
// Version MVP - Fonctionnalités manuelles uniquement

/**
 * Auteur d'une citation
 */
export interface Author {
  id?: string;
  name: string;
  role?: 'guest' | 'presenter' | 'other';
  avatar?: string;
}

/**
 * Contexte de la citation (émission, conducteur)
 */
export interface Context {
  showId?: string;
  showName?: string;
  showPlanId?: string;
  emissionId?: string;
  date?: string;
  timestamp?: string; // HH:mm:ss dans l'émission
}

/**
 * Source de la citation
 * MVP : Seulement 'manual' pour Partie 1
 */
export interface Source {
  type: 'manual' | 'stream_transcription' | 'audio_file';
  transcriptionId?: string; // Pour Partie 2
  segmentId?: string; // Pour Partie 2
  streamTimestamp?: number; // Pour Partie 2
  audioUrl?: string;
  audioFile?: string;
  duration?: number;
}

/**
 * Métadonnées de la citation
 */
export interface Metadata {
  category?: 'statement' | 'position' | 'quote' | 'fact';
  tags: string[];
  language?: 'fr' | 'en';
  isVerified?: boolean;
  capturedBy?: string;
  capturedAt?: Date;
}

/**
 * Médias associés à la citation
 */
export interface Media {
  audioClipUrl?: string;
  imageUrl?: string;
}

/**
 * Publication sur réseaux sociaux
 */
export interface Publication {
  id: string;
  platform: 'facebook' | 'twitter' | 'instagram' | 'website' | 'linkedin';
  publishedAt: string;
  postUrl?: string;
  status: 'pending' | 'published' | 'failed';
  template: string;
  generatedContent: string;
  imageUrl?: string;
}

/**
 * Citation complète
 */
export interface Quote {
  id: string;
  content: string;
  author: Author;
  context: Context;
  source: Source;
  metadata: Metadata;
  media?: Media;
  publications: Publication[];
  status: 'draft' | 'approved' | 'published' | 'archived';
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

/**
 * Données pour créer une citation
 */
export interface CreateQuoteData {
  content: string;
  author: Author;
  context?: Context;
  source: Omit<Source, 'transcriptionId' | 'segmentId' | 'streamTimestamp'>; // MVP : pas de transcription
  metadata?: Metadata;
  media?: Media;
  status?: 'draft' | 'approved' | 'published' | 'archived';
  createdBy?: string;
}

/**
 * Données pour mettre à jour une citation
 */
export interface UpdateQuoteData {
  content?: string;
  author?: Author;
  context?: Context;
  metadata?: Metadata;
  media?: Media;
  status?: Quote['status'];
}

/**
 * Filtres pour la liste des citations
 */
export interface QuoteFilters {
  status?: Quote['status'];
  emissionId?: string;
  authorId?: string;
  sourceType?: Source['type'];
  category?: Metadata['category'];
  tags?: string[];
}
