# 💬 Agent Skill: Intégration Citations sur Conducteurs

## Rôle
Guider l'agent dans l'implémentation complète du système de citations liées aux segments de conducteurs, avec gestion Firebase, recherche avancée et génération de contenu pour les plateformes.

## Quand utiliser ce skill

### Déclencheurs automatiques
- Création/modification de fonctionnalités liées aux citations
- Intégration citations ↔ segments de conducteurs
- Recherche et filtrage de citations
- Génération de contenu pour réseaux sociaux
- Stockage et récupération de citations dans Firebase
- Ajout de métadonnées (intervenant, horodatage, catégorie)

### Contexte d'utilisation
- **Systématique** : Toute opération sur le module Citations
- Création de formulaires de saisie de citations
- Développement de fonctionnalités de recherche
- Intégration avec les conducteurs et segments

---

## 📋 Vue d'ensemble du système

### Objectif métier

Le système de citations permet de :
1. **Capturer** des citations/extraits pendant ou après les émissions
2. **Lier** chaque citation à un segment spécifique du conducteur
3. **Enrichir** avec des métadonnées (intervenant, horodatage optionnel, type)
4. **Constituer** une base éditoriale consultable et réutilisable

> 🔮 **Évolution future** : Génération automatique de contenu pour les plateformes sociales (Facebook, Twitter, Instagram)

### Architecture du flux

```
┌─────────────────────────────────────────────────────────────┐
│                    CONDUCTEUR (ShowPlan)                     │
│  ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐           │
│  │Segment 1│ │Segment 2│ │Segment 3│ │Segment N│           │
│  │ Intro   │ │Interview│ │ Musique │ │  Outro  │           │
│  └────┬────┘ └────┬────┘ └────┬────┘ └────┬────┘           │
│       │           │           │           │                 │
│       └───────────┴─────┬─────┴───────────┘                 │
│                         │                                   │
│                    [+ Citation]                             │
└─────────────────────────┼───────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────────┐
│               FIREBASE FIRESTORE                             │
│                                                             │
│  Collection: quotes                                         │
│  ┌───────────────────────────────────────────────────────┐ │
│  │ {                                                     │ │
│  │   id: "quote_123",                                    │ │
│  │   content: "Cette citation est marquante...",         │ │
│  │   author: { name: "Marie L.", role: "guest" },        │ │
│  │   segment: {                                          │ │
│  │     id: "seg_456",                                    │ │
│  │     title: "Interview Marie L.",                      │ │
│  │     type: "interview"                                 │ │
│  │   },                                                  │ │
│  │   context: {                                          │ │
│  │     showPlanId: "sp_789",                             │ │
│  │     emissionId: "5",                                  │ │
│  │     broadcastDate: "2026-02-04"                       │ │
│  │   },                                                  │ │
│  │   timing: {                                           │ │
│  │     timestamp: "01:23:45",    // Optionnel            │ │
│  │     segmentMinute: 15         // Optionnel            │ │
│  │   },                                                  │ │
│  │   metadata: { category: "quote", tags: ["politique"] }│ │
│  │ }                                                     │ │
│  └───────────────────────────────────────────────────────┘ │
└─────────────────────────┼───────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────────┐
│                 SECTION CITATIONS                            │
│  ┌────────────────────────────────────────────────────────┐ │
│  │ 🔍 Recherche avancée                                   │ │
│  │ ┌──────────────────────────────────────────────────┐   │ │
│  │ │ Texte │ Intervenant │ Émission │ Date │ Tags    │   │ │
│  │ └──────────────────────────────────────────────────┘   │ │
│  └────────────────────────────────────────────────────────┘ │
│  ┌────────────────────────────────────────────────────────┐ │
│  │ 📝 Liste des citations                                 │ │
│  │ • "Cette citation..." - Marie L. - Morning Show        │ │
│  │ • "Une autre phrase..." - Jean D. - Midi Info          │ │
│  └────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
```

---

## 📦 Structure des données

### Interface Citation complète

```typescript
// src/types/quote.ts

/**
 * Citation avec liaison segment
 */
export interface Quote {
  id: string;
  
  // ═══════════════════════════════════════════════════════════
  // CONTENU
  // ═══════════════════════════════════════════════════════════
  content: string;                    // Texte de la citation
  contentType: QuoteContentType;      // Type de contenu
  
  // ═══════════════════════════════════════════════════════════
  // AUTEUR / INTERVENANT
  // ═══════════════════════════════════════════════════════════
  author: {
    id?: string;                      // ID si invité/présentateur connu
    name: string;                     // Nom de l'intervenant
    role: 'guest' | 'presenter' | 'caller' | 'other';
    avatar?: string;
  };
  
  // ═══════════════════════════════════════════════════════════
  // LIAISON SEGMENT (Nouveau)
  // ═══════════════════════════════════════════════════════════
  segment?: {
    id: string;                       // ID du segment
    title: string;                    // Titre du segment
    type: SegmentType;                // intro, interview, music, etc.
    position: number;                 // Position dans le conducteur
  };
  
  // ═══════════════════════════════════════════════════════════
  // CONTEXTE ÉMISSION
  // ═══════════════════════════════════════════════════════════
  context: {
    showPlanId?: string;              // ID du conducteur
    showPlanTitle?: string;           // Titre du conducteur
    emissionId?: string;              // ID de l'émission
    emissionName?: string;            // Nom de l'émission
    broadcastDate?: string;           // Date de diffusion (YYYY-MM-DD)
  };
  
  // ═══════════════════════════════════════════════════════════
  // HORODATAGE (Optionnel - Non bloquant)
  // ═══════════════════════════════════════════════════════════
  timing?: {
    timestamp?: string;               // HH:mm:ss dans l'émission (optionnel)
    segmentMinute?: number;           // Minute dans le segment (optionnel)
    approximateTime?: string;         // "début", "milieu", "fin" (optionnel)
  };
  
  // ═══════════════════════════════════════════════════════════
  // MÉTADONNÉES & RECHERCHE
  // ═══════════════════════════════════════════════════════════
  metadata: {
    category: QuoteCategory;          // Type de contenu éditorial
    tags: string[];                   // Tags pour recherche
    keywords: string[];               // Mots-clés extraits (pour recherche)
    language: 'fr' | 'en';
    importance: 'low' | 'medium' | 'high';
    isVerified: boolean;              // Vérifié par un éditeur
  };
  
  // ═══════════════════════════════════════════════════════════
  // SOURCE
  // ═══════════════════════════════════════════════════════════
  source: {
    type: 'manual' | 'transcription' | 'live_capture' | 'archive';
    audioUrl?: string;                // URL extrait audio
    audioDuration?: number;           // Durée en secondes
    transcriptionId?: string;         // Lien transcription si applicable
  };
  
  // ═══════════════════════════════════════════════════════════
  // STATUT (simplifié - publication = évolution future)
  // ═══════════════════════════════════════════════════════════
  status: 'draft' | 'validated' | 'archived';
  
  // ═══════════════════════════════════════════════════════════
  // AUDIT
  // ═══════════════════════════════════════════════════════════
  createdBy: string;
  createdByName: string;
  createdAt: string;                  // ISO string
  updatedAt: string;                  // ISO string
}

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
 * Catégories pour classification
 */
export type QuoteCategory = 
  | 'politics'        // Politique
  | 'economy'         // Économie
  | 'culture'         // Culture
  | 'sports'          // Sports
  | 'science'         // Science
  | 'society'         // Société
  | 'entertainment'   // Divertissement
  | 'other';          // Autre

/**
 * Types de segments (depuis conducteur)
 */
export type SegmentType = 
  | 'intro' 
  | 'interview' 
  | 'music' 
  | 'ad' 
  | 'outro' 
  | 'debate'
  | 'chronicle'
  | 'news'
  | 'other';
```

