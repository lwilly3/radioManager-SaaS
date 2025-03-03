import api from './api';
import type { Guest } from '../types';

const authHeaders = (token: string) => ({
  headers: { Authorization: `Bearer ${token}` },
});

export const guestApi = {
  getAll: async (token: string): Promise<Guest[]> => {
    try {
      const response = await api.get('/guests', authHeaders(token));
      return response.data;
    } catch (error) {
      console.error('Failed to fetch guests:', error);
      throw error;
    }
  },

  create: async (token: string, guest: Omit<Guest, 'id'>): Promise<Guest> => {
    try {
      const response = await api.post('/guests', guest, authHeaders(token));
      return response.data;
    } catch (error) {
      console.error('Failed to create guest:', error);
      throw error;
    }
  },

  update: async (
    token: string,
    id: string,
    guest: Partial<Guest>
  ): Promise<Guest> => {
    try {
      const response = await api.put(`/guests/${id}`, guest, authHeaders(token));
      return response.data;
    } catch (error) {
      console.error('Failed to update guest:', error);
      throw error;
    }
  },

  delete: async (token: string, id: string): Promise<void> => {
    try {
      await api.delete(`/guests/${id}`, authHeaders(token));
    } catch (error) {
      console.error('Failed to delete guest:', error);
      throw error;
    }
  },
};
