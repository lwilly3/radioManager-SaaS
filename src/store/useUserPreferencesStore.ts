import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { db } from '../api/firebase/firebase';
import { useAuthStore } from './useAuthStore';

interface UserPreferences {
  viewMode: 'grid' | 'list';
}

interface UserPreferencesState {
  preferences: UserPreferences;
  isLoading: boolean;
  error: string | null;
  setViewMode: (mode: 'grid' | 'list') => void;
  loadPreferences: () => Promise<void>;
  savePreferences: () => Promise<void>;
}

const DEFAULT_PREFERENCES: UserPreferences = {
  viewMode: 'list', // Default to list view
};

export const useUserPreferencesStore = create<UserPreferencesState>()(
  persist(
    (set, get) => ({
      preferences: DEFAULT_PREFERENCES,
      isLoading: false,
      error: null,

      setViewMode: (mode) => {
        set((state) => ({
          preferences: {
            ...state.preferences,
            viewMode: mode,
          },
        }));
        get().savePreferences();
      },

      loadPreferences: async () => {
        const user = useAuthStore.getState().user;
        if (!user) return;

        set({ isLoading: true, error: null });
        try {
          const prefsRef = doc(db, 'user_preferences', user.id);
          const docSnap = await getDoc(prefsRef);

          if (docSnap.exists()) {
            const data = docSnap.data() as UserPreferences;
            set({ preferences: data });
          } else {
            // If no preferences exist yet, save the defaults
            await get().savePreferences();
          }
        } catch (err) {
          console.error('Error loading user preferences:', err);
          set({ error: 'Failed to load preferences' });
        } finally {
          set({ isLoading: false });
        }
      },

      savePreferences: async () => {
        const user = useAuthStore.getState().user;
        if (!user) return;

        set({ isLoading: true, error: null });
        try {
          const prefsRef = doc(db, 'user_preferences', user.id);
          await setDoc(prefsRef, get().preferences);
        } catch (err) {
          console.error('Error saving user preferences:', err);
          set({ error: 'Failed to save preferences' });
        } finally {
          set({ isLoading: false });
        }
      },
    }),
    {
      name: 'user-preferences-storage',
    }
  )
);