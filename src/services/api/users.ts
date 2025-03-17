import { UseFormRegister } from 'react-hook-form';
import api from '../../api/api';
import type { Users, CreateUserData, UpdateUserData } from '../../types/user';

export const usersApi = {
  getAll: async (token: string): Promise<Users[]> => {
    try {
      const response = await api.get('users/users', {
        headers: { Authorization: `Bearer ${token}` },
      });
      return response.data;
    } catch (error) {
      console.error('Failed to fetch users:', error);
      throw error;
    }
  },

  getNonPresenters: async (token: string): Promise<{ total: number; users: Users[] }> => {
    try {
      const response = await api.get('users/non-presenters', {
        headers: { Authorization: `Bearer ${token}` },
      });
      return response.data;
    } catch (error) {
      console.error('Failed to fetch non-presenter users:', error);
      throw error;
    }
  },

  getById: async (token: string, id: number): Promise<UseFormRegister> => {
    try {
      const response = await api.get(`search_users/id/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return response.data;
    } catch (error) {
      console.error('Failed to fetch user:', error);
      throw error;
    }
  },

  create: async (token: string, userData: CreateUserData): Promise<Users> => {
    try {
      const response = await api.post('users/users', userData, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return response.data;
    } catch (error) {
      console.error('Failed to create user:', error);
      throw error;
    }
  },

  update: async (
    token: string,
    userId: number,
    userData: UpdateUserData
  ): Promise<Users> => {
    try {
      const response = await api.put(`users/updte/${userId}`, userData, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return response.data;
    } catch (error) {
      console.error('Failed to update user:', error);
      throw error;
    }
  },

  delete: async (token: string, userId: number): Promise<void> => {
    try {
      await api.delete(`users/del/${userId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
    } catch (error) {
      console.error('Failed to delete user:', error);
      throw error;
    }
  },
};