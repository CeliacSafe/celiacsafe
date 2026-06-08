import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

/**
 * Persistierte Theme-Praeferenz.
 *
 * - 'light'  : immer helles Theme (Default)
 * - 'dark'   : immer dunkles Theme
 * - 'system' : folgt dem Geraet (Appearance)
 */
export type ThemePreference = 'light' | 'dark' | 'system';

interface ThemeState {
  preference: ThemePreference;
  hasHydrated: boolean;

  setPreference: (preference: ThemePreference) => void;
  setHasHydrated: (value: boolean) => void;
}

export const useThemeStore = create<ThemeState>()(
  persist(
    (set) => ({
      preference: 'light',
      hasHydrated: false,

      setHasHydrated: (value) => set({ hasHydrated: value }),
      setPreference: (preference) => set({ preference }),
    }),
    {
      name: 'celiacsafe-theme',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({ preference: state.preference }),
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true);
      },
    }
  )
);

export type { ThemeState };
