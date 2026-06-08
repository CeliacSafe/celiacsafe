import type { NativeStackNavigationOptions } from '@react-navigation/native-stack';

import { useTheme } from '../theme/ThemeContext';
import { fontFamilies } from '../theme/fonts';
import { type AppColors } from '../theme/palette';

/** Gemeinsame Stack-Optionen aus der aktiven Palette. */
export function buildStackScreenOptions(colors: AppColors): NativeStackNavigationOptions {
  return {
    headerStyle: { backgroundColor: colors.background },
    headerTintColor: colors.primary,
    headerTitleStyle: { color: colors.textPrimary, fontFamily: fontFamilies.sansSemiBold },
    headerShadowVisible: false,
    contentStyle: { backgroundColor: colors.background },
    animation: 'slide_from_right',
    gestureEnabled: true,
    gestureDirection: 'horizontal',
    fullScreenGestureEnabled: true,
  };
}

/** Hook-Variante fuer theme-reaktive Stacks. */
export function useStackScreenOptions(): NativeStackNavigationOptions {
  const { colors } = useTheme();
  return buildStackScreenOptions(colors);
}
