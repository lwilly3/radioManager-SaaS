import api from '../../api/api';
import type { Role } from '../../types/user';

export const rolesApi = {
  getAll: async (token: string): Promise<Role[]> => {
    try {
      const response = await api.get('roles/all', {
        headers: { Authorization: `Bearer ${token}` },
      });
      return response.data;
    } catch (error) {
      console.error('Failed to fetch roles:', error);
      throw error;
    }
  },

  getById: async (token: string, roleId: number): Promise<Role> => {
    try {
      const response = await api.get(`roles/id/${roleId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return response.data;
    } catch (error) {
      console.error('Failed to fetch role:', error);
      throw error;
    }
  },

  create: async (token: string, name: string): Promise<Role> => {
    try {
      const response = await api.post('roles/', { name }, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return response.data;
    } catch (error) {
      console.error('Failed to create role:', error);
      throw error;
    }
  },

  update: async (token: string, roleId: number, name: string): Promise<Role> => {
    try {
      const response = await api.put(`roles/update/${roleId}`, { name }, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return response.data;
    } catch (error) {
      console.error('Failed to update role:', error);
      throw error;
    }
  },

  delete: async (token: string, roleId: number): Promise<void> => {
    try {
      await api.delete(`roles/del/${roleId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
    } catch (error) {
      console.error('Failed to delete role:', error);
      throw error;
    }
  },

  assignRoles: async (token: string, userId: number, roleIds: number[]): Promise<void> => {
    try {
      await api.post(`roles/assign/${userId}`, { role_ids: roleIds }, {
        headers: { Authorization: `Bearer ${token}` },
      });
    } catch (error) {
      console.error('Failed to assign roles:', error);
      throw error;
    }
  },

  unassignRoles: async (token: string, userId: number, roleIds: number[]): Promise<void> => {
    try {
      await api.post(`roles/unassign/${userId}`, { role_ids: roleIds }, {
        headers: { Authorization: `Bearer ${token}` },
      });
    } catch (error) {
      console.error('Failed to unassign roles:', error);
      throw error;
    }
  },

  getUserRoles: async (token: string, userId: number): Promise<Role[]> => {
    try {
      const response = await api.get(`roles/all_assigned/${userId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return response.data;
    } catch (error) {
      console.error('Failed to fetch user roles:', error);
      throw error;
    }
  }
};