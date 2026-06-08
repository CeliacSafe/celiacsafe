import { useMemo } from 'react';

import { useTheme } from './ThemeContext';
import { type AppColors } from './palette';

/**
 * Erzeugt theme-abhaengige Styles, die bei Theme-Wechsel neu berechnet werden.
 *
 * Nutzung:
 *   const styles = useThemedStyles(createStyles);
 *   // ...
 *   const createStyles = (colors: AppColors) => StyleSheet.create({ ... });
 */
export function useThemedStyles<T>(factory: (colors: AppColors) => T): T {
  const { colors } = useTheme();
  return useMemo(() => factory(colors), [factory, colors]);
}
