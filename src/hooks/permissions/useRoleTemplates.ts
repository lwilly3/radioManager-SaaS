import { useState, useCallback } from 'react';
import { useAuthStore } from '../../store/useAuthStore';
import axios from 'axios';
import { RoleTemplate } from '../../types/permissions';

interface UseRoleTemplatesReturn {
  fetchTemplates: () => Promise<RoleTemplate[]>;
  applyTemplate: (userId: number, templateId: string) => Promise<boolean>;
  createTemplate: (template: Omit<RoleTemplate, 'id'>) => Promise<RoleTemplate | null>;
  updateTemplate: (template: RoleTemplate) => Promise<boolean>;
  deleteTemplate: (templateId: string) => Promise<boolean>;
  isLoading: boolean;
  error: string | null;
}

/**
 * Hook personnalisé pour gérer les modèles de rôles
 * Permet de créer, mettre à jour, supprimer et appliquer des modèles de rôles
 */
export const useRoleTemplates = (): UseRoleTemplatesReturn => {
  const { token } = useAuthStore((state) => state);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Récupère tous les modèles de rôles
   * @returns Liste des modèles de rôles
   */
  const fetchTemplates = useCallback(async (): Promise<RoleTemplate[]> => {
    if (!token) {
      setError("Aucun token d'authentification disponible");
      return [];
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await axios.get('permissions/templates', {
        headers: { Authorization: `Bearer ${token}` }
      });
      return response.data;
    } catch (err: any) {
      const errorMessage = err.response?.data?.detail || "Erreur lors de la récupération des modèles";
      setError(errorMessage);
      return [];
    } finally {
      setIsLoading(false);
    }
  }, [token]);

  /**
   * Applique un modèle de rôle à un utilisateur
   * @param userId - ID de l'utilisateur
   * @param templateId - ID du modèle à appliquer
   * @returns true si l'application a réussi, false sinon
   */
  const applyTemplate = useCallback(async (userId: number, templateId: string): Promise<boolean> => {
    if (!token) {
      setError("Aucun token d'authentification disponible");
      return false;
    }

    setIsLoading(true);
    setError(null);

    try {
      await axios.post(
        `permissions/apply_template/${userId}`,
        { template_id: templateId },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      return true;
    } catch (err: any) {
      const errorMessage = err.response?.data?.detail || "Erreur lors de l'application du modèle";
      setError(errorMessage);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [token]);

  /**
   * Crée un nouveau modèle de rôle
   * @param template - Données du modèle à créer
   * @returns Le modèle créé ou null en cas d'erreur
   */
  const createTemplate = useCallback(async (template: Omit<RoleTemplate, 'id'>): Promise<RoleTemplate | null> => {
    if (!token) {
      setError("Aucun token d'authentification disponible");
      return null;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await axios.post(
        'permissions/templates',
        template,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      return response.data;
    } catch (err: any) {
      const errorMessage = err.response?.data?.detail || "Erreur lors de la création du modèle";
      setError(errorMessage);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [token]);

  /**
   * Met à jour un modèle de rôle existant
   * @param template - Données du modèle à mettre à jour
   * @returns true si la mise à jour a réussi, false sinon
   */
  const updateTemplate = useCallback(async (template: RoleTemplate): Promise<boolean> => {
    if (!token) {
      setError("Aucun token d'authentification disponible");
      return false;
    }

    setIsLoading(true);
    setError(null);

    try {
      await axios.put(
        `permissions/templates/${template.id}`,
        template,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      return true;
    } catch (err: any) {
      const errorMessage = err.response?.data?.detail || "Erreur lors de la mise à jour du modèle";
      setError(errorMessage);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [token]);

  /**
   * Supprime un modèle de rôle
   * @param templateId - ID du modèle à supprimer
   * @returns true si la suppression a réussi, false sinon
   */
  const deleteTemplate = useCallback(async (templateId: string): Promise<boolean> => {
    if (!token) {
      setError("Aucun token d'authentification disponible");
      return false;
    }

    setIsLoading(true);
    setError(null);

    try {
      await axios.delete(`permissions/templates/${templateId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      return true;
    } catch (err: any) {
      const errorMessage = err.response?.data?.detail || "Erreur lors de la suppression du modèle";
      setError(errorMessage);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [token]);

  return {
    fetchTemplates,
    applyTemplate,
    createTemplate,
    updateTemplate,
    deleteTemplate,
    isLoading,
    error
  };
};