### Données de création (formulaire)

```typescript
/**
 * Données pour créer une citation
 * Les champs optionnels ne bloquent PAS la soumission
 */
export interface CreateQuoteData {
  // Requis
  content: string;
  authorName: string;
  
  // Optionnels mais recommandés
  authorId?: string;
  authorRole?: 'guest' | 'presenter' | 'caller' | 'other';
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
  timestamp?: string;           // HH:mm:ss
  segmentMinute?: number;       // Minute dans segment
  approximateTime?: 'start' | 'middle' | 'end';
  
  // Métadonnées
  contentType: QuoteContentType;
  category?: QuoteCategory;
  tags?: string[];
  importance?: 'low' | 'medium' | 'high';
  
  // Source
  sourceType: 'manual' | 'transcription' | 'live_capture' | 'archive';
  audioUrl?: string;
  audioDuration?: number;
}
```

### Filtres de recherche

```typescript
/**
 * Filtres pour recherche avancée de citations
 */
export interface QuoteSearchFilters {
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
  category?: QuoteCategory;
  tags?: string[];
  importance?: 'low' | 'medium' | 'high';
  status?: 'draft' | 'approved' | 'published' | 'archived';
  
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
```

---

## 🔧 Services Firebase

### Service CRUD Citations

```typescript
// src/api/firebase/quotes.ts

import {
  collection,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  getDoc,
  getDocs,
  query,
  where,
  orderBy,
  limit,
  startAfter,
  onSnapshot,
  serverTimestamp,
  Timestamp,
  writeBatch,
} from 'firebase/firestore';
import { db } from './firebase';
import type { Quote, CreateQuoteData, QuoteSearchFilters } from '../../types/quote';

const QUOTES_COLLECTION = 'quotes';

// ════════════════════════════════════════════════════════════════
// HELPERS
// ════════════════════════════════════════════════════════════════

/**
 * Convertit un Timestamp Firestore en ISO string
 */
const timestampToISO = (timestamp: any): string => {
  if (!timestamp) return new Date().toISOString();
  if (timestamp instanceof Timestamp) return timestamp.toDate().toISOString();
  if (timestamp?.toDate) return timestamp.toDate().toISOString();
  if (typeof timestamp === 'string') return timestamp;
  return new Date().toISOString();
};

/**
 * Extrait les mots-clés du contenu pour recherche
 */
const extractKeywords = (content: string): string[] => {
  const stopWords = ['le', 'la', 'les', 'de', 'du', 'des', 'un', 'une', 'et', 'ou', 'que', 'qui'];
  return content
    .toLowerCase()
    .replace(/[^\w\sàâäéèêëïîôùûüç]/g, '')
    .split(/\s+/)
    .filter(word => word.length > 3 && !stopWords.includes(word))
    .slice(0, 20); // Max 20 mots-clés
};

/**
 * Convertit les données Firestore en Quote
 */
const firestoreToQuote = (id: string, data: any): Quote => ({
  id,
  content: data.content,
  contentType: data.contentType || 'quote',
  author: data.author || { name: 'Inconnu', role: 'other' },
  segment: data.segment || undefined,
  context: data.context || {},
  timing: data.timing || undefined,
  metadata: {
    category: data.metadata?.category || 'other',
    tags: data.metadata?.tags || [],
    keywords: data.metadata?.keywords || [],
    language: data.metadata?.language || 'fr',
    importance: data.metadata?.importance || 'medium',
    isVerified: data.metadata?.isVerified || false,
  },
  source: data.source || { type: 'manual' },
  publications: data.publications || [],
  status: data.status || 'draft',
  createdBy: data.createdBy,
  createdByName: data.createdByName || '',
  createdAt: timestampToISO(data.createdAt),
  updatedAt: timestampToISO(data.updatedAt),
});

// ════════════════════════════════════════════════════════════════
// CRUD OPERATIONS
// ════════════════════════════════════════════════════════════════

/**
 * Créer une citation avec liaison segment
 */
export const createQuote = async (
  data: CreateQuoteData,
  userId: string,
  userName: string
): Promise<string> => {
  const keywords = extractKeywords(data.content);
  
  const quoteData = {
    content: data.content,
    contentType: data.contentType,
    
    author: {
      id: data.authorId || null,
      name: data.authorName,
      role: data.authorRole || 'other',
      avatar: data.authorAvatar || null,
    },
    
    // Liaison segment (si fournie)
    segment: data.segmentId ? {
      id: data.segmentId,
      title: data.segmentTitle || '',
      type: data.segmentType || 'other',
      position: data.segmentPosition || 0,
    } : null,
    
    context: {
      showPlanId: data.showPlanId || null,
      showPlanTitle: data.showPlanTitle || null,
      emissionId: data.emissionId || null,
      emissionName: data.emissionName || null,
      broadcastDate: data.broadcastDate || null,
    },
    
    // Horodatage optionnel
    timing: (data.timestamp || data.segmentMinute || data.approximateTime) ? {
      timestamp: data.timestamp || null,
      segmentMinute: data.segmentMinute || null,
      approximateTime: data.approximateTime || null,
    } : null,
    
    metadata: {
      category: data.category || 'other',
      tags: data.tags || [],
      keywords, // Mots-clés extraits pour recherche
      language: 'fr',
      importance: data.importance || 'medium',
      isVerified: false,
    },
    
    source: {
      type: data.sourceType,
      audioUrl: data.audioUrl || null,
      audioDuration: data.audioDuration || null,
    },
    
    publications: [],
    status: 'draft',
    
    createdBy: userId,
    createdByName: userName,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  };
  
  const docRef = await addDoc(collection(db, QUOTES_COLLECTION), quoteData);
  return docRef.id;
};

/**
 * Mettre à jour une citation
 */
export const updateQuote = async (
  quoteId: string,
  updates: Partial<CreateQuoteData>
): Promise<void> => {
  const docRef = doc(db, QUOTES_COLLECTION, quoteId);
  
  const updateData: any = {
    updatedAt: serverTimestamp(),
  };
  
  // Mise à jour du contenu et mots-clés
  if (updates.content) {
    updateData.content = updates.content;
    updateData['metadata.keywords'] = extractKeywords(updates.content);
  }
  
  // Mise à jour de l'auteur
  if (updates.authorName) {
    updateData['author.name'] = updates.authorName;
    if (updates.authorId) updateData['author.id'] = updates.authorId;
    if (updates.authorRole) updateData['author.role'] = updates.authorRole;
    if (updates.authorAvatar) updateData['author.avatar'] = updates.authorAvatar;
  }
  
  // Mise à jour du segment
  if (updates.segmentId) {
    updateData.segment = {
      id: updates.segmentId,
      title: updates.segmentTitle || '',
      type: updates.segmentType || 'other',
      position: updates.segmentPosition || 0,
    };
  }
  
  // Mise à jour du timing
  if (updates.timestamp !== undefined || updates.segmentMinute !== undefined) {
    updateData.timing = {
      timestamp: updates.timestamp || null,
      segmentMinute: updates.segmentMinute || null,
      approximateTime: updates.approximateTime || null,
    };
  }
  
  // Mise à jour des métadonnées
  if (updates.category) updateData['metadata.category'] = updates.category;
  if (updates.tags) updateData['metadata.tags'] = updates.tags;
  if (updates.importance) updateData['metadata.importance'] = updates.importance;
  if (updates.contentType) updateData.contentType = updates.contentType;
  
  await updateDoc(docRef, updateData);
};

/**
 * Supprimer une citation
 */
export const deleteQuote = async (quoteId: string): Promise<void> => {
  const docRef = doc(db, QUOTES_COLLECTION, quoteId);
  await deleteDoc(docRef);
};

/**
 * Récupérer une citation par ID
 */
export const getQuoteById = async (quoteId: string): Promise<Quote | null> => {
  const docRef = doc(db, QUOTES_COLLECTION, quoteId);
  const docSnap = await getDoc(docRef);
  
  if (!docSnap.exists()) return null;
  return firestoreToQuote(docSnap.id, docSnap.data());
};

// ════════════════════════════════════════════════════════════════
// RECHERCHE AVANCÉE
// ════════════════════════════════════════════════════════════════

/**
 * Rechercher des citations avec filtres multiples
 */
export const searchQuotes = async (
  filters: QuoteSearchFilters
): Promise<{ quotes: Quote[]; hasMore: boolean; lastDoc: any }> => {
  let q = query(collection(db, QUOTES_COLLECTION));
  
  // ═══════════════════════════════════════════════════════════
  // FILTRES FIRESTORE (index requis)
  // ═══════════════════════════════════════════════════════════
  
  // Filtre par émission
  if (filters.emissionId) {
    q = query(q, where('context.emissionId', '==', filters.emissionId));
  }
  
  // Filtre par conducteur
  if (filters.showPlanId) {
    q = query(q, where('context.showPlanId', '==', filters.showPlanId));
  }
  
  // Filtre par segment
  if (filters.segmentId) {
    q = query(q, where('segment.id', '==', filters.segmentId));
  }
  
  // Filtre par type de segment
  if (filters.segmentType) {
    q = query(q, where('segment.type', '==', filters.segmentType));
  }
  
  // Filtre par auteur (ID)
  if (filters.authorId) {
    q = query(q, where('author.id', '==', filters.authorId));
  }
  
  // Filtre par type de contenu
  if (filters.contentType) {
    q = query(q, where('contentType', '==', filters.contentType));
  }
  
  // Filtre par catégorie
  if (filters.category) {
    q = query(q, where('metadata.category', '==', filters.category));
  }
  
  // Filtre par importance
  if (filters.importance) {
    q = query(q, where('metadata.importance', '==', filters.importance));
  }
  
  // Filtre par statut
  if (filters.status) {
    q = query(q, where('status', '==', filters.status));
  }
  
  // Filtre par tags (array-contains)
  if (filters.tags && filters.tags.length > 0) {
    // Note: Firestore ne supporte qu'un seul array-contains
    q = query(q, where('metadata.tags', 'array-contains', filters.tags[0]));
  }
  
  // ═══════════════════════════════════════════════════════════
  // TRI & PAGINATION
  // ═══════════════════════════════════════════════════════════
  
  const orderField = filters.orderBy || 'createdAt';
  const orderDir = filters.orderDirection || 'desc';
  q = query(q, orderBy(orderField, orderDir));
  
  // Pagination par curseur
  if (filters.startAfter) {
    const startDoc = await getDoc(doc(db, QUOTES_COLLECTION, filters.startAfter));
    if (startDoc.exists()) {
      q = query(q, startAfter(startDoc));
    }
  }
  
  // Limite (+ 1 pour détecter hasMore)
  const limitCount = filters.limit || 20;
  q = query(q, limit(limitCount + 1));
  
  // ═══════════════════════════════════════════════════════════
  // EXÉCUTION
  // ═══════════════════════════════════════════════════════════
  
  const snapshot = await getDocs(q);
  let quotes = snapshot.docs.map(doc => firestoreToQuote(doc.id, doc.data()));
  
  // Détecter si plus de résultats
  const hasMore = quotes.length > limitCount;
  if (hasMore) {
    quotes = quotes.slice(0, limitCount);
  }
  
  // ═══════════════════════════════════════════════════════════
  // FILTRES CÔTÉ CLIENT (non supportés par Firestore)
  // ═══════════════════════════════════════════════════════════
  
  // Recherche full-text dans contenu et auteur
  if (filters.query) {
    const searchTerms = filters.query.toLowerCase().split(/\s+/);
    quotes = quotes.filter(quote => {
      const searchableText = [
        quote.content,
        quote.author.name,
        quote.context.emissionName,
        quote.segment?.title,
        ...(quote.metadata.tags || []),
        ...(quote.metadata.keywords || []),
      ].filter(Boolean).join(' ').toLowerCase();
      
      return searchTerms.every(term => searchableText.includes(term));
    });
  }
  
  // Filtre par nom d'auteur (recherche partielle)
  if (filters.authorName) {
    const searchName = filters.authorName.toLowerCase();
    quotes = quotes.filter(q => 
      q.author.name.toLowerCase().includes(searchName)
    );
  }
  
  // Filtre par plage de dates
  if (filters.dateFrom || filters.dateTo) {
    quotes = quotes.filter(quote => {
      const date = quote.context.broadcastDate || quote.createdAt.split('T')[0];
      if (filters.dateFrom && date < filters.dateFrom) return false;
      if (filters.dateTo && date > filters.dateTo) return false;
      return true;
    });
  }
  
  const lastDoc = snapshot.docs[snapshot.docs.length - 1]?.id || null;
  
  return { quotes, hasMore, lastDoc };
};

/**
 * Récupérer les citations d'un segment spécifique
 */
export const getQuotesBySegment = async (segmentId: string): Promise<Quote[]> => {
  const q = query(
    collection(db, QUOTES_COLLECTION),
    where('segment.id', '==', segmentId),
    orderBy('createdAt', 'asc')
  );
  
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => firestoreToQuote(doc.id, doc.data()));
};

/**
 * Récupérer les citations d'un conducteur
 */
export const getQuotesByShowPlan = async (showPlanId: string): Promise<Quote[]> => {
  const q = query(
    collection(db, QUOTES_COLLECTION),
    where('context.showPlanId', '==', showPlanId),
    orderBy('createdAt', 'asc')
  );
  
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => firestoreToQuote(doc.id, doc.data()));
};

/**
 * Récupérer les citations d'un intervenant
 */
export const getQuotesByAuthor = async (authorId: string): Promise<Quote[]> => {
  const q = query(
    collection(db, QUOTES_COLLECTION),
    where('author.id', '==', authorId),
    orderBy('createdAt', 'desc')
  );
  
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => firestoreToQuote(doc.id, doc.data()));
};

// ════════════════════════════════════════════════════════════════
// LISTENER TEMPS RÉEL
// ════════════════════════════════════════════════════════════════

/**
 * S'abonner aux citations d'un conducteur en temps réel
 */
export const subscribeToShowPlanQuotes = (
  showPlanId: string,
  callback: (quotes: Quote[]) => void
): (() => void) => {
  const q = query(
    collection(db, QUOTES_COLLECTION),
    where('context.showPlanId', '==', showPlanId),
    orderBy('createdAt', 'asc')
  );
  
  return onSnapshot(q, (snapshot) => {
    const quotes = snapshot.docs.map(doc => firestoreToQuote(doc.id, doc.data()));
    callback(quotes);
  });
};

// ════════════════════════════════════════════════════════════════
// STATISTIQUES
// ════════════════════════════════════════════════════════════════

/**
 * Obtenir les statistiques des citations
 */
export const getQuotesStats = async (filters?: {
  emissionId?: string;
  dateFrom?: string;
  dateTo?: string;
}): Promise<{
  total: number;
  byCategory: Record<string, number>;
  byContentType: Record<string, number>;
  byStatus: Record<string, number>;
  topAuthors: { name: string; count: number }[];
}> => {
  let q = query(collection(db, QUOTES_COLLECTION));
  
  if (filters?.emissionId) {
    q = query(q, where('context.emissionId', '==', filters.emissionId));
  }
  
  const snapshot = await getDocs(q);
  const quotes = snapshot.docs.map(doc => doc.data());
  
  // Filtrer par dates côté client
  let filtered = quotes;
  if (filters?.dateFrom || filters?.dateTo) {
    filtered = quotes.filter(q => {
      const date = q.context?.broadcastDate || '';
      if (filters.dateFrom && date < filters.dateFrom) return false;
      if (filters.dateTo && date > filters.dateTo) return false;
      return true;
    });
  }
  
  // Calcul des stats
  const byCategory: Record<string, number> = {};
  const byContentType: Record<string, number> = {};
  const byStatus: Record<string, number> = {};
  const authorCounts: Record<string, number> = {};
  
  filtered.forEach(q => {
    const cat = q.metadata?.category || 'other';
    byCategory[cat] = (byCategory[cat] || 0) + 1;
    
    const type = q.contentType || 'quote';
    byContentType[type] = (byContentType[type] || 0) + 1;
    
    const status = q.status || 'draft';
    byStatus[status] = (byStatus[status] || 0) + 1;
    
    const author = q.author?.name || 'Inconnu';
    authorCounts[author] = (authorCounts[author] || 0) + 1;
  });
  
  // Top 10 auteurs
  const topAuthors = Object.entries(authorCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .map(([name, count]) => ({ name, count }));
  
  return {
    total: filtered.length,
    byCategory,
    byContentType,
    byStatus,
    topAuthors,
  };
};
```

