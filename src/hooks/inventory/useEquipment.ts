// Hook pour la gestion des équipements

import { useState, useEffect, useCallback, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getEquipments,
  getEquipmentById,
  createEquipment,
  updateEquipment,
  archiveEquipment,
  restoreEquipment,
  deleteEquipment,
  subscribeToEquipments,
  getInventoryStats,
  getNextReference,
} from '../../api/firebase/inventory';
import type { 
  Equipment, 
  CreateEquipmentData, 
  UpdateEquipmentData,
  InventorySearchCriteria,
} from '../../types/inventory';
import { useAuthStore } from '../../store/useAuthStore';

const QUERY_KEY = 'equipment';

/**
 * Hook pour récupérer la liste des équipements avec filtres
 */
export const useEquipments = (filters?: InventorySearchCriteria) => {
  const [realtimeEquipments, setRealtimeEquipments] = useState<Equipment[]>([]);
  const [isRealtime, setIsRealtime] = useState(false);
  
  // Query initiale
  const query = useQuery({
    queryKey: [QUERY_KEY, 'list', filters],
    queryFn: () => getEquipments(filters),
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  // Subscription temps réel (optionnelle)
  useEffect(() => {
    if (!isRealtime) return;

    const unsubscribe = subscribeToEquipments(
      (equipments) => {
        setRealtimeEquipments(equipments);
      },
      filters,
      (error) => {
        console.error('Erreur temps réel équipements:', error);
      }
    );

    return () => unsubscribe();
  }, [isRealtime, filters]);

  const enableRealtime = useCallback(() => setIsRealtime(true), []);
  const disableRealtime = useCallback(() => setIsRealtime(false), []);

  // Utilise les données temps réel si disponibles, sinon les données de la query
  const equipments = isRealtime && realtimeEquipments.length > 0 
    ? realtimeEquipments 
    : query.data || [];

  return {
    equipments,
    isLoading: query.isLoading,
    error: query.error,
    refetch: query.refetch,
    enableRealtime,
    disableRealtime,
    isRealtime,
  };
};

/**
 * Hook pour récupérer un équipement par ID
 */
export const useEquipment = (id: string | undefined) => {
  return useQuery({
    queryKey: [QUERY_KEY, 'detail', id],
    queryFn: () => id ? getEquipmentById(id) : null,
    enabled: !!id,
    staleTime: 1000 * 60 * 5,
  });
};

/**
 * Hook pour générer la prochaine référence automatiquement
 */
export const useNextReference = () => {
  return useMutation({
    mutationFn: () => getNextReference(),
  });
};

/**
 * Hook pour créer un équipement
 */
export const useCreateEquipment = () => {
  const queryClient = useQueryClient();
  const user = useAuthStore((state) => state.user);

  return useMutation({
    mutationFn: async (data: CreateEquipmentData) => {
      if (!user?.id || !user?.name) {
        throw new Error('Utilisateur non connecté');
      }
      return createEquipment(data, user.id, user.name);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
    },
    onError: (error) => {
      console.error('Erreur création équipement:', error);
    },
  });
};

/**
 * Hook pour mettre à jour un équipement
 */
export const useUpdateEquipment = () => {
  const queryClient = useQueryClient();
  const user = useAuthStore((state) => state.user);

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: UpdateEquipmentData }) => {
      if (!user?.id) {
        throw new Error('Utilisateur non connecté');
      }
      return updateEquipment(id, data, user.id);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY, 'detail', variables.id] });
    },
    onError: (error) => {
      console.error('Erreur mise à jour équipement:', error);
    },
  });
};

/**
 * Hook pour archiver un équipement
 */
export const useArchiveEquipment = () => {
  const queryClient = useQueryClient();
  const user = useAuthStore((state) => state.user);

  return useMutation({
    mutationFn: async ({ id, reason }: { id: string; reason: string }) => {
      if (!user?.id) {
        throw new Error('Utilisateur non connecté');
      }
      return archiveEquipment(id, reason, user.id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
    },
    onError: (error) => {
      console.error('Erreur archivage équipement:', error);
    },
  });
};

/**
 * Hook pour restaurer un équipement
 */
export const useRestoreEquipment = () => {
  const queryClient = useQueryClient();
  const user = useAuthStore((state) => state.user);

  return useMutation({
    mutationFn: async (id: string) => {
      if (!user?.id) {
        throw new Error('Utilisateur non connecté');
      }
      return restoreEquipment(id, user.id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
    },
    onError: (error) => {
      console.error('Erreur restauration équipement:', error);
    },
  });
};

/**
 * Hook pour supprimer définitivement un équipement
 */
export const useDeleteEquipment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deleteEquipment(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
    },
    onError: (error) => {
      console.error('Erreur suppression équipement:', error);
    },
  });
};

/**
 * Hook pour les statistiques d'inventaire
 */
export const useInventoryStats = (companyId?: string) => {
  return useQuery({
    queryKey: [QUERY_KEY, 'stats', companyId],
    queryFn: () => getInventoryStats(companyId),
    staleTime: 1000 * 60 * 2, // 2 minutes
  });
};

/**
 * Hook combiné pour la page liste avec filtres et recherche
 */
export const useEquipmentList = () => {
  const [filters, setFilters] = useState<InventorySearchCriteria>({
    isArchived: false,
    orderBy: 'createdAt',
    orderDirection: 'desc',
  });
  const [searchQuery, setSearchQuery] = useState('');

  const { equipments, isLoading, error, refetch } = useEquipments(filters);

  // Filtrage local par recherche
  const filteredEquipments = useMemo(() => {
    if (!searchQuery.trim()) return equipments;

    const terms = searchQuery.toLowerCase().split(/\s+/);
    return equipments.filter(eq => {
      const searchableText = [
        eq.name,
        eq.reference,
        eq.serialNumber,
        eq.brand,
        eq.model,
        eq.categoryName,
        eq.currentLocation.siteName,
        eq.currentLocation.roomName,
        eq.currentAssignment?.userName,
      ].filter(Boolean).join(' ').toLowerCase();

      return terms.every(term => searchableText.includes(term));
    });
  }, [equipments, searchQuery]);

  const updateFilters = useCallback((newFilters: Partial<InventorySearchCriteria>) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
  }, []);

  const resetFilters = useCallback(() => {
    setFilters({
      isArchived: false,
      orderBy: 'createdAt',
      orderDirection: 'desc',
    });
    setSearchQuery('');
  }, []);

  return {
    equipments: filteredEquipments,
    allEquipments: equipments,
    isLoading,
    error,
    refetch,
    filters,
    updateFilters,
    resetFilters,
    searchQuery,
    setSearchQuery,
  };
};
