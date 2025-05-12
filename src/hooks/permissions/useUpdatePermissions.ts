import { useState, useCallback } from 'react';
import { useAuthStore } from '../../store/useAuthStore';
import axios from 'axios';
import { UserPermissions } from '../../types/permissions';
import api from '../../api/api';

export const useUpdatePermissions = (defaultUserId: number = -1) => {
  const { token, permissions } = useAuthStore((state) => state);

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<boolean>(false);
  const [updatedPermissions, setUpdatedPermissions] = useState<UserPermissions | null>(null);

  const updatePermissions = useCallback(
    async (userId: number, permissionsToUpdate: Partial<UserPermissions>) => {
      if (!token) {
        setError("Aucun token d'authentification disponible");
        return;
      }

      if (!(permissions?.can_edit_users || permissions?.can_manage_roles)) {
        setError("Vous n'avez pas les droits pour modifier les permissions");
        return;
      }

      setIsLoading(true);
      setError(null);
      setSuccess(false);

      try {
        console.log("$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$ update permission");
        console.log(permissionsToUpdate);
        const response = await api.put(
          `permissions/update_permissions/${userId}`,
          permissionsToUpdate,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        console.log("$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$ update permission response");
        console.log(response);

        setUpdatedPermissions(response.data as UserPermissions);
        setSuccess(true);
      } catch (err: any) {
        const errorMessage =
          err.response?.data?.detail ||
          'Erreur lors de la mise à jour des permissions';
        setError(errorMessage);
      } finally {
        setIsLoading(false);
      }
    },
    [token, permissions]
  );

  const updateMultiplePermissions = useCallback(
    async (userId: number, permissionsToUpdate: Partial<UserPermissions>) => {
      return updatePermissions(userId, permissionsToUpdate);
    },
    [updatePermissions]
  );

  const setAllPermissions = useCallback(
    async (userId: number, value: boolean) => {
      const allPermissions = Object.keys(permissions || {}).reduce(
        (acc, key) => {
          acc[key as keyof UserPermissions] = value;
          return acc;
        },
        {} as Partial<UserPermissions>
      );

      return updatePermissions(userId, allPermissions);
    },
    [permissions, updatePermissions]
  );

  return {
    updatePermissions,
    updateMultiplePermissions,
    setAllPermissions,
    isLoading,
    error,
    success,
    updatedPermissions,
  };
};