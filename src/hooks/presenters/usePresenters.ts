
import { useQuery } from '@tanstack/react-query';
import { useAuthStore } from '../../store/useAuthStore';
import api from '../../api/api';
import type { Presenter } from '../../types';

export const usePresenters = () => {
  const token = useAuthStore((state) => state.token);

  return useQuery({
    queryKey: ['presenters'],
    queryFn: async (): Promise<Presenter[]> => {
      if (!token) throw new Error('No authentication token');
      
      const response = await api.get('/presenters/all', {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      return response.data.presenters.map((presenter: any) => ({
        id: presenter.id,
        user_id: presenter.users_id,
        name: presenter.name,
        profilePicture: presenter.profile_picture,
        contact: {
          email: presenter.email,
          phone: presenter.phone,
        },
        isMainPresenter: false
      }));
    },
    enabled: !!token
  });
};
