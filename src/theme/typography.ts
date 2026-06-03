import { Platform, type TextStyle } from 'react-native';

/**
 * Zentrale Typografie fuer CeliacSafe.
 *
 * Die Skala folgt einem modular vergroesserten Verhaeltnis (~1,25):
 * 11 → 12 → 13 → 15 → 17 → 18 → 22 → 28 → 32 → 36 pt
 *
 * Nutzung: style={[typography.body, { color: colors.textPrimary }]}
 * Aenderungen nur hier — die ganze App passt sich an.
 */

/** System-Schrift (keine Custom Fonts in M10). */
const fontFamily = Platform.select({
  ios: 'System',
  android: 'sans-serif',
  default: 'System',
});

export const typography = {
  /** Hero, Splash, sehr prominente Titel */
  displayLarge: {
    fontFamily,
    fontSize: 36,
    fontWeight: '700',
    lineHeight: 44,
  } satisfies TextStyle,

  /** Screen-Titel (Buscar, Profil) */
  display: {
    fontFamily,
    fontSize: 32,
    fontWeight: '700',
    lineHeight: 40,
  } satisfies TextStyle,

  /** Detail-Restaurantname, About-Hero */
  h1: {
    fontFamily,
    fontSize: 28,
    fontWeight: '700',
    lineHeight: 36,
  } satisfies TextStyle,

  /** Unterueberschriften, Bottom-Sheet-Titel */
  h2: {
    fontFamily,
    fontSize: 22,
    fontWeight: '700',
    lineHeight: 28,
  } satisfies TextStyle,

  /** Karten-Titel, Empty-State-Titel, Sektions-Ueberschriften */
  h3: {
    fontFamily,
    fontSize: 18,
    fontWeight: '600',
    lineHeight: 24,
  } satisfies TextStyle,

  /** Filter-Pills, kompakte Labels, Listen-Zeilen */
  h4: {
    fontFamily,
    fontSize: 15,
    fontWeight: '600',
    lineHeight: 20,
  } satisfies TextStyle,

  /** Hervorgehobener Fliesstext (Stadt in Detail-Header) */
  bodyLarge: {
    fontFamily,
    fontSize: 17,
    fontWeight: '400',
    lineHeight: 24,
  } satisfies TextStyle,

  /** Standard-Fliesstext */
  body: {
    fontFamily,
    fontSize: 15,
    fontWeight: '400',
    lineHeight: 22,
  } satisfies TextStyle,

  /** Sekundaerer Text, Meta-Informationen */
  bodySmall: {
    fontFamily,
    fontSize: 13,
    fontWeight: '400',
    lineHeight: 18,
  } satisfies TextStyle,

  /** Primaere Buttons */
  button: {
    fontFamily,
    fontSize: 16,
    fontWeight: '600',
    lineHeight: 22,
  } satisfies TextStyle,

  /** Hinweise, Disclaimer, kleine Labels */
  caption: {
    fontFamily,
    fontSize: 12,
    fontWeight: '400',
    lineHeight: 16,
  } satisfies TextStyle,

  /** Sektionstitel Profil, Counter Buscar (GROSSBUCHSTABEN) */
  overline: {
    fontFamily,
    fontSize: 11,
    fontWeight: '700',
    lineHeight: 16,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  } satisfies TextStyle,

  /** Badges auf Karten (SIN GLUTEN, VERIFIED) */
  badge: {
    fontFamily,
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  } satisfies TextStyle,

  /** Bottom-Tab-Beschriftung */
  tabLabel: {
    fontFamily,
    fontSize: 11,
    fontWeight: '500',
    lineHeight: 14,
  } satisfies TextStyle,
} as const;

export type TypographyVariant = keyof typeof typography;
