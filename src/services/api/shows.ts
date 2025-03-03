import axios from 'axios';
import api from '../../api/api';
import type { ApiShowResponse } from '../../types/api';
import type { ShowPlan } from '../../types';

const authHeaders = (token: string) => ({
  headers: { Authorization: `Bearer ${token}` },
});

const API_URL = 'https://api.radio.audace.ovh';

// Convert API response to internal format
const mapApiShowToShowPlan = (apiShow: ApiShowResponse): ShowPlan => ({
  id: apiShow.id,
  emission: apiShow.emission,
  title: apiShow.title,
  showType: 'other',
  date: apiShow.broadcast_date,
  description: apiShow.description,
  status: apiShow.status,
  segments: apiShow.segments.map((segment) => ({
    id: segment.id,
    title: segment.title,
    duration: segment.duration,
    type: segment.type.toLowerCase() as any,
    description: segment.description,
    startTime: segment.startTime || '',
    guests: segment.guests.map((guest) => guest.name),
  })),
  presenters: apiShow.presenters.map((presenter) => ({
    id: presenter.id,
    name: presenter.name,
    isMainPresenter: presenter.isMainPresenter,
  })),
  guests: apiShow.segments
    .flatMap((segment) => segment.guests)
    .map((guest) => ({
      id: guest.id,
      name: guest.name,
      role: guest.role as any,
      biography: guest.biography || undefined,
      avatar: guest.avatar || undefined,
    })),
});

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
      const response = await axios.get<ApiShowResponse>(
        `${API_URL}/shows/x/${id}`,
        authHeaders(token)
      );
      return mapApiShowToShowPlan(response.data);
    } catch (error) {
      console.error(`Failed to fetch show ${id}:`, error);
      throw error;
    }
  },

  // Create new show
  create: async (token: string, data: any): Promise<ShowPlan> => {
    try {
      const response = await api.post(
        '/shows/detail',
        data,
        authHeaders(token)
      );
      return mapApiShowToShowPlan(response.data);
    } catch (error) {
      console.error('Failed to create show:', error);
      throw error;
    }
  },

  // Update show
  update: async (token: string, id: string, data: any): Promise<ShowPlan> => {
    try {
      const response = await api.put(
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
      const response = await axios.delete(`${API_URL}/shows/del/${showId}`, {
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