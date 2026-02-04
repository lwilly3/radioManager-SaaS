import { useQuery } from '@tanstack/react-query';
import { useAuthStore } from '../../store/useAuthStore';
import { guestApi } from '../../services/api/guests';
import type { Guest } from '../../types';

export const useGuestSearch = (query: string) => {
  const token = useAuthStore((state) => state.token);

  return useQuery({
    queryKey: ['guests', 'search', query],
    queryFn: async (): Promise<Guest[]> => {
      if (!token) {
        console.error('No authentication token');
        throw new Error('No authentication token');
      }
      if (!query.trim()) return [];
      console.log('Performing search with query:', query);
      return guestApi.search(token, query);
    },
    enabled: query.length > 0,
    staleTime: 30000, // Cache results for 30 seconds
  });
};
