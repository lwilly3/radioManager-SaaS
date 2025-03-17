import { useState, useEffect } from 'react';
import { useAuthStore } from '../../store/useAuthStore';
import axios from 'axios';
import api from '../../api/api'; // Assurez-vous que le chemin est correct

interface Permissions {
  user_id: number;
  can_acces_showplan_broadcast_section: boolean;
  can_acces_showplan_section: boolean;
  can_create_showplan: boolean;
  can_edit_showplan: boolean;
  can_archive_showplan: boolean;
  can_archiveStatusChange_showplan: boolean;
  can_delete_showplan: boolean;
  can_destroy_showplan: boolean;
  can_changestatus_showplan: boolean;
  can_changestatus_owned_showplan: boolean;
  can_changestatus_archived_showplan: boolean;
  can_setOnline_showplan: boolean;
  can_viewAll_showplan: boolean;
  can_acces_users_section: boolean;
  can_view_users: boolean;
  can_edit_users: boolean;
  can_desable_users: boolean;
  can_delete_users: boolean;
  can_manage_roles: boolean;
  can_assign_roles: boolean;
  can_acces_guests_section: boolean;
  can_view_guests: boolean;
  can_edit_guests: boolean;
  can_delete_guests: boolean;
  can_acces_presenters_section: boolean;
  can_view_presenters: boolean;
  can_edit_presenters: boolean;
  can_delete_presenters: boolean;
  can_acces_emissions_section: boolean;
  can_view_emissions: boolean;
  can_create_emissions: boolean;
  can_edit_emissions: boolean;
  can_delete_emissions: boolean;
  can_manage_emissions: boolean;
  can_view_notifications: boolean;
  can_manage_notifications: boolean;
  can_view_audit_logs: boolean;
  can_view_login_history: boolean;
  can_manage_settings: boolean;
  can_view_messages: boolean;
  can_send_messages: boolean;
  can_delete_messages: boolean;
  can_view_files: boolean;
  can_upload_files: boolean;
  can_delete_files: boolean;
  granted_at: string;
}

export const useUserPermissions = (userId: number) => {
  const { token } = useAuthStore((state) => state);
  const [permissions, setPermissions] = useState<Permissions | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPermissions = async () => {
      if (!token) {
        setError("Aucun token d'authentification disponible");
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      setError(null);
      if (userId <= 0) {
        setIsLoading(false);
        return;
      }

      try {
        const response = await api.get<Permissions>(
          `permissions/users/${userId}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        console.log(`Permissions reçues pour userId ${userId}:`, response.data);
        setPermissions(response.data);
      } catch (err: any) {
        const errorMessage =
          err.response?.data?.detail ||
          'Erreur lors de la récupération des permissions';
        setError(errorMessage);
        console.error('Erreur dans useUserPermissions :', errorMessage);
      } finally {
        setIsLoading(false);
      }
    };

    fetchPermissions();
  }, [userId, token]);

  return { permissions, isLoading, error };
};
