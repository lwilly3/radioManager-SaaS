
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { guestApi } from '../../api/guests';
import type { Guest } from '../../types';

export const useGuests = () => {
  const queryClient = useQueryClient();

  const {
    data: guests = [],
    isLoading,
    error
  } = useQuery({
    queryKey: ['guests'],
    queryFn: guestApi.getAll,
    staleTime: 5 * 60 * 1000, // Consider data fresh for 5 minutes
  });

  const createGuest = useMutation({
    mutationFn: guestApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['guests'] });
    },
  });

  const updateGuest = useMutation({
    mutationFn: ({ id, guest }: { id: string; guest: Partial<Guest> }) =>
      guestApi.update(id, guest),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['guests'] });
    },
  });

  const deleteGuest = useMutation({
    mutationFn: guestApi.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['guests'] });
    },
  });

  return {
    guests,
    isLoading,
    error,
    createGuest,
    updateGuest,
    deleteGuest,
  };
};
