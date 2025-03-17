import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/useAuthStore';
import type { LoginCredentials } from '../../types/auth';

export const useLogin = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string>();
  const navigate = useNavigate();

  // Récupère les méthodes du store
  const loginStore = useAuthStore((state) => state.login);


// Définition de la fonction login, qui prend des identifiants (username et password) en paramètre
const login = async (credentials: LoginCredentials) => {
  try {
    // Active l'état de chargement pour indiquer à l'UI qu'une opération est en cours (ex. spinner)
    setIsLoading(true);

    // Réinitialise tout message d'erreur précédent pour repartir sur une base propre
    setError(undefined);

    // Appelle la fonction login du store Zustand (useAuthStore.login) avec les identifiants
    // Cette fonction effectue l'authentification via l'API, met à jour le store et synchronise avec Firestore
    await loginStore(credentials);

    // Si la connexion réussit (aucune erreur levée), redirige l'utilisateur vers la page d'accueil ('/')
    navigate('/');

    // Retourne true pour indiquer que la connexion a réussi (utile pour les appels parents ou tests)
    return true;
  } catch (err: any) {
    // En cas d'erreur pendant le processus de connexion, cette section est exécutée

    // Définit un message d'erreur adapté selon le type d'erreur reçu
    setError(
      // Si l'erreur est un 401 (Unauthorized), affiche un message spécifique pour identifiants incorrects
      err.response?.status === 401
        ? "Nom d'utilisateur ou mot de passe incorrect"
        : // Sinon, affiche un message générique pour toute autre erreur
          'Une erreur est survenue, veuillez réessayer'
    );

    // Retourne false pour indiquer que la connexion a échoué
    return false;
  } finally {
    // Cette section s'exécute toujours, qu'il y ait succès ou échec, pour nettoyer l'état

    // Désactive l'état de chargement une fois l'opération terminée (succès ou échec)
    setIsLoading(false);
  }
};


  return {
    login,
    isLoading,
    error,
  };
};
