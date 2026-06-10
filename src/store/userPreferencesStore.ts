import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import type { RestaurantAllergens } from '../types/Restaurant';

/** Persistierte Ernaehrungs-/Allergie-Praeferenzen im Nutzerprofil. */
export type DietaryPreferenceKey = 'lactoseFree' | 'vegan' | 'wheatFree';

export interface UserDietaryPreferences {
  lactoseFree: boolean;
  vegan: boolean;
  wheatFree: boolean;
}

/** Zuordnung zu Restaurant-Allergenfeldern fuer kuenftige Filterung. */
export const DIETARY_TO_ALLERGEN: Record<DietaryPreferenceKey, keyof RestaurantAllergens> = {
  lactoseFree: 'sin_lactosa',
  vegan: 'vegan',
  wheatFree: 'sin_trigo',
};

interface UserPreferencesState {
  dietary: UserDietaryPreferences;
  hasHydrated: boolean;

  setDietaryPreference: (key: DietaryPreferenceKey, value: boolean) => void;
  toggleDietaryPreference: (key: DietaryPreferenceKey) => void;
  setHasHydrated: (value: boolean) => void;
}

const defaultDietary: UserDietaryPreferences = {
  lactoseFree: false,
  vegan: false,
  wheatFree: false,
};

export const useUserPreferencesStore = create<UserPreferencesState>()(
  persist(
    (set) => ({
      dietary: defaultDietary,
      hasHydrated: false,

      setHasHydrated: (value) => set({ hasHydrated: value }),

      setDietaryPreference: (key, value) =>
        set((state) => ({
          dietary: { ...state.dietary, [key]: value },
        })),

      toggleDietaryPreference: (key) =>
        set((state) => ({
          dietary: { ...state.dietary, [key]: !state.dietary[key] },
        })),
    }),
    {
      name: 'celiacsafe-user-preferences',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({ dietary: state.dietary }),
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true);
      },
    }
  )
);

export type { UserPreferencesState };
