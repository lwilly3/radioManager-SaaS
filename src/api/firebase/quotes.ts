// Service Firestore pour les citations
// Version avec intégration segments de conducteurs

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
  QueryConstraint,
} from 'firebase/firestore';
import { db } from './firebase';
import type { Quote, CreateQuoteData, UpdateQuoteData, QuoteFilters, QuoteContentType } from '../../types/quote';

const QUOTES_COLLECTION = 'quotes';

// ════════════════════════════════════════════════════════════════
// HELPERS
// ════════════════════════════════════════════════════════════════

/**
 * Convertit un timestamp Firestore en string ISO
 */
const timestampToString = (timestamp: any): string => {
  if (!timestamp) return new Date().toISOString();
  if (timestamp instanceof Timestamp) {
    return timestamp.toDate().toISOString();
  }
  if (timestamp.toDate) {
    return timestamp.toDate().toISOString();
  }
  return timestamp;
};

/**
 * Extrait les mots-clés du contenu pour recherche
 */
const extractKeywords = (content: string): string[] => {
  const stopWords = ['le', 'la', 'les', 'de', 'du', 'des', 'un', 'une', 'et', 'ou', 'que', 'qui', 'dans', 'sur', 'pour', 'avec', 'sans', 'par', 'est', 'sont', 'être', 'avoir', 'fait', 'cette', 'ces', 'nous', 'vous', 'ils', 'elles'];
  return content
    .toLowerCase()
    .replace(/[^\w\sàâäéèêëïîôùûüç]/g, '')
    .split(/\s+/)
    .filter(word => word.length > 3 && !stopWords.includes(word))
    .slice(0, 20);
};

/**
 * Convertit les données Firestore en Quote typé
 */
const firestoreToQuote = (id: string, data: any): Quote => {
  return {
    id,
    content: data.content,
    contentType: data.contentType || 'quote',
    author: data.author || { name: 'Inconnu', role: 'other' },
    segment: data.segment || undefined,
    context: {
      ...data.context,
      broadcastDate: data.context?.broadcastDate || data.context?.date,
    },
    timing: data.timing || undefined,
    source: data.source || { type: 'manual' },
    metadata: {
      category: data.metadata?.category || 'quote',
      contentType: data.metadata?.contentType || data.contentType,
      tags: data.metadata?.tags || [],
      keywords: data.metadata?.keywords || [],
      language: data.metadata?.language || 'fr',
      importance: data.metadata?.importance || 'medium',
      isVerified: data.metadata?.isVerified || false,
      capturedBy: data.metadata?.capturedBy,
      capturedAt: data.metadata?.capturedAt 
        ? timestampToString(data.metadata.capturedAt) 
        : undefined,
    },
    media: data.media,
    status: data.status || 'draft',
    createdBy: data.createdBy,
    createdByName: data.createdByName || '',
    createdAt: timestampToString(data.createdAt),
    updatedAt: timestampToString(data.updatedAt),
  } as Quote;
};

// ════════════════════════════════════════════════════════════════
// CRUD OPERATIONS
// ════════════════════════════════════════════════════════════════

/**
 * Récupère toutes les citations avec filtres optionnels
 */
