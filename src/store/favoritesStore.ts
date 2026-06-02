import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

/**
 * Persistierter Favoriten-Store.
 *
 * Wir speichern nur Restaurant-IDs plus ISO-Zeitstempel (wann favorisiert),
 * nicht die ganzen Restaurant-Objekte — klein, konsistent bei Daten-Updates.
 */
interface FavoritesState {
  /** Map von Restaurant-ID -> ISO-Zeitstempel des Hinzufuegens */
  favorites: Record<string, string>;

  /**
   * True, sobald AsyncStorage geladen wurde.
   * Vorher duerfen Favoriten-UI und Tab-Badge noch nicht rendern.
   */
  hasHydrated: boolean;

  addFavorite: (id: string) => void;
  removeFavorite: (id: string) => void;
  toggleFavorite: (id: string) => void;
  clearAllFavorites: () => void;

  isFavorite: (id: string) => boolean;
  getFavoriteCount: () => number;
  /** IDs sortiert nach Hinzufuege-Datum — juengste zuerst */
  getFavoriteIdsSortedByDate: () => string[];

  /** Wird von der persist-Middleware nach Rehydration aufgerufen */
  setHasHydrated: (value: boolean) => void;
}

export const useFavoritesStore = create<FavoritesState>()(
  persist(
    (set, get) => ({
      favorites: {},
      hasHydrated: false,

      setHasHydrated: (value) => set({ hasHydrated: value }),

      addFavorite: (id) =>
        set((state) => ({
          favorites: {
            ...state.favorites,
            [id]: new Date().toISOString(),
          },
        })),

      removeFavorite: (id) =>
        set((state) => {
          const next = { ...state.favorites };
          delete next[id];
          return { favorites: next };
        }),

      toggleFavorite: (id) => {
        if (get().isFavorite(id)) {
          get().removeFavorite(id);
        } else {
          get().addFavorite(id);
        }
      },

      clearAllFavorites: () => set({ favorites: {} }),

      isFavorite: (id) => Object.prototype.hasOwnProperty.call(get().favorites, id),

      getFavoriteCount: () => Object.keys(get().favorites).length,

      getFavoriteIdsSortedByDate: () =>
        Object.entries(get().favorites)
          .sort(([, left], [, right]) => right.localeCompare(left))
          .map(([favoriteId]) => favoriteId),
    }),
    {
      name: 'celiacsafe-favorites',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({ favorites: state.favorites }),
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true);
      },
    }
  )
);

export type { FavoritesState };