---

## 🎨 Composants UI

### Principes UX du formulaire

> **Règle des 80/20** : 80% des utilisateurs n'ont besoin que de 2 champs (contenu + auteur).
> Le formulaire doit être rapide par défaut, avec une option "Plus d'options" pour les cas avancés.

```
┌─────────────────────────────────────────────────────────────┐
│  MODE RAPIDE (par défaut)                                   │
│  ┌───────────────────────────────────────────────────────┐  │
│  │ Segment: Interview Marie L. (15 min)         [info]  │  │
│  └───────────────────────────────────────────────────────┘  │
│                                                             │
│  Intervenant: [Dropdown invités ▼] ou [Saisir nom]         │
│                                                             │
│  Citation: ┌────────────────────────────────────────────┐  │
│            │                                            │  │
│            │                                            │  │
│            └────────────────────────────────────────────┘  │
│                                                             │
│  [+ Plus d'options]              [Annuler] [Enregistrer]   │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│  MODE AVANCÉ (déplié)                                       │
│  ...champs de base...                                       │
│  ┌───────────────────────────────────────────────────────┐  │
│  │ ▼ Plus d'options                                      │  │
│  │   Type: [Citation exacte ▼]  Catégorie: [Politique ▼]│  │
│  │   Tags: [politique, interview, ...]                   │  │
│  │   Importance: ○ Faible ● Moyenne ○ Haute              │  │
│  │   ─────────────────────────────────────────────────── │  │
│  │   Horodatage (optionnel):                             │  │
│  │   [__:__:__] ou [Minute: __] ou [Début|Milieu|Fin]   │  │
│  └───────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

### Formulaire de création de citation sur segment

```tsx
// src/components/quotes/SegmentQuoteForm.tsx

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Quote, Clock, User, Tag, FileText } from 'lucide-react';
import type { ShowSegment, Guest } from '../../types';
import type { CreateQuoteData, QuoteContentType, QuoteCategory } from '../../types/quote';

