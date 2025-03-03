import { useState } from 'react';
import { showsApi } from '../../services/api/shows';
import { useAuthStore } from '../../store/useAuthStore';

export const useDeleteShow = () => {
  const token = useAuthStore((state) => state.token); // Récupère le token
  const [isDeleting, setIsDeleting] = useState(false); // État pour indiquer si la suppression est en cours
  const [error, setError] = useState<string | null>(null); // Gestion des erreurs

  // Fonction pour supprimer un show
  const deleteShow = async (showId: string) => {
    if (!token) {
      setError("L'utilisateur n'est pas authentifié");
      return false;
    }

    setIsDeleting(true);
    setError(null); // Réinitialise l'erreur avant la suppression

    try {
      await showsApi.deleteDel(showId, token); // Appel de la méthode de suppression dans le service
      return true; // Indique que la suppression a réussi
    } catch (err: any) {
      setError(
        err.response?.data?.detail || 'Erreur lors de la suppression du show'
      );
      return false; // Indique que la suppression a échoué
    } finally {
      setIsDeleting(false); // Désactive l'état de suppression en cours
    }
  };

  return { deleteShow, isDeleting, error };
};
