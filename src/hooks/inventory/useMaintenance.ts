// Hook pour la gestion de la maintenance des équipements

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getMaintenanceRecords,
  createMaintenanceRecord,
  updateMaintenanceRecord,
} from '../../api/firebase/inventory';
import type { MaintenanceRecord } from '../../types/inventory';
import { useAuthStore } from '../../store/useAuthStore';

const QUERY_KEY = 'equipment_maintenance';

/**
 * Hook pour récupérer les maintenances d'un équipement
 */
export const useMaintenanceRecords = (equipmentId: string | undefined) => {
  const query = useQuery({
    queryKey: [QUERY_KEY, equipmentId],
    queryFn: () => equipmentId ? getMaintenanceRecords(equipmentId) : [],
    enabled: !!equipmentId,
    staleTime: 1000 * 60 * 5,
  });

  return {
    records: query.data || [],
    isLoading: query.isLoading,
    error: query.error,
    refetch: query.refetch,
  };
};

/**
 * Hook pour créer un enregistrement de maintenance
 */
export const useCreateMaintenance = () => {
  const queryClient = useQueryClient();
  const user = useAuthStore((state) => state.user);

  return useMutation({
    mutationFn: async (data: Omit<MaintenanceRecord, 'id' | 'createdAt' | 'updatedAt' | 'createdBy' | 'createdByName'>) => {
      if (!user?.id || !user?.name) {
        throw new Error('Utilisateur non connecté');
      }
      return createMaintenanceRecord(data, user.id, user.name);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY, variables.equipmentId] });
      queryClient.invalidateQueries({ queryKey: ['equipment'] });
    },
    onError: (error) => {
      console.error('Erreur création maintenance:', error);
    },
  });
};

/**
 * Hook pour mettre à jour un enregistrement de maintenance
 */
export const useUpdateMaintenance = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<MaintenanceRecord> }) => {
      return updateMaintenanceRecord(id, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
      queryClient.invalidateQueries({ queryKey: ['equipment'] });
    },
    onError: (error) => {
      console.error('Erreur mise à jour maintenance:', error);
    },
  });
};
