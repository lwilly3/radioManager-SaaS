import axios, { isAxiosError } from 'axios';
import type { LoginCredentials, LoginResponse } from '../../types/auth';

const API_URL = 'https://api.radio.audace.ovh';

export const authApi = async (
  credentials: LoginCredentials
): Promise<{
  token: string;
  permissions: Record<string, boolean | string | number>;
  user: {
    id: string;
    name: string;
    family_name: string;
    username: string;
    email: string;
    phone_number: string;
  };
}> => {
  try {
    const response = await axios.post<LoginResponse>(
      `${API_URL}/login`,
      new URLSearchParams({
        username: credentials.username,
        password: credentials.password,
      }),
      {
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      }
    );

    const adaptedResponse = {
      token: response.data.access_token,
      permissions: {
        ...response.data.permissions,
        user_id: String(response.data.permissions.user_id),
      },
      user: {
        id: String(response.data.permissions.user_id),
        name: response.data.name ?? 'Unknown',
        family_name: response.data.family_name ?? 'Unknown',
        username: response.data.username ?? credentials.username,
        email: response.data.email ?? 'Unknown',
        phone_number: response.data.phone_number ?? 'Unknown',
      },
    };

    return adaptedResponse;
  } catch (error) {
    console.error('Erreur lors de la connexion :', error);
    if (isAxiosError(error)) {
      throw new Error(
        error.response?.status === 401
          ? "Nom d'utilisateur ou mot de passe incorrect"
          : 'Une erreur est survenue, veuillez réessayer plus tard.'
      );
    }
    throw new Error('Une erreur inattendue est survenue.');
  }
};

// import axios from 'axios';
// import type { LoginCredentials, LoginResponse } from '../../types/auth';

// const API_URL = 'https://api.radio.audace.ovh';

// export const authApi = async (
//   credentials: LoginCredentials
// ): Promise<{
//   token: string;
//   permissions: Record<string, boolean | string | number>; // Accepte des valeurs variées
//   user: { id: string; name: string; family_name: string; username: string };
// }> => {
//   try {
//     const response = await axios.post<LoginResponse>(
//       `${API_URL}/login`,
//       new URLSearchParams(credentials),
//       {
//         headers: {
//           'Content-Type': 'application/x-www-form-urlencoded',
//         },
//       }
//     );
//     console.log(
//       'Contenu des permissions à sauvegarder :',
//       response.data.permissions
//     );

//     const adaptedResponse = {
//       token: response.data.access_token,
//       permissions: {
//         ...response.data.permissions,
//         user_id: String(response.data.permissions.user_id), // Convertit en string pour cohérence
//       },
//       user: {
//         name: response.data.name,
//         family_name: response.data.family_name,
//         id: String(response.data.permissions.user_id), // Convertit en string
//         username: credentials.username,
//       },
//     };

//     return adaptedResponse;
//   } catch (error) {
//     console.error('Erreur lors de la connexion :', error);
//     throw new Error(
//       error.response?.status === 401
//         ? "Nom d'utilisateur ou mot de passe incorrect"
//         : 'Une erreur est survenue, veuillez réessayer plus tard.'
//     );
//   }
// };

// // import axios from 'axios';
// // import type { LoginCredentials, LoginResponse } from '../../types/auth';

// // const API_URL = 'https://api.radio.audace.ovh';

// // /**
// //  * Appelle l'API pour authentifier l'utilisateur
// //  * @param credentials - Identifiants de l'utilisateur
// //  * @returns Réponse adaptée contenant le token, les permissions et d'autres données nécessaires
// //  */
// // export const authApi = async (
// //   credentials: LoginCredentials
// // ): Promise<{
// //   token: string;
// //   permissions: Record<string, boolean>;
// //   user: {
// //     id: string;
// //     username: string;
// //   };
// // }> => {
// //   try {
// //     const response = await axios.post<LoginResponse>(
// //       `${API_URL}/login`,
// //       new URLSearchParams(credentials),
// //       {
// //         headers: {
// //           'Content-Type': 'application/x-www-form-urlencoded',
// //         },
// //       }
// //     );
// //     console.log('contenue de permission to save :', response.data.permissions);

// //     // Adapter la réponse pour inclure uniquement les données nécessaires
// //     const adaptedResponse = {
// //       token: response.data.access_token, // Jeton d'accès
// //       permissions: response.data.permissions, // Permissions utilisateur
// //       user: {
// //         id: response.data.permissions.user_id,
// //         username: credentials.username, // Nom d'utilisateur fourni lors de la connexion
// //       },
// //     };

// //     return adaptedResponse; // Retourne la réponse adaptée
// //   } catch (error) {
// //     console.error('Erreur lors de la connexion :', error);

// //     // Gestion d'erreur adaptée
// //     throw new Error(
// //       error.response?.status === 401
// //         ? "Nom d'utilisateur ou mot de passe incorrect"
// //         : 'Une erreur est survenue, veuillez réessayer plus tard.'
// //     );
// //   }
// // };

// // // import axios from 'axios';
// // // import type { LoginCredentials, LoginResponse } from '../../types/auth';

// // // const API_URL = 'https://api.radio.audace.ovh';

// // // /**
// // //  * Handles user authentication with the backend API
// // //  */
// // // export const authApi = {
// // //   /**
// // //    * Login user with credentials
// // //    */
// // //   login: async (credentials: LoginCredentials): Promise<LoginResponse> => {
// // //     const formData = new URLSearchParams();
// // //     formData.append('username', credentials.username);
// // //     formData.append('password', credentials.password);

// // //     const response = await axios.post<LoginResponse>(
// // //       `${API_URL}/login`,
// // //       formData,
// // //       {
// // //         headers: {
// // //           'Content-Type': 'application/x-www-form-urlencoded',
// // //         },
// // //       }
// // //     );
// // //     console.log(` ///////////// ${response.data}`);
// // //     console.log(`Response data: ${JSON.stringify(response.data, null, 2)}`);

// // //     return response.data;
// // //   },
// // // };