export const getQuotes = async (filters?: QuoteFilters): Promise<Quote[]> => {
  try {
    const constraints: QueryConstraint[] = [];

    // Appliquer les filtres Firestore
    if (filters?.status) {
      constraints.push(where('status', '==', filters.status));
    }
    if (filters?.emissionId) {
      constraints.push(where('context.emissionId', '==', filters.emissionId));
    }
    if (filters?.showPlanId) {
      constraints.push(where('context.showPlanId', '==', filters.showPlanId));
    }
    if (filters?.segmentId) {
      constraints.push(where('segment.id', '==', filters.segmentId));
    }
    if (filters?.authorId) {
      constraints.push(where('author.id', '==', filters.authorId));
    }
    if (filters?.contentType) {
      constraints.push(where('contentType', '==', filters.contentType));
    }
    if (filters?.category) {
      constraints.push(where('metadata.category', '==', filters.category));
    }
    if (filters?.importance) {
      constraints.push(where('metadata.importance', '==', filters.importance));
    }
    if (filters?.sourceType) {
      constraints.push(where('source.type', '==', filters.sourceType));
    }

    // Tri
    const orderField = filters?.orderBy || 'createdAt';
    const orderDir = filters?.orderDirection || 'desc';
    constraints.push(orderBy(orderField, orderDir));

    // Limite
    if (filters?.limit) {
      constraints.push(limit(filters.limit));
    }

    const q = query(collection(db, QUOTES_COLLECTION), ...constraints);
    const querySnapshot = await getDocs(q);

    let quotes = querySnapshot.docs.map(doc => 
      firestoreToQuote(doc.id, doc.data())
    );

    // Filtres côté client (non supportés par Firestore)
    if (filters?.query) {
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

    if (filters?.authorName) {
      const searchName = filters.authorName.toLowerCase();
      quotes = quotes.filter(q => 
        q.author.name.toLowerCase().includes(searchName)
      );
    }

    // Filtrage par tags (côté client car Firestore ne supporte pas array-contains-any avec d'autres filtres)
    if (filters?.tags && filters.tags.length > 0) {
      quotes = quotes.filter(quote => {
        const quoteTags = quote.metadata.tags || [];
        return filters.tags!.some(tag => quoteTags.includes(tag));
      });
    }

    // Filtrage par type de segment
    if (filters?.segmentType) {
      quotes = quotes.filter(q => q.segment?.type === filters.segmentType);
    }

    if (filters?.dateFrom || filters?.dateTo) {
      quotes = quotes.filter(quote => {
        const date = quote.context.broadcastDate || quote.createdAt.split('T')[0];
        if (filters.dateFrom && date < filters.dateFrom) return false;
        if (filters.dateTo && date > filters.dateTo) return false;
        return true;
      });
    }

    return quotes;
  } catch (error) {
    console.error('Erreur lors de la récupération des citations:', error);
    throw new Error('Impossible de récupérer les citations');
  }
};

/**
 * Récupère une citation par son ID
 */
export const getQuoteById = async (quoteId: string): Promise<Quote | null> => {
  try {
    const quoteRef = doc(db, QUOTES_COLLECTION, quoteId);
    const quoteSnap = await getDoc(quoteRef);

    if (!quoteSnap.exists()) {
      return null;
    }

    return firestoreToQuote(quoteSnap.id, quoteSnap.data());
  } catch (error) {
    console.error('Erreur lors de la récupération de la citation:', error);
    throw new Error('Impossible de récupérer la citation');
  }
};

/**
 * Écoute une citation unique en temps réel
 */
export const subscribeToQuote = (
  quoteId: string,
  callback: (quote: Quote | null) => void,
  onError?: (error: Error) => void
): (() => void) => {
  const quoteRef = doc(db, QUOTES_COLLECTION, quoteId);
  
  return onSnapshot(
    quoteRef,
    (docSnap) => {
      if (docSnap.exists()) {
        callback(firestoreToQuote(docSnap.id, docSnap.data()));
      } else {
        callback(null);
      }
    },
    (error) => {
      console.error('Erreur écoute citation:', error);
      if (onError) onError(error);
    }
  );
};

/**
 * Écoute les citations en temps réel
 */
export const subscribeToQuotes = (
  callback: (quotes: Quote[]) => void,
  filters?: QuoteFilters
): (() => void) => {
  try {
    const constraints: QueryConstraint[] = [];

    // Appliquer les filtres Firestore (indexés)
    if (filters?.status) {
      constraints.push(where('status', '==', filters.status));
    }
    if (filters?.emissionId) {
      constraints.push(where('context.emissionId', '==', filters.emissionId));
    }
    if (filters?.showPlanId) {
      constraints.push(where('context.showPlanId', '==', filters.showPlanId));
    }
    if (filters?.segmentId) {
      constraints.push(where('segment.id', '==', filters.segmentId));
    }
    if (filters?.contentType) {
      constraints.push(where('contentType', '==', filters.contentType));
    }
    if (filters?.category) {
      constraints.push(where('metadata.category', '==', filters.category));
    }
    if (filters?.importance) {
      constraints.push(where('metadata.importance', '==', filters.importance));
    }

    // Tri par date de création décroissante
    constraints.push(orderBy('createdAt', 'desc'));

    const q = query(collection(db, QUOTES_COLLECTION), ...constraints);

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        let quotes = snapshot.docs.map(doc =>
          firestoreToQuote(doc.id, doc.data())
        );

        // Filtres côté client (non supportés par Firestore avec d'autres filtres)
        if (filters?.query) {
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

        if (filters?.authorName) {
          const searchName = filters.authorName.toLowerCase();
          quotes = quotes.filter(q => 
            q.author.name.toLowerCase().includes(searchName)
          );
        }

        if (filters?.tags && filters.tags.length > 0) {
          quotes = quotes.filter(quote => {
            const quoteTags = quote.metadata.tags || [];
            return filters.tags!.some(tag => quoteTags.includes(tag));
          });
        }

        if (filters?.segmentType) {
          quotes = quotes.filter(q => q.segment?.type === filters.segmentType);
        }

        if (filters?.dateFrom || filters?.dateTo) {
          quotes = quotes.filter(quote => {
            const date = quote.context.broadcastDate || quote.createdAt.split('T')[0];
            if (filters.dateFrom && date < filters.dateFrom) return false;
            if (filters.dateTo && date > filters.dateTo) return false;
            return true;
          });
        }

        callback(quotes);
      },
      (error) => {
        console.error('Erreur temps réel citations:', error);
      }
    );

    return unsubscribe;
  } catch (error) {
    console.error('Erreur lors de la souscription:', error);
    return () => {};
  }
};

