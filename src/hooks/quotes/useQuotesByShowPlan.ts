// Hook pour récupérer les citations d'un conducteur spécifique
// Optimisé pour les performances avec requête Firestore directe

import { useState, useEffect } from 'react';
import { collection, query, where, onSnapshot, Unsubscribe } from 'firebase/firestore';
import { db } from '../../api/firebase/firebase';
import type { Quote } from '../../types/quote';

const QUOTES_COLLECTION = 'quotes';

// Convertir un document Firestore en Quote
const firestoreToQuote = (id: string, data: any): Quote => {
  return {
    id,
    content: data.content || '',
    contentType: data.contentType || 'quote',
    author: data.author || { id: '', name: 'Inconnu', role: 'other' },
    segment: data.segment || undefined,
    context: {
      showPlanId: data.context?.showPlanId || null,
      showPlanTitle: data.context?.showPlanTitle || null,
      emissionId: data.context?.emissionId || null,
      emissionName: data.context?.emissionName || null,
      broadcastDate: data.context?.broadcastDate || null,
    },
    timing: data.timing || undefined,
    source: data.source || { type: 'manual' },
    metadata: {
      category: data.metadata?.category || 'autre',
      contentType: data.metadata?.contentType || 'quote',
      tags: data.metadata?.tags || [],
      keywords: data.metadata?.keywords || [],
      language: data.metadata?.language || 'fr',
      importance: data.metadata?.importance || 'medium',
      isVerified: data.metadata?.isVerified || false,
    },
    status: data.status || 'draft',
    createdBy: data.createdBy || '',
    createdByName: data.createdByName || '',
    createdAt: data.createdAt?.toDate?.()?.toISOString() || new Date().toISOString(),
    updatedAt: data.updatedAt?.toDate?.()?.toISOString() || new Date().toISOString(),
  };
};

interface UseQuotesByShowPlanReturn {
  quotes: Quote[];
  isLoading: boolean;
  error: string | null;
  count: number;
}

/**
 * Hook pour récupérer les citations d'un conducteur spécifique
 * Effectue une requête Firestore optimisée avec écoute temps réel
 * 
 * @param showPlanId - L'ID du conducteur (string ou number)
 */
export const useQuotesByShowPlan = (
  showPlanId: string | number | undefined | null
): UseQuotesByShowPlanReturn => {
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    console.log('[useQuotesByShowPlan] Hook appelé avec showPlanId:', showPlanId);
    
    if (!showPlanId) {
      console.log('[useQuotesByShowPlan] Pas de showPlanId, retour vide');
      setQuotes([]);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    // Préparer les deux formats pour les requêtes
    const showPlanIdStr = showPlanId.toString();
    const showPlanIdNum = !isNaN(Number(showPlanId)) ? Number(showPlanId) : null;

    console.log('[useQuotesByShowPlan] Recherche avec:', { showPlanIdStr, showPlanIdNum });

    // Stocker les résultats de chaque requête séparément
    let quotesFromStr: Quote[] = [];
    let quotesFromNum: Quote[] = [];
    let strLoaded = false;
    let numLoaded = showPlanIdNum === null; // Si pas de requête num, considérer comme chargée

    const mergeAndUpdate = () => {
      if (!strLoaded || !numLoaded) {
        console.log('[useQuotesByShowPlan] En attente:', { strLoaded, numLoaded });
        return;
      }
      
      // Fusionner et dédupliquer par ID
      const quotesMap = new Map<string, Quote>();
      [...quotesFromStr, ...quotesFromNum].forEach(q => quotesMap.set(q.id, q));
      
      const allQuotes = Array.from(quotesMap.values());
      // Trier par date de création décroissante
      allQuotes.sort((a, b) => 
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
      
      console.log('[useQuotesByShowPlan] Résultat final:', {
        fromStr: quotesFromStr.length,
        fromNum: quotesFromNum.length,
        total: allQuotes.length
      });
      
      setQuotes(allQuotes);
      setIsLoading(false);
    };

    const unsubscribes: Unsubscribe[] = [];

    // Requête 1: showPlanId comme string (sans orderBy pour éviter besoin d'index composite)
    const queryStr = query(
      collection(db, QUOTES_COLLECTION),
      where('context.showPlanId', '==', showPlanIdStr)
    );

    const unsubStr = onSnapshot(
      queryStr,
      (snapshot) => {
        console.log('[useQuotesByShowPlan] Requête STRING reçue:', snapshot.docs.length, 'docs');
        quotesFromStr = snapshot.docs.map(doc => firestoreToQuote(doc.id, doc.data()));
        strLoaded = true;
        mergeAndUpdate();
      },
      (err) => {
        console.error('[useQuotesByShowPlan] Erreur requête string:', err);
        strLoaded = true;
        mergeAndUpdate();
      }
    );
    unsubscribes.push(unsubStr);

    // Requête 2: showPlanId comme number (si applicable)
    if (showPlanIdNum !== null) {
      const queryNum = query(
        collection(db, QUOTES_COLLECTION),
        where('context.showPlanId', '==', showPlanIdNum)
      );

      const unsubNum = onSnapshot(
        queryNum,
        (snapshot) => {
          console.log('[useQuotesByShowPlan] Requête NUMBER reçue:', snapshot.docs.length, 'docs');
          quotesFromNum = snapshot.docs.map(doc => firestoreToQuote(doc.id, doc.data()));
          numLoaded = true;
          mergeAndUpdate();
        },
        (err) => {
          console.error('[useQuotesByShowPlan] Erreur requête number:', err);
          numLoaded = true;
          mergeAndUpdate();
        }
      );
      unsubscribes.push(unsubNum);
    }

    return () => {
      unsubscribes.forEach(unsub => unsub());
    };
  }, [showPlanId]);

  return {
    quotes,
    isLoading,
    error,
    count: quotes.length,
  };
};

export default useQuotesByShowPlan;
