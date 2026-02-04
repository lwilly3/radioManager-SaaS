import api from '../../api/api';
import type { ApiShowResponse } from '../../types/api';
import type { ShowPlan, ShowType } from '../../types';

const authHeaders = (token: string) => ({
  headers: { Authorization: `Bearer ${token}` },
});

// Valider et convertir le type de show
const mapShowType = (type: string): ShowType => {
  const validTypes: ShowType[] = [
    'morning-show', 'news', 'talk-show', 'music-show', 
    'cultural', 'sports', 'documentary', 'entertainment', 'debate', 'other'
  ];
  return validTypes.includes(type as ShowType) ? (type as ShowType) : 'other';
};

// Convert API response to internal format
const mapApiShowToShowPlan = (apiShow: ApiShowResponse): ShowPlan => {
  // Utilisez une valeur par défaut si `segments` est absent
  const segments = apiShow.segments || [];
  
  return {
    id: apiShow.id,
    emission_id: apiShow.emission_id ? String(apiShow.emission_id) : undefined,
    emission: apiShow.emission,
    title: apiShow.title,
    showType: mapShowType(apiShow.type),
    date: apiShow.broadcast_date,
    description: apiShow.description,
    status: apiShow.status,
    segments: segments.map((segment, index) => ({
      id: segment.id.toString(),
      title: segment.title,
      duration: segment.duration,
      type: segment.type.toLowerCase() as any,
      description: segment.description,
      startTime: segment.startTime || '',
      position: segment.position?.toString() || index.toString(),
      guests: segment.guests?.map((guest) => guest.id.toString()) || [],
    })),
    presenters: apiShow.presenters?.map((presenter) => ({
      id: presenter.id.toString(),
      user_id: presenter.id.toString(),
      name: presenter.name,
      isMainPresenter: presenter.isMainPresenter,
    })) || [],
    guests: segments
      .flatMap((segment) => segment.guests || [])
      .map((guest) => ({
        id: Number(guest.id) || 0,
        name: guest.name,
        role: guest.role || null,
        biography: guest.biography || null,
        avatar: guest.avatar || null,
        contact_info: guest.contact_info || null,
        phone: null,
        email: null,
        segments: [],
        appearances: [],
      })),
  };
};

export const showsApi = {
  // Retourne les conducteurs prêts à diffuser
  getAll_production: async (token: string): Promise<ShowPlan[]> => {
    try {
      const response = await api.get('/shows/production', authHeaders(token));
      return response.data.map(mapApiShowToShowPlan);
    } catch (error) {
      console.error('Failed to fetch production shows:', error);
      throw error;
    }
  },

  // Retourne les conducteurs de l'utilisateur connecté
  getAll_Owned: async (token: string): Promise<ShowPlan[]> => {
    try {
      const response = await api.get('/shows/owned', authHeaders(token));
      return response.data.map(mapApiShowToShowPlan);
    } catch (error) {
      console.error('Failed to fetch owned shows:', error);
      throw error;
    }
  },

  // Get show by ID
  getById: async (token: string, id: string): Promise<ShowPlan> => {
    try {
      // Essayer d'abord l'endpoint authentifié
      const response = await api.get(`/shows/getdetail/${id}`, authHeaders(token));
      return mapApiShowToShowPlan(response.data);
    } catch (error: any) {
      // Si 404 sur getdetail, essayer l'autre endpoint
      if (error.response?.status === 404) {
        try {
          const response = await api.get(`/shows/x/${id}`, authHeaders(token));
          return mapApiShowToShowPlan(response.data);
        } catch (fallbackError) {
          console.error(`Failed to fetch show ${id} (fallback):`, fallbackError);
          throw fallbackError;
        }
      }
      console.error(`Failed to fetch show ${id}:`, error);
      throw error;
    }
  },

  // Create new showPlan creation d'un conducteur
  create: async (token: string, data: any): Promise<any> => {
    try {
      const response = await api.post(
        '/shows/detail',
        data,
        authHeaders(token)
      );
      return response.data;
    } catch (error) {
      console.error('Failed to create show:', error);
      throw error;
    }
  },

  // Update show
  update: async (token: string, id: string, data: any): Promise<ShowPlan> => {
    try {
      console.log('Données envoyées à l\'API:', data);
      const response = await api.patch(
        `/shows/detail/${id}`,
        data,
        authHeaders(token)
      );
      return mapApiShowToShowPlan(response.data);
    } catch (error) {
      console.error(`Failed to update show ${id}:`, error);
      throw error;
    }
  },

  // Update show status
  updateStatus: async (
    token: string,
    id: string,
    status: string
  ): Promise<void> => {
    try {
      await api.patch(`/shows/status/${id}`, { status }, authHeaders(token));
    } catch (error) {
      console.error(`Failed to update show status for ${id}:`, error);
      throw error;
    }
  },

  // Delete show
  deleteDel: async (showId: string, token: string) => {
    try {
      const response = await api.delete(`/shows/del/${showId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  },
};