// ════════════════════════════════════════════════════════════════
// VALIDATION SCHEMA - Mode rapide par défaut
// Seuls content et authorName sont requis
// ════════════════════════════════════════════════════════════════

const quoteSchema = z.object({
  // ✅ REQUIS (Mode rapide)
  content: z.string()
    .min(10, 'La citation doit contenir au moins 10 caractères')
    .max(1000, 'La citation ne peut pas dépasser 1000 caractères'),
  
  authorName: z.string()
    .min(2, 'Le nom de l\'intervenant est requis'),
  
  // ════════════════════════════════════════════════════════════
  // OPTIONNEL (Mode avancé - tout a des valeurs par défaut)
  // ════════════════════════════════════════════════════════════
  authorRole: z.enum(['guest', 'presenter', 'caller', 'other']).default('guest'),
  
  contentType: z.enum(['quote', 'key_idea', 'statement', 'fact']).default('quote'),
  
  category: z.enum([
    'politics', 'economy', 'culture', 'sports', 'science', 'society', 'entertainment', 'other'
  ]).optional(),
  
  tags: z.array(z.string()).default([]),
  importance: z.enum(['low', 'medium', 'high']).default('medium'),
  
  // Horodatage 100% optionnel - jamais bloquant
  timestamp: z.string().optional(),
  segmentMinute: z.number().min(0).optional(),
  approximateTime: z.enum(['start', 'middle', 'end']).optional(),
});

type QuoteFormData = z.infer<typeof quoteSchema>;

interface SegmentQuoteFormProps {
  segment: ShowSegment;
  showPlanId: string;
  showPlanTitle: string;
  emissionId?: string;
  emissionName?: string;
  broadcastDate?: string;
  guests?: Guest[];
  onSubmit: (data: CreateQuoteData) => Promise<void>;
  onCancel: () => void;
}

