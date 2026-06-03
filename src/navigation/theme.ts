import { DarkTheme, type Theme } from '@react-navigation/native';

import { colors } from '../theme/colors';

/** Einheitliches Dark-Theme fuer NavigationContainer und Header. */
export const navigationTheme: Theme = {
  ...DarkTheme,
  dark: true,
  colors: {
    ...DarkTheme.colors,
    primary: colors.primary,
    background: colors.background,
    card: colors.surface,
    text: colors.textPrimary,
    border: colors.primaryDark,
    notification: colors.heart,
  },
};
