import { Platform, type ViewStyle } from 'react-native';

/**
 * Zentrales Spacing-System fuer CeliacSafe.
 * Folgt einem 4-Punkt-Grid: alle Werte sind Vielfache von 4.
 *
 * Nutzung: paddingHorizontal: spacing.screenPadding
 * Aenderungen nur hier — Layout wird app-weit konsistenter.
 */
export const spacing = {
  /** Sehr eng — z. B. zwischen Icon und Label im Button */
  xs: 4,
  /** Eng — z. B. zwischen Pills, Action-Buttons */
  sm: 8,
  /** Standard — haeufigste Padding-Groesse */
  md: 16,
  /** Grosszuegig — z. B. zwischen Sektionen */
  lg: 24,
  /** Sehr grosszuegig — z. B. um Hero-Bereiche */
  xl: 32,
  /** Selten — nur fuer deutliche Trennungen */
  xxl: 48,

  /** Horizontaler Rand des Screen-Inhalts */
  screenPadding: 20,
  /** Innerer Padding einer Card */
  cardPadding: 16,
  /** Vertikaler Abstand zwischen Sektionen */
  sectionGap: 24,
} as const;

/**
 * Border-Radius-Skala.
 */
export const radius = {
  none: 0,
  /** Kleine Akzente (z. B. Tooltips) */
  sm: 4,
  /** Buttons, kleine Container */
  md: 8,
  /** Mittlere Container, Sektionen */
  lg: 12,
  /** Cards */
  xl: 16,
  /** Cards, Editorial-Bilder */
  card: 14,
  /** Hero-Bereiche */
  xxl: 24,
  /** Runde Icon-/Flaggen-Container (20px, wie screenPadding) */
  icon: 20,
  /** Pill-/Badge-Form (immer rund) */
  pill: 999,
} as const;

/**
 * Schatten-Stile (plattformspezifisch).
 */
export const shadows = {
  none: {} satisfies ViewStyle,
  small: Platform.select<ViewStyle>({
    ios: {
      shadowColor: '#2a2a28',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.06,
      shadowRadius: 8,
    },
    android: { elevation: 2 },
    default: {},
  }),
  medium: Platform.select<ViewStyle>({
    ios: {
      shadowColor: '#2a2a28',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.08,
      shadowRadius: 12,
    },
    android: { elevation: 4 },
    default: {},
  }),
  large: Platform.select<ViewStyle>({
    ios: {
      shadowColor: '#2a2a28',
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.12,
      shadowRadius: 20,
    },
    android: { elevation: 8 },
    default: {},
  }),
} as const;

/** @deprecated Nutze spacing.xs */
export const SPACE_XS = spacing.xs;
/** @deprecated Nutze spacing.sm */
export const SPACE_SM = spacing.sm;
/** @deprecated Nutze spacing.cardPadding */
export const SPACE_MD = spacing.cardPadding;
/** @deprecated Nutze spacing.md */
export const SPACE_LG = spacing.md;
/** @deprecated Nutze spacing.screenPadding */
export const SPACE_XL = spacing.screenPadding;
/** @deprecated Nutze spacing.sectionGap */
export const SPACE_XXL = spacing.sectionGap;
/** @deprecated Nutze spacing.xl */
export const SPACE_3XL = spacing.xl;
/** @deprecated Nutze spacing.xl */
export const SPACE_XXXL = spacing.xl;