/**
 * Crée une nouvelle citation avec liaison segment
 */
export const createQuote = async (
  data: CreateQuoteData,
  userId: string,
  userName?: string
): Promise<string> => {
  try {
    const keywords = extractKeywords(data.content);
    
    const quoteData = {
      content: data.content,
      contentType: data.contentType || 'quote',
      
      author: {
        id: data.authorId || null,
        name: data.authorName,
        role: data.authorRole || 'guest',
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
      
      source: {
        type: data.sourceType || 'manual',
        audioUrl: data.audioUrl || null,
        duration: data.audioDuration || null,
      },
      
      metadata: {
        category: data.category || 'autre',
        contentType: data.contentType || 'quote',
        tags: data.tags || [],
        keywords,
        language: 'fr',
        importance: data.importance || 'medium',
        isVerified: false,
      },
      
      status: 'draft',
      createdBy: userId,
      createdByName: userName || '',
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };

    const quoteRef = await addDoc(collection(db, QUOTES_COLLECTION), quoteData);
    return quoteRef.id;
  } catch (error) {
    console.error('Erreur lors de la création de la citation:', error);
    throw new Error('Impossible de créer la citation');
  }
};

/**
 * Met à jour une citation existante
 */
export const updateQuote = async (
  quoteId: string,
  data: UpdateQuoteData
): Promise<void> => {
  try {
    const quoteRef = doc(db, QUOTES_COLLECTION, quoteId);
    
    const updateData: any = {
      updatedAt: serverTimestamp(),
    };

    // Mise à jour du contenu et mots-clés
    if (data.content) {
      updateData.content = data.content;
      updateData['metadata.keywords'] = extractKeywords(data.content);
    }

    // Mise à jour du type de contenu
    if (data.contentType) {
      updateData.contentType = data.contentType;
      updateData['metadata.contentType'] = data.contentType;
    }

    // Mise à jour de l'auteur
    if (data.author) {
      updateData.author = data.author;
    }

    // Mise à jour du segment
    if (data.segment) {
      updateData.segment = data.segment;
    }

    // Mise à jour du contexte
    if (data.context) {
      updateData.context = data.context;
    }

    // Mise à jour du timing
    if (data.timing) {
      updateData.timing = data.timing;
    }

    // Mise à jour des métadonnées
    if (data.metadata) {
      if (data.metadata.category) updateData['metadata.category'] = data.metadata.category;
      if (data.metadata.tags) updateData['metadata.tags'] = data.metadata.tags;
      if (data.metadata.importance) updateData['metadata.importance'] = data.metadata.importance;
    }

    // Mise à jour du statut
    if (data.status) {
      updateData.status = data.status;
    }

    await updateDoc(quoteRef, updateData);
  } catch (error) {
    console.error('Erreur lors de la mise à jour de la citation:', error);
    throw new Error('Impossible de mettre à jour la citation');
  }
};

/**
 * Supprime une citation
 */
export const deleteQuote = async (quoteId: string): Promise<void> => {
  try {
    const quoteRef = doc(db, QUOTES_COLLECTION, quoteId);
    await deleteDoc(quoteRef);
  } catch (error) {
    console.error('Erreur lors de la suppression de la citation:', error);
    throw new Error('Impossible de supprimer la citation');
  }
};

// ════════════════════════════════════════════════════════════════
// FONCTIONS SPÉCIFIQUES SEGMENTS
// ════════════════════════════════════════════════════════════════

/**
 * Récupère les citations d'un segment spécifique
 * Gère les différences de type (string vs number) pour segment.id
 */
export const getQuotesBySegment = async (segmentId: string): Promise<Quote[]> => {
  try {
    const segmentIdStr = segmentId.toString();
    const segmentIdNum = !isNaN(Number(segmentId)) ? Number(segmentId) : null;
    
    console.log('[getQuotesBySegment] Recherche segment:', { segmentIdStr, segmentIdNum });
    
    // Requête avec string
    const qStr = query(
      collection(db, QUOTES_COLLECTION),
      where('segment.id', '==', segmentIdStr)
    );
    
    const snapshotStr = await getDocs(qStr);
    const quotesFromStr = snapshotStr.docs.map(doc => firestoreToQuote(doc.id, doc.data()));
    
    // Requête avec number si applicable
    let quotesFromNum: Quote[] = [];
    if (segmentIdNum !== null) {
      const qNum = query(
        collection(db, QUOTES_COLLECTION),
        where('segment.id', '==', segmentIdNum)
      );
      const snapshotNum = await getDocs(qNum);
      quotesFromNum = snapshotNum.docs.map(doc => firestoreToQuote(doc.id, doc.data()));
    }
    
    // Fusionner et dédupliquer
    const quotesMap = new Map<string, Quote>();
    [...quotesFromStr, ...quotesFromNum].forEach(q => quotesMap.set(q.id, q));
    
    const allQuotes = Array.from(quotesMap.values());
    // Trier par date de création
    allQuotes.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
    
    console.log('[getQuotesBySegment] Trouvées:', { fromStr: quotesFromStr.length, fromNum: quotesFromNum.length, total: allQuotes.length });
    
    return allQuotes;
  } catch (error) {
    console.error('Erreur récupération citations segment:', error);
    return [];
  }
};

/**
 * Récupère les citations d'un conducteur
 */
export const getQuotesByShowPlan = async (showPlanId: string): Promise<Quote[]> => {
  try {
    const q = query(
      collection(db, QUOTES_COLLECTION),
      where('context.showPlanId', '==', showPlanId),
      orderBy('createdAt', 'asc')
    );
    
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => firestoreToQuote(doc.id, doc.data()));
  } catch (error) {
    console.error('Erreur récupération citations conducteur:', error);
    return [];
  }
};