export const SegmentQuoteForm: React.FC<SegmentQuoteFormProps> = ({
  segment,
  showPlanId,
  showPlanTitle,
  emissionId,
  emissionName,
  broadcastDate,
  guests = [],
  onSubmit,
  onCancel,
}) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedGuest, setSelectedGuest] = useState<Guest | null>(null);
  
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<QuoteFormData>({
    resolver: zodResolver(quoteSchema),
    defaultValues: {
      contentType: 'quote',
      importance: 'medium',
      tags: [],
    },
  });
  
  // Sélection d'un invité pré-remplit les champs auteur
  const handleGuestSelect = (guestId: string) => {
    if (guestId === 'manual') {
      setSelectedGuest(null);
      setValue('authorName', '');
      setValue('authorRole', 'other');
      return;
    }
    
    const guest = guests.find(g => String(g.id) === guestId);
    if (guest) {
      setSelectedGuest(guest);
      setValue('authorName', guest.name);
      setValue('authorRole', 'guest');
    }
  };
  
  const onFormSubmit = async (formData: QuoteFormData) => {
    setIsSubmitting(true);
    try {
      const createData: CreateQuoteData = {
        content: formData.content,
        authorName: formData.authorName,
        authorId: selectedGuest ? String(selectedGuest.id) : undefined,
        authorRole: formData.authorRole,
        authorAvatar: selectedGuest?.avatar || undefined,
        
        // Liaison segment
        segmentId: segment.id,
        segmentTitle: segment.title,
        segmentType: segment.type,
        segmentPosition: parseInt(segment.position) || 0,
        
        // Contexte conducteur
        showPlanId,
        showPlanTitle,
        emissionId,
        emissionName,
        broadcastDate,
        
        // Horodatage optionnel
        timestamp: formData.timestamp || undefined,
        segmentMinute: formData.segmentMinute,
        approximateTime: formData.approximateTime,
        
        // Métadonnées
        contentType: formData.contentType,
        category: formData.category,
        tags: formData.tags,
        importance: formData.importance,
        
        sourceType: 'manual',
      };
      
      await onSubmit(createData);
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-6">
      {/* ════════════════════════════════════════════════════════════ */}
      {/* CONTEXTE SEGMENT (Information) */}
      {/* ════════════════════════════════════════════════════════════ */}
      <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
        <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">
          Segment sélectionné
        </h4>
        <div className="flex items-center gap-3">
          <span className={`px-2 py-1 rounded text-xs font-medium ${
            segment.type === 'interview' ? 'bg-blue-100 text-blue-700' :
            segment.type === 'intro' ? 'bg-green-100 text-green-700' :
            'bg-gray-100 text-gray-700'
          }`}>
            {segment.type}
          </span>
          <span className="font-medium">{segment.title}</span>
          <span className="text-gray-500">({segment.duration} min)</span>
        </div>
      </div>
      
      {/* ════════════════════════════════════════════════════════════ */}
      {/* SÉLECTION INTERVENANT */}
      {/* ════════════════════════════════════════════════════════════ */}
      {guests.length > 0 && (
        <div>
          <label className="block text-sm font-medium mb-2">
            <User className="inline-block w-4 h-4 mr-1" />
            Intervenant du segment
          </label>
          <select
            onChange={(e) => handleGuestSelect(e.target.value)}
            className="w-full rounded-lg border p-2.5 focus:ring-2 focus:ring-indigo-500"
          >
            <option value="manual">-- Saisir manuellement --</option>
            {guests.map((guest) => (
              <option key={guest.id} value={String(guest.id)}>
                {guest.name} {guest.role ? `(${guest.role})` : ''}
              </option>
            ))}
          </select>
        </div>
      )}
      
      {/* Nom intervenant (manuel ou pré-rempli) */}
      <div>
        <label className="block text-sm font-medium mb-2">
          Nom de l'intervenant *
        </label>
        <input
          type="text"
          {...register('authorName')}
          className="w-full rounded-lg border p-2.5"
          placeholder="Ex: Jean Dupont"
        />
        {errors.authorName && (
          <p className="text-red-500 text-sm mt-1">{errors.authorName.message}</p>
        )}
      </div>
      
      {/* ════════════════════════════════════════════════════════════ */}
      {/* CONTENU DE LA CITATION */}
      {/* ════════════════════════════════════════════════════════════ */}
      <div>
        <label className="block text-sm font-medium mb-2">
          <Quote className="inline-block w-4 h-4 mr-1" />
          Citation / Extrait *
        </label>
        <textarea
          {...register('content')}
          rows={4}
          className="w-full rounded-lg border p-2.5"
          placeholder="Saisissez la citation ou l'extrait..."
        />
        {errors.content && (
          <p className="text-red-500 text-sm mt-1">{errors.content.message}</p>
        )}
      </div>
      
      {/* Type de contenu */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-2">
            <FileText className="inline-block w-4 h-4 mr-1" />
            Type de contenu *
          </label>
          <select
            {...register('contentType')}
            className="w-full rounded-lg border p-2.5"
          >
            <option value="quote">💬 Citation exacte</option>
            <option value="key_idea">💡 Idée clé</option>
            <option value="statement">📢 Déclaration</option>
            <option value="fact">📊 Fait / Info</option>
          </select>
        </div>
        
        <div>
          <label className="block text-sm font-medium mb-2">
            Catégorie
          </label>
          <select
            {...register('category')}
            className="w-full rounded-lg border p-2.5"
          >
            <option value="">-- Optionnel --</option>
            <option value="politics">Politique</option>
            <option value="economy">Économie</option>
            <option value="culture">Culture</option>
            <option value="sports">Sports</option>
            <option value="science">Science</option>
            <option value="society">Société</option>
            <option value="entertainment">Divertissement</option>
            <option value="other">Autre</option>
          </select>
        </div>
      </div>
      
      {/* ════════════════════════════════════════════════════════════ */}
      {/* HORODATAGE OPTIONNEL */}
      {/* ════════════════════════════════════════════════════════════ */}
      <div className="border-t pt-4">
        <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-3">
          <Clock className="inline-block w-4 h-4 mr-1" />
          Horodatage (optionnel)
        </h4>
        
        <div className="grid grid-cols-3 gap-4">
          {/* Timestamp HH:mm:ss */}
          <div>
            <label className="block text-sm text-gray-600 mb-1">
              Heure dans l'émission
            </label>
            <input
              type="time"
              step="1"
              {...register('timestamp')}
              className="w-full rounded-lg border p-2.5"
              placeholder="HH:mm:ss"
            />
          </div>
          
          {/* Minute dans le segment */}
          <div>
            <label className="block text-sm text-gray-600 mb-1">
              Minute du segment
            </label>
            <input
              type="number"
              min={0}
              max={segment.duration}
              {...register('segmentMinute', { valueAsNumber: true })}
              className="w-full rounded-lg border p-2.5"
              placeholder={`0-${segment.duration}`}
            />
          </div>
          
          {/* Position approximative */}
          <div>
            <label className="block text-sm text-gray-600 mb-1">
              Position approximative
            </label>
            <select
              {...register('approximateTime')}
              className="w-full rounded-lg border p-2.5"
            >
              <option value="">-- Non précisé --</option>
              <option value="start">Début du segment</option>
              <option value="middle">Milieu du segment</option>
              <option value="end">Fin du segment</option>
            </select>
          </div>
        </div>
        
        <p className="text-xs text-gray-400 mt-2">
          L'horodatage est optionnel et n'empêche pas l'enregistrement de la citation.
        </p>
      </div>
      
      {/* ════════════════════════════════════════════════════════════ */}
      {/* TAGS & IMPORTANCE */}
      {/* ════════════════════════════════════════════════════════════ */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-2">
            <Tag className="inline-block w-4 h-4 mr-1" />
            Tags (séparés par des virgules)
          </label>
          <input
            type="text"
            onChange={(e) => {
              const tags = e.target.value.split(',').map(t => t.trim()).filter(Boolean);
              setValue('tags', tags);
            }}
            className="w-full rounded-lg border p-2.5"
            placeholder="Ex: interview, exclusif, politique"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium mb-2">
            Importance
          </label>
          <select
            {...register('importance')}
            className="w-full rounded-lg border p-2.5"
          >
            <option value="low">Faible</option>
            <option value="medium">Moyenne</option>
            <option value="high">Haute</option>
          </select>
        </div>
      </div>
      
      {/* ════════════════════════════════════════════════════════════ */}
      {/* ACTIONS */}
      {/* ════════════════════════════════════════════════════════════ */}
      <div className="flex justify-end gap-3 pt-4 border-t">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg"
        >
          Annuler
        </button>
        <button
          type="submit"
          disabled={isSubmitting}
          className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50"
        >
          {isSubmitting ? 'Enregistrement...' : 'Enregistrer la citation'}
        </button>
      </div>
    </form>
  );
};
```

### Composant de recherche avancée

```tsx
// src/components/quotes/QuoteSearchBar.tsx

import { useState, useEffect, useCallback } from 'react';
import { Search, Filter, X, Calendar, User, Tag } from 'lucide-react';
import { useDebounce } from '../../hooks/useDebounce';
import type { QuoteSearchFilters, QuoteContentType, QuoteCategory } from '../../types/quote';

interface QuoteSearchBarProps {
  filters: QuoteSearchFilters;
  onFiltersChange: (filters: QuoteSearchFilters) => void;
  emissions?: { id: string; name: string }[];
  loading?: boolean;
}

export const QuoteSearchBar: React.FC<QuoteSearchBarProps> = ({
  filters,
  onFiltersChange,
  emissions = [],
  popularTags = [],        // Tags les plus utilisés
  recentSearches = [],     // Recherches récentes de l'utilisateur
  loading = false,
}) => {
  const [query, setQuery] = useState(filters.query || '');
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  
  const debouncedQuery = useDebounce(query, 300);
  
  useEffect(() => {
    onFiltersChange({ ...filters, query: debouncedQuery });
  }, [debouncedQuery]);
  
  const handleFilterChange = (key: keyof QuoteSearchFilters, value: any) => {
    onFiltersChange({ ...filters, [key]: value || undefined });
  };
  
  const clearFilters = () => {
    setQuery('');
    onFiltersChange({});
  };
  
  const activeFiltersCount = Object.values(filters).filter(v => 
    v !== undefined && v !== '' && (!Array.isArray(v) || v.length > 0)
  ).length;
  
  return (
    <div className="space-y-4">
      {/* Barre de recherche principale */}
      <div className="flex gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Rechercher dans les citations..."
            className="w-full pl-10 pr-4 py-2.5 rounded-lg border focus:ring-2 focus:ring-indigo-500"
          />
          {loading && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2">
              <div className="animate-spin h-5 w-5 border-2 border-indigo-500 border-t-transparent rounded-full" />
            </div>
          )}
          
          {/* Suggestions dropdown */}
          {showSuggestions && !query && (popularTags.length > 0 || recentSearches.length > 0) && (
            <div className="absolute top-full left-0 right-0 mt-1 bg-white border rounded-lg shadow-lg z-10 p-3">
              {recentSearches.length > 0 && (
                <div className="mb-3">
                  <p className="text-xs text-gray-500 mb-2">🕐 Recherches récentes</p>
                  <div className="flex flex-wrap gap-1">
                    {recentSearches.slice(0, 5).map((search) => (
                      <button
                        key={search}
                        onClick={() => { setQuery(search); setShowSuggestions(false); }}
                        className="text-sm px-2 py-1 bg-gray-100 rounded hover:bg-gray-200"
                      >
                        {search}
                      </button>
                    ))}
                  </div>
                </div>
              )}
              {popularTags.length > 0 && (
                <div>
                  <p className="text-xs text-gray-500 mb-2">🏷️ Tags populaires</p>
                  <div className="flex flex-wrap gap-1">
                    {popularTags.slice(0, 8).map((tag) => (
                      <button
                        key={tag}
                        onClick={() => handleFilterChange('tags', [tag])}
                        className="text-sm px-2 py-1 bg-indigo-50 text-indigo-700 rounded hover:bg-indigo-100"
                      >
                        #{tag}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
        
        <button
          onClick={() => setShowAdvanced(!showAdvanced)}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-lg border ${
            showAdvanced || activeFiltersCount > 0
              ? 'bg-indigo-50 border-indigo-300 text-indigo-700'
              : 'hover:bg-gray-50'
          }`}
        >
          <Filter className="h-5 w-5" />
          Filtres
          {activeFiltersCount > 0 && (
            <span className="bg-indigo-600 text-white text-xs px-2 py-0.5 rounded-full">
              {activeFiltersCount}
            </span>
          )}
        </button>
        
        {activeFiltersCount > 0 && (
          <button
            onClick={clearFilters}
            className="flex items-center gap-2 px-4 py-2.5 rounded-lg text-red-600 hover:bg-red-50"
          >
            <X className="h-5 w-5" />
            Effacer
          </button>
        )}
      </div>
      
      {/* Filtres avancés */}
      {showAdvanced && (
        <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 space-y-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {/* Émission */}
            <div>
              <label className="block text-sm font-medium mb-1">Émission</label>
              <select
                value={filters.emissionId || ''}
                onChange={(e) => handleFilterChange('emissionId', e.target.value)}
                className="w-full rounded-lg border p-2"
              >
                <option value="">Toutes</option>
                {emissions.map((em) => (
                  <option key={em.id} value={em.id}>{em.name}</option>
                ))}
              </select>
            </div>
            
            {/* Type de contenu */}
            <div>
              <label className="block text-sm font-medium mb-1">Type de contenu</label>
              <select
                value={filters.contentType || ''}
                onChange={(e) => handleFilterChange('contentType', e.target.value)}
                className="w-full rounded-lg border p-2"
              >
                <option value="">Tous</option>
                <option value="quote">Citation exacte</option>
                <option value="extract">Extrait écrit</option>
                <option value="key_idea">Idée clé</option>
                <option value="statement">Déclaration</option>
                <option value="fact">Fait</option>
                <option value="opinion">Opinion</option>
                <option value="anecdote">Anecdote</option>
              </select>
            </div>
            
            {/* Catégorie */}
            <div>
              <label className="block text-sm font-medium mb-1">Catégorie</label>
              <select
                value={filters.category || ''}
                onChange={(e) => handleFilterChange('category', e.target.value)}
                className="w-full rounded-lg border p-2"
              >
                <option value="">Toutes</option>
                <option value="politics">Politique</option>
                <option value="economy">Économie</option>
                <option value="culture">Culture</option>
                <option value="sports">Sports</option>
                <option value="science">Science</option>
                <option value="society">Société</option>
                <option value="entertainment">Divertissement</option>
                <option value="other">Autre</option>
              </select>
            </div>
            
            {/* Importance */}
            <div>
              <label className="block text-sm font-medium mb-1">Importance</label>
              <select
                value={filters.importance || ''}
                onChange={(e) => handleFilterChange('importance', e.target.value)}
                className="w-full rounded-lg border p-2"
              >
                <option value="">Toutes</option>
                <option value="high">Haute</option>
                <option value="medium">Moyenne</option>
                <option value="low">Faible</option>
              </select>
            </div>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {/* Intervenant */}
            <div>
              <label className="block text-sm font-medium mb-1">
                <User className="inline-block w-4 h-4 mr-1" />
                Intervenant
              </label>
              <input
                type="text"
                value={filters.authorName || ''}
                onChange={(e) => handleFilterChange('authorName', e.target.value)}
                placeholder="Nom..."
                className="w-full rounded-lg border p-2"
              />
            </div>
            
            {/* Type de segment */}
            <div>
              <label className="block text-sm font-medium mb-1">Type segment</label>
              <select
                value={filters.segmentType || ''}
                onChange={(e) => handleFilterChange('segmentType', e.target.value)}
                className="w-full rounded-lg border p-2"
              >
                <option value="">Tous</option>
                <option value="intro">Intro</option>
                <option value="interview">Interview</option>
                <option value="debate">Débat</option>
                <option value="chronicle">Chronique</option>
                <option value="news">Actualités</option>
                <option value="outro">Outro</option>
              </select>
            </div>
            
            {/* Date de début */}
            <div>
              <label className="block text-sm font-medium mb-1">
                <Calendar className="inline-block w-4 h-4 mr-1" />
                Du
              </label>
              <input
                type="date"
                value={filters.dateFrom || ''}
                onChange={(e) => handleFilterChange('dateFrom', e.target.value)}
                className="w-full rounded-lg border p-2"
              />
            </div>
            
            {/* Date de fin */}
            <div>
              <label className="block text-sm font-medium mb-1">
                <Calendar className="inline-block w-4 h-4 mr-1" />
                Au
              </label>
              <input
                type="date"
                value={filters.dateTo || ''}
                onChange={(e) => handleFilterChange('dateTo', e.target.value)}
                className="w-full rounded-lg border p-2"
              />
            </div>
          </div>
          
          {/* Statut */}
          <div className="flex gap-2">
            <label className="text-sm font-medium">Statut :</label>
            {['draft', 'approved', 'published', 'archived'].map((status) => (
              <button
                key={status}
                onClick={() => handleFilterChange('status', 
                  filters.status === status ? undefined : status
                )}
                className={`px-3 py-1 rounded-full text-sm ${
                  filters.status === status
                    ? 'bg-indigo-600 text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                {status === 'draft' ? 'Brouillon' :
                 status === 'approved' ? 'Approuvé' :
                 status === 'published' ? 'Publié' : 'Archivé'}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
```

---

## 🪝 Hooks React

### Hook de gestion des citations

```typescript
// src/hooks/quotes/useQuotes.ts

import { useState, useCallback, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import {
  searchQuotes,
  createQuote,
  updateQuote,
  deleteQuote,
  getQuotesBySegment,
  getQuotesByShowPlan,
} from '../../api/firebase/quotes';
import { useAuthStore } from '../../store/useAuthStore';
import type { Quote, CreateQuoteData, QuoteSearchFilters } from '../../types/quote';

export const useQuotes = (initialFilters?: QuoteSearchFilters) => {
  const queryClient = useQueryClient();
  const { user } = useAuthStore();
  const [filters, setFilters] = useState<QuoteSearchFilters>(initialFilters || {});
  
  // ═══════════════════════════════════════════════════════════
  // RECHERCHE
  // ═══════════════════════════════════════════════════════════
  
  const {
    data,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ['quotes', filters],
    queryFn: () => searchQuotes(filters),
    staleTime: 30000, // 30 secondes
  });
  
  const quotes = data?.quotes || [];
  const hasMore = data?.hasMore || false;
  const lastDoc = data?.lastDoc;
  
  // Charger plus de résultats
  const loadMore = useCallback(() => {
    if (hasMore && lastDoc) {
      setFilters(prev => ({ ...prev, startAfter: lastDoc }));
    }
  }, [hasMore, lastDoc]);
  
  // ═══════════════════════════════════════════════════════════
  // MUTATIONS
  // ═══════════════════════════════════════════════════════════
  
  const createMutation = useMutation({
    mutationFn: (data: CreateQuoteData) => 
      createQuote(data, user!.id, user!.name),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['quotes'] });
      toast.success('Citation enregistrée');
    },
    onError: (error: Error) => {
      toast.error(`Erreur: ${error.message}`);
    },
  });
  
  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<CreateQuoteData> }) =>
      updateQuote(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['quotes'] });
      toast.success('Citation mise à jour');
    },
    onError: (error: Error) => {
      toast.error(`Erreur: ${error.message}`);
    },
  });
  
  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteQuote(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['quotes'] });
      toast.success('Citation supprimée');
    },
    onError: (error: Error) => {
      toast.error(`Erreur: ${error.message}`);
    },
  });
  
  return {
    // Data
    quotes,
    hasMore,
    isLoading,
    error,
    
    // Filters
    filters,
    setFilters,
    
    // Actions
    refetch,
    loadMore,
    createQuote: createMutation.mutateAsync,
    updateQuote: updateMutation.mutateAsync,
    deleteQuote: deleteMutation.mutateAsync,
    
    // Loading states
    isCreating: createMutation.isPending,
    isUpdating: updateMutation.isPending,
    isDeleting: deleteMutation.isPending,
  };
};

