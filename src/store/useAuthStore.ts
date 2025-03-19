// src/store/useAuthStore.ts
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { doc, setDoc, onSnapshot } from 'firebase/firestore';
import { db } from '../../src/api/firebase/firebase';
import { authApi } from '../../src/api/auth/authApi';

interface AuthState {
  user: {
    id: string;
    name: string;
    family_name: string;
    username: string;
    email: string;
    phone_number: string;
  } | null;
  token: string | null;
  permissions: Record<string, boolean | string | number> | null;
  isLoading: boolean;
  error: string | null;
  setUser: (
    user: {
      id: string;
      name: string;
      family_name: string;
      username: string;
      email: string;
      phone_number: string;
    } | null
  ) => void;
  setPermission: (
    permissions: Record<string, boolean | string | number> | null
  ) => void;
  setToken: (token: string | null) => void;
  login: (credentials: { username: string; password: string }) => Promise<void>;
  logout: () => void;
  syncPermissionsWithFirestore: () => Promise<void>;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      permissions: null,
      isLoading: false,
      error: null,

      setUser: (user) => set({ user }),
      setPermission: (permissions) => set({ permissions }),
      setToken: (token) => set({ token }),

      login: async (credentials) => {
        set({ isLoading: true, error: null });
        try {
          const { token, permissions, user } = await authApi(credentials);
          set({ user, token, permissions, isLoading: false });
          console.log('debut de synchro avec firebase');

          // Synchronise avec Firestore
          await get().syncPermissionsWithFirestore();

          // Écoute les mises à jour Firestore (optionnel, pour réactivité)
          const userRef = doc(db, 'users', user.id);
          onSnapshot(
            userRef,
            (docSnapshot) => {
              if (docSnapshot.exists()) {
                const data = docSnapshot.data();
                set({
                  user:
                    data.id && data.username
                      ? {
                          id: data.id,
                          name: data.name,
                          family_name: data.family_name,
                          username: data.username,
                          email: data.email,
                          phone_number: data.phone_number,
                        }
                      : null,
                  permissions: data.permissions,
                });
              }
            },
            (err) => {
              set({
                error:
                  'Erreur lors de l’écoute des permissions : ' + err.message,
              });
            }
          );
        } catch (err: any) {
          set({ error: err.message, isLoading: false });
          throw err;
        }
      },

      logout: () => {
        set({
          user: null,
          token: null,
          permissions: null,
          isLoading: false,
          error: null,
        });
      },

      syncPermissionsWithFirestore: async () => {
        const state = get();
        if (!state.user || !state.token || !state.permissions) return;

        set({ isLoading: true });
        try {
          console.log(
            'Début de synchronisation avec Firestore : ',
            state.permissions
          );
          const userRef = doc(db, 'users', state.user.id);
          await setDoc(
            userRef,
            {
              id: state.user.id,
              name: state.user.name,
              family_name: state.user.family_name,
              username: state.user.username,
              permissions: state.permissions,
              email: state.user.email,
              phone_number: state.user.phone_number,

              updatedAt: new Date().toISOString(),
            },
            { merge: true }
          );
          console.log('Synchronisation Firestore terminée');
          set({ isLoading: false });
        } catch (err: any) {
          set({
            error: 'Erreur lors de la synchronisation avec Firestore',
            isLoading: false,
          });
          console.error(err);
        }
      },

      // syncPermissionsWithFirestore: async () => {
      //   const state = get();
      //   console.log('control element avant synchro');
      //   if (!state.user || !state.token || !state.permissions) return;

      //   set({ isLoading: true });
      //   try {
      //     console.log('debut de syncro de luser : ', state);
      //     const userRef = doc(db, 'users', state.user.id);
      //     await setDoc(
      //       userRef,
      //       {
      //         id: state.user.id,
      //         name: state.user.name,
      //         family_name: state.user.family_name,
      //         username: state.user.username,
      //         permissions: state.permissions,
      //         updatedAt: new Date().toISOString(),
      //       },
      //       { merge: true }
      //     );
      //     set({ isLoading: false });
      //   } catch (err: any) {
      //     set({
      //       error: 'Erreur lors de la synchronisation avec Firestore',
      //       isLoading: false,
      //     });
      //     console.error(err);
      //   }
      // },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        permissions: state.permissions,
      }),
    }
  )
);

