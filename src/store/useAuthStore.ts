import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { doc, setDoc, onSnapshot, Unsubscribe } from 'firebase/firestore';
import { getAuth, signOut } from 'firebase/auth';
import { db } from '../../src/api/firebase/firebase';
import { authApi, logoutApi } from '../../src/api/auth/authApi';

interface AuthState {
  user: {
    id: string;
    name: string;
    family_name: string;
    username: string;
    email: string;
    phone_number: string | null;
  } | null;
  token: string | null;
  permissions: Record<string, boolean | string | number> | null;
  isLoading: boolean;
  error: string | null;
  unsubscribe?: Unsubscribe;
  setUser: (user: {
    id: string;
    name: string;
    family_name: string;
    username: string;
    email: string;
    phone_number: string | null;
  } | null) => void;
  setPermission: (permissions: Record<string, boolean | string | number> | null) => void;
  setToken: (token: string | null) => void;
  login: (credentials: { username: string; password: string }) => Promise<void>;
  logout: () => Promise<void>;
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
      unsubscribe: undefined,

      setUser: (user) => set({ user }),
      setPermission: (permissions) => set({ permissions }),
      setToken: (token) => set({ token }),

      login: async (credentials) => {
        set({ isLoading: true, error: null });
        try {
          const { token, permissions, user } = await authApi(credentials);
          set({ user, token, permissions, isLoading: false });
          
          await get().syncPermissionsWithFirestore();

          const userRef = doc(db, 'users', user.id);
          const unsubscribe = onSnapshot(
            userRef,
            (docSnapshot) => {
              if (docSnapshot.exists()) {
                const data = docSnapshot.data();
                set({
                  user: data.id && data.username ? {
                    id: data.id,
                    name: data.name,
                    family_name: data.family_name,
                    username: data.username,
                    email: data.email,
                    phone_number: data.phone_number,
                  } : null,
                  permissions: data.permissions,
                });
              }
            },
            (err) => {
              set({ error: "Erreur lors de l'écoute des permissions : " + err.message });
            }
          );

          set({ unsubscribe });
        } catch (err: any) {
          set({ error: err.message, isLoading: false });
          throw err;
        }
      },

      logout: async () => {
        const { unsubscribe, token } = get();

        if (unsubscribe) {
          unsubscribe();
        }

        if (token) {
          try {
            await logoutApi(token);
          } catch (err) {
            console.warn('Erreur lors de la déconnexion, continuons le processus');
          }
        }

        try {
          await signOut(getAuth());
        } catch (err) {
          console.warn('Erreur lors de la déconnexion Firebase, continuons le processus');
        }

        set({
          user: null,
          token: null,
          permissions: null,
          isLoading: false,
          error: null,
          unsubscribe: undefined,
        });

        localStorage.removeItem('auth-storage');
      },

      syncPermissionsWithFirestore: async () => {
        const state = get();
        if (!state.user || !state.token || !state.permissions) return;

        set({ isLoading: true });
        try {
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
          set({ isLoading: false });
        } catch (err: any) {
          set({
            error: 'Erreur lors de la synchronisation avec Firestore',
            isLoading: false,
          });
          console.error(err);
        }
      },
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