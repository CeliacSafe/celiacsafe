import type { NativeStackNavigationOptions } from '@react-navigation/native-stack';

import { colors } from '../theme/colors';

/** Gemeinsame Stack-Optionen: Dark Theme + Slide-Transition. */
export const stackScreenOptions: NativeStackNavigationOptions = {
  headerStyle: { backgroundColor: colors.background },
  headerTintColor: colors.primary,
  headerTitleStyle: { color: colors.textPrimary, fontWeight: '700' },
  headerShadowVisible: false,
  contentStyle: { backgroundColor: colors.background },
  animation: 'slide_from_right',
  gestureEnabled: true,
  gestureDirection: 'horizontal',
  fullScreenGestureEnabled: true,
};
