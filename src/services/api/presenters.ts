import api from '../../api/api';
import type { Presenter } from '../../types';

export interface CreatePresenterData {
  name: string;
  contact_info?: string;
  biography?: string;
  users_id: number;
  profilePicture?: string;
  isMainPresenter?: boolean;
}

export interface PresenterResponse {
  id: number;
  name: string;
  biography: string | null;
  is_deleted: boolean;
  deleted_at: string | null;
  users_id: number;
  contact_info: string | null;
  profilePicture: string | null;
  shows_presented: number;
  username: string;
  presenter_name: string;
  user_name: string;
  family_name: string;
  user_id: number;
}

export const presenterApi = {
  getAll: async (token: string): Promise<{ total: number; presenters: PresenterResponse[] }> => {
    try {
      const response = await api.get('/presenters/all', {
        headers: { Authorization: `Bearer ${token}` },
      });
      return response.data;
    } catch (error) {
      console.error('Failed to fetch presenters:', error);
      throw error;
    }
  },

  getByUserId: async (token: string, userId: number): Promise<PresenterResponse> => {
    try {
      const response = await api.get(`/by-user/${userId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return response.data;
    } catch (error) {
      console.error('Failed to fetch presenter by user ID:', error);
      throw error;
    }
  },

  getById: async (token: string, presenterId: number): Promise<PresenterResponse> => {
    try {
      const response = await api.get(`/presenters/${presenterId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return response.data;
    } catch (error) {
      console.error('Failed to fetch presenter:', error);
      throw error;
    }
  },

  create: async (token: string, data: CreatePresenterData): Promise<PresenterResponse> => {
    try {
      const response = await api.post('/presenters/', data, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return response.data;
    } catch (error) {
      console.error('Failed to create presenter:', error);
      throw error;
    }
  },

  update: async (token: string, presenterId: number, data: Partial<CreatePresenterData>): Promise<PresenterResponse> => {
    try {
      const response = await api.put(`/presenters/update/${presenterId}`, data, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return response.data;
    } catch (error) {
      console.error('Failed to update presenter:', error);
      throw error;
    }
  },

  delete: async (token: string, presenterId: number): Promise<void> => {
    try {
      await api.delete(`/presenters/del/${presenterId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
    } catch (error) {
      console.error('Failed to delete presenter:', error);
      throw error;
    }
  },
};