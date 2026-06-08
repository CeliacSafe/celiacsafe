import { type TextStyle } from 'react-native';

import { fontFamilies } from './fonts';

/**
 * Zentrale Typografie fuer CeliacSafe (Editorial-Botanical).
 *
 * Drei Familien:
 *  - Fraunces (serif)     -> Display, Headings, editoriale Titel
 *  - Inter Tight (sans)   -> Body, UI, Buttons, Listen
 *  - JetBrains Mono (mono) -> Overlines, Badges, Meta-Labels
 *
 * Nutzung: style={[typography.body, { color: colors.textPrimary }]}
 * Aenderungen nur hier — die ganze App passt sich an.
 *
 * Hinweis: Da gewichtsspezifische Custom-Fonts geladen werden, steuert die
 * `fontFamily` das Gewicht. `fontWeight` bleibt als Fallback (System-Schrift,
 * bevor die Fonts geladen sind) erhalten.
 */

export const typography = {
  /** Hero, Splash, sehr prominente Titel */
  displayLarge: {
    fontFamily: fontFamilies.serif,
    fontSize: 36,
    fontWeight: '500',
    lineHeight: 42,
    letterSpacing: -0.5,
  } satisfies TextStyle,

  /** Screen-Titel (Buscar, Profil) */
  display: {
    fontFamily: fontFamilies.serif,
    fontSize: 32,
    fontWeight: '500',
    lineHeight: 38,
    letterSpacing: -0.5,
  } satisfies TextStyle,

  /** Detail-Restaurantname, About-Hero */
  h1: {
    fontFamily: fontFamilies.serif,
    fontSize: 28,
    fontWeight: '500',
    lineHeight: 34,
    letterSpacing: -0.4,
  } satisfies TextStyle,

  /** Unterueberschriften, Bottom-Sheet-Titel */
  h2: {
    fontFamily: fontFamilies.serif,
    fontSize: 22,
    fontWeight: '500',
    lineHeight: 27,
    letterSpacing: -0.3,
  } satisfies TextStyle,

  /** Karten-Titel, Empty-State-Titel, Sektions-Ueberschriften */
  h3: {
    fontFamily: fontFamilies.sansSemiBold,
    fontSize: 18,
    fontWeight: '600',
    lineHeight: 24,
  } satisfies TextStyle,

  /** Filter-Pills, kompakte Labels, Listen-Zeilen */
  h4: {
    fontFamily: fontFamilies.sansSemiBold,
    fontSize: 15,
    fontWeight: '600',
    lineHeight: 20,
  } satisfies TextStyle,

  /** Hervorgehobener Fliesstext (Stadt in Detail-Header) */
  bodyLarge: {
    fontFamily: fontFamilies.sans,
    fontSize: 17,
    fontWeight: '400',
    lineHeight: 24,
  } satisfies TextStyle,

  /** Standard-Fliesstext */
  body: {
    fontFamily: fontFamilies.sans,
    fontSize: 15,
    fontWeight: '400',
    lineHeight: 22,
  } satisfies TextStyle,

  /** Sekundaerer Text, Meta-Informationen */
  bodySmall: {
    fontFamily: fontFamilies.sans,
    fontSize: 13,
    fontWeight: '400',
    lineHeight: 18,
  } satisfies TextStyle,

  /** Primaere Buttons */
  button: {
    fontFamily: fontFamilies.sansSemiBold,
    fontSize: 16,
    fontWeight: '600',
    lineHeight: 22,
  } satisfies TextStyle,

  /** Hinweise, Disclaimer, kleine Labels */
  caption: {
    fontFamily: fontFamilies.sans,
    fontSize: 12,
    fontWeight: '400',
    lineHeight: 16,
  } satisfies TextStyle,

  /** Sektionstitel Profil, Counter Buscar (GROSSBUCHSTABEN, mono) */
  overline: {
    fontFamily: fontFamilies.monoMedium,
    fontSize: 11,
    fontWeight: '500',
    lineHeight: 16,
    letterSpacing: 1.4,
    textTransform: 'uppercase',
  } satisfies TextStyle,

  /** Badges auf Karten (SIN GLUTEN, VERIFIED, mono) */
  badge: {
    fontFamily: fontFamilies.monoMedium,
    fontSize: 10,
    fontWeight: '500',
    letterSpacing: 1,
    textTransform: 'uppercase',
  } satisfies TextStyle,

  /** Bottom-Tab-Beschriftung */
  tabLabel: {
    fontFamily: fontFamilies.sansMedium,
    fontSize: 11,
    fontWeight: '500',
    lineHeight: 14,
  } satisfies TextStyle,
} as const;

export type TypographyVariant = keyof typeof typography;

/** Direkte Font-Family-Referenzen fuer Spezialfaelle (z. B. italic Akzente). */
export { fontFamilies };