// src/store/useAuthStore.ts
// import { create } from 'zustand';
// import { persist } from 'zustand/middleware';
// import { getAuth } from 'firebase/auth';
// import { doc, setDoc, onSnapshot } from 'firebase/firestore';
// import { auth, db } from '../../src/api/firebase/firebase';
// import { authApi } from '../../src/api/auth/authApi';

// interface AuthState {
//   user: { id: string; username: string } | null;
//   token: string | null;
//   permissions: Record<string, boolean | string | number> | null;
//   isLoading: boolean;
//   error: string | null;
//   setUser: (user: { id: string; username: string } | null) => void;
//   setPermission: (
//     permissions: Record<string, boolean | string | number> | null
//   ) => void;
//   setToken: (token: string | null) => void;
//   login: (credentials: { username: string; password: string }) => Promise<void>;
//   logout: () => Promise<void>;
//   syncPermissionsWithFirestore: () => Promise<void>;
// }

// export const useAuthStore = create<AuthState>()(
//   persist(
//     (set, get) => ({
//       user: null,
//       token: null,
//       permissions: null,
//       isLoading: false,
//       error: null,

//       setUser: (user) => set({ user }),
//       setPermission: (permissions) => set({ permissions }),
//       setToken: (token) => set({ token }),

//       login: async (credentials) => {
//         set({ isLoading: true, error: null });
//         try {
//           const { token, permissions, user } = await authApi(credentials);
//           set({ user, token, permissions, isLoading: false });
//           await get().syncPermissionsWithFirestore();
//         } catch (err: any) {
//           set({ error: err.message, isLoading: false });
//           throw err;
//         }
//       },

//       logout: async () => {
//         await getAuth().signOut();
//         set({
//           user: null,
//           token: null,
//           permissions: null,
//           isLoading: false,
//           error: null,
//         });
//       },

//       syncPermissionsWithFirestore: async () => {
//         const state = get();
//         if (!state.user || !state.token || !state.permissions) return;

//         set({ isLoading: true });
//         try {
//           const userRef = doc(db, 'users', state.user.id);
//           await setDoc(
//             userRef,
//             {
//               id: state.user.id,
//               username: state.user.username,
//               permissions: state.permissions,
//               updatedAt: new Date().toISOString(),
//             },
//             { merge: true }
//           );
//           set({ isLoading: false });
//         } catch (err: any) {
//           set({
//             error: 'Erreur lors de la synchronisation avec Firestore',
//             isLoading: false,
//           });
//           console.error(err);
//         }
//       },
//     }),
//     {
//       name: 'auth-storage',
//       partialize: (state) => ({
//         user: state.user,
//         token: state.token,
//         permissions: state.permissions,
//       }),
//     }
//   )
// );

// // Écoute les mises à jour Firestore
// const firebaseAuth = getAuth();
// firebaseAuth.onAuthStateChanged((firebaseUser) => {
//   if (firebaseUser) {
//     const userRef = doc(db, 'users', firebaseUser.uid);
//     onSnapshot(
//       userRef,
//       (docSnapshot) => {
//         if (docSnapshot.exists()) {
//           const data = docSnapshot.data();
//           set({
//             user:
//               data.id && data.username
//                 ? { id: data.id, username: data.username }
//                 : null,
//             permissions: data.permissions,
//           });
//         }
//       },
//       (err) => {
//         set({
//           error: 'Erreur lors de l’écoute des permissions : ' + err.message,
//         });
//       }
//     );
//   } else {
//     set({ user: null, token: null, permissions: null });
//   }
// });

// // // src/store/useAuthStore.ts
// // import { create } from 'zustand';
// // import { persist } from 'zustand/middleware';
// // import { getAuth, signInWithCustomToken } from 'firebase/auth';
// // import { doc, setDoc, onSnapshot } from 'firebase/firestore';
// // import { auth, db } from '../../src/api/firebase/firebase';
// // import { authApi } from '../../src/api/auth/authApi'; // Importe ta fonction authApi

// // interface AuthState {
// //   user: { id: string; username: string } | null;
// //   token: string | null;
// //   permissions: Record<string, boolean> | null;
// //   isLoading: boolean;
// //   error: string | null;
// //   setUser: (user: { id: string; username: string } | null) => void;
// //   setPermission: (permissions: Record<string, boolean> | null) => void;
// //   setToken: (token: string | null) => void;
// //   login: (credentials: { username: string; password: string }) => Promise<void>;
// //   logout: () => Promise<void>;
// //   syncPermissionsWithFirestore: () => Promise<void>;
// // }

