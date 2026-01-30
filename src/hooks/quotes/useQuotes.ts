// Hook pour gérer les citations
// Version MVP - Fonctionnalités de base

import { useState, useEffect } from 'react';
import {
  subscribeToQuotes,
  createQuote,
  updateQuote,
  deleteQuote,
  getQuoteById,
} from '../../api/firebase/quotes';
import type { Quote, CreateQuoteData, UpdateQuoteData, QuoteFilters } from '../../types/quote';
import { useAuthStore } from '../../store/useAuthStore';

interface UseQuotesReturn {
  quotes: Quote[];
  isLoading: boolean;
  error: string | null;
  create: (data: CreateQuoteData) => Promise<string>;
  update: (quoteId: string, data: UpdateQuoteData) => Promise<void>;
  remove: (quoteId: string) => Promise<void>;
  refresh: () => void;
}

/**
 * Hook principal pour gérer les citations
 * @param filters - Filtres optionnels pour la liste
 * @param realTime - Active l'écoute en temps réel (défaut: true)
 */
export const useQuotes = (
  filters?: QuoteFilters,
  realTime: boolean = true
): UseQuotesReturn => {
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  
  const { user } = useAuthStore();

  // Écoute temps réel ou récupération unique
  useEffect(() => {
    if (!realTime) {
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    const unsubscribe = subscribeToQuotes(
      (updatedQuotes) => {
        setQuotes(updatedQuotes);
        setIsLoading(false);
      },
      filters
    );

    return () => {
      unsubscribe();
    };
  }, [filters?.status, filters?.emissionId, filters?.category, realTime, refreshTrigger]);

  // Créer une citation
  const create = async (data: CreateQuoteData): Promise<string> => {
    try {
      if (!user?.id) {
        throw new Error('Utilisateur non authentifié');
      }

      const quoteId = await createQuote(data, user.id);
      return quoteId;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur lors de la création';
      setError(errorMessage);
      throw err;
    }
  };

  // Mettre à jour une citation
  const update = async (quoteId: string, data: UpdateQuoteData): Promise<void> => {
    try {
      await updateQuote(quoteId, data);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur lors de la mise à jour';
      setError(errorMessage);
      throw err;
    }
  };

  // Supprimer une citation
  const remove = async (quoteId: string): Promise<void> => {
    try {
      await deleteQuote(quoteId);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur lors de la suppression';
      setError(errorMessage);
      throw err;
    }
  };

  // Forcer le rafraîchissement
  const refresh = () => {
    setRefreshTrigger(prev => prev + 1);
  };

  return {
    quotes,
    isLoading,
    error,
    create,
    update,
    remove,
    refresh,
  };
};

/**
 * Hook pour récupérer une seule citation par ID
 */
export const useQuote = (quoteId: string | undefined) => {
  const [quote, setQuote] = useState<Quote | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!quoteId) {
      setQuote(null);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    getQuoteById(quoteId)
      .then(fetchedQuote => {
        setQuote(fetchedQuote);
        setIsLoading(false);
      })
      .catch(err => {
        setError(err instanceof Error ? err.message : 'Erreur de chargement');
        setIsLoading(false);
      });
  }, [quoteId]);

  return { quote, isLoading, error };
};
