// Hooks pour les citations liées aux segments
// Optimisé avec React Query pour le caching

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getQuotesBySegment,
  getQuotesByShowPlan,
  createQuote,
  updateQuote,
  deleteQuote,
  getPopularTags,
} from '../../api/firebase/quotes';
import { useAuthStore } from '../../store/useAuthStore';
import type { Quote, CreateQuoteData, UpdateQuoteData } from '../../types/quote';

// ════════════════════════════════════════════════════════════════
// HOOKS SEGMENT
// ════════════════════════════════════════════════════════════════

/**
 * Hook pour les citations d'un segment spécifique
 */
export const useSegmentQuotes = (segmentId: string | null) => {
  return useQuery({
    queryKey: ['quotes', 'segment', segmentId],
    queryFn: () => segmentId ? getQuotesBySegment(segmentId) : Promise.resolve([]),
    enabled: !!segmentId,
    staleTime: 30000, // 30 secondes
  });
};

/**
 * Hook pour les citations d'un conducteur complet
 */
export const useShowPlanQuotes = (showPlanId: string | null) => {
  return useQuery({
    queryKey: ['quotes', 'showplan', showPlanId],
    queryFn: () => showPlanId ? getQuotesByShowPlan(showPlanId) : Promise.resolve([]),
    enabled: !!showPlanId,
    staleTime: 30000,
  });
};

/**
 * Hook pour les tags populaires
 */
export const usePopularTags = (limit: number = 10) => {
  return useQuery({
    queryKey: ['quotes', 'popularTags', limit],
    queryFn: () => getPopularTags(limit),
    staleTime: 60000, // 1 minute
  });
};

// ════════════════════════════════════════════════════════════════
// MUTATIONS
// ════════════════════════════════════════════════════════════════

/**
 * Hook pour créer une citation sur un segment
 */
export const useCreateSegmentQuote = () => {
  const queryClient = useQueryClient();
  const { user } = useAuthStore();

  return useMutation({
    mutationFn: async (data: CreateQuoteData) => {
      if (!user?.id) {
        throw new Error('Utilisateur non authentifié');
      }
      return createQuote(data, user.id, user.name);
    },
    onSuccess: (_, variables) => {
      // Invalider les caches liés
      queryClient.invalidateQueries({ queryKey: ['quotes'] });
      if (variables.segmentId) {
        queryClient.invalidateQueries({ queryKey: ['quotes', 'segment', variables.segmentId] });
      }
      if (variables.showPlanId) {
        queryClient.invalidateQueries({ queryKey: ['quotes', 'showplan', variables.showPlanId] });
      }
      console.log('Citation enregistrée avec succès');
    },
    onError: (error: Error) => {
      console.error(`Erreur création citation: ${error.message}`);
    },
  });
};

/**
 * Hook pour mettre à jour une citation
 */
export const useUpdateQuote = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: UpdateQuoteData }) => {
      return updateQuote(id, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['quotes'] });
      console.log('Citation mise à jour avec succès');
    },
    onError: (error: Error) => {
      console.error(`Erreur mise à jour citation: ${error.message}`);
    },
  });
};

/**
 * Hook pour supprimer une citation
 */
export const useDeleteQuote = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (quoteId: string) => {
      return deleteQuote(quoteId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['quotes'] });
      console.log('Citation supprimée avec succès');
    },
    onError: (error: Error) => {
      console.error(`Erreur suppression citation: ${error.message}`);
    },
  });
};

// ════════════════════════════════════════════════════════════════
// HELPER HOOKS
// ════════════════════════════════════════════════════════════════

/**
 * Hook combiné pour les citations d'un segment avec mutations
 */
export const useSegmentQuotesManager = (segmentId: string | null) => {
  const quotesQuery = useSegmentQuotes(segmentId);
  const createMutation = useCreateSegmentQuote();
  const updateMutation = useUpdateQuote();
  const deleteMutation = useDeleteQuote();

  return {
    // Data
    quotes: quotesQuery.data || [],
    isLoading: quotesQuery.isLoading,
    error: quotesQuery.error,
    
    // Actions
    createQuote: createMutation.mutateAsync,
    updateQuote: (id: string, data: UpdateQuoteData) => 
      updateMutation.mutateAsync({ id, data }),
    deleteQuote: deleteMutation.mutateAsync,
    refetch: quotesQuery.refetch,
    
    // Loading states
    isCreating: createMutation.isPending,
    isUpdating: updateMutation.isPending,
    isDeleting: deleteMutation.isPending,
  };
};

/**
 * Récupère la dernière citation d'un segment
 */
export const useLastSegmentQuote = (segmentId: string | null): Quote | undefined => {
  const { data: quotes = [] } = useSegmentQuotes(segmentId);
  return quotes[quotes.length - 1];
};

/**
 * Compte le nombre de citations d'un segment
 */
export const useSegmentQuotesCount = (segmentId: string | null): number => {
  const { data: quotes = [] } = useSegmentQuotes(segmentId);
  return quotes.length;
};