// // export const useAuthStore = create<AuthState>()(
// //   persist(
// //     (set, get) => ({
// //       user: null,
// //       token: null,
// //       permissions: null,
// //       isLoading: false,
// //       error: null,

// //       setUser: (user) => set({ user }),
// //       setPermission: (permissions) => set({ permissions }),
// //       setToken: (token) => set({ token }),

// //       login: async (credentials) => {
// //         set({ isLoading: true, error: null });
// //         try {
// //           // Appelle ton API pour obtenir le token et les permissions
// //           const { token, permissions, user } = await authApi(credentials);

// //           // Met à jour l'état local
// //           set({ user, token, permissions, isLoading: false });

// //           // Synchronise avec Firestore
// //           await get().syncPermissionsWithFirestore();

// //           // Optionnel : Si ton API ne fournit pas un token Firebase, utilise un token personnalisé
// //           // const firebaseToken = await getFirebaseCustomTokenFromApi(token);
// //           // await signInWithCustomToken(getAuth(), firebaseToken);
// //         } catch (err: any) {
// //           set({ error: err.message, isLoading: false });
// //           throw err;
// //         }
// //       },

// //       logout: async () => {
// //         await getAuth().signOut();
// //         set({ user: null, token: null, permissions: null, isLoading: false, error: null });
// //       },

// //       syncPermissionsWithFirestore: async () => {
// //         const state = get();
// //         if (!state.user || !state.token || !state.permissions) return;

// //         set({ isLoading: true });
// //         try {
// //           const userRef = doc(db, 'users', state.user.id);
// //           await setDoc(
// //             userRef,
// //             {
// //               id: state.user.id,
// //               username: state.user.username,
// //               permissions: state.permissions,
// //               updatedAt: new Date().toISOString(),
// //             },
// //             { merge: true }
// //           );
// //           set({ isLoading: false });
// //         } catch (err: any) {
// //           set({ error: 'Erreur lors de la synchronisation avec Firestore', isLoading: false });
// //         }
// //       },
// //     }),
// //     {
// //       name: 'auth-storage',
// //       partialize: (state) => ({
// //         user: state.user,
// //         token: state.token,
// //         permissions: state.permissions,
// //       }),
// //     }
// //   )
// // );

// // // Écoute les changements d'état Firebase Auth
// // const firebaseAuth = getAuth();
// // onSnapshot(doc(db, 'users', firebaseAuth.currentUser?.uid || ''), (docSnapshot) => {
// //   if (docSnapshot.exists()) {
// //     const data = docSnapshot.data();
// //     useAuthStore.setState({
// //       permissions: data.permissions,
// //       user: data.id && data.username ? { id: data.id, username: data.username } : null,
// //     });
// //   }
// // });

// // // import { create } from 'zustand';
// // // import { persist } from 'zustand/middleware';
// // // import type { User } from '../types/auth';
// // // import type { UserPermissions } from '../types/permissions';

// // // // Définition de l'interface pour l'état d'authentification
// // // interface AuthState {
// // //   user: User | null; // Informations sur l'utilisateur
// // //   token: string | null; // Jeton d'authentification
// // //   permissions: UserPermissions | null; // Permissions utilisateur
// // //   setUser: (user: User | null) => void; // Met à jour l'utilisateur
// // //   setPermission: (permissions: UserPermissions | null) => void; // Met à jour les permissions
// // //   setToken: (token: string | null) => void; // Met à jour le token
// // //   logout: () => void; // Réinitialise l'état d'authentification
// // // }

// // // // Création du store zustand avec persistance
// // // export const useAuthStore = create<AuthState>()(
// // //   persist(
// // //     (set) => ({
// // //       // État initial
// // //       user: null,
// // //       token: null,
// // //       permissions: null,

// // //       // Mise à jour des informations utilisateur
// // //       setUser: (user) => set({ user }),

// // //       // Mise à jour des permissions
// // //       setPermission: (permissions) => set({ permissions }),

// // //       // Mise à jour du jeton
// // //       setToken: (token) => set({ token }),

// // //       // Déconnexion : réinitialise l'état
// // //       logout: () => set({ user: null, token: null, permissions: null }),
// // //     }),
// // //     {
// // //       name: 'auth-storage', // Nom utilisé pour le stockage local
// // //       partialize: (state) => ({
// // //         token: state.token,
// // //         permissions: state.permissions,
// // //       }), // Persist token et permission
// // //     }
// // //   )
// // // );
