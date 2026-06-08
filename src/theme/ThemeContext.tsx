import {
  createContext,
  useContext,
  useMemo,
  type ReactNode,
} from 'react';
import { useColorScheme } from 'react-native';

import { useThemeStore, type ThemePreference } from '../store/themeStore';
import { palettes, type AppColors, type ThemeScheme } from './palette';

interface ThemeContextValue {
  /** Aktive Farbpalette (light oder dark). */
  colors: AppColors;
  /** Aufgeloestes Schema. */
  scheme: ThemeScheme;
  isDark: boolean;
  /** Nutzer-Praeferenz (light | dark | system). */
  preference: ThemePreference;
  setPreference: (preference: ThemePreference) => void;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const systemScheme = useColorScheme();
  const preference = useThemeStore((state) => state.preference);
  const setPreference = useThemeStore((state) => state.setPreference);

  const value = useMemo<ThemeContextValue>(() => {
    const scheme: ThemeScheme =
      preference === 'system' ? (systemScheme === 'dark' ? 'dark' : 'light') : preference;

    return {
      colors: palettes[scheme],
      scheme,
      isDark: scheme === 'dark',
      preference,
      setPreference,
    };
  }, [preference, systemScheme, setPreference]);

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme(): ThemeContextValue {
  const ctx = useContext(ThemeContext);
  if (!ctx) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return ctx;
}
