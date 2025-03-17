// import { useState, useCallback } from 'react';
// import { useAuthStore } from '../../store/useAuthStore';
// import axios from 'axios';
// import { UserPermissions } from '../../types/permissions';

// export const useUpdatePermissions = (userId: number) => {
//   const { token, permissions } = useAuthStore((state) => state);
//   const [isLoading, setIsLoading] = useState<boolean>(false);
//   const [error, setError] = useState<string | null>(null);
//   const [success, setSuccess] = useState<boolean>(false);
//   const [updatedPermissions, setUpdatedPermissions] =
//     useState<UserPermissions | null>(null);

//   const updatePermissions = useCallback(
//     async (permissionsToUpdate: Partial<UserPermissions>) => {
//       if (!token) {
//         setError("Aucun token d'authentification disponible");
//         console.log('Erreur : Token manquant');
//         return;
//       }
//       if (!(permissions?.can_edit_users || permissions?.can_manage_roles)) {
//         setError("Vous n'avez pas les droits pour modifier les permissions");
//         console.log('Erreur : Droits insuffisants');
//         return;
//       }

//       setIsLoading(true);
//       setError(null);
//       setSuccess(false);

//       try {
//         console.log('Envoi à l’API :', permissionsToUpdate);
//         const response = await axios.put(
//           `permissions/update_permissions/${userId}`,
//           permissionsToUpdate,
//           { headers: { Authorization: `Bearer ${token}` } }
//         );
//         console.log('Réponse API :', response.data);
//         setUpdatedPermissions(response.data as UserPermissions);
//         setSuccess(true);
//       } catch (err: any) {
//         const errorMessage =
//           err.response?.data?.detail ||
//           'Erreur lors de la mise à jour des permissions';
//         setError(errorMessage);
//         console.error('Erreur API :', errorMessage);
//       } finally {
//         setIsLoading(false);
//       }
//     },
//     [token, userId, permissions]
//   );

//   const updateMultiplePermissions = useCallback(
//     async (permissionsToUpdate: Partial<UserPermissions>) => {
//       return updatePermissions(permissionsToUpdate);
//     },
//     [updatePermissions]
//   );

//   const setAllPermissions = useCallback(
//     async (value: boolean) => {
//       const allPermissions = Object.keys(permissions || {}).reduce(
//         (acc, key) => {
//           acc[key as keyof UserPermissions] = value;
//           return acc;
//         },
//         {} as Partial<UserPermissions>
//       );
//       return updatePermissions(allPermissions);
//     },
//     [permissions, updatePermissions]
//   );

//   return {
//     updatePermissions,
//     updateMultiplePermissions,
//     setAllPermissions,
//     isLoading,
//     error,
//     success,
//     updatedPermissions,
//   };
// };

import { useState, useCallback } from 'react';
import { useAuthStore } from '../../store/useAuthStore';
import axios from 'axios';
import { UserPermissions } from '../../types/permissions';
import api from '../../api/api'; // Assurez-vous que le chemin est correct

/**
 * Hook personnalisé pour gérer la mise à jour des permissions d'un utilisateur via l'API.
 * Fournit une fonction pour envoyer les nouvelles permissions et gère les états associés
 * (chargement, erreur, succès, et données mises à jour).
 *
 * @param userId - L'identifiant de l'utilisateur dont les permissions doivent être mises à jour.
 * @returns Objet contenant la fonction updatePermissions, ainsi que les états isLoading, error, success, et updatedPermissions.
 */
export const useUpdatePermissions = (userId: number) => {
  // Récupère le token et les permissions de l'utilisateur connecté depuis le store
  const { token, permissions } = useAuthStore((state) => state);

  // États pour gérer le processus de mise à jour
  const [isLoading, setIsLoading] = useState<boolean>(false); // Indique si une mise à jour est en cours
  const [error, setError] = useState<string | null>(null); // Stocke les messages d'erreur
  const [success, setSuccess] = useState<boolean>(false); // Indique si la mise à jour a réussi
  const [updatedPermissions, setUpdatedPermissions] =
    useState<UserPermissions | null>(null); // Stocke les permissions mises à jour

  /**
   * Fonction pour mettre à jour les permissions d'un utilisateur via l'API.
   * @param permissionsToUpdate - Un objet partiel contenant les permissions à modifier (clé: nom, valeur: booléen).
   * @returns void - Met à jour les états en fonction du résultat de la requête.
   */
  const updatePermissions = useCallback(
    async (permissionsToUpdate: Partial<UserPermissions>) => {
      // Vérifie si un token d'authentification est disponible
      if (!token) {
        setError("Aucun token d'authentification disponible");
        return;
      }

      console.log(permissions);

      // Vérifie si l'utilisateur connecté a les droits pour modifier les permissions
      if (!(permissions?.can_edit_users || permissions?.can_manage_roles)) {
        console.log('permission pour modification non accorde ////////////:');
        setError("Vous n'avez pas les droits pour modifier les permissions");
        return;
      }

      // Active le chargement et réinitialise les états d'erreur et de succès
      setIsLoading(true);
      setError(null);
      setSuccess(false);

      try {
        console.log(
          'Mise à jour des permissions locales depuis l’API ////////////:',
          permissionsToUpdate
        );

        // Envoie une requête PUT à l'API avec les nouvelles permissions
        const response = await api.put(
          `permissions/update_permissions/${userId}`,
          permissionsToUpdate,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        // Met à jour les permissions avec la réponse de l'API
        setUpdatedPermissions(response.data as UserPermissions);
        setSuccess(true);
      } catch (err: any) {
        // Gère les erreurs et extrait le message d'erreur depuis la réponse API si disponible
        const errorMessage =
          err.response?.data?.detail ||
          'Erreur lors de la mise à jour des permissions';
        setError(errorMessage);
      } finally {
        // Désactive le chargement, peu importe le résultat
        setIsLoading(false);
      }
    },
    [token, userId, permissions] // Dépendances pour éviter une recréation inutile de la fonction
  );

  /**
   * Fonction pour mettre à jour plusieurs permissions en une seule fois
   * @param permissionsToUpdate - Un objet contenant toutes les permissions à mettre à jour
   */
  const updateMultiplePermissions = useCallback(
    async (permissionsToUpdate: Partial<UserPermissions>) => {
      return updatePermissions(permissionsToUpdate);
    },
    [updatePermissions]
  );

  /**
   * Fonction pour activer ou désactiver toutes les permissions
   * @param value - La valeur à appliquer à toutes les permissions (true/false)
   */
  const setAllPermissions = useCallback(
    async (value: boolean) => {
      // Crée un objet avec toutes les permissions définies à la valeur spécifiée
      const allPermissions = Object.keys(permissions || {}).reduce(
        (acc, key) => {
          acc[key as keyof UserPermissions] = value;
          return acc;
        },
        {} as Partial<UserPermissions>
      );

      return updatePermissions(allPermissions);
    },
    [permissions, updatePermissions]
  );

  // Retourne les éléments nécessaires pour l'utilisation dans un composant
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
