import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// Définition de l'interface pour l'état d'authentification
interface AuthState {
  user: { id: string; username: string } | null; // Informations sur l'utilisateur
  token: string | null; // Jeton d'authentification
  permissions: Record<string, boolean> | null; // Permissions utilisateur comme objet brut JSON
  setUser: (user: { id: string; username: string } | null) => void; // Met à jour l'utilisateur
  setPermission: (permissions: Record<string, boolean> | null) => void; // Met à jour les permissions
  setToken: (token: string | null) => void; // Met à jour le token
  logout: () => void; // Réinitialise l'état d'authentification
}

// Création du store zustand avec persistance
export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      permissions: null,

      setUser: (user) => set({ user }),
      setPermission: (permissions) => set({ permissions }), // Directement stocker l'objet JSON
      setToken: (token) => set({ token }),
      logout: () => set({ user: null, token: null, permissions: null }),
    }),
    {
      name: 'auth-storage', // Nom utilisé pour le stockage local
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        permissions: state.permissions, // Sauvegarde directe des permissions
      }),
    }
  )
);

// import { create } from 'zustand';
// import { persist } from 'zustand/middleware';
// import type { User } from '../types/auth';
// import type { UserPermissions } from '../types/permissions';

// // Définition de l'interface pour l'état d'authentification
// interface AuthState {
//   user: User | null; // Informations sur l'utilisateur
//   token: string | null; // Jeton d'authentification
//   permissions: UserPermissions | null; // Permissions utilisateur
//   setUser: (user: User | null) => void; // Met à jour l'utilisateur
//   setPermission: (permissions: UserPermissions | null) => void; // Met à jour les permissions
//   setToken: (token: string | null) => void; // Met à jour le token
//   logout: () => void; // Réinitialise l'état d'authentification
// }

// // Création du store zustand avec persistance
// export const useAuthStore = create<AuthState>()(
//   persist(
//     (set) => ({
//       // État initial
//       user: null,
//       token: null,
//       permissions: null,

//       // Mise à jour des informations utilisateur
//       setUser: (user) => set({ user }),

//       // Mise à jour des permissions
//       setPermission: (permissions) => set({ permissions }),

//       // Mise à jour du jeton
//       setToken: (token) => set({ token }),

//       // Déconnexion : réinitialise l'état
//       logout: () => set({ user: null, token: null, permissions: null }),
//     }),
//     {
//       name: 'auth-storage', // Nom utilisé pour le stockage local
//       partialize: (state) => ({
//         token: state.token,
//         permissions: state.permissions,
//       }), // Persist token et permission
//     }
//   )
// );
