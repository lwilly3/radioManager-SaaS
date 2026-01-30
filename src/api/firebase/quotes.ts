// Service Firestore pour les citations
// Version MVP - Fonctionnalités de base

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
  onSnapshot,
  serverTimestamp,
  Timestamp,
  QueryConstraint,
} from 'firebase/firestore';
import { db } from './firebase';
import type { Quote, CreateQuoteData, UpdateQuoteData, QuoteFilters } from '../../types/quote';

const QUOTES_COLLECTION = 'quotes';

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
 * Convertit les données Firestore en Quote typé
 */
const firestoreToQuote = (id: string, data: any): Quote => {
  return {
    ...data,
    id,
    createdAt: timestampToString(data.createdAt),
    updatedAt: timestampToString(data.updatedAt),
    context: {
      ...data.context,
      date: timestampToString(data.context?.date),
    },
    metadata: {
      ...data.metadata,
      capturedAt: data.metadata?.capturedAt 
        ? timestampToString(data.metadata.capturedAt) 
        : undefined,
    },
  } as Quote;
};

/**
 * Récupère toutes les citations avec filtres optionnels
 */
export const getQuotes = async (filters?: QuoteFilters): Promise<Quote[]> => {
  try {
    const constraints: QueryConstraint[] = [];

    // Appliquer les filtres
    if (filters?.status) {
      constraints.push(where('status', '==', filters.status));
    }
    if (filters?.emissionId) {
      constraints.push(where('context.emissionId', '==', filters.emissionId));
    }
    if (filters?.authorId) {
      constraints.push(where('author.id', '==', filters.authorId));
    }
    if (filters?.sourceType) {
      constraints.push(where('source.type', '==', filters.sourceType));
    }
    if (filters?.category) {
      constraints.push(where('metadata.category', '==', filters.category));
    }

    // Tri par date de création décroissante
    constraints.push(orderBy('createdAt', 'desc'));

    const q = query(collection(db, QUOTES_COLLECTION), ...constraints);
    const querySnapshot = await getDocs(q);

    return querySnapshot.docs.map(doc => 
      firestoreToQuote(doc.id, doc.data())
    );
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
 * Écoute les citations en temps réel
 */
export const subscribeToQuotes = (
  callback: (quotes: Quote[]) => void,
  filters?: QuoteFilters
): (() => void) => {
  try {
    const constraints: QueryConstraint[] = [];

    // Appliquer les filtres
    if (filters?.status) {
      constraints.push(where('status', '==', filters.status));
    }
    if (filters?.emissionId) {
      constraints.push(where('context.emissionId', '==', filters.emissionId));
    }

    // Tri par date de création décroissante
    constraints.push(orderBy('createdAt', 'desc'));

    const q = query(collection(db, QUOTES_COLLECTION), ...constraints);

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const quotes = snapshot.docs.map(doc =>
          firestoreToQuote(doc.id, doc.data())
        );
        callback(quotes);
      },
      (error) => {
        console.error('Erreur temps réel citations:', error);
      }
    );

    return unsubscribe;
  } catch (error) {
    console.error('Erreur lors de la souscription:', error);
    return () => {}; // Retourner une fonction vide en cas d'erreur
  }
};

/**
 * Crée une nouvelle citation
 */
export const createQuote = async (
  data: CreateQuoteData,
  userId: string
): Promise<string> => {
  try {
    const quoteRef = await addDoc(collection(db, QUOTES_COLLECTION), {
      ...data,
      publications: [],
      status: 'draft',
      createdBy: userId,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });

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
    await updateDoc(quoteRef, {
      ...data,
      updatedAt: serverTimestamp(),
    });
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
