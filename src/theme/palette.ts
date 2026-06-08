/**
 * Farbpaletten fuer CeliacSafe (Editorial-Botanical).
 *
 * Hell ist der Standard; Dunkel ist eine optionale Variante.
 * Beide Paletten teilen exakt dieselben Keys, damit Styles
 * theme-unabhaengig auf `colors.*` zugreifen koennen.
 *
 * Quelle der Werte: Design-Vorlagen (Sage / Saffron / Terracotta / Bone).
 */

/** Helle Palette (Default) — warmes, papierartiges Editorial-Theme. */
export const lightColors = {
  // Marke / Aktionen
  primary: '#5a6850', // sage
  primaryDark: '#424d3a', // sage-dark
  accent: '#d4863a', // saffron
  accentDeep: '#b96e26', // saffron-deep

  // Flaechen
  background: '#fdfaf2', // paper
  surface: '#f9f6ed', // bone-cool (Cards)
  surfaceAlt: '#ede6d3', // bone-warm (Chips, Inputs, Tags)
  cuisineSurface: '#ede6d3',

  // Text
  textPrimary: '#2a2a28', // charcoal
  textSecondary: '#4a4a47', // charcoal-soft

  // Akzent-/Status
  heart: '#b85c3c', // terracotta
  verifiedGreen: '#5a6850',
  warning: '#d4863a',
  error: '#c0392b',

  // Text-/Icon-Farben AUF gefuellten Flaechen
  onPrimary: '#fdfaf2', // auf sage/charcoal Buttons
  onAccent: '#2a2a28', // auf saffron
  onWarning: '#2a2a28',
  white: '#ffffff',

  // Linien / Raender
  border: 'rgba(42, 42, 40, 0.12)',
  line: 'rgba(42, 42, 40, 0.12)',
  lineSoft: 'rgba(42, 42, 40, 0.06)',

  // Overlays / Scrims
  overlayDark: 'rgba(42, 42, 40, 0.5)', // Modal-Backdrop
  scrim: 'rgba(42, 42, 40, 0.55)', // Karten-/Map-Scrim
  overlay: 'rgba(253, 250, 242, 0.94)', // helle Glas-Overlays auf Fotos
  overlayWhite15: 'rgba(42, 42, 40, 0.06)',
  overlayWhite20: 'rgba(42, 42, 40, 0.10)',

  // Interaktion / Platzhalter
  ripple: 'rgba(42, 42, 40, 0.08)',
  rippleLight: 'rgba(42, 42, 40, 0.08)',
  skeleton: 'rgba(42, 42, 40, 0.06)',
  skeletonMuted: 'rgba(42, 42, 40, 0.06)',
  skeletonStrong: 'rgba(42, 42, 40, 0.10)',
  shadow: '#2a2a28',

  // Badges
  sinGlutenBg: 'rgba(90, 104, 80, 0.16)',
  premiumBg: 'rgba(212, 134, 58, 0.92)',
  premiumText: '#2a2a28',
} as const;

/** Dunkle Palette (optionale Variante) — warmes Charcoal-Theme. */
export const darkColors: Record<keyof typeof lightColors, string> = {
  primary: '#7d8b6f', // sage auf dunklem Grund lesbar
  primaryDark: '#5a6850',
  accent: '#d4863a',
  accentDeep: '#b96e26',

  background: '#1a1a18',
  surface: '#26261f',
  surfaceAlt: '#34342f',
  cuisineSurface: '#34342f',

  textPrimary: '#f5f1e8', // bone
  textSecondary: '#b8b3a6',

  heart: '#cc6a48',
  verifiedGreen: '#8b9680',
  warning: '#d4863a',
  error: '#e07a5f',

  onPrimary: '#1a1a18',
  onAccent: '#1a1a18',
  onWarning: '#1a1a18',
  white: '#ffffff',

  border: 'rgba(245, 241, 232, 0.14)',
  line: 'rgba(245, 241, 232, 0.14)',
  lineSoft: 'rgba(245, 241, 232, 0.08)',

  overlayDark: 'rgba(0, 0, 0, 0.55)',
  scrim: 'rgba(0, 0, 0, 0.6)',
  overlay: 'rgba(26, 26, 24, 0.9)',
  overlayWhite15: 'rgba(245, 241, 232, 0.12)',
  overlayWhite20: 'rgba(245, 241, 232, 0.18)',

  ripple: 'rgba(245, 241, 232, 0.12)',
  rippleLight: 'rgba(245, 241, 232, 0.12)',
  skeleton: 'rgba(245, 241, 232, 0.08)',
  skeletonMuted: 'rgba(245, 241, 232, 0.08)',
  skeletonStrong: 'rgba(245, 241, 232, 0.12)',
  shadow: '#000000',

  sinGlutenBg: 'rgba(139, 150, 128, 0.22)',
  premiumBg: 'rgba(212, 134, 58, 0.9)',
  premiumText: '#1a1a18',
};

export type AppColors = Record<keyof typeof lightColors, string>;
export type AppColorKey = keyof typeof lightColors;

export type ThemeScheme = 'light' | 'dark';

export const palettes: Record<ThemeScheme, AppColors> = {
  light: lightColors,
  dark: darkColors,
};
