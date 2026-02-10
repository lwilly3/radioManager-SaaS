// Hook pour la gestion des mouvements d'équipement

import { useState, useEffect, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getMovements,
  createMovement,
  approveMovement,
  rejectMovement,
  subscribeToEquipmentMovements,
} from '../../api/firebase/inventory';
import type { 
  EquipmentMovement, 
  CreateMovementData,
  MovementSearchCriteria,
} from '../../types/inventory';
import { useAuthStore } from '../../store/useAuthStore';

const QUERY_KEY = 'equipment-movements';

/**
 * Hook pour récupérer les mouvements avec filtres
 */
export const useMovements = (filters?: MovementSearchCriteria) => {
  return useQuery({
    queryKey: [QUERY_KEY, 'list', filters],
    queryFn: () => getMovements(filters),
    staleTime: 1000 * 60 * 5,
  });
};

/**
 * Hook pour récupérer les mouvements d'un équipement spécifique avec temps réel
 */
export const useEquipmentMovements = (equipmentId: string | undefined) => {
  const [movements, setMovements] = useState<EquipmentMovement[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!equipmentId) {
      setMovements([]);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    const unsubscribe = subscribeToEquipmentMovements(
      equipmentId,
      (loadedMovements) => {
        setMovements(loadedMovements);
        setIsLoading(false);
        setError(null);
      },
      (err) => {
        console.error('Erreur mouvements équipement:', err);
        setError(err);
        setIsLoading(false);
      }
    );

    return () => unsubscribe();
  }, [equipmentId]);

  return { movements, isLoading, error };
};

/**
 * Hook pour créer un mouvement
 */
export const useCreateMovement = () => {
  const queryClient = useQueryClient();
  const user = useAuthStore((state) => state.user);

  return useMutation({
    mutationFn: async (data: CreateMovementData) => {
      if (!user?.id || !user?.name) {
        throw new Error('Utilisateur non connecté');
      }
      return createMovement(data, user.id, user.name);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
      queryClient.invalidateQueries({ queryKey: ['equipment', 'detail', variables.equipmentId] });
      queryClient.invalidateQueries({ queryKey: ['equipment', 'list'] });
    },
    onError: (error) => {
      console.error('Erreur création mouvement:', error);
    },
  });
};

/**
 * Hook pour approuver un mouvement
 */
export const useApproveMovement = () => {
  const queryClient = useQueryClient();
  const user = useAuthStore((state) => state.user);

  return useMutation({
    mutationFn: async (movementId: string) => {
      if (!user?.id || !user?.name) {
        throw new Error('Utilisateur non connecté');
      }
      return approveMovement(movementId, user.id, user.name);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
      queryClient.invalidateQueries({ queryKey: ['equipment'] });
    },
    onError: (error) => {
      console.error('Erreur approbation mouvement:', error);
    },
  });
};

/**
 * Hook pour rejeter un mouvement
 */
export const useRejectMovement = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ movementId, reason }: { movementId: string; reason: string }) => {
      const user = useAuthStore.getState().user;
      if (!user?.id) {
        throw new Error('Utilisateur non connecté');
      }
      return rejectMovement(movementId, reason, user.id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
    },
    onError: (error) => {
      console.error('Erreur rejet mouvement:', error);
    },
  });
};

/**
 * Hook pour les mouvements en attente d'approbation
 */
export const usePendingMovements = () => {
  return useMovements({
    status: ['pending'],
    orderDirection: 'asc',
  });
};

/**
 * Hook combiné pour l'historique des mouvements avec filtres
 */
export const useMovementHistory = (initialFilters?: MovementSearchCriteria) => {
  const [filters, setFilters] = useState<MovementSearchCriteria>(initialFilters || {
    orderDirection: 'desc',
    limit: 50,
  });

  const { data: movements, isLoading, error, refetch } = useMovements(filters);

  const updateFilters = useCallback((newFilters: Partial<MovementSearchCriteria>) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
  }, []);

  const resetFilters = useCallback(() => {
    setFilters({
      orderDirection: 'desc',
      limit: 50,
    });
  }, []);

  return {
    movements: movements || [],
    isLoading,
    error,
    refetch,
    filters,
    updateFilters,
    resetFilters,
  };
};
