import axios, { isAxiosError } from 'axios';
import api from '../api';
import type { LoginCredentials, LoginResponse } from '../../types/auth';

export const authApi = async (credentials: LoginCredentials) => {
  try {
    const response = await api.post<LoginResponse>('login', new URLSearchParams(credentials), {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    });

    return {
      token: response.data.access_token,
      permissions: response.data.permissions,
      user: {
        id: String(response.data.permissions.user_id),
        name: response.data.name,
        family_name: response.data.family_name,
        username: response.data.username,
        email: response.data.email,
        phone_number: response.data.phone_number,
      },
    };
  } catch (err) {
    console.error('Login error:', err);
    throw err;
  }
};

export const logoutApi = async (token: string): Promise<void> => {
  try {
    await api.post('logout', {}, {
      headers: { Authorization: `Bearer ${token}` },
    });
    console.log("Token invalidé avec succès via l'API");
  } catch (err) {
    if (isAxiosError(err)) {
      // If token is already invalid (401) or forbidden (403), consider logout successful
      if (err.response?.status === 401 || err.response?.status === 403) {
        console.warn('Token déjà invalide ou expiré, déconnexion considérée comme réussie');
        return;
      }
      throw new Error('Erreur lors de la déconnexion, veuillez réessayer plus tard.');
    }
    throw new Error('Une erreur inattendue est survenue lors de la déconnexion.');
  }
};