// Types pour le module Citations
// Version avec intégration segments de conducteurs

import type { SegmentType } from './index';

/**
 * Types de contenu éditorial (simplifié à 4 choix)
 * Règle UX : Trop de choix = paralysie décisionnelle
 */
export type QuoteContentType = 
  | 'quote'           // Citation exacte (verbatim)
  | 'key_idea'        // Idée clé / Point important
  | 'statement'       // Déclaration / Prise de position
  | 'fact';           // Fait / Information vérifiable

/**
 * Auteur d'une citation
 */
export interface Author {
  id?: string;
  name: string;
  role?: 'guest' | 'presenter' | 'caller' | 'other';
  avatar?: string;
}

/**
 * Liaison avec un segment de conducteur
 */
export interface SegmentLink {
  id: string;                         // ID du segment
  title: string;                      // Titre du segment
  type: SegmentType;                  // intro, interview, music, etc.
  position: number;                   // Position dans le conducteur
}

/**
 * Contexte de la citation (émission, conducteur)
 */
export interface Context {
  showId?: string;
  showName?: string;
  showPlanId?: string;
  showPlanTitle?: string;
  emissionId?: string;
  emissionName?: string;
  broadcastDate?: string;             // YYYY-MM-DD
  timestamp?: string;                 // HH:mm:ss dans l'émission (optionnel)
}

/**
 * Horodatage optionnel (jamais bloquant)
 */
export interface QuoteTiming {
  timestamp?: string;                 // HH:mm:ss dans l'émission
  segmentMinute?: number;             // Minute dans le segment
  approximateTime?: 'start' | 'middle' | 'end';
}

/**
 * Source de la citation
 * MVP : Seulement 'manual' pour Partie 1
 */
export interface Source {
  type: 'manual' | 'stream_transcription' | 'audio_file';
  transcriptionId?: string; // Pour Partie 2
  streamTimestamp?: number; // Pour Partie 2
  audioUrl?: string;
  audioFile?: string;
  duration?: number;
}

/**
 * Catégorie thématique de la citation
 */
export type QuoteCategory = 
  | 'politique'
  | 'sport'
  | 'culture'
  | 'economie'
  | 'societe'
  | 'humour'
  | 'autre';

/**
 * Métadonnées de la citation
 */
export interface Metadata {
  category?: QuoteCategory;           // Catégorie thématique
  contentType?: QuoteContentType;     // Type de contenu (quote, key_idea, etc.)
  tags: string[];
  keywords?: string[];                // Mots-clés extraits pour recherche
  language?: 'fr' | 'en';
  importance?: 'low' | 'medium' | 'high';
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
 * Citation complète avec liaison segment
 */
export interface Quote {
  id: string;
  content: string;
  contentType: QuoteContentType;
  author: Author;
  segment?: SegmentLink;              // Liaison segment (nouveau)
  context: Context;
  timing?: QuoteTiming;               // Horodatage optionnel (nouveau)
  source: Source;
  metadata: Metadata;
  media?: Media;
  status: 'draft' | 'validated' | 'archived';
  createdBy: string;
  createdByName?: string;
  createdAt: string;
  updatedAt: string;
}

/**
 * Données pour créer une citation (mode rapide)
 * Seuls content et authorName sont requis
 */
export interface CreateQuoteData {
  // ✅ REQUIS (Mode rapide)
  content: string;
  authorName: string;
  
  // Optionnels mais recommandés
  authorId?: string;
  authorRole?: Author['role'];
  authorAvatar?: string;
  
  // Liaison segment (optionnel)
  segmentId?: string;
  segmentTitle?: string;
  segmentType?: SegmentType;
  segmentPosition?: number;
  
  // Contexte (pré-rempli si depuis conducteur)
  showPlanId?: string;
  showPlanTitle?: string;
  emissionId?: string;
  emissionName?: string;
  broadcastDate?: string;
  
  // Horodatage (100% optionnel)
  timestamp?: string;
  segmentMinute?: number;
  approximateTime?: 'start' | 'middle' | 'end';
  
  // Métadonnées
  contentType?: QuoteContentType;
  category?: Metadata['category'];
  tags?: string[];
  importance?: 'low' | 'medium' | 'high';
  
  // Source
  sourceType?: Source['type'];
  audioUrl?: string;
  audioDuration?: number;
}

/**
 * Données pour mettre à jour une citation
 */
export interface UpdateQuoteData {
  content?: string;
  contentType?: QuoteContentType;
  author?: Author;
  segment?: SegmentLink;
  context?: Context;
  timing?: QuoteTiming;
  metadata?: Metadata;
  media?: Media;
  status?: Quote['status'];
}

/**
 * Filtres pour la recherche avancée de citations
 */
export interface QuoteFilters {
  // Recherche texte
  query?: string;                     // Recherche full-text
  
  // Filtres principaux
  authorName?: string;
  authorId?: string;
  emissionId?: string;
  emissionName?: string;
  showPlanId?: string;
  segmentId?: string;
  segmentType?: SegmentType;
  
  // Filtres métadonnées
  contentType?: QuoteContentType;
  category?: Metadata['category'];
  tags?: string[];
  importance?: 'low' | 'medium' | 'high';
  status?: Quote['status'];
  sourceType?: Source['type'];
  
  // Filtres date
  dateFrom?: string;                  // YYYY-MM-DD
  dateTo?: string;                    // YYYY-MM-DD
  
  // Pagination
  limit?: number;
  startAfter?: string;                // Cursor pagination
  
  // Tri
  orderBy?: 'createdAt' | 'broadcastDate' | 'authorName' | 'importance';
  orderDirection?: 'asc' | 'desc';
}