/**
 * Hook pour les citations d'un segment
 */
export const useSegmentQuotes = (segmentId: string | null) => {
  return useQuery({
    queryKey: ['quotes', 'segment', segmentId],
    queryFn: () => segmentId ? getQuotesBySegment(segmentId) : [],
    enabled: !!segmentId,
  });
};

/**
 * Hook pour les citations d'un conducteur
 */
export const useShowPlanQuotes = (showPlanId: string | null) => {
  return useQuery({
    queryKey: ['quotes', 'showplan', showPlanId],
    queryFn: () => showPlanId ? getQuotesByShowPlan(showPlanId) : [],
    enabled: !!showPlanId,
  });
};
```

---

## 📱 Intégration sur la page Conducteur

### Bouton d'ajout de citation sur chaque segment

```tsx
// src/components/showPlans/segments/SegmentCard.tsx (extrait)

import { Quote, ChevronDown, ChevronUp } from 'lucide-react';
import { useState } from 'react';
import { SegmentQuoteForm } from '../../quotes/SegmentQuoteForm';
import { useSegmentQuotes } from '../../../hooks/quotes/useQuotes';

interface SegmentCardProps {
  segment: ShowSegment;
  showPlan: ShowPlan;
  canAddQuote: boolean;
}

export const SegmentCard: React.FC<SegmentCardProps> = ({
  segment,
  showPlan,
  canAddQuote,
}) => {
  const [showQuoteForm, setShowQuoteForm] = useState(false);
  const [showQuotes, setShowQuotes] = useState(false);
  
  const { data: segmentQuotes = [] } = useSegmentQuotes(segment.id);
  const lastQuote = segmentQuotes[segmentQuotes.length - 1];
  
  return (
    <div className="border rounded-lg p-4 hover:border-indigo-200 transition-colors group">
      {/* Header du segment */}
      <div className="flex items-center justify-between">
        <div>
          <span className="font-medium">{segment.title}</span>
          <span className="text-gray-500 ml-2">({segment.duration} min)</span>
        </div>
        
        <div className="flex items-center gap-2">
          {/* Badge nombre de citations - toujours visible si > 0 */}
          {segmentQuotes.length > 0 && (
            <button
              onClick={() => setShowQuotes(!showQuotes)}
              className="flex items-center gap-1 text-sm text-indigo-600 hover:bg-indigo-50 px-2 py-1 rounded"
            >
              <Quote className="h-4 w-4" />
              {segmentQuotes.length}
              {showQuotes ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            </button>
          )}
          
          {/* Bouton ajouter - apparaît au hover ou si pas de citations */}
          {canAddQuote && (
            <button
              onClick={() => setShowQuoteForm(true)}
              className={`flex items-center gap-1 text-sm px-3 py-1.5 rounded-lg transition-opacity
                ${segmentQuotes.length === 0 
                  ? 'bg-indigo-600 text-white hover:bg-indigo-700' 
                  : 'bg-gray-100 text-gray-700 opacity-0 group-hover:opacity-100 hover:bg-gray-200'
                }`}
            >
              <Quote className="h-4 w-4" />
              {segmentQuotes.length === 0 ? 'Ajouter citation' : '+'}
            </button>
          )}
        </div>
      </div>
      
      {/* ═══════════════════════════════════════════════════════════ */}
      {/* APERÇU dernière citation (sans déplier) */}
      {/* ═══════════════════════════════════════════════════════════ */}
      {lastQuote && !showQuotes && (
        <div 
          className="mt-2 text-sm text-gray-600 italic truncate cursor-pointer hover:text-gray-800"
          onClick={() => setShowQuotes(true)}
          title="Cliquer pour voir toutes les citations"
        >
          "{lastQuote.content.substring(0, 80)}..." — {lastQuote.author.name}
        </div>
      )}
      
      {/* Liste des citations du segment */}
      {showQuotes && segmentQuotes.length > 0 && (
        <div className="mt-4 space-y-2 border-t pt-4">
          {segmentQuotes.map((quote) => (
            <div key={quote.id} className="bg-gray-50 rounded-lg p-3">
              <p className="italic">"{quote.content}"</p>
              <p className="text-sm text-gray-500 mt-1">
                — {quote.author.name}
                {quote.timing?.timestamp && ` • ${quote.timing.timestamp}`}
              </p>
            </div>
          ))}
        </div>
      )}
      
      {/* Modal formulaire citation */}
      {showQuoteForm && (
        <Modal onClose={() => setShowQuoteForm(false)}>
          <SegmentQuoteForm
            segment={segment}
            showPlanId={showPlan.id}
            showPlanTitle={showPlan.title}
            emissionId={showPlan.emission_id}
            emissionName={showPlan.emission}
            broadcastDate={showPlan.date}
            guests={showPlan.guests}
            onSubmit={async (data) => {
              await createQuote(data);
              setShowQuoteForm(false);
            }}
            onCancel={() => setShowQuoteForm(false)}
          />
        </Modal>
      )}
    </div>
  );
};
```

---

## 🔥 Index Firestore recommandés

```javascript
// firestore.indexes.json

{
  "indexes": [
    // Recherche par émission + tri
    {
      "collectionGroup": "quotes",
      "queryScope": "COLLECTION",
      "fields": [
        { "fieldPath": "context.emissionId", "order": "ASCENDING" },
        { "fieldPath": "createdAt", "order": "DESCENDING" }
      ]
    },
    // Recherche par conducteur + tri
    {
      "collectionGroup": "quotes",
      "queryScope": "COLLECTION",
      "fields": [
        { "fieldPath": "context.showPlanId", "order": "ASCENDING" },
        { "fieldPath": "createdAt", "order": "ASCENDING" }
      ]
    },
    // Recherche par segment + tri
    {
      "collectionGroup": "quotes",
      "queryScope": "COLLECTION",
      "fields": [
        { "fieldPath": "segment.id", "order": "ASCENDING" },
        { "fieldPath": "createdAt", "order": "ASCENDING" }
      ]
    },
    // Recherche par auteur + tri
    {
      "collectionGroup": "quotes",
      "queryScope": "COLLECTION",
      "fields": [
        { "fieldPath": "author.id", "order": "ASCENDING" },
        { "fieldPath": "createdAt", "order": "DESCENDING" }
      ]
    },
    // Recherche par catégorie + importance + tri
    {
      "collectionGroup": "quotes",
      "queryScope": "COLLECTION",
      "fields": [
        { "fieldPath": "metadata.category", "order": "ASCENDING" },
        { "fieldPath": "metadata.importance", "order": "ASCENDING" },
        { "fieldPath": "createdAt", "order": "DESCENDING" }
      ]
    },
    // Recherche par type de contenu + statut
    {
      "collectionGroup": "quotes",
      "queryScope": "COLLECTION",
      "fields": [
        { "fieldPath": "contentType", "order": "ASCENDING" },
        { "fieldPath": "status", "order": "ASCENDING" },
        { "fieldPath": "createdAt", "order": "DESCENDING" }
      ]
    },
    // Recherche par tags (array-contains)
    {
      "collectionGroup": "quotes",
      "queryScope": "COLLECTION",
      "fields": [
        { "fieldPath": "metadata.tags", "arrayConfig": "CONTAINS" },
        { "fieldPath": "createdAt", "order": "DESCENDING" }
      ]
    }
  ],
  "fieldOverrides": []
}
```

---

## ✅ Checklist d'implémentation

### Phase 1 : Structure de base ✅
- [x] Types TypeScript simplifiés (4 contentTypes, sans publication)
- [x] Service Firebase CRUD complet
- [x] Hook useQuotes avec React Query
- [x] Page de liste des citations (QuotesList)
- [x] Page de détail citation (QuoteDetail)
- [x] Composant QuoteCard avec actions contextuelles

### Phase 2 : Intégration conducteur ✅
- [x] Lien discret vers citations dans ShowPlanDetail (compteur + icône)
- [x] Hook useQuotesByShowPlan optimisé (double requête string/number)
- [x] Filtrage par URL (`/quotes?showPlanId=X`)
- [x] Header contextuel dans QuotesList (affiche "Citations du conducteur X")
- [x] Bouton "Ajouter citation" contextuel sur chaque segment (via SegmentDetailsWithQuotes)
- [ ] Formulaire en **mode rapide** par défaut (2 champs)
- [ ] Mode avancé dépliant pour métadonnées
- [ ] Aperçu dernière citation dans SegmentCard (sans déplier)
- [x] Horodatage optionnel (jamais bloquant)

### Phase 2b : Gestion des statuts ✅
- [x] Changement de statut inline dans QuoteCard
- [x] UI ergonomique dans QuoteDetail (header coloré + boutons contextuels)
- [x] Permissions owner-based (créateur peut modifier son statut)
- [x] Mise à jour temps réel via subscribeToQuote

### Phase 3 : Recherche avancée
- [ ] Composant QuoteSearchBar avec suggestions
- [ ] Tags populaires en raccourcis
- [ ] Recherches récentes de l'utilisateur
- [x] Filtres multiples (émission, auteur, catégorie, dates)
- [ ] Pagination par curseur

### 🔮 Phase 4 : Évolutions futures
- [ ] Publication vers réseaux sociaux
- [ ] Génération d'images avec templates
- [ ] Planification de publications
- [ ] Transcription automatique (si budget)
- [ ] Index Firestore composite pour orderBy optimisé

---

## 🔧 Notes techniques d'implémentation

### Hook useQuotesByShowPlan

Le hook effectue **deux requêtes Firestore parallèles** pour gérer les différences de type de `showPlanId` (string vs number) :

```typescript
// src/hooks/quotes/useQuotesByShowPlan.ts
// Requête avec showPlanId comme string
where('context.showPlanId', '==', showPlanIdStr)
// + Requête avec showPlanId comme number (si applicable)
where('context.showPlanId', '==', showPlanIdNum)
```

Les résultats sont fusionnés et dédupliqués côté client.

> ⚠️ **Note** : Pour activer `orderBy` côté serveur, créer un index composite Firestore sur `context.showPlanId` + `createdAt`.

### Permissions owner-based

Les utilisateurs peuvent modifier le statut de leurs propres citations sans avoir besoin de permissions admin :

```typescript
const isOwner = user?.id === quote.createdBy;
const canChangeStatus = isOwner || hasPermission('quotes_edit');
```

---

## 📚 Ressources

- [docs/modules/quotes.md](../../../docs/modules/quotes.md) - Documentation complète du module
- [docs/QUOTES_SHOWPLAN_INTEGRATION.md](../../../docs/QUOTES_SHOWPLAN_INTEGRATION.md) - Intégration conducteurs
- [api-consumer/routes/quotes.md](../api-consumer/routes/quotes.md) - Routes API

---

## 📝 Métadonnées

- **Version:** 1.0.0
- **Dernière mise à jour:** 2026-02-04
- **Priorité:** Haute
- **Dépendances:** firebase, coding-standards, architecture
- **Modules concernés:** Quotes, ShowPlans, Segments
- **Collections Firebase:** quotes
