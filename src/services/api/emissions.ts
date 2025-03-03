
import api from '../../api/api';
import type { Emission, CreateShowPlanPayload } from '../../types/emission';

export const emissionApi = {
  // Récupérer la liste des émissions
  getAllEmissions: async (token: string): Promise<Emission[]> => {
    try {
      const response = await api.get('/emissions', {
        headers: { Authorization: `Bearer ${token}` },
      });
      return response.data;
    } catch (error) {
      console.error('Failed to fetch emissions:', error);
      throw error;
    }
  },

  // Créer un nouveau conducteur
  createShowPlan: async (token: string, payload: CreateShowPlanPayload): Promise<any> => {
    try {
      const response = await api.post('/shows/detail', payload, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return response.data;
    } catch (error) {
      console.error('Failed to create show plan:', error);
      throw error;
    }
  },
};
