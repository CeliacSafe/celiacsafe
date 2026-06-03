import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import i18n, { getDeviceLanguage, type SupportedLanguage } from '../i18n';

/**
 * Persistierter Sprach-Store mit manuellem Override.
 *
 * Ohne userOverride folgt die App der Geraetesprache (auch nach Neustart).
 * Nach manueller Wahl bleibt die Sprache fix, bis resetToDevice().
 */
interface LanguageState {
  language: SupportedLanguage;
  userOverride: boolean;
  hasHydrated: boolean;

  setLanguage: (lang: SupportedLanguage) => void;
  resetToDevice: () => void;
  setHasHydrated: (value: boolean) => void;
}

export const useLanguageStore = create<LanguageState>()(
  persist(
    (set) => ({
      language: 'es',
      userOverride: false,
      hasHydrated: false,

      setHasHydrated: (value) => set({ hasHydrated: value }),

      setLanguage: (lang) => {
        i18n.changeLanguage(lang).catch(() => undefined);
        set({ language: lang, userOverride: true });
      },

      resetToDevice: () => {
        const deviceLang = getDeviceLanguage();
        i18n.changeLanguage(deviceLang).catch(() => undefined);
        set({ language: deviceLang, userOverride: false });
      },
    }),
    {
      name: 'celiacsafe-language',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        language: state.language,
        userOverride: state.userOverride,
      }),
      onRehydrateStorage: () => (state) => {
        if (state) {
          if (!state.userOverride) {
            const deviceLang = getDeviceLanguage();
            state.language = deviceLang;
            i18n.changeLanguage(deviceLang).catch(() => undefined);
          } else {
            i18n.changeLanguage(state.language).catch(() => undefined);
          }
          state.setHasHydrated(true);
        }
      },
    }
  )
);

export type { LanguageState };
