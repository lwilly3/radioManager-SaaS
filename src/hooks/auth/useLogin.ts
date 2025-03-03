import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/useAuthStore';
import { authApi } from '../../api/auth/authApi';
import type { LoginCredentials } from '../../types/auth';
// import { permission } from 'process';

export const useLogin = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string>();
  const navigate = useNavigate();

  const setToken = useAuthStore((state) => state.setToken);
  const setUser = useAuthStore((state) => state.setUser);
  const setPermissions = useAuthStore((state) => state.setPermission);

  const login = async (credentials: LoginCredentials) => {
    try {
      setIsLoading(true);
      setError(undefined);

      const response = await authApi(credentials);

      // Store auth data
      setToken(response.token);
      console.log(
        ` ///////////// structure de la reponse permission ${response.permissions.can_delete_showplan}`
      );
      // setPermissions(response.permission);

      setPermissions({
        can_create_showplan: true,
        can_edit_showplan: false,
        can_archive_showplan: true,
        can_delete_showplan: true,
        can_destroy_showplan: false,
        can_changestatus_showplan: true,
      });

      setUser({
        id: '1', // This should come from a decoded token or user info endpoint  credentials.username
        username: 'lwilly3',
      });

      // Redirect to dashboard
      navigate('/');

      return true;
    } catch (err: any) {
      setError(
        err.response?.status === 401
          ? "Nom d'utilisateur ou mot de passe incorrect"
          : 'Une erreur est survenue, veuillez réessayer'
      );
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    login,
    isLoading,
    error,
  };
};
