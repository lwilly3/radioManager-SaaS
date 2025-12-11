import api from '../../api/api';
import type {
  Emission,
  CreateEmissionData,
  UpdateEmissionData,
} from '../../types/emission';

const authHeaders = (token: string) => ({
  headers: { Authorization: `Bearer ${token}` },
});

// 141.95.52.115

export const emissionApi = {
  // Get all emissions
  getAllEmissions: async (token: string): Promise<Emission[]> => {
    try {
      const response = await api.get('emissions', {
        headers: { Authorization: `Bearer ${token}` },
      });
      return response.data;
    } catch (error) {
      console.error('Failed to fetch emissions:', error);
      throw error;
    }
  },

  // Create new emission
  create: async (
    token: string,
    data: CreateEmissionData
  ): Promise<Emission> => {
    console.log('//////////////////////////////// Create new emission');
    console.log(data);
    try {
      // const response = await axios.post(
      //   `${API_URL}/emissions/`,
      //   data,
      //   authHeaders(token)
      // );
      
      const response = await api.post('emissions/', {
  "title": data.title,
  "synopsis": data.synopsis,
  "type": data.type,
  "duration": data.duration,
  "frequency": data.frequency,
  "description": data.description,
}, {
        headers: { Authorization: `Bearer ${token}` },
      });

      return response.data;
    } catch (error) {
      console.error('Failed to create emission:', error);
      throw error;
    }
  },

  // Update emission
  update: async (
    token: string,
    emissionId: number,
    data: UpdateEmissionData
  ): Promise<Emission> => {
    try {
      const response = await api.put(`emissions/upd/${emissionId}`, {
  "title": data.title,
  "synopsis": data.synopsis,
  "type": data.type,
  "duration": data.duration,
  "frequency": data.frequency,
  "description": data.description,
}, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return response.data;
    } catch (error) {
      console.error('Failed to update emission:', error);
      throw error;
    }
  },

  // Delete emission
  delete: async (token: string, emissionId: number): Promise<void> => {
    try {
      await api.delete(`emissions/softDel/${emissionId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
    } catch (error) {
      console.error('Failed to delete emission:', error);
      throw error;
    }
  },
};
