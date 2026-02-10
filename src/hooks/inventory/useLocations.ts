// Hook pour la gestion des localisations (entreprises, sites, locaux)

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getCompanies,
  getSites,
  getRooms,
  createCompany,
  createSite,
  createRoom,
  updateCompany,
  updateSite,
  updateRoom,
  deleteCompany,
  deleteSite,
  deleteRoom,
} from '../../api/firebase/inventory';
import type { Company, Site, Room } from '../../types/inventory';

const QUERY_KEY_COMPANIES = 'companies';
const QUERY_KEY_SITES = 'sites';
const QUERY_KEY_ROOMS = 'rooms';

/**
 * Hook pour récupérer les entreprises
 */
export const useCompanies = () => {
  return useQuery({
    queryKey: [QUERY_KEY_COMPANIES],
    queryFn: getCompanies,
    staleTime: 1000 * 60 * 30, // 30 minutes
  });
};

/**
 * Hook pour récupérer les sites
 */
export const useSites = (companyId?: string) => {
  return useQuery({
    queryKey: [QUERY_KEY_SITES, companyId],
    queryFn: () => getSites(companyId),
    staleTime: 1000 * 60 * 30,
  });
};

/**
 * Hook pour récupérer les locaux
 */
export const useRooms = (siteId?: string) => {
  return useQuery({
    queryKey: [QUERY_KEY_ROOMS, siteId],
    queryFn: () => getRooms(siteId),
    staleTime: 1000 * 60 * 30,
  });
};

/**
 * Hook pour créer une entreprise
 */
export const useCreateCompany = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: Omit<Company, 'id' | 'createdAt' | 'updatedAt'>) => createCompany(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY_COMPANIES] });
    },
    onError: (error) => {
      console.error('Erreur création entreprise:', error);
    },
  });
};

/**
 * Hook pour créer un site
 */
export const useCreateSite = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: Omit<Site, 'id' | 'createdAt' | 'updatedAt'>) => createSite(data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY_SITES] });
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY_SITES, variables.companyId] });
    },
    onError: (error) => {
      console.error('Erreur création site:', error);
    },
  });
};

/**
 * Hook pour créer un local
 */
export const useCreateRoom = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: Omit<Room, 'id' | 'createdAt' | 'updatedAt'>) => createRoom(data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY_ROOMS] });
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY_ROOMS, variables.siteId] });
    },
    onError: (error) => {
      console.error('Erreur création local:', error);
    },
  });
};

/**
 * Hook pour modifier une entreprise
 */
export const useUpdateCompany = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Omit<Company, 'id' | 'createdAt' | 'updatedAt'>> }) =>
      updateCompany(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY_COMPANIES] });
    },
    onError: (error) => {
      console.error('Erreur modification entreprise:', error);
    },
  });
};

/**
 * Hook pour supprimer une entreprise (soft delete)
 */
export const useDeleteCompany = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deleteCompany(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY_COMPANIES] });
    },
    onError: (error) => {
      console.error('Erreur suppression entreprise:', error);
    },
  });
};

/**
 * Hook pour modifier un site
 */
export const useUpdateSite = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Omit<Site, 'id' | 'createdAt' | 'updatedAt'>> }) =>
      updateSite(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY_SITES] });
    },
    onError: (error) => {
      console.error('Erreur modification site:', error);
    },
  });
};

/**
 * Hook pour supprimer un site (soft delete)
 */
export const useDeleteSite = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deleteSite(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY_SITES] });
    },
    onError: (error) => {
      console.error('Erreur suppression site:', error);
    },
  });
};

/**
 * Hook pour modifier un local
 */
export const useUpdateRoom = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Omit<Room, 'id' | 'createdAt' | 'updatedAt'>> }) =>
      updateRoom(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY_ROOMS] });
    },
    onError: (error) => {
      console.error('Erreur modification local:', error);
    },
  });
};

/**
 * Hook pour supprimer un local (soft delete)
 */
export const useDeleteRoom = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deleteRoom(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY_ROOMS] });
    },
    onError: (error) => {
      console.error('Erreur suppression local:', error);
    },
  });
};

/**
 * Hook combiné pour la sélection de localisation en cascade
 */
export const useLocationSelector = () => {
  const { data: companies = [], isLoading: isLoadingCompanies } = useCompanies();
  const { data: allSites = [], isLoading: isLoadingSites } = useSites();
  const { data: allRooms = [], isLoading: isLoadingRooms } = useRooms();

  const getSitesByCompany = (companyId: string) => {
    return allSites.filter(site => site.companyId === companyId);
  };

  const getRoomsBySite = (siteId: string) => {
    return allRooms.filter(room => room.siteId === siteId);
  };

  const getCompanyById = (companyId: string) => {
    return companies.find(c => c.id === companyId);
  };

  const getSiteById = (siteId: string) => {
    return allSites.find(s => s.id === siteId);
  };

  const getRoomById = (roomId: string) => {
    return allRooms.find(r => r.id === roomId);
  };

  return {
    companies,
    allSites,
    allRooms,
    isLoading: isLoadingCompanies || isLoadingSites || isLoadingRooms,
    getSitesByCompany,
    getRoomsBySite,
    getCompanyById,
    getSiteById,
    getRoomById,
  };
};