/**
 * Récupère les citations d'un intervenant
 */
export const getQuotesByAuthor = async (authorId: string): Promise<Quote[]> => {
  try {
    const q = query(
      collection(db, QUOTES_COLLECTION),
      where('author.id', '==', authorId),
      orderBy('createdAt', 'desc')
    );
    
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => firestoreToQuote(doc.id, doc.data()));
  } catch (error) {
    console.error('Erreur récupération citations auteur:', error);
    return [];
  }
};

// ════════════════════════════════════════════════════════════════
// LISTENERS TEMPS RÉEL
// ════════════════════════════════════════════════════════════════

/**
 * S'abonne aux citations d'un conducteur en temps réel
 */
export const subscribeToShowPlanQuotes = (
  showPlanId: string,
  callback: (quotes: Quote[]) => void
): (() => void) => {
  try {
    const q = query(
      collection(db, QUOTES_COLLECTION),
      where('context.showPlanId', '==', showPlanId),
      orderBy('createdAt', 'asc')
    );
    
    return onSnapshot(q, (snapshot) => {
      const quotes = snapshot.docs.map(doc => firestoreToQuote(doc.id, doc.data()));
      callback(quotes);
    });
  } catch (error) {
    console.error('Erreur souscription citations conducteur:', error);
    return () => {};
  }
};

/**
 * Compte le nombre de citations avec filtres
 */
export const countQuotes = async (filters?: QuoteFilters): Promise<number> => {
  try {
    const quotes = await getQuotes(filters);
    return quotes.length;
  } catch (error) {
    console.error('Erreur lors du comptage des citations:', error);
    return 0;
  }
};

/**
 * Compte les citations par segment (pour afficher le badge)
 */
export const countQuotesBySegment = async (segmentId: string): Promise<number> => {
  try {
    const quotes = await getQuotesBySegment(segmentId);
    return quotes.length;
  } catch (error) {
    console.error('Erreur comptage citations segment:', error);
    return 0;
  }
};

/**
 * Récupère les tags populaires
 */
export const getPopularTags = async (limitCount: number = 10): Promise<string[]> => {
  try {
    const q = query(
      collection(db, QUOTES_COLLECTION),
      orderBy('createdAt', 'desc'),
      limit(100)
    );
    
    const snapshot = await getDocs(q);
    const tagCounts: Record<string, number> = {};
    
    snapshot.docs.forEach(doc => {
      const tags = doc.data().metadata?.tags || [];
      tags.forEach((tag: string) => {
        tagCounts[tag] = (tagCounts[tag] || 0) + 1;
      });
    });
    
    return Object.entries(tagCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, limitCount)
      .map(([tag]) => tag);
  } catch (error) {
    console.error('Erreur récupération tags populaires:', error);
    return [];
  }
};
