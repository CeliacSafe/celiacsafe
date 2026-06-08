import { DarkTheme, DefaultTheme, type Theme } from '@react-navigation/native';

import { type AppColors } from '../theme/palette';

/** Baut das NavigationContainer-Theme aus der aktiven Palette. */
export function buildNavigationTheme(colors: AppColors, isDark: boolean): Theme {
  const base = isDark ? DarkTheme : DefaultTheme;
  return {
    ...base,
    dark: isDark,
    colors: {
      ...base.colors,
      primary: colors.primary,
      background: colors.background,
      card: colors.surface,
      text: colors.textPrimary,
      border: colors.border,
      notification: colors.heart,
    },
  };
}
