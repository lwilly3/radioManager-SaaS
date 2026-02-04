import api from '../../api/api';
import type { Guest } from '../../types';

export const guestApi = {
  search: async (token: string, query: string): Promise<Guest[]> => {
    try {
      const response = await api.get(`guests/search`, {
        params: { query },
        headers: { Authorization: `Bearer ${token}` },
      });
      console.log('Response query:', response.data);

      return response.data.data;
    } catch (error) {
      console.error('Failed to search guests:', error);
      throw error;
    }
  },
};
