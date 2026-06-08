import { lightColors } from './palette';

/**
 * Standard-Farben (helle Palette).
 *
 * Statische Styles, die nicht auf Theme-Wechsel reagieren muessen,
 * koennen weiterhin direkt `colors` importieren. Fuer Light/Dark-faehige
 * Komponenten stattdessen `useTheme()` + `useThemedStyles()` nutzen.
 */
export const colors = lightColors;

export type AppColor = keyof typeof colors;
