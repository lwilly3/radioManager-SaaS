import axios from 'axios';
import type { LoginCredentials, LoginResponse } from '../types/auth';
import { console } from 'inspector';

const API_URL = 'https://api.radio.audace.ovh';

/**
 * Appelle l'API pour authentifier l'utilisateur
 * @param credentials - Identifiants de l'utilisateur
 * @returns Réponse adaptée contenant le token, les permissions et d'autres données nécessaires
 */
export const login = async (
  credentials: LoginCredentials
): Promise<{
  token: string;
  permissions: Record<string, boolean>;
  user: {
    id: string;
    username: string;
  };
}> => {
  try {
    console.log('login vian api/auth');
    const response = await axios.post<LoginResponse>(
      `${API_URL}/login`,
      new URLSearchParams(credentials),
      {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      }
    );
    console.log('contenue de permission to save :', response.data.permissions);

    // Adapter la réponse pour inclure uniquement les données nécessaires
    const adaptedResponse = {
      token: response.data.access_token, // Jeton d'accès
      permissions: response.data.permissions, // Permissions utilisateur
      user: {
        id: '1',
        username: credentials.username, // Nom d'utilisateur fourni lors de la connexion
      },
    };

    return adaptedResponse; // Retourne la réponse adaptée
  } catch (error) {
    console.error('Erreur lors de la connexion :', error);

    // Gestion d'erreur adaptée
    throw new Error(
      error.response?.status === 401
        ? "Nom d'utilisateur ou mot de passe incorrect"
        : 'Une erreur est survenue, veuillez réessayer plus tard.'
    );
  }
};

// import axios from 'axios';
// import type { LoginCredentials, LoginResponse } from '../types/auth';

// const API_URL = 'https://api.radio.audace.ovh';

// /**
//  * Appelle l'API pour authentifier l'utilisateur
//  * @param credentials - Identifiants de l'utilisateur
//  * @returns Réponse de l'API contenant le token
//  */
// export const login = async (
//   credentials: LoginCredentials
// ): Promise<LoginResponse> => {

//   const response = await axios.post<LoginResponse>(
//     `${API_URL}/login`,
//     new URLSearchParams(credentials),
//     {
//       headers: {
//         'Content-Type': 'application/x-www-form-urlencoded',
//       },
//     }
//   );
//   console.log(` ///////////// login 2 `);

//   return response.data;
// };
